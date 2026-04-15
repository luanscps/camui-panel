/**
 * POST /api/activate
 *
 * Registra ou atualiza o dispositivo na tabela device_activations.
 * Cada dispositivo recebe uma sub_license_key única gerada automaticamente.
 *
 * Body JSON:
 * {
 *   license_key:     string  — chave da licença mãe do usuário
 *   device_name:     string  — Build.MODEL
 *   device_brand:    string  — Build.BRAND
 *   device_model:    string  — Build.DEVICE
 *   device_hardware: string  — Build.HARDWARE
 *   android_version: string  — Build.VERSION.RELEASE
 *   sdk_int:         number  — Build.VERSION.SDK_INT
 *   android_id:      string  — Settings.Secure.ANDROID_ID
 *   app_version:     string  — BuildConfig.VERSION_NAME
 * }
 *
 * Resposta de sucesso:
 * { ok: true, plan, max_devices, device_id, sub_license_key, status }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

type ActivateBody = {
  license_key:      string
  device_name?:     string
  device_brand?:    string
  device_model?:    string
  device_hardware?: string
  android_version?: string
  sdk_int?:         number
  android_id:       string
  app_version?:     string
}

function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

/** Gera sub-licença no formato CAMUI-XXXX-XXXX-XXXX-XXXX */
function generateSubLicenseKey(): string {
  const seg = () => Math.random().toString(36).substring(2, 6).toUpperCase()
  return `CAMUI-${seg()}-${seg()}-${seg()}-${seg()}`
}

export async function POST(req: NextRequest) {
  let body: ActivateBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Body JSON inválido' }, { status: 400 })
  }

  const { license_key, android_id } = body

  if (!license_key?.trim())
    return NextResponse.json({ ok: false, error: 'license_key obrigatório' }, { status: 400 })
  if (!android_id?.trim())
    return NextResponse.json({ ok: false, error: 'android_id obrigatório' }, { status: 400 })

  // ---------- valida licença mãe ----------
  const { data: license, error: licErr } = await supabaseAdmin
    .from('licenses')
    .select('id, plan, status, max_devices, expires_at')
    .eq('license_key', license_key.trim())
    .single()

  if (licErr || !license)
    return NextResponse.json({ ok: false, error: 'Licença não encontrada' }, { status: 404 })
  if (license.status !== 'ACTIVE')
    return NextResponse.json({ ok: false, error: `Licença ${license.status}` }, { status: 403 })
  if (license.expires_at && new Date(license.expires_at) < new Date())
    return NextResponse.json({ ok: false, error: 'Licença expirada' }, { status: 403 })

  const maxDevices: number = license.max_devices ?? (license.plan === 'PRO' ? 5 : 1)

  // ---------- busca device existente ----------
  const { data: existingDevice } = await supabaseAdmin
    .from('device_activations')
    .select('id, status, sub_license_key')
    .eq('license_id', license.id)
    .eq('android_id', android_id)
    .maybeSingle()

  // Device existente suspenso — bloqueia acesso
  if (existingDevice?.status === 'SUSPENDED') {
    return NextResponse.json(
      { ok: false, error: 'Dispositivo suspenso. Contate o suporte.' },
      { status: 403 }
    )
  }

  // Novo device — verifica limite de slots
  if (!existingDevice) {
    const { count } = await supabaseAdmin
      .from('device_activations')
      .select('id', { count: 'exact', head: true })
      .eq('license_id', license.id)
      .neq('status', 'REVOKED')

    if ((count ?? 0) >= maxDevices)
      return NextResponse.json(
        { ok: false, error: `Limite de ${maxDevices} dispositivo(s) atingido` },
        { status: 409 }
      )
  }

  // ---------- fingerprint ----------
  const fingerprint = [body.device_brand ?? '', body.device_model ?? '', body.device_hardware ?? '', android_id].join('|')
  const now = new Date().toISOString()

  const updateData = {
    device_name:     body.device_name     ?? null,
    device_brand:    body.device_brand    ?? null,
    device_model:    body.device_model    ?? null,
    device_hardware: body.device_hardware ?? null,
    android_version: body.android_version ?? null,
    sdk_int:         body.sdk_int         ?? null,
    app_version:     body.app_version     ?? null,
    fingerprint,
    last_seen: now,
  }

  // ---------- upsert ----------
  const { data: upserted, error: upsertErr } = existingDevice
    ? await supabaseAdmin
        .from('device_activations')
        .update(updateData)
        .eq('id', existingDevice.id)
        .select('id, sub_license_key, status')
        .single()
    : await supabaseAdmin
        .from('device_activations')
        .insert({
          ...updateData,
          license_id:      license.id,
          android_id,
          device_id:       uuidv4(),
          activated_at:    now,
          status:          'ACTIVE',
          sub_license_key: generateSubLicenseKey(),
        })
        .select('id, sub_license_key, status')
        .single()

  if (upsertErr || !upserted) {
    console.error('[/api/activate] upsert error:', upsertErr)
    return NextResponse.json({ ok: false, error: 'Erro ao registrar dispositivo' }, { status: 500 })
  }

  return NextResponse.json({
    ok:              true,
    plan:            license.plan      as string,
    max_devices:     maxDevices        as number,
    device_id:       upserted.id       as string,
    sub_license_key: upserted.sub_license_key as string,
    status:          upserted.status   as string,
  })
}
