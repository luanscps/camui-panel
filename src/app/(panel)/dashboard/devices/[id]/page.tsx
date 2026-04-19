import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import DeviceActions from '../DeviceActions'

export const metadata = { title: 'Detalhe do Dispositivo — CAMUI Panel' }

type CameraInfo = {
  id: string; facing: string; label?: string
  max_resolution?: string; max_fps?: number
  ois_supported?: boolean; eis_supported?: boolean
  focal_lengths_mm?: number[]; iso_range?: number[]
  has_raw?: boolean; has_hdr?: boolean
  zoom_ratio_max?: number; lens_count?: number
}

type DeviceDetail = {
  id: string
  device_name: string | null
  device_brand: string | null
  device_model: string | null
  device_hardware: string | null
  android_version: string | null
  sdk_int: number | null
  app_version: string | null
  last_app_version: string | null
  app_build_number: number | null
  status: string
  activated_at: string | null
  last_seen_at: string | null
  phone_image_url: string | null
  sub_license_key: string | null
  fingerprint: string | null
  cameras: CameraInfo[] | null
  phone_specs: Record<string, unknown> | null
  // Telemetria Sprint 2
  streaming_now: boolean
  current_protocol: string | null
  last_rtmp_url: string | null
  stream_started_at: string | null
  stream_ended_at: string | null
  last_stream_error: string | null
  last_bitrate_kbps: number | null
  total_stream_seconds: number
  stream_session_count: number
  battery_level: number | null
  is_charging: boolean | null
  thermal_state: string | null
  network_type: string | null
  network_strength: number | null
}

function formatSeconds(s: number) {
  if (s < 60)   return `${s}s`
  if (s < 3600) return `${Math.floor(s / 60)}min`
  return `${(s / 3600).toFixed(1)}h`
}

function thermalColor(state: string | null) {
  switch (state) {
    case 'nominal':   return 'var(--color-success)'
    case 'fair':      return 'var(--color-warning)'
    case 'serious':   return '#f97316'
    case 'critical':
    case 'emergency':
    case 'shutdown':  return 'var(--color-error)'
    default:          return 'var(--color-text-muted)'
  }
}

function facingLabel(f: string) {
  if (f === 'back')  return 'Traseira'
  if (f === 'front') return 'Frontal'
  return f
}

const chip = {
  fontSize: '0.72rem', padding: '0.2rem 0.55rem', borderRadius: 999,
  background: 'var(--color-surface-offset)', border: '1px solid var(--color-border)',
  color: 'var(--color-text-muted)', whiteSpace: 'nowrap' as const,
}

export default async function DeviceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = (await createClient()) as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: license } = await supabase
    .from('licenses').select('id').eq('user_id', user.id).single()
  if (!license) redirect('/dashboard')

  const { data: dev } = await supabase
    .from('device_activations')
    .select('*')
    .eq('id', id)
    .eq('license_id', license.id)
    .single() as { data: DeviceDetail | null }

  if (!dev) notFound()

  const lastSeen   = dev.last_seen_at ? new Date(dev.last_seen_at) : null
  const minutesAgo = lastSeen ? Math.floor((Date.now() - lastSeen.getTime()) / 60000) : null
  const isOnline   = minutesAgo !== null && minutesAgo < 5
  const displayName = dev.device_name ?? [dev.device_brand, dev.device_model].filter(Boolean).join(' ') ?? 'Dispositivo'
  const cameras = Array.isArray(dev.cameras) ? dev.cameras : []
  const statusColor = dev.status === 'ACTIVE' ? 'var(--color-success)' : dev.status === 'SUSPENDED' ? 'var(--color-warning)' : 'var(--color-error)'

  return (
    <main className="camui-content">
      {/* Breadcrumb */}
      <div style={{ marginBottom: '1.25rem', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
        <Link href="/dashboard/devices" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>← Dispositivos</Link>
        <span style={{ margin: '0 0.4rem' }}>/</span>
        <span>{displayName}</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
        <div style={{ width: 72, height: 72, borderRadius: 'var(--radius-lg)', background: 'var(--color-surface-offset)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
          {dev.phone_image_url
            ? <Image src={dev.phone_image_url} alt={displayName} width={60} height={70} style={{ objectFit: 'contain' }} />
            : <span style={{ fontSize: '2.5rem', opacity: 0.25 }}>📱</span>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{displayName}</h1>
            {dev.streaming_now && (
              <span style={{ padding: '0.2rem 0.6rem', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700, background: 'var(--color-error)', color: '#fff' }}>● AO VIVO</span>
            )}
            <span style={{ padding: '0.2rem 0.6rem', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700, background: isOnline ? 'var(--color-success)' : 'var(--color-surface)', color: isOnline ? '#fff' : 'var(--color-text-muted)', border: `1px solid ${isOnline ? 'var(--color-success)' : 'var(--color-border)'}` }}>
              {isOnline ? '● Online' : 'Offline'}
            </span>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            {[dev.device_brand, dev.device_model, dev.android_version ? `Android ${dev.android_version}` : null].filter(Boolean).join(' · ')}
          </div>
        </div>
        <DeviceActions activationId={dev.id} status={dev.status} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>

        {/* ── CARD: Identificação ─────────────────────────── */}
        <div className="card">
          <div className="card-header"><div className="card-title">Identificação</div></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[
              { label: 'Status',       value: <span style={{ fontWeight: 700, color: statusColor }}>{dev.status}</span> },
              { label: 'Marca',        value: dev.device_brand },
              { label: 'Modelo',       value: dev.device_model },
              { label: 'Hardware',     value: dev.device_hardware },
              { label: 'Android',      value: dev.android_version ? `${dev.android_version} (SDK ${dev.sdk_int ?? '—'})` : null },
              { label: 'App',          value: dev.app_version ? `v${dev.app_version}${dev.app_build_number ? ` (build ${dev.app_build_number})` : ''}` : null },
              { label: 'Versão anterior', value: dev.last_app_version ? `v${dev.last_app_version}` : null },
              { label: 'Ativado em',   value: dev.activated_at ? new Date(dev.activated_at).toLocaleString('pt-BR') : null },
              { label: 'Último sinal', value: lastSeen ? (isOnline ? `há ${minutesAgo}min` : lastSeen.toLocaleString('pt-BR')) : null },
            ].map(({ label, value }) => value ? (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{label}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 500, textAlign: 'right' }}>{value}</span>
              </div>
            ) : null)}
            {dev.sub_license_key && (
              <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Sub-licença</div>
                <code style={{ fontSize: '0.72rem', background: 'var(--color-surface-offset)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', letterSpacing: '0.04em', wordBreak: 'break-all' }}>{dev.sub_license_key}</code>
              </div>
            )}
          </div>
        </div>

        {/* ── CARD: Saúde do device ───────────────────────── */}
        <div className="card">
          <div className="card-header"><div className="card-title">Saúde do Dispositivo</div></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>

            {/* Bateria */}
            <div style={{ paddingBottom: '0.6rem', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Bateria</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: (dev.battery_level ?? 100) < 20 ? 'var(--color-error)' : 'var(--color-text)' }}>
                  {dev.battery_level !== null ? `${dev.battery_level}%${dev.is_charging ? ' ⚡ carregando' : ''}` : '—'}
                </span>
              </div>
              {dev.battery_level !== null && (
                <div style={{ height: 6, borderRadius: 999, background: 'var(--color-divider)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${dev.battery_level}%`, borderRadius: 999, background: dev.battery_level < 20 ? 'var(--color-error)' : dev.battery_level < 40 ? 'var(--color-warning)' : 'var(--color-success)', transition: 'width 0.3s' }} />
                </div>
              )}
            </div>

            {/* Térmica */}
            {[
              { label: 'Temperatura',  value: dev.thermal_state ? <span style={{ fontWeight: 600, color: thermalColor(dev.thermal_state) }}>{dev.thermal_state}</span> : null },
              { label: 'Rede',         value: dev.network_type ? `${dev.network_type.toUpperCase()}${dev.network_strength !== null ? ` · Sinal ${dev.network_strength}/4` : ''}` : null },
            ].map(({ label, value }) => value ? (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{label}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{value}</span>
              </div>
            ) : null)}

            {/* Phone specs */}
            {dev.phone_specs && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', paddingTop: '0.25rem' }}>
                {Object.entries(dev.phone_specs as Record<string, string>).map(([k, v]) =>
                  v ? <span key={k} style={chip}>{v}</span> : null
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── CARD: Stream ────────────────────────────────── */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Streaming</div>
            {dev.streaming_now && (
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-error)' }}>● TRANSMITINDO</span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[
              { label: 'Status',        value: dev.streaming_now ? <span style={{ color: 'var(--color-error)', fontWeight: 700 }}>Ao Vivo</span> : 'Inativo' },
              { label: 'Protocolo',     value: dev.current_protocol },
              { label: 'Bitrate',       value: dev.last_bitrate_kbps ? `${dev.last_bitrate_kbps} kbps` : null },
              { label: 'URL RTMP',      value: dev.last_rtmp_url ? <code style={{ fontSize: '0.65rem', wordBreak: 'break-all' }}>{dev.last_rtmp_url}</code> : null },
              { label: 'Início',        value: dev.stream_started_at ? new Date(dev.stream_started_at).toLocaleString('pt-BR') : null },
              { label: 'Fim',           value: dev.stream_ended_at   ? new Date(dev.stream_ended_at).toLocaleString('pt-BR')   : null },
              { label: 'Total sessões', value: dev.stream_session_count > 0 ? `${dev.stream_session_count} sessão(ões)` : null },
              { label: 'Tempo total',   value: dev.total_stream_seconds > 0 ? formatSeconds(dev.total_stream_seconds) : null },
            ].map(({ label, value }) => value ? (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>{label}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 500, textAlign: 'right' }}>{value}</span>
              </div>
            ) : null)}

            {dev.last_stream_error && (
              <div style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.75rem', color: 'var(--color-error)' }}>
                ⚠️ {dev.last_stream_error}
              </div>
            )}

            {!dev.streaming_now && !dev.stream_session_count && (
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '1rem 0' }}>Nenhuma transmissão registrada ainda.</p>
            )}
          </div>
        </div>

        {/* ── CARD: Câmeras ───────────────────────────────── */}
        {cameras.length > 0 && (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="card-header">
              <div className="card-title">Câmeras ({cameras.length})</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
              {cameras.map((cam, i) => (
                <div key={cam.id ?? i} style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--color-surface-offset)', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    {cam.facing === 'back' ? '🔭' : '🤳'} {facingLabel(cam.facing)}
                    {cam.label && <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', marginLeft: '0.4rem', fontSize: '0.75rem' }}>{cam.label}</span>}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {cam.max_resolution    && <span style={chip}>{cam.max_resolution}</span>}
                    {cam.max_fps           && <span style={chip}>{cam.max_fps}fps</span>}
                    {cam.ois_supported     && <span style={{ ...chip, color: 'var(--color-primary)' }}>OIS</span>}
                    {cam.eis_supported     && <span style={{ ...chip, color: 'var(--color-primary)' }}>EIS</span>}
                    {cam.has_raw           && <span style={chip}>RAW</span>}
                    {cam.has_hdr           && <span style={chip}>HDR</span>}
                    {cam.zoom_ratio_max    && <span style={chip}>🔍 {cam.zoom_ratio_max}x</span>}
                    {cam.lens_count        && cam.lens_count > 1 && <span style={chip}>🔭 {cam.lens_count} lentes</span>}
                    {cam.focal_lengths_mm  && cam.focal_lengths_mm.length > 0 && (
                      <span style={chip}>{cam.focal_lengths_mm.map(f => `${f}mm`).join(' / ')}</span>
                    )}
                    {cam.iso_range && cam.iso_range.length === 2 && (
                      <span style={chip}>ISO {cam.iso_range[0]}–{cam.iso_range[1]}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
