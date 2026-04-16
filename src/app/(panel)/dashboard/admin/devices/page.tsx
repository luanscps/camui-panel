import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'

export const metadata = { title: 'Dispositivos — Admin CAMUI' }

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
  phone_specs: Record<string, string | null> | null
  sub_license_key: string | null
  licenses: {
    account_number: string | null
    plan: string
    profiles: { full_name: string | null } | null
  } | null
}

export default async function AdminDevicesPage() {
  const supabase = (await createClient()) as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: devices } = await supabase
    .from('device_activations')
    .select(`
      id, device_name, device_brand, device_model, android_version,
      status, last_seen_at, activated_at, phone_image_url, phone_specs, sub_license_key,
      licenses ( account_number, plan, profiles ( full_name ) )
    `)
    .order('activated_at', { ascending: false })
    .limit(200) as { data: DeviceRow[] | null }

  const total  = devices?.length ?? 0
  const online = devices?.filter(d => {
    const t = d.last_seen_at ? new Date(d.last_seen_at) : null
    return t && (Date.now() - t.getTime()) < 5 * 60 * 1000
  }).length ?? 0

  return (
    <main className="camui-content">
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>Dispositivos — Admin</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{total} dispositivos cadastrados · {online} online agora</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total',     value: total,                                                      color: 'var(--color-text)'    },
          { label: 'Online',    value: online,                                                     color: 'var(--color-success)' },
          { label: 'Ativos',    value: devices?.filter(d => d.status === 'ACTIVE').length    ?? 0, color: 'var(--color-primary)' },
          { label: 'Suspensos', value: devices?.filter(d => d.status === 'SUSPENDED').length ?? 0, color: 'var(--color-warning)' },
          { label: 'Revogados', value: devices?.filter(d => d.status === 'REVOKED').length   ?? 0, color: 'var(--color-error)'   },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-offset)' }}>
                {['', 'Dispositivo', 'Cliente', 'Conta', 'Plano', 'Android', 'Status', 'Último acesso'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {devices?.map(dev => {
                const lastSeen    = dev.last_seen_at ? new Date(dev.last_seen_at) : null
                const minutesAgo  = lastSeen ? Math.floor((Date.now() - lastSeen.getTime()) / 60000) : null
                const isOnline    = minutesAgo !== null && minutesAgo < 5
                const statusColor = dev.status === 'ACTIVE' ? 'var(--color-success)' : dev.status === 'SUSPENDED' ? 'var(--color-warning)' : 'var(--color-error)'
                const displayName = dev.device_name ?? [dev.device_brand, dev.device_model].filter(Boolean).join(' ') ?? 'Dispositivo'

                return (
                  <tr key={dev.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.5rem 0.75rem', width: 52 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: 'var(--color-surface-offset)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {dev.phone_image_url ? (
                          <Image src={dev.phone_image_url} alt={displayName} width={44} height={44} style={{ objectFit: 'contain' }} />
                        ) : (
                          <span style={{ fontSize: '1.4rem' }}>📱</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600 }}>{displayName}</div>
                      {dev.phone_specs?.ram && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                          {[dev.phone_specs.ram, dev.phone_specs.camera].filter(Boolean).join(' · ')}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)' }}>
                      {dev.licenses?.profiles?.full_name ?? '—'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-primary)' }}>
                      #{dev.licenses?.account_number ?? '——'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className={`badge badge-${dev.licenses?.plan === 'PRO' ? 'pro' : 'basic'}`}>{dev.licenses?.plan ?? '—'}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                      {dev.android_version ? `Android ${dev.android_version}` : '—'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: isOnline ? 'var(--color-success)' : 'var(--color-border)', display: 'inline-block' }} />
                        <span style={{ fontWeight: 600, fontSize: '0.78rem', color: statusColor }}>{dev.status}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      {lastSeen
                        ? isOnline
                          ? <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Online agora</span>
                          : lastSeen.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
