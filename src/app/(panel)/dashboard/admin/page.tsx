import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Database } from '@/types/database'
import Link from 'next/link'

export const metadata = { title: 'Admin — CAMUI Panel' }

type LicenseStats = Database['public']['Views']['admin_license_stats']['Row']
type UserRow = Database['public']['Views']['admin_users_overview']['Row']

function StatCard({ label, value, icon, accentColor, accentBg }: {
  label: string
  value: number | string
  icon: string
  accentColor: string
  accentBg: string
}) {
  return (
    <div className="stat-card">
      <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: accentBg, color: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem', marginBottom: '0.25rem' }}>
        {icon}
      </div>
      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: accentColor, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.125rem' }}>{label}</div>
    </div>
  )
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('id', user.id).single() as unknown as { data: { is_admin: boolean } | null }
  if (!profile?.is_admin) redirect('/dashboard')

  const { data } = await supabase
    .from('admin_license_stats').select('*').single() as unknown as { data: Partial<LicenseStats> | null }

  const { data: recentUsers } = await supabase
    .from('admin_users_overview')
    .select('*')
    .order('registered_at', { ascending: false })
    .limit(5) as unknown as { data: UserRow[] | null }

  const s = data ?? {}
  const now = new Date()
  const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  // Licenças expirando em breve
  const { data: allLicenses } = await supabase
    .from('licenses')
    .select('expires_at, status')
    .eq('status', 'ACTIVE')

  const expiringSoon = (allLicenses ?? []).filter((l: any) => { // eslint-disable-line
    if (!l.expires_at) return false
    const exp = new Date(l.expires_at)
    return exp >= now && exp <= in7days
  }).length

  // Devices por status
  const { count: devicesSuspensos } = await supabase
    .from('device_activations')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'SUSPENDED')

  const { count: devicesRevogados } = await supabase
    .from('device_activations')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'REVOKED')

  const devicesAtivos = (s.total_devices ?? 0) - (devicesSuspensos ?? 0) - (devicesRevogados ?? 0)

  return (
    <main className="camui-content">
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>Painel Admin</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>CamStreamer BR — visão geral do sistema</p>
      </div>

      {/* Alertas */}
      {expiringSoon > 0 && (
        <div style={{ marginBottom: '1.25rem', padding: '0.875rem 1.25rem', background: 'var(--color-warning-bg)', border: '1px solid rgba(150,66,25,0.25)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span>⚠️</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-warning)', fontWeight: 500 }}>
              {expiringSoon} licença{expiringSoon > 1 ? 's' : ''} expirando nos próximos 7 dias
            </span>
          </div>
          <Link href="/dashboard/admin/licenses" className="btn btn-sm" style={{ background: 'var(--color-warning)', color: '#fff', fontSize: '0.75rem' }}>Ver licenças</Link>
        </div>
      )}

      {/* Stats — Licenças */}
      <div style={{ marginBottom: '0.5rem' }}>
        <p style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>Licenças</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard label="Total Usuários"  value={s.total_users ?? 0}     icon="👥" accentColor="var(--color-text)"     accentBg="rgba(40,37,29,0.06)" />
        <StatCard label="Plano BASIC"     value={s.total_basic ?? 0}     icon="🔵" accentColor="#1d4ed8"              accentBg="#eff6ff" />
        <StatCard label="Plano PRO"       value={s.total_pro ?? 0}       icon="⭐" accentColor="var(--color-primary)"  accentBg="rgba(1,105,111,0.08)" />
        <StatCard label="Ativas"          value={s.total_active ?? 0}    icon="✅" accentColor="var(--color-success)"  accentBg="var(--color-success-bg)" />
        <StatCard label="Suspensas"       value={s.total_suspended ?? 0} icon="⏸️" accentColor="var(--color-warning)"  accentBg="var(--color-warning-bg)" />
        <StatCard label="Expiradas"       value={s.total_expired ?? 0}   icon="❌" accentColor="var(--color-error)"    accentBg="var(--color-error-bg)" />
        <StatCard label="Expirando (7d)"  value={expiringSoon}           icon="⏳" accentColor="#92400e"             accentBg="#fef3c7" />
      </div>

      {/* Stats — Dispositivos */}
      <div style={{ marginBottom: '0.5rem' }}>
        <p style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>Dispositivos</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Total Devices"   value={s.total_devices ?? 0}   icon="📱" accentColor="#7c3aed"             accentBg="#f5f3ff" />
        <StatCard label="Ativos"          value={devicesAtivos < 0 ? 0 : devicesAtivos} icon="✅" accentColor="var(--color-success)" accentBg="var(--color-success-bg)" />
        <StatCard label="Suspensos"       value={devicesSuspensos ?? 0}  icon="⏸️" accentColor="var(--color-warning)"  accentBg="var(--color-warning-bg)" />
        <StatCard label="Revogados"       value={devicesRevogados ?? 0}  icon="🚫" accentColor="var(--color-error)"    accentBg="var(--color-error-bg)" />
      </div>

      {/* Ações rápidas */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div>
            <div className="card-title">Ações Rápidas</div>
            <div className="card-subtitle">Gerenciamento do sistema</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/dashboard/admin/users"    className="btn btn-primary">👥 Gerenciar Usuários</Link>
          <Link href="/dashboard/admin/licenses" className="btn btn-secondary">🔑 Gerenciar Licenças</Link>
          <Link href="/dashboard/admin/devices"  className="btn btn-secondary">📱 Gerenciar Dispositivos</Link>
        </div>
      </div>

      {/* Usuários recentes */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="card-title">Usuários Recentes</div>
            <div className="card-subtitle">Últimos 5 cadastros</div>
          </div>
          <Link href="/dashboard/admin/users" style={{ fontSize: '0.8125rem', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500 }}>Ver todos →</Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-offset)' }}>
                {['Nome', 'Email', 'Plano', 'Status', 'Cadastro'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.625rem 1rem', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!recentUsers?.length && (
                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Nenhum usuário ainda</td></tr>
              )}
              {recentUsers?.map((u: UserRow, i: number) => (
                <tr key={u.id ?? i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{u.full_name ?? <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>Sem nome</span>}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>{u.email}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {u.plan ? <span className={`badge badge-${u.plan === 'PRO' ? 'pro' : 'basic'}`}>{u.plan}</span> : <span style={{ color: 'var(--color-text-muted)' }}>—</span>}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {u.license_status ? (
                      <span style={{ fontWeight: 600, fontSize: '0.8rem', color: u.license_status === 'ACTIVE' ? 'var(--color-success)' : u.license_status === 'EXPIRED' ? 'var(--color-error)' : 'var(--color-warning)' }}>{u.license_status}</span>
                    ) : <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>—</span>}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                    {u.registered_at ? new Date(u.registered_at).toLocaleDateString('pt-BR') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}