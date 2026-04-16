import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import DeviceActionsClient from './DeviceActionsClient'

export const metadata = { title: 'Dispositivos — CAMUI Panel' }

type DeviceRow = {
  id: string
  device_name: string | null
  device_brand: string | null
  device_model: string | null
  device_hardware: string | null
  android_version: string | null
  android_id: string | null
  app_version: string | null
  sdk_int: number | null
  status: string
  sub_license_key: string | null
  last_seen_at: string | null
  activated_at: string | null
  license_id: string
  phone_image_url: string | null
  phone_specs: Record<string, string | null> | null
  licenses: {
    plan: string
    user_id: string
    account_number: string | null
  } | null
}

type Profile = { id: string; full_name: string | null }

export default async function AdminDevicesPage() {
  const supabase = (await createClient()) as any

  // Verifica se é admin pelo campo correto is_admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!profile?.is_admin) redirect('/dashboard')

  const { data: devices, error } = await supabase
    .from('device_activations')
    .select(`
      id, device_name, device_brand, device_model, device_hardware,
      android_version, android_id, app_version, sdk_int,
      status, sub_license_key, last_seen_at, activated_at, license_id,
      phone_image_url, phone_specs,
      licenses ( plan, user_id, account_number )
    `)
    .order('last_seen_at', { ascending: false, nullsFirst: false }) as { data: DeviceRow[] | null; error: unknown }

  if (error) console.error('[AdminDevices] query error:', error)

  const userIds = [...new Set(
    devices?.map(d => d.licenses?.user_id).filter(Boolean) ?? []
  )]

  const { data: profiles } = userIds.length
    ? await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds) as { data: Profile[] | null }
    : { data: [] as Profile[] }

  const total     = devices?.length ?? 0
  const online    = devices?.filter(d => {
    const t = d.last_seen_at ? new Date(d.last_seen_at) : null
    return t && (Date.now() - t.getTime()) < 5 * 60 * 1000
  }).length ?? 0
  const ativos    = devices?.filter(d => d.status === 'ACTIVE').length    ?? 0
  const suspensos = devices?.filter(d => d.status === 'SUSPENDED').length ?? 0
  const revogados = devices?.filter(d => d.status === 'REVOKED').length   ?? 0

  const kpis = [
    { label: 'Total',     value: total,     color: 'var(--color-primary)' },
    { label: 'Online',    value: online,    color: 'var(--color-success)' },
    { label: 'Ativos',    value: ativos,    color: 'var(--color-success)' },
    { label: 'Suspensos', value: suspensos, color: 'var(--color-warning)' },
    { label: 'Revogados', value: revogados, color: 'var(--color-error)'   },
  ]

  return (
    <main className="camui-content">
      <style>{`
        .device-row { transition: background 0.15s; }
        .device-row:hover { background: var(--color-surface-offset); }
      `}</style>

      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>Dispositivos</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Gerencie as sub-licenças de cada dispositivo cadastrado no sistema</p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        {kpis.map(k => (
          <div key={k.label} className="card" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '0.375rem' }}>{k.label}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: k.color, lineHeight: 1 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-offset)' }}>
                {[
                  '', 'Dispositivo', 'Marca / Modelo', 'Android', 'Android ID',
                  'Usuário', 'Conta', 'Plano', 'Sub-licença', 'App Ver.', 'Status', 'Último acesso', 'Ações',
                ].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!devices?.length && (
                <tr>
                  <td colSpan={13} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    Nenhum dispositivo cadastrado ainda
                  </td>
                </tr>
              )}
              {devices?.map(dev => {
                const profile      = profiles?.find((p: Profile) => p.id === dev.licenses?.user_id)
                const statusColor  = dev.status === 'ACTIVE' ? 'var(--color-success)' : dev.status === 'SUSPENDED' ? 'var(--color-warning)' : 'var(--color-error)'
                const lastSeen     = dev.last_seen_at ? new Date(dev.last_seen_at) : null
                const minutesAgo   = lastSeen ? Math.floor((Date.now() - lastSeen.getTime()) / 60000) : null
                const isOnline     = minutesAgo !== null && minutesAgo < 5
                const displayName  = dev.device_name ?? 'Sem nome'

                return (
                  <tr key={dev.id} className="device-row" style={{ borderBottom: '1px solid var(--color-border)' }}>

                    {/* Foto */}
                    <td style={{ padding: '0.5rem 0.75rem', width: 52 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: 'var(--color-surface-offset)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {dev.phone_image_url ? (
                          <Image src={dev.phone_image_url} alt={displayName} width={44} height={44} style={{ objectFit: 'contain' }} />
                        ) : (
                          <span style={{ fontSize: '1.4rem' }}>📱</span>
                        )}
                      </div>
                    </td>

                    {/* Dispositivo */}
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, display: 'inline-block', background: isOnline ? 'var(--color-success)' : 'var(--color-border)' }} />
                        {dev.device_name ?? <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>Sem nome</span>}
                      </div>
                      {dev.phone_specs?.ram && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                          {[dev.phone_specs.ram, dev.phone_specs.camera].filter(Boolean).join(' · ')}
                        </div>
                      )}
                    </td>

                    {/* Marca / Modelo */}
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      {[dev.device_brand, dev.device_model].filter(Boolean).join(' / ') || '—'}
                      {dev.device_hardware && (
                        <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{dev.device_hardware}</div>
                      )}
                    </td>

                    {/* Android */}
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      {dev.android_version ? `Android ${dev.android_version}` : '—'}
                      {dev.sdk_int ? <span style={{ fontSize: '0.7rem', marginLeft: '0.25rem', opacity: 0.6 }}>(SDK {dev.sdk_int})</span> : null}
                    </td>

                    {/* Android ID */}
                    <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                      <code style={{ background: 'var(--color-surface-offset)', padding: '0.1rem 0.4rem', borderRadius: 'var(--radius-sm)', fontSize: '0.7rem' }}>
                        {dev.android_id ? dev.android_id.slice(0, 12) + '…' : '—'}
                      </code>
                    </td>

                    {/* Usuário */}
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem' }}>
                      {profile?.full_name ?? <span style={{ color: 'var(--color-text-muted)' }}>—</span>}
                    </td>

                    {/* Conta */}
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-primary)', whiteSpace: 'nowrap' }}>
                      #{dev.licenses?.account_number ?? '——'}
                    </td>

                    {/* Plano */}
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {dev.licenses?.plan
                        ? <span className={`badge badge-${dev.licenses.plan === 'PRO' ? 'pro' : 'basic'}`}>{dev.licenses.plan}</span>
                        : <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>—</span>}
                    </td>

                    {/* Sub-licença */}
                    <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                      <code style={{ background: 'var(--color-surface-offset)', padding: '0.1rem 0.4rem', borderRadius: 'var(--radius-sm)', fontSize: '0.7rem' }}>
                        {dev.sub_license_key ? dev.sub_license_key.slice(0, 14) + '…' : '—'}
                      </code>
                    </td>

                    {/* App Version */}
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      {dev.app_version ?? '—'}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.8rem', color: statusColor }}>{dev.status}</span>
                    </td>

                    {/* Último acesso */}
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      {lastSeen
                        ? isOnline
                          ? <span style={{ color: 'var(--color-success)', fontWeight: 500 }}>Online agora</span>
                          : lastSeen.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </td>

                    {/* Ações */}
                    <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                      <DeviceActionsClient
                        deviceId={dev.id}
                        currentStatus={dev.status}
                        deviceName={dev.device_name ?? 'Dispositivo'}
                      />
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
