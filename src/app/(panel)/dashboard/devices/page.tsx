import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import DeviceActions from './DeviceActions'

export const metadata = { title: 'Dispositivos — CAMUI Panel' }

type BatterySpec = { type?: string; charging?: string } | string | null

type CameraInfo = {
  id:                string
  facing:            string
  label?:            string
  max_resolution?:   string
  max_fps?:          number
  ois_supported?:    boolean
  focal_lengths_mm?: number[]
}

type DeviceRow = {
  id: string
  device_name: string | null
  device_brand: string | null
  device_model: string | null
  android_version: string | null
  app_version: string | null
  last_app_version: string | null
  status: string
  last_seen_at: string | null
  activated_at: string | null
  phone_image_url: string | null
  cameras: CameraInfo[] | null
  phone_specs: {
    display?: string | null
    camera?: string | null
    battery?: BatterySpec
    ram?: string | null
    chipset?: string | null
    storage?: string | null
  } | null
  // Sprint 2 — telemetria
  streaming_now: boolean
  current_protocol: string | null
  last_rtmp_url: string | null
  stream_started_at: string | null
  stream_ended_at: string | null
  last_stream_error: string | null
  last_bitrate_kbps: number | null
  total_stream_seconds: number
  stream_session_count: number
  // Sprint 2 — saúde
  app_build_number: number | null
  battery_level: number | null
  is_charging: boolean | null
  thermal_state: string | null
  network_type: string | null
  network_strength: number | null
}

function batteryLabel(battery: BatterySpec): string | null {
  if (!battery) return null
  if (typeof battery === 'string') return battery
  if (typeof battery === 'object') {
    const parts = [battery.type, battery.charging].filter(Boolean)
    return parts.length ? parts.join(' · ') : null
  }
  return null
}

function facingLabel(facing: string) {
  if (facing === 'back')  return 'Traseira'
  if (facing === 'front') return 'Frontal'
  return facing
}

function formatStreamSeconds(secs: number): string {
  if (secs < 60)   return `${secs}s`
  if (secs < 3600) return `${Math.floor(secs / 60)}min`
  return `${(secs / 3600).toFixed(1)}h`
}

function thermalColor(state: string | null): string {
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

function thermalLabel(state: string | null): string {
  switch (state) {
    case 'nominal':   return '🌡️ Normal'
    case 'fair':      return '🌡️ Morno'
    case 'serious':   return '🌡️ Quente'
    case 'critical':  return '🌡️ Crítico'
    case 'emergency': return '🌡️ Emergência'
    case 'shutdown':  return '🌡️ Desligando'
    default:          return ''
  }
}

function batteryIcon(level: number | null, charging: boolean | null): string {
  if (level === null) return '🔋'
  if (charging) return '⚡'
  if (level >= 80) return '🔋'
  if (level >= 40) return '🪫'
  return '⚠️'
}

function networkIcon(type: string | null): string {
  switch (type) {
    case 'wifi':     return '📶'
    case '5g':       return '5G'
    case '4g':       return '4G'
    case '3g':       return '3G'
    case 'ethernet': return '🔌'
    default:         return '📡'
  }
}

export default async function DevicesPage() {
  const supabase = (await createClient()) as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: licData } = await supabase
    .from('licenses')
    .select('id, plan, max_devices')
    .eq('user_id', user.id)
    .single()

  const { data: devices } = await supabase
    .from('device_activations')
    .select(`
      id, device_name, device_brand, device_model, android_version,
      app_version, last_app_version, status, last_seen_at, activated_at,
      phone_image_url, phone_specs, cameras,
      streaming_now, current_protocol, last_rtmp_url,
      stream_started_at, stream_ended_at, last_stream_error,
      last_bitrate_kbps, total_stream_seconds, stream_session_count,
      app_build_number, battery_level, is_charging,
      thermal_state, network_type, network_strength
    `)
    .eq('license_id', licData?.id)
    .order('activated_at', { ascending: false }) as { data: DeviceRow[] | null }

  const activeCount    = devices?.filter(d => d.status === 'ACTIVE').length ?? 0
  const streamingCount = devices?.filter(d => d.streaming_now).length ?? 0
  const maxDevices     = licData?.max_devices ?? 1

  const chipStyle = {
    fontSize: '0.7rem',
    padding: '0.2rem 0.5rem',
    borderRadius: 999,
    background: 'var(--color-surface-offset)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-muted)',
    whiteSpace: 'nowrap' as const,
  }

  const appChipStyle = {
    ...chipStyle,
    background: 'rgba(1,105,111,0.08)',
    color: 'var(--color-primary)',
    border: '1px solid rgba(1,105,111,0.2)',
    fontWeight: 600,
  }

  return (
    <main className="camui-content">
      <div style={{ marginBottom: '1.75rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>Meus Dispositivos</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            {activeCount} de {maxDevices} ativo(s)
            {streamingCount > 0 && (
              <span style={{ marginLeft: '0.75rem', color: 'var(--color-error)', fontWeight: 700 }}>
                ● {streamingCount} ao vivo
              </span>
            )}
          </p>
        </div>
      </div>

      {!devices?.length ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📱</div>
          <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Nenhum dispositivo ainda</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Faça login no app <strong>CAMSTREAMER-BR</strong> com seu email e senha para ativar automaticamente.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {devices.map(dev => {
            const lastSeen    = dev.last_seen_at ? new Date(dev.last_seen_at) : null
            const minutesAgo  = lastSeen ? Math.floor((Date.now() - lastSeen.getTime()) / 60000) : null
            const isOnline    = minutesAgo !== null && minutesAgo < 5
            const statusColor = dev.status === 'ACTIVE' ? 'var(--color-success)' : dev.status === 'SUSPENDED' ? 'var(--color-warning)' : 'var(--color-error)'
            const displayName = dev.device_name ?? [dev.device_brand, dev.device_model].filter(Boolean).join(' ') ?? 'Dispositivo'
            const battery     = batteryLabel(dev.phone_specs?.battery ?? null)
            const cameras     = Array.isArray(dev.cameras) ? dev.cameras : []

            return (
              <div key={dev.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>

                {/* Imagem + badges de status */}
                <div style={{ background: 'var(--color-surface-offset)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180, position: 'relative' }}>
                  {dev.phone_image_url ? (
                    <Image
                      src={dev.phone_image_url}
                      alt={displayName}
                      width={120}
                      height={160}
                      style={{ objectFit: 'contain', maxHeight: 160 }}
                    />
                  ) : (
                    <span style={{ fontSize: '4rem', opacity: 0.25 }}>📱</span>
                  )}

                  {/* Badge Online/Offline */}
                  <span style={{
                    position: 'absolute', top: 10, right: 10,
                    padding: '0.2rem 0.6rem', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700,
                    background: isOnline ? 'var(--color-success)' : 'var(--color-surface)',
                    color: isOnline ? '#fff' : 'var(--color-text-muted)',
                    border: `1px solid ${isOnline ? 'var(--color-success)' : 'var(--color-border)'}`,
                  }}>
                    {isOnline ? '● Online' : 'Offline'}
                  </span>

                  {/* Badge AO VIVO */}
                  {dev.streaming_now && (
                    <span style={{
                      position: 'absolute', top: 10, left: 10,
                      padding: '0.2rem 0.6rem', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700,
                      background: 'var(--color-error)', color: '#fff',
                      animation: 'pulse 1.5s infinite',
                    }}>
                      ● AO VIVO
                    </span>
                  )}
                </div>

                {/* Corpo do card */}
                <div style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>{displayName}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                    {dev.android_version ? `Android ${dev.android_version}` : ''}
                    {dev.android_version && dev.device_brand ? '  ·  ' : ''}
                    {dev.device_brand ?? ''}
                  </div>

                  {/* ═══ TELEMETRIA AO VIVO ═══ */}
                  {dev.streaming_now && (
                    <div style={{
                      marginBottom: '0.75rem', padding: '0.6rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(239,68,68,0.07)',
                      border: '1px solid rgba(239,68,68,0.2)',
                      display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center',
                    }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-error)' }}>● TRANSMITINDO</span>
                      {dev.last_bitrate_kbps && (
                        <span style={{ ...chipStyle, color: 'var(--color-error)', borderColor: 'rgba(239,68,68,0.3)' }}>
                          {dev.last_bitrate_kbps} kbps
                        </span>
                      )}
                      {dev.current_protocol && (
                        <span style={chipStyle}>{dev.current_protocol}</span>
                      )}
                      {dev.stream_started_at && (
                        <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                          desde {new Date(dev.stream_started_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Erro de stream */}
                  {dev.last_stream_error && !dev.streaming_now && (
                    <div style={{
                      marginBottom: '0.75rem', padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(239,68,68,0.05)',
                      border: '1px solid rgba(239,68,68,0.15)',
                      fontSize: '0.7rem', color: 'var(--color-error)',
                    }}>
                      ⚠️ {dev.last_stream_error}
                    </div>
                  )}

                  {/* ═══ SAÚDE DO DEVICE ═══ */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.6rem' }}>

                    {/* Bateria */}
                    {dev.battery_level !== null && (
                      <span style={{
                        ...chipStyle,
                        color: dev.battery_level < 20 ? 'var(--color-error)' : dev.battery_level < 40 ? 'var(--color-warning)' : 'var(--color-text-muted)',
                        borderColor: dev.battery_level < 20 ? 'rgba(239,68,68,0.3)' : 'var(--color-border)',
                      }}>
                        {batteryIcon(dev.battery_level, dev.is_charging)} {dev.battery_level}%
                        {dev.is_charging ? ' carregando' : ''}
                      </span>
                    )}

                    {/* Térmica */}
                    {dev.thermal_state && dev.thermal_state !== 'nominal' && (
                      <span style={{ ...chipStyle, color: thermalColor(dev.thermal_state), borderColor: thermalColor(dev.thermal_state) + '44' }}>
                        {thermalLabel(dev.thermal_state)}
                      </span>
                    )}

                    {/* Rede */}
                    {dev.network_type && (
                      <span style={chipStyle}>
                        {networkIcon(dev.network_type)} {dev.network_type.toUpperCase()}
                        {dev.network_strength !== null ? ` ${dev.network_strength}/4` : ''}
                      </span>
                    )}
                  </div>

                  {/* Versão do app */}
                  {dev.app_version && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                      <span style={appChipStyle}>📦 App v{dev.app_version}{dev.app_build_number ? ` (${dev.app_build_number})` : ''}</span>
                      {dev.last_app_version && (
                        <span style={{ ...chipStyle, fontSize: '0.65rem' }} title={`Versão anterior: ${dev.last_app_version}`}>
                          anterior: v{dev.last_app_version}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Specs do telefone */}
                  {dev.phone_specs && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
                      {dev.phone_specs.ram     && <span style={chipStyle}>💾 {dev.phone_specs.ram}</span>}
                      {dev.phone_specs.camera  && <span style={chipStyle}>📷 {dev.phone_specs.camera}</span>}
                      {battery                 && <span style={chipStyle}>🔋 {battery}</span>}
                      {dev.phone_specs.display && <span style={chipStyle}>📐 {dev.phone_specs.display}</span>}
                      {dev.phone_specs.chipset && <span style={chipStyle}>⚡ {dev.phone_specs.chipset}</span>}
                    </div>
                  )}

                  {/* Estatísticas de stream */}
                  {(dev.stream_session_count > 0 || dev.total_stream_seconds > 0) && (
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                      {dev.stream_session_count > 0 && (
                        <span style={chipStyle}>🎬 {dev.stream_session_count} sessão(ões)</span>
                      )}
                      {dev.total_stream_seconds > 0 && (
                        <span style={chipStyle}>⏱ {formatStreamSeconds(dev.total_stream_seconds)} transmitidos</span>
                      )}
                    </div>
                  )}

                  {/* Câmeras do dispositivo */}
                  {cameras.length > 0 && (
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                        Câmeras ({cameras.length})
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        {cameras.map((cam, i) => (
                          <div
                            key={cam.id ?? i}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.3rem 0.6rem',
                              borderRadius: 'var(--radius-sm)',
                              background: 'var(--color-surface-offset)',
                              border: '1px solid var(--color-border)',
                              fontSize: '0.72rem',
                              flexWrap: 'wrap',
                            }}
                          >
                            <span style={{ fontWeight: 600, color: 'var(--color-text)', minWidth: 60 }}>
                              {cam.facing === 'back' ? '🔭' : '🤳'} {facingLabel(cam.facing)}
                            </span>
                            {cam.max_resolution && <span style={{ color: 'var(--color-text-muted)' }}>{cam.max_resolution}</span>}
                            {cam.max_fps && <span style={{ color: 'var(--color-text-muted)' }}>{cam.max_fps}fps</span>}
                            {cam.ois_supported && <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>OIS</span>}
                            {cam.focal_lengths_mm && cam.focal_lengths_mm.length > 0 && (
                              <span style={{ color: 'var(--color-text-muted)' }}>
                                {cam.focal_lengths_mm.map(f => `${f}mm`).join(' / ')}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status + ações */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: statusColor }}>{dev.status}</span>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                        {lastSeen
                          ? isOnline
                            ? minutesAgo === 0 ? 'Agora' : `há ${minutesAgo} min`
                            : lastSeen.toLocaleDateString('pt-BR')
                          : dev.activated_at
                            ? new Date(dev.activated_at).toLocaleDateString('pt-BR')
                            : '—'}
                      </div>
                    </div>
                    <DeviceActions activationId={dev.id} status={dev.status} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
