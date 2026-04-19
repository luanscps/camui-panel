/**
 * POST /api/device/heartbeat
 * Recebe telemetria periódica do app Android.
 * Header: Authorization: Bearer <sub_license_key>
 *
 * Body esperado:
 * {
 *   streaming_now:        boolean
 *   current_protocol?:    string        // "RTMP"
 *   last_rtmp_url?:       string
 *   stream_started_at?:   string        // ISO 8601
 *   stream_ended_at?:     string        // ISO 8601
 *   last_stream_error?:   string
 *   last_bitrate_kbps?:   number
 *   total_stream_seconds?: number
 *   stream_session_count?: number
 *   app_build_number?:    number
 *   battery_level?:       number        // 0-100
 *   is_charging?:         boolean
 *   thermal_state?:       string        // nominal|fair|serious|critical|emergency|shutdown
 *   network_type?:        string        // wifi|4g|5g|3g|ethernet
 *   network_strength?:    number        // 0-4
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type DeviceUpdate = Database['public']['Tables']['device_activations']['Update']

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

  // ── Buscar device ────────────────────────────────────────
  const { data: device, error: deviceErr } = await supabaseAdmin
    .from('device_activations')
    .select('id, status, streaming_now, stream_session_count, total_stream_seconds')
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

  // ── Calcular incrementos de sessão ───────────────────────
  // Se o device estava offline e agora está streaming → nova sessão
  const wasStreaming   = device.streaming_now ?? false
  const isStreaming    = body.streaming_now ?? false
  const newSession     = !wasStreaming && isStreaming

  const currentSessions = device.stream_session_count ?? 0
  const currentSeconds  = device.total_stream_seconds  ?? 0

  // ── Montar payload de update ─────────────────────────────
  const update: DeviceUpdate = {
    last_seen_at:     now,
    last_seen:        now,
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
    // Incrementar totais acumulados
    ...(body.total_stream_seconds !== undefined && {
      total_stream_seconds: currentSeconds + body.total_stream_seconds,
    }),
    ...(newSession && {
      stream_session_count: currentSessions + 1,
    }),
    // Se body.stream_session_count veio explícito (override do app), usa ele
    ...(body.stream_session_count !== undefined && !newSession && {
      stream_session_count: body.stream_session_count,
    }),
  }

  const { error: updateErr } = await supabaseAdmin
    .from('device_activations')
    .update(update)
    .eq('id', device.id)

  if (updateErr) {
    console.error('[/api/device/heartbeat] update error:', updateErr)
    return NextResponse.json({ ok: false, error: 'Erro ao salvar telemetria' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, received_at: now })
}
