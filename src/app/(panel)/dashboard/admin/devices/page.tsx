import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DeviceDrawer from './DeviceDrawer'

export const metadata = { title: 'Dispositivos — CAMUI Panel' }

type DeviceRow = {
  id: string
  device_name: string | null
  device_brand: string | null
  device_model: string | null
  android_version: string | null
  android_id: string | null
  app_version: string | null
  status: string
  sub_license_key: string | null
  last_seen_at: string | null
  phone_image_url: string | null
  phone_specs: Record<string, string | null> | null
  license_id: string
  licenses: {
    plan: string
    user_id: string
    account_number: string | null
  } | null
}

type AdminUser = {
  id: string | null
  email: string | null
  full_name: string | null
  plan: string | null
  license_id: string | null
}

type AccountRow = {
  userId: string
  fullName: string
  email: string
  plan: string
  accountNumber: string | null
  deviceCount: number
  activeCount: number
  suspendedCount: number
  revokedCount: number
  lastSeen: string | null
  devices: DeviceRow[]
}

export default async function AdminDevicesPage() {
  const supabase = (await createClient()) as any

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!profile?.is_admin) redirect('/dashboard')

  // Busca devices
  const { data: devices, error } = await supabase
    .from('device_activations')
    .select(`
      id, device_name, device_brand, device_model,
      android_version, android_id, app_version,
      status, sub_license_key, last_seen_at, license_id,
      phone_image_url, phone_specs,
      licenses ( plan, user_id, account_number )
    `)
    .order('last_seen_at', { ascending: false, nullsFirst: false }) as { data: DeviceRow[] | null; error: unknown }

  if (error) console.error('[AdminDevices] query error:', error)

  // Busca usuários pela view admin_users_overview (tem id, email, full_name)
  const { data: adminUsers } = await supabase
    .from('admin_users_overview')
    .select('id, email, full_name, plan, license_id') as { data: AdminUser[] | null }

  const userMap = new Map<string, AdminUser>()
  for (const u of adminUsers ?? []) {
    if (u.id) userMap.set(u.id, u)
  }

  // Agrupa devices por conta
  const accountMap = new Map<string, AccountRow>()

  for (const dev of devices ?? []) {
    const uid = dev.licenses?.user_id
    if (!uid) continue
    const u = userMap.get(uid)

    if (!accountMap.has(uid)) {
      accountMap.set(uid, {
        userId: uid,
        fullName: u?.full_name ?? 'Sem nome',
        email: u?.email ?? '—',
        plan: dev.licenses?.plan ?? u?.plan ?? '—',
        accountNumber: dev.licenses?.account_number ?? null,
        deviceCount: 0,
        activeCount: 0,
        suspendedCount: 0,
        revokedCount: 0,
        lastSeen: null,
        devices: [],
      })
    }

    const acc = accountMap.get(uid)!
    acc.deviceCount++
    if (dev.status === 'ACTIVE')    acc.activeCount++
    if (dev.status === 'SUSPENDED') acc.suspendedCount++
    if (dev.status === 'REVOKED')   acc.revokedCount++
    if (dev.last_seen_at && (!acc.lastSeen || dev.last_seen_at > acc.lastSeen)) {
      acc.lastSeen = dev.last_seen_at
    }
    acc.devices.push(dev)
  }

  const accounts = [...accountMap.values()]

  const totalAccounts  = accounts.length
  const totalDevices   = devices?.length ?? 0
  const totalOnline    = devices?.filter(d => {
    const t = d.last_seen_at ? new Date(d.last_seen_at) : null
    return t && (Date.now() - t.getTime()) < 5 * 60 * 1000
  }).length ?? 0
  const totalAtivos    = devices?.filter(d => d.status === 'ACTIVE').length ?? 0
  const totalSuspensos = devices?.filter(d => d.status === 'SUSPENDED').length ?? 0
  const totalRevogados = devices?.filter(d => d.status === 'REVOKED').length ?? 0

  const kpis = [
    { label: 'Contas',    value: totalAccounts,  color: 'var(--color-primary)' },
    { label: 'Devices',   value: totalDevices,   color: 'var(--color-text)' },
    { label: 'Online',    value: totalOnline,    color: 'var(--color-success)' },
    { label: 'Ativos',    value: totalAtivos,    color: 'var(--color-success)' },
    { label: 'Suspensos', value: totalSuspensos, color: 'var(--color-warning)' },
    { label: 'Revogados', value: totalRevogados, color: 'var(--color-error)' },
  ]

  return (
    <main className="camui-content">
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
          Dispositivos
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          Contas cadastradas e seus dispositivos vinculados
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        {kpis.map(k => (
          <div key={k.label} className="card" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '0.375rem' }}>
              {k.label}
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: k.color, lineHeight: 1 }}>
              {k.value}
            </div>
          </div>
        ))}
      </div>

      {/* Tabela de contas */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-offset)' }}>
                {['Nome', 'E-mail', 'Conta', 'Plano', 'Devices', 'Ativos', 'Susp.', 'Revog.', 'Último acesso', 'Ações'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!accounts.length && (
                <tr>
                  <td colSpan={10} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    Nenhuma conta com dispositivo cadastrado
                  </td>
                </tr>
              )}
              {accounts.map(acc => {
                const lastSeen = acc.lastSeen ? new Date(acc.lastSeen) : null
                const isOnline = lastSeen ? (Date.now() - lastSeen.getTime()) < 5 * 60 * 1000 : false

                return (
                  <tr
                    key={acc.userId}
                    style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 150ms' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-offset)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                  >
                    {/* Nome */}
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {acc.fullName}
                    </td>

                    {/* E-mail */}
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {acc.email}
                    </td>

                    {/* Conta */}
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-primary)', whiteSpace: 'nowrap' }}>
                      #{acc.accountNumber ?? '——'}
                    </td>

                    {/* Plano */}
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {acc.plan !== '—'
                        ? <span className={`badge badge-${acc.plan === 'PRO' ? 'pro' : 'basic'}`}>{acc.plan}</span>
                        : <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>—</span>
                      }
                    </td>

                    {/* Devices total */}
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, textAlign: 'center' }}>
                      {acc.deviceCount}
                    </td>

                    {/* Ativos */}
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--color-success)', fontWeight: 600 }}>
                      {acc.activeCount}
                    </td>

                    {/* Suspensos */}
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: acc.suspendedCount > 0 ? 'var(--color-warning)' : 'var(--color-text-muted)', fontWeight: 600 }}>
                      {acc.suspendedCount}
                    </td>

                    {/* Revogados */}
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: acc.revokedCount > 0 ? 'var(--color-error)' : 'var(--color-text-muted)', fontWeight: 600 }}>
                      {acc.revokedCount}
                    </td>

                    {/* Último acesso */}
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      {lastSeen
                        ? isOnline
                          ? <span style={{ color: 'var(--color-success)', fontWeight: 500 }}>🟢 Online</span>
                          : lastSeen.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </td>

                    {/* Ações */}
                    <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                      <DeviceDrawer account={acc} />
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