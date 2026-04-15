import { createClient } from '@/lib/supabase/server'
import AdminUserActions from './UserActions'

export const metadata = { title: 'Usuários — Admin' }

type UserRow = {
  id: string
  email: string
  is_admin: boolean
  plan: string | null
  license_status: string | null
  license_id: string | null
  active_devices_count: number | null
  max_devices: number | null
  registered_at: string | null
}

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('admin_users_overview')
    .select('*')
    .order('registered_at', { ascending: false })
  const users = (data ?? []) as UserRow[]

  const planBadge = (plan: string | null) =>
    plan === 'PRO' ? 'badge-pro' : plan === 'BASIC' ? 'badge-basic' : 'badge-neutral'

  const statusBadge = (status: string | null) => {
    if (status === 'ACTIVE') return 'badge-success'
    if (status === 'SUSPENDED') return 'badge-warning'
    if (status === 'EXPIRED') return 'badge-error'
    return 'badge-neutral'
  }

  return (
    <main className="camui-content">
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>Usuários</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Lista de todos os usuários registrados</p>
        </div>
        <span className="badge badge-neutral" style={{ marginTop: '0.25rem' }}>{users.length} total</span>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3>Nenhum usuário encontrado</h3>
            <p>Ainda não há usuários cadastrados no sistema.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="camui-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Plano</th>
                  <th>Status</th>
                  <th>Devices</th>
                  <th>Cadastro</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--color-text)', fontSize: '0.8125rem' }}>{u.email}</div>
                      {u.is_admin && <span className="badge badge-admin" style={{ marginTop: '0.25rem' }}>admin</span>}
                    </td>
                    <td><span className={`badge ${planBadge(u.plan)}`}>{u.plan ?? 'Sem licença'}</span></td>
                    <td><span className={`badge ${statusBadge(u.license_status)}`}>{u.license_status ?? '—'}</span></td>
                    <td style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--color-text-muted)' }}>
                      {u.active_devices_count ?? 0}
                      <span style={{ color: 'var(--color-text-faint)' }}> / {u.max_devices ?? '—'}</span>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                      {u.registered_at ? new Date(u.registered_at).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td>
                      {u.license_id && (
                        <AdminUserActions
                          licenseId={u.license_id}
                          currentPlan={u.plan ?? 'BASIC'}
                          currentStatus={u.license_status ?? 'ACTIVE'}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
