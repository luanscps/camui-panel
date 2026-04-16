// src/app/(panel)/dashboard/admin/users/UsersTable.tsx
'use client'

import DeleteUserButton from './DeleteUserButton'
import EditLicenseButton from './EditLicenseButton'
import CreateLicenseButton from './CreateLicenseButton'

type UserRow = {
  id: string | null
  email: string | null
  full_name: string | null
  is_admin: boolean | null
  plan: string | null
  license_id: string | null
  license_status: string | null
  max_devices: number | null
  active_devices_count: number | null
  expires_at: string | null
  registered_at: string | null
  last_sign_in_at: string | null
}

export default function UsersTable({ users }: { users: UserRow[] }) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-offset)' }}>
              {['Usuário', 'Email', 'Plano', 'Status', 'Devices', 'Último acesso', 'Expira em', 'Cadastro', 'Ações', ''].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600,
                  color: 'var(--color-text-muted)', fontSize: '0.7rem',
                  textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={10} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                  Nenhum usuário encontrado
                </td>
              </tr>
            )}
            {users.map((u, idx) => (
              <tr
                key={u.id ?? idx}
                style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 150ms' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(1,105,111,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
              >
                <td style={{ padding: '0.75rem 1rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    {u.full_name ?? <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>Sem nome</span>}
                  </div>
                  {u.is_admin && (
                    <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-primary)', background: 'rgba(1,105,111,0.1)', padding: '0.1rem 0.4rem', borderRadius: '999px' }}>Admin</span>
                  )}
                </td>

                <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)', fontSize: '0.8125rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {u.email ?? '—'}
                </td>

                <td style={{ padding: '0.75rem 1rem' }}>
                  {u.plan
                    ? <span className={`badge badge-${u.plan === 'PRO' ? 'pro' : 'basic'}`}>{u.plan}</span>
                    : <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>—</span>}
                </td>

                <td style={{ padding: '0.75rem 1rem' }}>
                  {u.license_status ? (
                    <span style={{
                      fontWeight: 600, fontSize: '0.8rem',
                      color: u.license_status === 'ACTIVE' ? 'var(--color-success)'
                        : u.license_status === 'EXPIRED' ? 'var(--color-error)'
                        : 'var(--color-warning)',
                    }}>{u.license_status}</span>
                  ) : <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>—</span>}
                </td>

                <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem' }}>
                  {u.license_id
                    ? <>{u.active_devices_count ?? 0}<span style={{ color: 'var(--color-text-muted)' }}> / {u.max_devices ?? '?'}</span></>
                    : <span style={{ color: 'var(--color-text-muted)' }}>—</span>}
                </td>

                <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                  {u.last_sign_in_at
                    ? <span style={{ color: 'var(--color-text-muted)' }}>{new Date(u.last_sign_in_at).toLocaleDateString('pt-BR')}</span>
                    : <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-error)', background: 'var(--color-error-bg)', padding: '0.15rem 0.5rem', borderRadius: '999px' }}>Nunca acessou</span>
                  }
                </td>

                <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                  {u.expires_at ? new Date(u.expires_at).toLocaleDateString('pt-BR') : '—'}
                </td>

                <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                  {u.registered_at ? new Date(u.registered_at).toLocaleDateString('pt-BR') : '—'}
                </td>

                <td style={{ padding: '0.75rem 1rem' }}>
                  <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                    {u.license_id ? (
                      <EditLicenseButton
                        licenseId={u.license_id}
                        currentPlan={u.plan ?? 'BASIC'}
                        currentStatus={u.license_status ?? 'ACTIVE'}
                        currentMaxDevices={u.max_devices ?? 1}
                        currentExpiresAt={u.expires_at}
                      />
                    ) : u.id && u.email ? (
                      <CreateLicenseButton userId={u.id} userEmail={u.email} />
                    ) : null}
                  </div>
                </td>

                <td style={{ padding: '0.75rem 1rem' }}>
                  {u.id && u.email && !u.is_admin ? (
                    <DeleteUserButton userId={u.id} userEmail={u.email} />
                  ) : (
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}