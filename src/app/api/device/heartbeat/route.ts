/**
 * POST /api/device/heartbeat
 * Recebe telemetria periódica do app Android.
 * Header: Authorization: Bearer <sub_license_key>
 *
 * As colunas de telemetria (streaming_now, battery_level, etc.) existem no banco
 * após as migrations do Sprint 2, mas podem ainda não estar no tipo gerado.
 * Por isso o update é feito via Record<string, any> e o SELECT usa apenas
 * colunas que já existem no tipo base (id, status).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

type HeartbeatBody = {
  streaming_now?:        boolean
  current_protocol?:     string
  last_rtmp_url?:        string
  stream_started_at?:    string
  stream_ended_at?:      string
  last_stream_error?:    string
  last_bitrate_kbps?:    number
  total_stream_seconds?: number
  stream_session_count?: number
  app_build_number?:     number
  battery_level?:        number
  is_charging?:          boolean
  thermal_state?:        string
  network_type?:         string
  network_strength?:     number
}

export async function POST(req: NextRequest) {
  // ── Auth ────────────────────────────────────────────────
  const authHeader = req.headers.get('authorization') ?? ''
  const sub_license_key = authHeader.replace(/^Bearer\s+/i, '').trim()

  if (!sub_license_key)
    return NextResponse.json({ ok: false, error: 'Authorization header ausente' }, { status: 401 })

  // ── Buscar device (apenas colunas tipadas) ──────────────────────
  const { data: device, error: deviceErr } = await supabaseAdmin
    .from('device_activations')
    .select('id, status')
    .eq('sub_license_key', sub_license_key)
    .maybeSingle()

  if (deviceErr) {
    console.error('[/api/device/heartbeat] query error:', deviceErr)
    return NextResponse.json({ ok: false, error: 'Erro interno' }, { status: 500 })
  }

  if (!device)
    return NextResponse.json({ ok: false, error: 'Sub-licença não encontrada' }, { status: 404 })

  if (device.status === 'SUSPENDED')
    return NextResponse.json({ ok: false, error: 'Dispositivo suspenso' }, { status: 403 })

  if (device.status === 'REVOKED')
    return NextResponse.json({ ok: false, error: 'Dispositivo revogado' }, { status: 403 })

  // ── Parsear body ─────────────────────────────────────────
  let body: HeartbeatBody = {}
  try { body = await req.json() }
  catch { /* body vazio é permitido — apenas atualiza last_seen_at */ }

  const now = new Date().toISOString()

  // ── Update com cast any nas colunas novas do Sprint 2 ────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update: Record<string, any> = {
    last_seen_at: now,
    last_seen:    now,
    ...(body.streaming_now        !== undefined && { streaming_now:        body.streaming_now }),
    ...(body.current_protocol                  && { current_protocol:     body.current_protocol }),
    ...(body.last_rtmp_url                     && { last_rtmp_url:        body.last_rtmp_url }),
    ...(body.stream_started_at                 && { stream_started_at:    body.stream_started_at }),
    ...(body.stream_ended_at                   && { stream_ended_at:      body.stream_ended_at }),
    ...(body.last_stream_error    !== undefined && { last_stream_error:   body.last_stream_error }),
    ...(body.last_bitrate_kbps    !== undefined && { last_bitrate_kbps:   body.last_bitrate_kbps }),
    ...(body.app_build_number     !== undefined && { app_build_number:    body.app_build_number }),
    ...(body.battery_level        !== undefined && { battery_level:       body.battery_level }),
    ...(body.is_charging          !== undefined && { is_charging:         body.is_charging }),
    ...(body.thermal_state                     && { thermal_state:        body.thermal_state }),
    ...(body.network_type                      && { network_type:         body.network_type }),
    ...(body.network_strength     !== undefined && { network_strength:    body.network_strength }),
    ...(body.total_stream_seconds !== undefined && { total_stream_seconds: body.total_stream_seconds }),
    ...(body.stream_session_count !== undefined && { stream_session_count: body.stream_session_count }),
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateErr } = await (supabaseAdmin as any)
    .from('device_activations')
    .update(update)
    .eq('id', device.id)

  if (updateErr) {
    console.error('[/api/device/heartbeat] update error:', updateErr)
    return NextResponse.json({ ok: false, error: 'Erro ao salvar telemetria' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, received_at: now })
}
