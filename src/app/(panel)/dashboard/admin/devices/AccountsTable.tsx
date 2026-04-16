'use client'

import DeviceDrawer from './DeviceDrawer'

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

export default function AccountsTable({ accounts }: { accounts: AccountRow[] }) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-offset)' }}>
              {['Nome', 'E-mail', 'Conta', 'Plano', 'Devices', 'Ativos', 'Susp.', 'Revog.', 'Último acesso', 'Ações'].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '0.75rem 1rem',
                  fontWeight: 600, color: 'var(--color-text-muted)',
                  fontSize: '0.7rem', textTransform: 'uppercase',
                  letterSpacing: '0.05em', whiteSpace: 'nowrap'
                }}>
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
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {acc.fullName}
                  </td>

                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {acc.email}
                  </td>

                  <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-primary)', whiteSpace: 'nowrap' }}>
                    #{acc.accountNumber ?? '——'}
                  </td>

                  <td style={{ padding: '0.75rem 1rem' }}>
                    {acc.plan !== '—'
                      ? <span className={`badge badge-${acc.plan === 'PRO' ? 'pro' : 'basic'}`}>{acc.plan}</span>
                      : <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>—</span>
                    }
                  </td>

                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, textAlign: 'center' }}>
                    {acc.deviceCount}
                  </td>

                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--color-success)', fontWeight: 600 }}>
                    {acc.activeCount}
                  </td>

                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: acc.suspendedCount > 0 ? 'var(--color-warning)' : 'var(--color-text-muted)' }}>
                    {acc.suspendedCount}
                  </td>

                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: acc.revokedCount > 0 ? 'var(--color-error)' : 'var(--color-text-muted)' }}>
                    {acc.revokedCount}
                  </td>

                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                    {lastSeen
                      ? isOnline
                        ? <span style={{ color: 'var(--color-success)', fontWeight: 500 }}>🟢 Online</span>
                        : lastSeen.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
                      : '—'}
                  </td>

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
  )
}