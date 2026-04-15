import { createClient } from '@/lib/supabase/server'
import RevokeButton from './RevokeButton'

export const metadata = { title: 'Licenças — CAMUI Panel' }

export default async function AdminLicensesPage() {
  const supabase = await createClient()

  const { data: licenses } = await supabase
    .from('licenses')
    .select('id, plan, status, expires_at, user_id, profiles(full_name)')
    .order('created_at', { ascending: false })

  return (
    <main className="camui-content">
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>Licenças</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{licenses?.length ?? 0} licenças no sistema</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Usuário', 'Plano', 'Status', 'Expira em', 'Ações'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {licenses?.map(lic => {
                const profile = Array.isArray(lic.profiles) ? lic.profiles[0] : lic.profiles
                return (
                  <tr key={lic.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.75rem 1rem' }}>{profile?.full_name ?? lic.user_id.slice(0, 8) + '…'}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className={`badge badge-${lic.plan === 'PRO' ? 'pro' : 'basic'}`}>{lic.plan}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ color: lic.status === 'ACTIVE' ? 'var(--color-success)' : lic.status === 'REVOKED' ? 'var(--color-error)' : 'var(--color-warning)', fontWeight: 500 }}>{lic.status}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                      {lic.expires_at ? new Date(lic.expires_at).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {lic.status !== 'REVOKED' && <RevokeButton licenseId={lic.id} />}
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
