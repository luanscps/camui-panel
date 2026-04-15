import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Tables } from '@/types/database'

type License = Tables<'licenses'>

export default async function LicensePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: licenseData } = await supabase
    .from('licenses')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const license: License | null = licenseData ?? null

  const isPro    = license?.plan   === 'pro'
  const isActive = license?.status === 'active'

  const expiresAt = license?.expires_at
    ? new Date(license.expires_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : null

  const activatedAt = license?.created_at
    ? new Date(license.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : null

  return (
    <div className="camui-content">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
          Licença
        </h1>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
          Seu plano atual, status e opções de upgrade.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '1.25rem', maxWidth: '720px' }}>
        {/* Plano atual */}
        <div
          className="card"
          style={{
            border: isPro ? '1px solid var(--color-brand-highlight)' : '1px solid var(--color-border)',
            background: isPro ? 'linear-gradient(135deg, #f0fafb 0%, #e8f5f6 100%)' : 'var(--color-surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Plano atual</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1 }}>
                {isPro ? 'Pro' : 'Basic'}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
              <span className={`badge ${isActive ? 'badge-success' : 'badge-warning'}`}>
                {isActive ? 'Ativa' : (license?.status ?? 'Sem licença')}
              </span>
              {isPro && <span className="badge badge-pro">PRO</span>}
            </div>
          </div>

          <div className="info-row">
            <div className="info-cell">
              <div className="info-cell-label">Dispositivos permitidos</div>
              <div className="info-cell-value">{license?.max_devices ?? (isPro ? 5 : 1)}</div>
            </div>
            <div className="info-cell">
              <div className="info-cell-label">Ativada em</div>
              <div className="info-cell-value">{activatedAt ?? '—'}</div>
            </div>
            <div className="info-cell">
              <div className="info-cell-label">Expira em</div>
              <div className="info-cell-value">{expiresAt ?? 'Vitalícia'}</div>
            </div>
            <div className="info-cell">
              <div className="info-cell-label">ID da Licença</div>
              <div className="info-cell-value" style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
                {license?.id ? `${license.id.slice(0, 8)}...` : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Comparação de planos */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: '1.25rem' }}>
            <div>
              <div className="card-title">Comparar planos</div>
              <div className="card-subtitle">Veja o que cada plano oferece.</div>
            </div>
          </div>

          <table className="camui-table">
            <thead>
              <tr>
                <th>Recurso</th>
                <th>Basic</th>
                <th>Pro</th>
              </tr>
            </thead>
            <tbody>
              {([
                ['Dispositivos simultâneos', '1', '5'],
                ['Qualidade de stream', '720p', '1080p / 4K'],
                ['Suporte prioritário', '—', '✓'],
                ['Sem watermark', '—', '✓'],
                ['Configurações avançadas', '—', '✓'],
                ['Acesso antecipado a features', '—', '✓'],
              ] as [string, string, string][]).map(([feature, basic, pro]) => (
                <tr key={feature}>
                  <td style={{ fontWeight: 500 }}>{feature}</td>
                  <td style={{ color: basic === '—' ? 'var(--color-text-faint)' : 'var(--color-text)' }}>{basic}</td>
                  <td style={{ color: pro === '—' ? 'var(--color-text-faint)' : 'var(--color-brand)', fontWeight: pro !== '—' ? 600 : 400 }}>{pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Upgrade */}
        {!isPro && (
          <div className="upgrade-banner">
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-brand-hover)', marginBottom: '0.25rem' }}>
                Upgrade para Pro
              </div>
              <p>
                Desbloqueie até 5 dispositivos simultâneos, streams em 4K e suporte prioritário.
              </p>
            </div>
            <button className="btn btn-primary" style={{ flexShrink: 0 }}>
              Fazer upgrade
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
