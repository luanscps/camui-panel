import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Database } from '@/types/database'
import UsersTable from './UsersTable'

export const metadata = { title: 'Usuários — CAMUI Panel' }

type UserRow = Database['public']['Views']['admin_users_overview']['Row']

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) redirect('/dashboard')

  const { data: users, error } = await supabase
    .from('admin_users_overview')
    .select('*')
    .order('registered_at', { ascending: false }) as unknown as { data: UserRow[] | null; error: { message: string } | null }

  return (
    <main className="camui-content">
      <div style={{ marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>Usuários</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            {error ? 'Erro ao carregar usuários' : `${users?.length ?? 0} usuários cadastrados`}
          </p>
        </div>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem', borderLeft: '3px solid var(--color-error)' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-error)', fontWeight: 500 }}>
            ⚠️ Erro ao consultar a view <code>admin_users_overview</code>: {error.message}
          </p>
        </div>
      )}

      {!error && <UsersTable users={users ?? []} />}
    </main>
  )
}
