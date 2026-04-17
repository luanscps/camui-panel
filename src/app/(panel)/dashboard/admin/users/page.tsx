// src/app/(panel)/dashboard/admin/users/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Database } from '@/types/database'
import UsersTable from './UsersTable'
import UsersControls from './UsersControls'
import type { SortField, SortDir } from './UsersControls'
import { Suspense } from 'react'

export const metadata = { title: 'Usuários — CAMUI Panel' }

type UserRow = Database['public']['Views']['admin_users_overview']['Row']

const PAGE_SIZE = 20

const VALID_SORT_FIELDS: SortField[] = [
  'registered_at', 'last_sign_in_at', 'expires_at', 'full_name', 'plan', 'license_status',
]

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string; plan?: string; sort?: string; dir?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('id', user.id).single() as unknown as { data: { is_admin: boolean } | null }
  if (!profile?.is_admin) redirect('/dashboard')

  const sp = await searchParams
  const page   = Math.max(1, parseInt(sp.page ?? '1', 10))
  const q      = (sp.q      ?? '').trim()
  const status = (sp.status ?? '').trim()
  const plan   = (sp.plan   ?? '').trim()
  const sort   = (VALID_SORT_FIELDS.includes(sp.sort as SortField) ? sp.sort : 'registered_at') as SortField
  const dir    = (sp.dir === 'asc' ? 'asc' : 'desc') as SortDir

  const from = (page - 1) * PAGE_SIZE
  const to   = from + PAGE_SIZE - 1

  let query = (supabase as any)
    .from('admin_users_overview')
    .select('*', { count: 'exact' })
    .order(sort, { ascending: dir === 'asc', nullsFirst: false })
    .range(from, to)

  if (q)      query = query.or(`email.ilike.%${q}%,full_name.ilike.%${q}%`)
  if (status) query = query.eq('license_status', status)
  if (plan)   query = query.eq('plan', plan)

  const { data: users, count, error } = await query as unknown as {
    data: UserRow[] | null; count: number | null; error: { message: string } | null
  }

  const total = count ?? 0

  return (
    <main className="camui-content">
      <div style={{ marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>Usuários</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            {error
              ? 'Erro ao carregar usuários'
              : total === 0 && (q || status || plan)
              ? 'Nenhum resultado para os filtros aplicados'
              : `${total} usuário${total !== 1 ? 's' : ''} cadastrado${total !== 1 ? 's' : ''}`
            }
          </p>
        </div>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem', borderLeft: '3px solid var(--color-error)' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-error)', fontWeight: 500 }}>
            ⚠️ Erro ao consultar <code>admin_users_overview</code>: {error.message}
          </p>
        </div>
      )}

      {!error && (
        <Suspense>
          <UsersControls
            total={total}
            page={page}
            pageSize={PAGE_SIZE}
            q={q}
            status={status}
            plan={plan}
            sort={sort}
            dir={dir}
          />
        </Suspense>
      )}

      {!error && <UsersTable users={(users ?? []) as any} />} {/* eslint-disable-line */}
    </main>
  )
}