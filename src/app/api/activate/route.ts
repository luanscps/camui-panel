/**
 * POST /api/activate
 *
 * Chamado pelo app Android após login. Registra ou atualiza o dispositivo
 * na tabela device_activations usando android_id como chave única por licença.
 *
 * Body JSON esperado:
 * {
 *   license_key:     string  — chave da licença do usuário
 *   device_name:     string  — Build.MODEL (ex: "Pixel 7")
 *   device_brand:    string  — Build.BRAND (ex: "Google")
 *   device_model:    string  — Build.DEVICE (ex: "panther")
 *   device_hardware: string  — Build.HARDWARE (ex: "qcom")
 *   android_version: string  — Build.VERSION.RELEASE (ex: "14")
 *   sdk_int:         number  — Build.VERSION.SDK_INT (ex: 34)
 *   android_id:      string  — Settings.Secure.ANDROID_ID
 *   app_version:     string  — BuildConfig.VERSION_NAME (ex: "5.0.1")
 * }
 *
 * Resposta de sucesso:
 * { ok: true, plan: "BASIC"|"PRO", max_devices: number, device_id: string }
 *
 * Resposta de erro:
 * { ok: false, error: string } — HTTP 4xx/5xx
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

/** Gera UUID v4 sem dependência externa */
function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

export async function POST(req: NextRequest) {
  // ---------- parse body ----------
  let body: ActivateBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Body JSON inválido' }, { status: 400 })
  }

  const { license_key, android_id } = body

  if (!license_key?.trim()) {
    return NextResponse.json({ ok: false, error: 'license_key obrigatório' }, { status: 400 })
  }
  if (!android_id?.trim()) {
    return NextResponse.json({ ok: false, error: 'android_id obrigatório' }, { status: 400 })
  }

  // ---------- buscar licença ----------
  const { data: license, error: licErr } = await supabaseAdmin
    .from('licenses')
    .select('id, user_id, plan, status, max_devices, expires_at')
    .eq('license_key', license_key.trim())
    .single()

  if (licErr || !license) {
    return NextResponse.json({ ok: false, error: 'Licença não encontrada' }, { status: 404 })
  }

  if (license.status !== 'ACTIVE') {
    return NextResponse.json({ ok: false, error: `Licença ${license.status}` }, { status: 403 })
  }

  if (license.expires_at && new Date(license.expires_at) < new Date()) {
    return NextResponse.json({ ok: false, error: 'Licença expirada' }, { status: 403 })
  }

  const maxDevices: number = license.max_devices ?? (license.plan === 'PRO' ? 5 : 1)

  // ---------- verificar se este android_id já está ativo nesta licença ----------
  const { data: existingDevice } = await supabaseAdmin
    .from('device_activations')
    .select('id')
    .eq('license_id', license.id)
    .eq('android_id', android_id)
    .maybeSingle()

  // Se não existe, verificar limite de slots
  if (!existingDevice) {
    const { count } = await supabaseAdmin
      .from('device_activations')
      .select('id', { count: 'exact', head: true })
      .eq('license_id', license.id)

    if ((count ?? 0) >= maxDevices) {
      return NextResponse.json(
        { ok: false, error: `Limite de ${maxDevices} dispositivo(s) atingido` },
        { status: 409 }
      )
    }
  }

  // ---------- montar fingerprint ----------
  const fingerprint = [
    body.device_brand    ?? '',
    body.device_model    ?? '',
    body.device_hardware ?? '',
    android_id,
  ].join('|')

  // ---------- upsert do dispositivo ----------
  const now = new Date().toISOString()

  const upsertData = {
    license_id:      license.id,
    android_id:      android_id,
    device_name:     body.device_name     ?? null,
    device_brand:    body.device_brand    ?? null,
    device_model:    body.device_model    ?? null,
    device_hardware: body.device_hardware ?? null,
    android_version: body.android_version ?? null,
    sdk_int:         body.sdk_int         ?? null,
    app_version:     body.app_version     ?? null,
    fingerprint:     fingerprint,
    last_seen:       now,
  }

  const { data: upserted, error: upsertErr } = existingDevice
    ? await supabaseAdmin
        .from('device_activations')
        .update(upsertData)
        .eq('id', existingDevice.id)
        .select('id')
        .single()
    : await supabaseAdmin
        .from('device_activations')
        .insert({
          ...upsertData,
          device_id:    uuidv4(),  // coluna NOT NULL legada — gerada aqui
          activated_at: now,
        })
        .select('id')
        .single()

  if (upsertErr || !upserted) {
    console.error('[/api/activate] upsert error:', upsertErr)
    return NextResponse.json({ ok: false, error: 'Erro ao registrar dispositivo' }, { status: 500 })
  }

  return NextResponse.json({
    ok:          true,
    plan:        license.plan  as string,
    max_devices: maxDevices    as number,
    device_id:   upserted.id  as string,
  })
}
