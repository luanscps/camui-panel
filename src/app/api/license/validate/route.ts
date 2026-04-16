/**
 * GET /api/license/validate
 * Valida uma sub_license_key e retorna features do plano.
 * Header: Authorization: Bearer <sub_license_key>
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization') ?? ''
  const sub_license_key = authHeader.replace(/^Bearer\s+/i, '').trim()

  if (!sub_license_key)
    return NextResponse.json({ ok: false, error: 'Authorization header ausente' }, { status: 401 })

  const { data: device, error } = await supabaseAdmin
    .from('device_activations')
    .select(`
      id, status, last_seen_at,
      licenses (
        plan, status, expires_at,
        plan_features:plan_features!inner ( * )
      )
    `)
    .eq('sub_license_key', sub_license_key)
    .maybeSingle()

  if (error) {
    console.error('[/api/license/validate] query error:', error)
    return NextResponse.json({ ok: false, error: 'Erro interno' }, { status: 500 })
  }

  if (!device)
    return NextResponse.json({ ok: false, error: 'Sub-licença não encontrada' }, { status: 404 })

  if (device.status === 'SUSPENDED')
    return NextResponse.json({ ok: false, error: 'Dispositivo suspenso' }, { status: 403 })

  if (device.status === 'REVOKED')
    return NextResponse.json({ ok: false, error: 'Dispositivo revogado' }, { status: 403 })

  // O Supabase tipado retorna licenses como objeto ou array dependendo da relação
  const license = Array.isArray(device.licenses) ? device.licenses[0] : device.licenses
  if (!license || license.status !== 'ACTIVE')
    return NextResponse.json({ ok: false, error: `Licença ${license?.status ?? 'inválida'}` }, { status: 403 })

  if (license.expires_at && new Date(license.expires_at) < new Date())
    return NextResponse.json({ ok: false, error: 'Licença expirada' }, { status: 403 })

  // Atualiza last_seen_at (fire and forget)
  supabaseAdmin
    .from('device_activations')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('id', device.id)
    .then(() => {})

  const pf = Array.isArray(license.plan_features) ? license.plan_features[0] : license.plan_features

  return NextResponse.json({
    ok:         true,
    plan:       license.plan,
    expires_at: license.expires_at,
    device_id:  device.id,
    features: {
      max_rtmp_outputs:   pf.max_rtmp_outputs,
      max_resolution:     pf.max_resolution,
      max_bitrate_kbps:   pf.max_bitrate_kbps,
      web_control:        pf.web_control,
      local_recording:    pf.local_recording,
      max_stream_minutes: pf.max_stream_minutes,
      front_camera:       pf.front_camera,
      max_devices:        pf.max_devices,
    },
  })
}