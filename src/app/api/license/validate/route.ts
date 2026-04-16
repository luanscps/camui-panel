/**
 * GET /api/license/validate
 *
 * Valida uma sub_license_key e retorna o objeto de features do plano.
 * O app Android deve chamar este endpoint no startup e a cada 1h.
 *
 * Header obrigatório:
 *   Authorization: Bearer <sub_license_key>
 *
 * Resposta de sucesso:
 * {
 *   ok: true,
 *   plan: "BASIC" | "PRO",
 *   expires_at: string | null,
 *   device_id: string,
 *   features: {
 *     max_rtmp_outputs: number,
 *     max_resolution: string,
 *     max_bitrate_kbps: number,
 *     web_control: boolean,
 *     local_recording: boolean,
 *     max_stream_minutes: number,
 *     front_camera: boolean,
 *     max_devices: number
 *   }
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization') ?? ''
  const sub_license_key = authHeader.replace(/^Bearer\s+/i, '').trim()

  if (!sub_license_key)
    return NextResponse.json(
      { ok: false, error: 'Authorization header ausente' },
      { status: 401 }
    )

  // Busca device + licença + features em uma query só
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

  const license = device.licenses as any
  if (!license || license.status !== 'ACTIVE')
    return NextResponse.json({ ok: false, error: `Licença ${license?.status ?? 'inválida'}` }, { status: 403 })

  if (license.expires_at && new Date(license.expires_at) < new Date())
    return NextResponse.json({ ok: false, error: 'Licença expirada' }, { status: 403 })

  // Atualiza last_seen_at do device (fire and forget)
  supabaseAdmin
    .from('device_activations')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('id', device.id)
    .then(() => {})

  const pf = license.plan_features as any

  return NextResponse.json({
    ok:         true,
    plan:       license.plan       as string,
    expires_at: license.expires_at as string | null,
    device_id:  device.id          as string,
    features: {
      max_rtmp_outputs:   pf.max_rtmp_outputs   as number,
      max_resolution:     pf.max_resolution     as string,
      max_bitrate_kbps:   pf.max_bitrate_kbps   as number,
      web_control:        pf.web_control        as boolean,
      local_recording:    pf.local_recording    as boolean,
      max_stream_minutes: pf.max_stream_minutes as number,
      front_camera:       pf.front_camera       as boolean,
      max_devices:        pf.max_devices        as number,
    },
  })
}
