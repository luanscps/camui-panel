import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Database } from '@/types/database'
import UserActions from './UserActions'

export const metadata = { title: 'Usuários — CAMUI Panel' }

type UserRow = Database['public']['Views']['admin_users_overview']['Row']

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single() as unknown as { data: { is_admin: boolean } | null }

  if (!profile?.is_admin) redirect('/dashboard')

  const { data: users, error } = await supabase
    .from('admin_users_overview')
    .select('*')
    .order('registered_at', { ascending: false }) as unknown as { data: UserRow[] | null; error: { message: string } | null }

  return (
    <main className="camui-content">
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>Usuários</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          {error ? 'Erro ao carregar usuários' : `${users?.length ?? 0} usuários cadastrados`}
        </p>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem', borderLeft: '3px solid var(--color-error)' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-error)', fontWeight: 500 }}>
            ⚠️ Erro ao consultar a view <code>admin_users_overview</code>: {error.message}
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            Verifique se a view existe e se a RLS permite leitura para o role <code>authenticated</code>.
          </p>
        </div>
      )}

      {!error && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['Usuário', 'Email', 'Plano', 'Status', 'Devices', 'Expira em', 'Admin', 'Ações'].map(h => (
                    <th key={h} style={{
                      textAlign: 'left', padding: '0.75rem 1rem',
                      fontWeight: 600, color: 'var(--color-text-muted)',
                      fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users && users.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      Nenhum usuário encontrado
                    </td>
                  </tr>
                )}
                {users?.map((u: UserRow, idx: number) => (
                  // Bug 2 fix: key nunca null
                  <tr key={u.id ?? u.email ?? idx} style={{ borderBottom: '1px solid var(--color-border)' }}>

                    {/* Nome */}
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>
                      {u.full_name ?? <span style={{ color: 'var(--color-text-muted)' }}>—</span>}
                    </td>

                    {/* Email */}
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                      {u.email ?? '—'}
                    </td>

                    {/* Plano */}
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {u.plan
                        ? <span className={`badge badge-${u.plan === 'PRO' ? 'pro' : 'basic'}`}>{u.plan}</span>
                        : <span style={{ color: 'var(--color-text-muted)' }}>—</span>}
                    </td>

                    {/* Status — Bug 4 fix: null não recebe cor warning */}
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {u.license_status ? (
                        <span style={{
                          fontWeight: 500,
                          color: u.license_status === 'ACTIVE'
                            ? 'var(--color-success)'
                            : u.license_status === 'EXPIRED'
                              ? 'var(--color-error)'
                              : 'var(--color-warning)'
                        }}>
                          {u.license_status}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                      )}
                    </td>

                    {/* Devices ativos / máx */}
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem' }}>
                      {u.license_id
                        ? <>{u.active_devices_count ?? 0}<span style={{ color: 'var(--color-text-muted)' }}> / {u.max_devices ?? '?'}</span></>
                        : <span style={{ color: 'var(--color-text-muted)' }}>—</span>}
                    </td>

                    {/* Expira em */}
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                      {u.expires_at ? new Date(u.expires_at).toLocaleDateString('pt-BR') : '—'}
                    </td>

                    {/* is_admin badge */}
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {u.is_admin
                        ? <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)', background: 'var(--color-primary-highlight)', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)' }}>Admin</span>
                        : <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>User</span>}
                    </td>

                    {/* Ações */}
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {u.license_id
                        ? <UserActions
                            licenseId={u.license_id}
                            currentPlan={u.plan ?? 'BASIC'}
                            currentStatus={u.license_status ?? 'ACTIVE'}
                          />
                        : <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Sem licença</span>}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  )
}
