import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'

export const metadata = { title: 'Dispositivos — CAMUI Panel' }

type BatterySpec = { type?: string; charging?: string } | string | null

type DeviceRow = {
  id: string
  device_name: string | null
  device_brand: string | null
  device_model: string | null
  android_version: string | null
  status: string
  last_seen_at: string | null
  activated_at: string | null
  phone_image_url: string | null
  phone_specs: {
    display?: string | null
    camera?: string | null
    battery?: BatterySpec
    ram?: string | null
    chipset?: string | null
    storage?: string | null
  } | null
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
    .select('id, device_name, device_brand, device_model, android_version, status, last_seen_at, activated_at, phone_image_url, phone_specs')
    .eq('license_id', licData?.id)
    .order('activated_at', { ascending: false }) as { data: DeviceRow[] | null }

  const activeCount = devices?.filter(d => d.status === 'ACTIVE').length ?? 0
  const maxDevices  = licData?.max_devices ?? 1

  const chipStyle = {
    fontSize: '0.7rem',
    padding: '0.2rem 0.5rem',
    borderRadius: 999,
    background: 'var(--color-surface-offset)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-muted)',
    whiteSpace: 'nowrap' as const,
  }

  return (
    <main className="camui-content">
      <div style={{ marginBottom: '1.75rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>Meus Dispositivos</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{activeCount} de {maxDevices} dispositivo(s) ativo(s)</p>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {devices.map(dev => {
            const lastSeen    = dev.last_seen_at ? new Date(dev.last_seen_at) : null
            const minutesAgo  = lastSeen ? Math.floor((Date.now() - lastSeen.getTime()) / 60000) : null
            const isOnline    = minutesAgo !== null && minutesAgo < 5
            const statusColor = dev.status === 'ACTIVE' ? 'var(--color-success)' : dev.status === 'SUSPENDED' ? 'var(--color-warning)' : 'var(--color-error)'
            const displayName = dev.device_name ?? [dev.device_brand, dev.device_model].filter(Boolean).join(' ') ?? 'Dispositivo'
            const battery     = batteryLabel(dev.phone_specs?.battery ?? null)

            return (
              <div key={dev.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
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
                  <span style={{
                    position: 'absolute', top: 10, right: 10,
                    padding: '0.2rem 0.6rem', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700,
                    background: isOnline ? 'var(--color-success)' : 'var(--color-surface)',
                    color: isOnline ? '#fff' : 'var(--color-text-muted)',
                    border: `1px solid ${isOnline ? 'var(--color-success)' : 'var(--color-border)'}`,
                  }}>
                    {isOnline ? '● Online' : 'Offline'}
                  </span>
                </div>
                <div style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>{displayName}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                    {dev.android_version ? `Android ${dev.android_version}` : ''}
                    {dev.android_version && dev.device_brand ? '  ·  ' : ''}
                    {dev.device_brand ?? ''}
                  </div>
                  {dev.phone_specs && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
                      {dev.phone_specs.ram     && <span style={chipStyle}>💾 {dev.phone_specs.ram}</span>}
                      {dev.phone_specs.camera  && <span style={chipStyle}>📷 {dev.phone_specs.camera}</span>}
                      {battery                 && <span style={chipStyle}>🔋 {battery}</span>}
                      {dev.phone_specs.display && <span style={chipStyle}>📐 {dev.phone_specs.display}</span>}
                      {dev.phone_specs.chipset && <span style={chipStyle}>⚡ {dev.phone_specs.chipset}</span>}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: statusColor }}>{dev.status}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {lastSeen
                        ? isOnline ? 'Agora'
                        : lastSeen.toLocaleDateString('pt-BR')
                        : dev.activated_at ? new Date(dev.activated_at).toLocaleDateString('pt-BR') : '—'}
                    </span>
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
