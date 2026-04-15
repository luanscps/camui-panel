import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata = { title: 'Admin — CAMUI Panel' }

type LicenseStats = {
  total_users: number
  total_basic: number
  total_pro: number
  total_devices: number
  total_active: number
  total_suspended: number
  total_expired: number
}

interface StatCardProps {
  label: string
  value: number
  iconPath: string
  accentColor: string
  accentBg: string
}

function StatCard({ label, value, iconPath, accentColor, accentBg }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: accentBg, color: accentColor }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={iconPath}/>
        </svg>
      </div>
      <div className="stat-value" style={{ color: accentColor }}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

export default async function AdminPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createClient()) as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string | null } | null }

  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data } = await supabase
    .from('admin_license_stats')
    .select('*')
    .single() as { data: Partial<LicenseStats> | null }

  const s = data ?? {}

  return (
    <main className="camui-content">
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>Painel Admin</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>CamStreamer BR — visão geral do sistema</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Total Usuários" value={s.total_users ?? 0}
          iconPath="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
          accentColor="var(--color-text)" accentBg="rgba(40,37,29,0.06)" />
        <StatCard label="Plano BASIC" value={s.total_basic ?? 0}
          iconPath="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10zm0-14v4l3 3"
          accentColor="#1d4ed8" accentBg="#eff6ff" />
        <StatCard label="Plano PRO" value={s.total_pro ?? 0}
          iconPath="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          accentColor="var(--color-primary)" accentBg="rgba(1,105,111,0.08)" />
        <StatCard label="Devices Ativos" value={s.total_devices ?? 0}
          iconPath="M5 2h14a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm7 16h.01"
          accentColor="#7c3aed" accentBg="#f5f3ff" />
        <StatCard label="Licenças Ativas" value={s.total_active ?? 0}
          iconPath="M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4 12 14.01l-3-3"
          accentColor="var(--color-success)" accentBg="var(--color-success-highlight)" />
        <StatCard label="Suspensas" value={s.total_suspended ?? 0}
          iconPath="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"
          accentColor="var(--color-warning)" accentBg="var(--color-warning-highlight)" />
        <StatCard label="Expiradas" value={s.total_expired ?? 0}
          iconPath="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9.5 9 12 11.5 14.5 9M9.5 14.5 12 12 14.5 14.5"
          accentColor="var(--color-error)" accentBg="var(--color-error-highlight)" />
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Ações Rápidas</div>
            <div className="card-subtitle">Gerenciamento do sistema</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/dashboard/admin/users" className="btn btn-primary">Gerenciar Usuários</Link>
          <Link href="/dashboard/admin/licenses" className="btn btn-secondary">Gerenciar Licenças</Link>
        </div>
      </div>
    </main>
  )
}
