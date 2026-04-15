import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata = { title: 'Licença — CAMUI Panel' }

type License = {
  plan: string; status: string
  expires_at: string | null; max_devices: number | null
  created_at: string | null
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

export default async function LicensePage() {
  const supabase = (await createClient()) as any // eslint-disable-line
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: license } = await supabase
    .from('licenses')
    .select('plan, status, expires_at, max_devices, created_at')
    .eq('user_id', user.id)
    .single() as { data: License | null }

  const isPro = license?.plan === 'PRO'
  const daysLeft = daysUntil(license?.expires_at ?? null)
  const expiringSoon = daysLeft !== null && daysLeft <= 7 && daysLeft >= 0
  const isExpired = daysLeft !== null && daysLeft < 0

  const comparison = [
    { feature: 'Streaming RTMP básico',        basic: true,  pro: true  },
    { feature: 'RTMP avançado / multi-stream', basic: false, pro: true  },
    { feature: 'Dispositivos simultâneos',     basic: '1',   pro: '5'   },
    { feature: 'Suporte por email',             basic: true,  pro: true  },
    { feature: 'Suporte prioritário',           basic: false, pro: true  },
    { feature: 'Atualizações antecipadas',      basic: false, pro: true  },
    { feature: 'Acesso a recursos beta',        basic: false, pro: true  },
  ]

  return (
    <main className="camui-content">
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>Licença</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Detalhes do seu plano CAMSTREAMER-BR</p>
      </div>

      {/* Alerta de expiração */}
      {expiringSoon && (
        <div style={{ marginBottom: '1.25rem', padding: '0.875rem 1.25rem', background: 'var(--color-warning-bg)', border: '1px solid rgba(150,66,25,0.25)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span>⏳</span>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-warning)', fontWeight: 500 }}>
            Sua licença expira em <strong>{daysLeft} dia{daysLeft !== 1 ? 's' : ''}</strong>. Renove para não perder o acesso.
          </span>
        </div>
      )}
      {isExpired && (
        <div style={{ marginBottom: '1.25rem', padding: '0.875rem 1.25rem', background: 'var(--color-error-bg)', border: '1px solid rgba(161,44,123,0.25)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span>🔴</span>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-error)', fontWeight: 500 }}>Sua licença <strong>expirou</strong>. Entre em contato com o suporte para renovar.</span>
        </div>
      )}

      {/* Card status */}
      {license ? (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <div>
              <div className="card-title">Plano atual</div>
              <div className="card-subtitle">
                {license.created_at
                  ? `Ativo desde ${new Date(license.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}`
                  : 'CAMSTREAMER-BR'}
              </div>
            </div>
            <span className={`badge badge-${isPro ? 'pro' : 'basic'}`}>{license.plan}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            {[
              {
                label: 'Status',
                value: <span style={{ fontWeight: 700, color: license.status === 'ACTIVE' ? 'var(--color-success)' : license.status === 'EXPIRED' ? 'var(--color-error)' : 'var(--color-warning)' }}>{license.status}</span>
              },
              {
                label: 'Dispositivos',
                value: <span style={{ fontWeight: 700 }}>{license.max_devices ?? 1}</span>
              },
              {
                label: 'Expiração',
                value: <span style={{ fontWeight: 700, color: isExpired ? 'var(--color-error)' : expiringSoon ? 'var(--color-warning)' : 'var(--color-text)' }}>
                  {license.expires_at ? new Date(license.expires_at).toLocaleDateString('pt-BR') : 'Vitalício'}
                </span>
              },
              {
                label: 'Dias restantes',
                value: <span style={{ fontWeight: 700, color: isExpired ? 'var(--color-error)' : expiringSoon ? 'var(--color-warning)' : 'var(--color-success)' }}>
                  {daysLeft === null ? '∞' : isExpired ? 'Expirado' : `${daysLeft}d`}
                </span>
              },
            ].map(({ label, value }) => (
              <div key={label} className="stat-card">
                <div className="stat-label">{label}</div>
                <div className="stat-value" style={{ fontSize: '1rem' }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Barra de progresso de expiração */}
          {license.expires_at && daysLeft !== null && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.375rem' }}>
                <span>Tempo restante de licença</span>
                <span>{Math.max(daysLeft, 0)} dias</span>
              </div>
              <div style={{ height: 8, borderRadius: 999, background: 'var(--color-divider)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.max(0, Math.min(100, (daysLeft / 365) * 100))}%`,
                  background: isExpired ? 'var(--color-error)' : expiringSoon ? 'var(--color-warning)' : 'var(--color-primary)',
                  borderRadius: 999, transition: 'width 0.4s ease',
                }} />
              </div>
            </div>
          )}

          {/* CTA upgrade ou suporte */}
          {!isPro && (
            <div className="upgrade-banner">
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-primary)', marginBottom: '0.25rem' }}>🚀 Faça upgrade para PRO</div>
                <p>Desbloqueie RTMP avançado, até 5 dispositivos e suporte prioritário.</p>
              </div>
              <a
                href="https://wa.me/?text=Olá! Gostaria de fazer upgrade para o plano PRO do CAMSTREAMER-BR."
                target="_blank" rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ flexShrink: 0 }}
              >💬 Falar com suporte</a>
            </div>
          )}
          {isPro && (
            <div style={{ padding: '0.875rem 1rem', background: 'rgba(1,105,111,0.05)', border: '1px solid rgba(1,105,111,0.15)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span>✅</span>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 500 }}>Você está no plano máximo. Aproveite todos os recursos!</span>
            </div>
          )}
        </div>
      ) : (
        <div className="card" style={{ marginBottom: '1.5rem', textAlign: 'center', padding: '2.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔑</div>
          <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Nenhuma licença encontrada</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>Entre em contato com o suporte para obter sua licença.</p>
          <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="btn btn-primary">Falar com suporte</a>
        </div>
      )}

      {/* Tabela comparativa BASIC vs PRO */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Comparativo de planos</div>
            <div className="card-subtitle">BASIC vs PRO — CAMSTREAMER-BR</div>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recurso</th>
                <th style={{ textAlign: 'center', padding: '0.75rem 1rem', fontSize: '0.875rem' }}>
                  <span className={`badge badge-basic${!isPro ? ' ring-2' : ''}`} style={{ fontWeight: !isPro ? 800 : 600 }}>BASIC {!isPro && '← você'}</span>
                </th>
                <th style={{ textAlign: 'center', padding: '0.75rem 1rem', fontSize: '0.875rem' }}>
                  <span className={`badge badge-pro${isPro ? ' ring-2' : ''}`} style={{ fontWeight: isPro ? 800 : 600 }}>PRO {isPro && '← você'}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {comparison.map(row => (
                <tr key={row.feature} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text)' }}>{row.feature}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                    {typeof row.basic === 'boolean'
                      ? <span style={{ fontSize: '1rem' }}>{row.basic ? '✅' : '—'}</span>
                      : <span style={{ fontWeight: 600 }}>{row.basic}</span>}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                    {typeof row.pro === 'boolean'
                      ? <span style={{ fontSize: '1rem' }}>{row.pro ? '✅' : '—'}</span>
                      : <span style={{ fontWeight: 600 }}>{row.pro}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isPro && (
          <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)', textAlign: 'center' }}>
            <a
              href="https://wa.me/?text=Olá! Gostaria de fazer upgrade para o plano PRO do CAMSTREAMER-BR."
              target="_blank" rel="noopener noreferrer"
              className="btn btn-primary"
            >💬 Quero o PRO — Falar com suporte</a>
          </div>
        )}
      </div>
    </main>
  )
}
