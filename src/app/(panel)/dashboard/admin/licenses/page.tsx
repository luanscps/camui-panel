import { createClient } from '@/lib/supabase/server'
import EditLicenseInline from './EditLicenseInline'

export const metadata = { title: 'Licenças — CAMUI Panel' }

type License = {
  id: string; plan: string; status: string
  expires_at: string | null; user_id: string
  max_devices: number | null; created_at: string | null
}
type Profile = { id: string; full_name: string | null }

export default async function AdminLicensesPage() {
  const supabase = await createClient()

  const { data: licenses } = await supabase
    .from('licenses')
    .select('id, plan, status, expires_at, user_id, max_devices, created_at')
    .order('created_at', { ascending: false }) as { data: License[] | null }

  const userIds = licenses?.map((l: License) => l.user_id) ?? []
  const { data: profiles } = userIds.length
    ? await supabase.from('profiles').select('id, full_name').in('id', userIds) as { data: Profile[] | null }
    : { data: [] as Profile[] }

  const now = new Date()
  const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const expiringSoon = licenses?.filter((l: License) => {
    if (!l.expires_at || l.status !== 'ACTIVE') return false
    const exp = new Date(l.expires_at)
    return exp >= now && exp <= in7days
  }) ?? []

  const expired = licenses?.filter((l: License) => {
    if (!l.expires_at) return false
    return new Date(l.expires_at) < now && l.status !== 'EXPIRED'
  }) ?? []

  return (
    <main className="camui-content">
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>Licenças</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{licenses?.length ?? 0} licenças no sistema</p>
      </div>

      {expiringSoon.length > 0 && (
        <div style={{ marginBottom: '1rem', padding: '0.875rem 1.25rem', background: 'var(--color-warning-bg)', border: '1px solid rgba(150,66,25,0.2)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1rem' }}>⚠️</span>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-warning)', fontWeight: 500 }}>
            {expiringSoon.length} licença{expiringSoon.length > 1 ? 's' : ''} expirando nos próximos 7 dias
          </span>
        </div>
      )}
      {expired.length > 0 && (
        <div style={{ marginBottom: '1rem', padding: '0.875rem 1.25rem', background: 'var(--color-error-bg)', border: '1px solid rgba(161,44,123,0.2)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1rem' }}>🔴</span>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-error)', fontWeight: 500 }}>
            {expired.length} licença{expired.length > 1 ? 's' : ''} com data expirada mas status ainda ACTIVE
          </span>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-offset)' }}>
                {['Usuário', 'Plano', 'Status', 'Devices', 'Expira em', 'Criado em', 'Ações'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!licenses?.length && (
                <tr><td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Nenhuma licença</td></tr>
              )}
              {licenses?.map((lic: License) => {
                const profile = profiles?.find((p: Profile) => p.id === lic.user_id)
                const isExpiring = expiringSoon.some(e => e.id === lic.id)
                const isExpired = expired.some(e => e.id === lic.id)
                return (
                  <tr key={lic.id} style={{ borderBottom: '1px solid var(--color-border)', background: isExpiring ? 'rgba(150,66,25,0.03)' : isExpired ? 'rgba(161,44,123,0.03)' : '' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>
                      {profile?.full_name ?? <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>Sem nome</span>}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className={`badge badge-${lic.plan === 'PRO' ? 'pro' : 'basic'}`}>{lic.plan}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{
                        fontWeight: 600, fontSize: '0.8rem',
                        color: lic.status === 'ACTIVE' ? 'var(--color-success)'
                          : lic.status === 'EXPIRED' ? 'var(--color-error)'
                          : 'var(--color-warning)'
                      }}>{lic.status}</span>
                      {isExpiring && <span style={{ marginLeft: '0.375rem', fontSize: '0.7rem', color: 'var(--color-warning)' }}>⚠️ expira em breve</span>}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      {lic.max_devices ?? 1}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: isExpired ? 'var(--color-error)' : 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      {lic.expires_at ? new Date(lic.expires_at).toLocaleDateString('pt-BR') : '—'}
                      {isExpired && ' 🔴'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      {lic.created_at ? new Date(lic.created_at).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <EditLicenseInline
                        licenseId={lic.id}
                        userId={lic.user_id}
                        userName={profile?.full_name ?? lic.user_id.slice(0, 8) + '…'}
                        currentPlan={lic.plan}
                        currentStatus={lic.status}
                        currentMaxDevices={lic.max_devices ?? 1}
                        currentExpiresAt={lic.expires_at}
                      />
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
