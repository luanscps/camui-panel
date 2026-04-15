import { createClient } from '@/lib/supabase/server'
import UserActions from './UserActions'

export const metadata = { title: 'Usuários — CAMUI Panel' }

type User = {
  id: string
  full_name: string | null
}

type License = {
  id: string
  plan: string
  status: string
  expires_at: string | null
  user_id: string
}

export default async function AdminUsersPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createClient()) as any

  const { data: users } = await supabase
    .from('profiles')
    .select('id, full_name')
    .order('id') as { data: User[] | null }

  const userIds = users?.map((u: User) => u.id) ?? []
  const { data: licenses } = await supabase
    .from('licenses')
    .select('id, plan, status, expires_at, user_id')
    .in('user_id', userIds) as { data: License[] | null }

  return (
    <main className="camui-content">
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>Usuários</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{users?.length ?? 0} usuários cadastrados</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Nome', 'ID', 'Plano', 'Status', 'Expira em', 'Ações'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users?.map((u: User) => {
                const lic = licenses?.find((l: License) => l.user_id === u.id)
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.75rem 1rem' }}>{u.full_name ?? '—'}</td>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{u.id.slice(0, 8)}…</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className={`badge badge-${lic?.plan === 'PRO' ? 'pro' : 'basic'}`}>{lic?.plan ?? '—'}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ color: lic?.status === 'ACTIVE' ? 'var(--color-success)' : 'var(--color-warning)', fontWeight: 500 }}>{lic?.status ?? '—'}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                      {lic?.expires_at ? new Date(lic.expires_at).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {lic ? <UserActions licenseId={lic.id} currentPlan={lic.plan} currentStatus={lic.status} /> : '—'}
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
