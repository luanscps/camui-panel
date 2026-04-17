import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import LicensesControls from './LicensesControls'
import LicensesTable from './LicensesTable'

export const metadata = { title: 'Licenças — CAMUI Panel' }

const PAGE_SIZE = 20

type License = {
  id: string; plan: string; status: string
  expires_at: string | null; user_id: string
  max_devices: number | null; created_at: string | null
}
type Profile = { id: string; full_name: string | null }

export default async function AdminLicensesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string; plan?: string }>
}) {
  const supabase = (await createClient()) as any // eslint-disable-line

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) redirect('/dashboard')

  // Resolve searchParams (Next.js 15)
  const sp      = await searchParams
  const page    = Math.max(1, parseInt(sp.page   ?? '1', 10))
  const q       = (sp.q      ?? '').trim()
  const status  = (sp.status ?? '').trim()
  const plan    = (sp.plan   ?? '').trim()

  // ── Busca por nome: resolve user_ids via profiles ──────────────────────────
  let filteredUserIds: string[] | null = null
  if (q) {
    const { data: matchedProfiles } = await supabase
      .from('profiles')
      .select('id')
      .ilike('full_name', `%${q}%`) as { data: { id: string }[] | null }
    filteredUserIds = matchedProfiles?.map(p => p.id) ?? []
  }

  // ── Query principal paginada ───────────────────────────────────────────────
  const from = (page - 1) * PAGE_SIZE
  const to   = from + PAGE_SIZE - 1

  let query = supabase
    .from('licenses')
    .select('id, plan, status, expires_at, user_id, max_devices, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (status) query = query.eq('status', status)
  if (plan)   query = query.eq('plan', plan)

  // Se buscou por nome mas não achou nenhum perfil → retorna zero resultados
  if (filteredUserIds !== null) {
    if (filteredUserIds.length === 0) {
      return (
        <main className="camui-content">
          <div style={{ marginBottom: '1.75rem' }}>
            <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>Licenças</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>0 licenças encontradas</p>
          </div>
          <Suspense>
            <LicensesControls total={0} page={1} pageSize={PAGE_SIZE} q={q} status={status} plan={plan} />
          </Suspense>
          <LicensesTable licenses={[]} />
        </main>
      )
    }
    query = query.in('user_id', filteredUserIds)
  }

  const { data: licenses, count, error } = await query as {
    data: License[] | null; count: number | null; error: { message: string } | null
  }

  const total = count ?? 0

  // ── Resolve nomes para as licenças da página atual ─────────────────────────
  const userIds = licenses?.map(l => l.user_id) ?? []
  const { data: profiles } = userIds.length
    ? await supabase.from('profiles').select('id, full_name').in('id', userIds) as { data: Profile[] | null }
    : { data: [] as Profile[] }

  const profileMap = new Map((profiles ?? []).map(p => [p.id, p.full_name]))

  // ── Enriquece licenças com flags de alerta ─────────────────────────────────
  const now      = new Date()
  const in7days  = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const enriched = (licenses ?? []).map(lic => ({
    ...lic,
    userName: profileMap.get(lic.user_id) ?? '',
    isExpiring:
      !!lic.expires_at &&
      lic.status === 'ACTIVE' &&
      new Date(lic.expires_at) >= now &&
      new Date(lic.expires_at) <= in7days,
    isExpiredButActive:
      !!lic.expires_at &&
      new Date(lic.expires_at) < now &&
      lic.status !== 'EXPIRED',
  }))

  const expiringSoonCount    = enriched.filter(l => l.isExpiring).length
  const expiredButActiveCount = enriched.filter(l => l.isExpiredButActive).length

  return (
    <main className="camui-content">
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>Licenças</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          {error ? 'Erro ao carregar licenças' : `${total} licença${total !== 1 ? 's' : ''} no sistema`}
        </p>
      </div>

      {/* Alertas */}
      {expiringSoonCount > 0 && (
        <div style={{ marginBottom: '0.75rem', padding: '0.875rem 1.25rem', background: 'var(--color-warning-bg)', border: '1px solid rgba(150,66,25,0.2)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span>⚠️</span>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-warning)', fontWeight: 500 }}>
            {expiringSoonCount} licença{expiringSoonCount > 1 ? 's' : ''} expirando nos próximos 7 dias (nesta página)
          </span>
        </div>
      )}
      {expiredButActiveCount > 0 && (
        <div style={{ marginBottom: '0.75rem', padding: '0.875rem 1.25rem', background: 'var(--color-error-bg)', border: '1px solid rgba(161,44,123,0.2)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span>🔴</span>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-error)', fontWeight: 500 }}>
            {expiredButActiveCount} licença{expiredButActiveCount > 1 ? 's' : ''} com data expirada mas status ainda ACTIVE (nesta página)
          </span>
        </div>
      )}

      {error && (
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem', borderLeft: '3px solid var(--color-error)' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-error)', fontWeight: 500 }}>
            ⚠️ Erro: {error.message}
          </p>
        </div>
      )}

      {!error && (
        <Suspense>
          <LicensesControls
            total={total}
            page={page}
            pageSize={PAGE_SIZE}
            q={q}
            status={status}
            plan={plan}
          />
        </Suspense>
      )}

      {!error && <LicensesTable licenses={enriched} />}
    </main>
  )
}