import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminDeviceActions from './AdminDeviceActions'

export const metadata = { title: 'Dispositivos — Admin CAMUI' }

type DeviceRow = {
  id:              string
  status:          string | null
  sub_license_key: string | null
  device_name:     string | null
  device_brand:    string | null
  device_model:    string | null
  device_hardware: string | null
  android_version: string | null
  sdk_int:         number | null
  android_id:      string | null
  app_version:     string | null
  fingerprint:     string | null
  activated_at:    string | null
  last_seen:       string | null
  license_id:      string
  // join
  licenses: {
    plan:        string
    status:      string
    license_key: string | null
    user_email:  string | null
  } | null
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '—'
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'agora'
  if (m < 60) return `há ${m}min`
  const h = Math.floor(m / 60)
  if (h < 24) return `há ${h}h`
  const d = Math.floor(h / 24)
  if (d < 30) return `há ${d}d`
  return new Date(dateStr).toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'numeric' })
}

function isOnline(dateStr: string | null) {
  if (!dateStr) return false
  return Date.now() - new Date(dateStr).getTime() < 5 * 60 * 1000
}

export default async function AdminDevicesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createClient()) as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!profile?.is_admin) redirect('/dashboard')

  const { filter = 'ALL', q = '' } = await searchParams

  // Busca todos os devices com join na licença mãe
  let query = supabase
    .from('device_activations')
    .select(`
      id, status, sub_license_key,
      device_name, device_brand, device_model, device_hardware,
      android_version, sdk_int, android_id, app_version, fingerprint,
      activated_at, last_seen, license_id,
      licenses (
        plan, status, license_key,
        profiles ( full_name ),
        user_id
      )
    `)
    .order('last_seen', { ascending: false })

  if (filter === 'ACTIVE')    query = query.eq('status', 'ACTIVE')
  if (filter === 'SUSPENDED') query = query.eq('status', 'SUSPENDED')

  const { data: rawDevices } = await query
  let devices: DeviceRow[] = (rawDevices ?? []) as DeviceRow[]

  // Busca emails via admin API para cada user_id
  const userIds: string[] = [...new Set(
    devices
      .map((d: any) => (d.licenses as any)?.user_id) // eslint-disable-line
      .filter(Boolean)
  )]

  const emailMap: Record<string, string> = {}
  for (const uid of userIds) {
    const { data: { user: u } } = await supabase.auth.admin.getUserById(uid)
    if (u?.email) emailMap[uid] = u.email
  }

  // Aplica emailMap e filtro de busca
  devices = devices
    .map((d: any) => { // eslint-disable-line
      const uid = d.licenses?.user_id
      return {
        ...d,
        licenses: d.licenses ? { ...d.licenses, user_email: uid ? (emailMap[uid] ?? null) : null } : null,
      }
    })
    .filter((d: DeviceRow) => {
      if (!q.trim()) return true
      const search = q.toLowerCase()
      return (
        d.sub_license_key?.toLowerCase().includes(search) ||
        d.device_name?.toLowerCase().includes(search) ||
        d.device_brand?.toLowerCase().includes(search) ||
        d.licenses?.user_email?.toLowerCase().includes(search) ||
        d.android_id?.toLowerCase().includes(search)
      )
    })

  // Contadores
  const total      = (rawDevices ?? []).length
  const activeCount    = (rawDevices ?? []).filter((d: any) => d.status === 'ACTIVE').length    // eslint-disable-line
  const suspendedCount = (rawDevices ?? []).filter((d: any) => d.status === 'SUSPENDED').length // eslint-disable-line
  const onlineCount    = (rawDevices ?? []).filter((d: any) => isOnline(d.last_seen)).length    // eslint-disable-line

  const filterOptions = [
    { value: 'ALL',       label: `Todos (${total})` },
    { value: 'ACTIVE',    label: `Ativos (${activeCount})` },
    { value: 'SUSPENDED', label: `Suspensos (${suspendedCount})` },
  ]

  return (
    <main className="camui-content">

      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
            Dispositivos
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Gerencie as sub-licenças de cada dispositivo registrado no sistema.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total',     value: total,          color: 'var(--color-primary)' },
          { label: 'Ativos',    value: activeCount,    color: 'var(--color-success)' },
          { label: 'Suspensos', value: suspendedCount, color: 'var(--color-warning)' },
          { label: 'Online',    value: onlineCount,    color: 'var(--color-blue)'    },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filtros + busca */}
      <div className="card" style={{ padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {filterOptions.map(({ value, label }) => (
            <a
              key={value}
              href={`/admin/devices?filter=${value}&q=${encodeURIComponent(q)}`}
              className="btn btn-xs"
              style={{
                background: filter === value ? 'var(--color-primary)' : 'var(--color-surface-offset)',
                color: filter === value ? 'white' : 'var(--color-text-muted)',
                border: `1px solid ${filter === value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                fontWeight: filter === value ? 600 : 400,
                textDecoration: 'none',
              }}
            >
              {label}
            </a>
          ))}
        </div>

        <form method="get" action="/admin/devices" style={{ flex: 1, minWidth: 200, display: 'flex', gap: '0.375rem' }}>
          <input type="hidden" name="filter" value={filter} />
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por email, sub-licença, dispositivo, Android ID..."
            style={{
              flex: 1, fontSize: '0.8125rem', padding: '0.375rem 0.625rem',
              border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
              background: 'var(--color-surface)', color: 'var(--color-text)', outline: 'none',
            }}
          />
          <button type="submit" className="btn btn-xs btn-primary">Buscar</button>
        </form>
      </div>

      {/* Tabela */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {devices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18.01"/>
              </svg>
            </div>
            <h3>Nenhum dispositivo encontrado</h3>
            <p>Tente mudar o filtro ou a busca.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="camui-table">
              <thead>
                <tr>
                  <th>Dispositivo</th>
                  <th>Sub-licença</th>
                  <th>Usuário</th>
                  <th>Plano</th>
                  <th>Android</th>
                  <th>Status</th>
                  <th>Último acesso</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device) => {
                  const online = isOnline(device.last_seen)
                  const isSuspended = device.status === 'SUSPENDED'
                  const brandModel = [device.device_brand, device.device_name].filter(Boolean).join(' ')
                  const androidLabel = device.android_version
                    ? `Android ${device.android_version}`
                    : device.sdk_int ? `API ${device.sdk_int}` : '—'

                  return (
                    <tr
                      key={device.id}
                      style={{
                        opacity: isSuspended ? 0.65 : 1,
                        background: isSuspended ? 'rgba(218,113,1,0.03)' : undefined,
                      }}
                    >
                      {/* Dispositivo */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ position: 'relative', flexShrink: 0 }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: 'var(--radius-sm)',
                              background: isSuspended ? 'rgba(218,113,1,0.08)' : 'rgba(1,105,111,0.08)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: isSuspended ? 'var(--color-warning)' : 'var(--color-primary)',
                            }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18.01"/>
                              </svg>
                            </div>
                            <span style={{
                              position:'absolute', bottom:-2, right:-2,
                              width:8, height:8, borderRadius:'50%',
                              background: isSuspended ? 'var(--color-warning)' : online ? 'var(--color-success)' : 'var(--color-text-faint)',
                              border:'2px solid var(--color-surface)',
                            }}/>
                          </div>
                          <div>
                            <div style={{ fontWeight:600, fontSize:'0.8125rem', color:'var(--color-text)', whiteSpace:'nowrap' }}>
                              {brandModel || 'Android Device'}
                            </div>
                            <div style={{ fontSize:'0.6875rem', color:'var(--color-text-muted)' }}>
                              {device.device_model ?? device.device_hardware ?? '—'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Sub-licença */}
                      <td>
                        {device.sub_license_key ? (
                          <code style={{
                            fontSize:'0.75rem', fontFamily:'monospace',
                            color:'var(--color-primary)',
                            background:'rgba(1,105,111,0.06)',
                            padding:'0.1rem 0.4rem', borderRadius:'var(--radius-sm)',
                            letterSpacing:'0.04em', whiteSpace:'nowrap',
                          }}>
                            {device.sub_license_key}
                          </code>
                        ) : <span style={{ color:'var(--color-text-faint)' }}>—</span>}
                      </td>

                      {/* Usuário */}
                      <td style={{ fontSize:'0.8125rem', color:'var(--color-text-muted)', maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {device.licenses?.user_email ?? '—'}
                      </td>

                      {/* Plano */}
                      <td>
                        <span className={`badge badge-${device.licenses?.plan === 'PRO' ? 'pro' : 'basic'}`}>
                          {device.licenses?.plan ?? '—'}
                        </span>
                      </td>

                      {/* Android */}
                      <td style={{ fontSize:'0.75rem', color:'var(--color-text-muted)', whiteSpace:'nowrap' }}>{androidLabel}</td>

                      {/* Status sub-licença */}
                      <td>
                        <span style={{
                          fontSize:'0.6875rem', fontWeight:600,
                          color: isSuspended ? 'var(--color-warning)' : online ? 'var(--color-success)' : 'var(--color-text-muted)',
                          background: isSuspended ? 'rgba(218,113,1,0.08)' : online ? 'rgba(67,122,34,0.08)' : 'var(--color-surface-offset)',
                          padding:'0.1rem 0.45rem', borderRadius:'var(--radius-full)',
                          textTransform:'uppercase', letterSpacing:'0.04em', whiteSpace:'nowrap',
                        }}>
                          {isSuspended ? '⏸ Suspenso' : online ? '● Online' : '○ Offline'}
                        </span>
                      </td>

                      {/* Último acesso */}
                      <td style={{ fontSize:'0.75rem', color: online && !isSuspended ? 'var(--color-success)' : 'var(--color-text-muted)', whiteSpace:'nowrap', fontVariantNumeric:'tabular-nums' }}>
                        {timeAgo(device.last_seen)}
                      </td>

                      {/* Ações */}
                      <td>
                        <AdminDeviceActions
                          activationId={device.id}
                          status={device.status ?? 'ACTIVE'}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </main>
  )
}
