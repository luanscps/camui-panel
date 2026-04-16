/**
 * POST /api/activate
 * Autenticação via JWT — sem license_key
 * Após upsert do device, chama Edge Function sync-phone-image
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type DeviceInsert = Database['public']['Tables']['device_activations']['Insert']
type DeviceUpdate = Database['public']['Tables']['device_activations']['Update']

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

type ActivateBody = {
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

function generateSubLicenseKey(): string {
  const seg = () => Math.random().toString(36).substring(2, 6).toUpperCase()
  return `CAMUI-${seg()}-${seg()}-${seg()}-${seg()}`
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()
  if (!token)
    return NextResponse.json({ ok: false, error: 'Token ausente' }, { status: 401 })

  const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token)
  if (authErr || !user)
    return NextResponse.json({ ok: false, error: 'Token inválido' }, { status: 401 })

  let body: ActivateBody
  try { body = await req.json() }
  catch { return NextResponse.json({ ok: false, error: 'Body inválido' }, { status: 400 }) }

  const { android_id } = body
  if (!android_id?.trim())
    return NextResponse.json({ ok: false, error: 'android_id obrigatório' }, { status: 400 })

  const { data: license, error: licErr } = await supabaseAdmin
    .from('licenses')
    .select('id, plan, status, max_devices, expires_at, account_number')
    .eq('user_id', user.id)
    .single()

  if (licErr || !license)
    return NextResponse.json({ ok: false, error: 'Licença não encontrada' }, { status: 404 })
  if (license.status !== 'ACTIVE')
    return NextResponse.json({ ok: false, error: `Licença ${license.status}` }, { status: 403 })
  if (license.expires_at && new Date(license.expires_at) < new Date())
    return NextResponse.json({ ok: false, error: 'Licença expirada' }, { status: 403 })

  const maxDevices: number = license.max_devices ?? (license.plan === 'PRO' ? 5 : 1)

  const { data: existingDevice } = await supabaseAdmin
    .from('device_activations')
    .select('id, status, sub_license_key')
    .eq('license_id', license.id)
    .eq('android_id', android_id.trim())
    .maybeSingle()

  if (existingDevice?.status === 'SUSPENDED')
    return NextResponse.json({ ok: false, error: 'Dispositivo suspenso.' }, { status: 403 })
  if (existingDevice?.status === 'REVOKED')
    return NextResponse.json({ ok: false, error: 'Dispositivo revogado.' }, { status: 403 })

  if (!existingDevice) {
    const { count } = await supabaseAdmin
      .from('device_activations')
      .select('id', { count: 'exact', head: true })
      .eq('license_id', license.id)
      .neq('status', 'REVOKED')

    if ((count ?? 0) >= maxDevices)
      return NextResponse.json(
        { ok: false, error: `Limite de ${maxDevices} dispositivo(s) atingido.` },
        { status: 409 }
      )
  }

  const fingerprint = [body.device_brand ?? '', body.device_model ?? '', body.device_hardware ?? '', android_id].join('|')
  const now = new Date().toISOString()

  const updateData: DeviceUpdate = {
    device_name:     body.device_name     ?? null,
    device_brand:    body.device_brand    ?? null,
    device_model:    body.device_model    ?? null,
    device_hardware: body.device_hardware ?? null,
    android_version: body.android_version ?? null,
    sdk_int:         body.sdk_int         ?? null,
    app_version:     body.app_version     ?? null,
    fingerprint,
    last_seen:       now,
    last_seen_at:    now,
  }

  const insertData: DeviceInsert = {
    ...updateData,
    license_id:      license.id,
    android_id:      android_id.trim(),
    device_id:       uuidv4(),
    activated_at:    now,
    status:          'ACTIVE',
    sub_license_key: generateSubLicenseKey(),
  }

  const { data: upserted, error: upsertErr } = existingDevice
    ? await supabaseAdmin
        .from('device_activations')
        .update(updateData as never)
        .eq('id', existingDevice.id)
        .select('id, sub_license_key, status')
        .single()
    : await supabaseAdmin
        .from('device_activations')
        .insert(insertData as never)
        .select('id, sub_license_key, status')
        .single()

  if (upsertErr || !upserted) {
    console.error('[/api/activate] upsert error:', upsertErr)
    return NextResponse.json({ ok: false, error: 'Erro ao registrar dispositivo' }, { status: 500 })
  }

  if (body.device_brand && body.device_model) {
    const edgeUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/sync-phone-image`
    fetch(edgeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        device_activation_id: upserted.id,
        device_brand:         body.device_brand,
        device_model:         body.device_model,
      }),
    }).catch(e => console.error('[sync-phone-image] fire-and-forget error:', e))
  }

  return NextResponse.json({
    ok:              true,
    plan:            license.plan,
    max_devices:     maxDevices,
    account_number:  license.account_number,
    device_id:       upserted.id,
    sub_license_key: upserted.sub_license_key,
    status:          upserted.status,
  })
}
