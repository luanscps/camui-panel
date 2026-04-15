import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Licença — CAMUI Panel' }

export default async function LicensePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: license } = await supabase
    .from('licenses')
    .select('plan, status, expires_at, max_devices')
    .eq('user_id', user.id)
    .single()

  const isPro = license?.plan === 'PRO'

  return (
    <main className="camui-content">
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>Licença</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Detalhes do seu plano atual</p>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Plano atual</div>
            <div className="card-subtitle">Informações da sua licença CAMSTREAMER-BR</div>
          </div>
          <span className={`badge badge-${isPro ? 'pro' : 'basic'}`}>{license?.plan ?? 'BASIC'}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
            <div className="stat-card">
              <div className="stat-label">Status</div>
              <div className="stat-value" style={{ fontSize: '1rem', color: license?.status === 'ACTIVE' ? 'var(--color-success)' : 'var(--color-warning)' }}>
                {license?.status ?? '—'}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Dispositivos</div>
              <div className="stat-value" style={{ fontSize: '1rem' }}>{license?.max_devices ?? 1}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Expira em</div>
              <div className="stat-value" style={{ fontSize: '0.9rem' }}>
                {license?.expires_at ? new Date(license.expires_at).toLocaleDateString('pt-BR') : 'Nunca'}
              </div>
            </div>
          </div>

          {!isPro && (
            <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                Faça upgrade para o plano PRO e desbloqueie mais dispositivos e recursos avançados.
              </p>
              <button className="btn btn-primary" disabled>
                Upgrade para PRO (em breve)
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
