import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const metadata = { title: 'Dashboard — CAMUI Panel' }

type License = {
  id: string
  user_id: string
  plan: 'BASIC' | 'PRO'
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED'
  expires_at: string | null
  max_devices: number
  created_at: string
}

type Device = {
  id: string
  license_id: string
  device_id: string
  device_name?: string
  activated_at: string
  last_seen_at: string
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: license } = await supabase
    .from('licenses')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle() as { data: License | null }

  const { data: devices } = license
    ? await supabase
        .from('device_activations')
        .select('*')
        .eq('license_id', license.id)
        .order('last_seen_at', { ascending: false }) as { data: Device[] | null }
    : { data: [] as Device[] }

  const statusBadge: Record<string, string> = {
    ACTIVE: 'badge-success', SUSPENDED: 'badge-warning', EXPIRED: 'badge-error'
  }
  const planBadge = license?.plan === 'PRO' ? 'badge-pro' : 'badge-basic'

  return (
    <main className="camui-content">
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>Meu Painel</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Bem-vindo de volta, {user.email}</p>
      </div>

      {!license && (
        <div className="card" style={{ marginBottom: '1.5rem', textAlign: 'center', padding: '2.5rem 1.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔑</div>
          <h3 style={{ fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem' }}>Nenhuma licença encontrada</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>Sua conta ainda não possui uma licença ativa.</p>
          <Link href="/upgrade" className="btn btn-primary">Ver planos</Link>
        </div>
      )}

      {license && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <div>
              <div className="card-title">Minha Licença</div>
              <div className="card-subtitle">Status e plano atual</div>
            </div>
            <span className={`badge ${planBadge}`}>{license.plan}</span>
          </div>
          <div className="info-row">
            <div className="info-cell">
              <div className="info-cell-label">Status</div>
              <div className="info-cell-value">
                <span className={`badge ${statusBadge[license.status] ?? 'badge-neutral'}`}>{license.status}</span>
              </div>
            </div>
            <div className="info-cell">
              <div className="info-cell-label">Dispositivos</div>
              <div className="info-cell-value">
                {devices?.length ?? 0}
                <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}> / {license.max_devices}</span>
              </div>
            </div>
            <div className="info-cell">
              <div className="info-cell-label">Expiração</div>
              <div className="info-cell-value" style={{ fontSize: '0.875rem' }}>
                {license.expires_at ? new Date(license.expires_at).toLocaleDateString('pt-BR') : 'Vitalício'}
              </div>
            </div>
            <div className="info-cell">
              <div className="info-cell-label">RTMP Avançado</div>
              <div className="info-cell-value">
                <span className={`badge ${license.plan === 'PRO' ? 'badge-success' : 'badge-neutral'}`}>
                  {license.plan === 'PRO' ? 'Habilitado' : 'Básico'}
                </span>
              </div>
            </div>
          </div>
          {license.status === 'SUSPENDED' && (
            <div className="upgrade-banner" style={{ borderColor: 'var(--color-warning)', background: 'var(--color-warning-highlight)' }}>
              <p>⚠️ Sua licença está <strong>suspensa</strong>. Entre em contato com o suporte.</p>
            </div>
          )}
          {license.plan === 'BASIC' && license.status === 'ACTIVE' && (
            <div className="upgrade-banner">
              <p>🚀 Faça upgrade para <strong>PRO</strong> e desbloqueie RTMP avançado e mais dispositivos.</p>
              <Link href="/upgrade" className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>Upgrade PRO</Link>
            </div>
          )}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Dispositivos Ativados</div>
            <div className="card-subtitle">
              {devices && devices.length > 0
                ? `${devices.length} dispositivo${devices.length > 1 ? 's' : ''} conectado${devices.length > 1 ? 's' : ''}`
                : 'Nenhum dispositivo ativo'}
            </div>
          </div>
        </div>
        {!devices || devices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2"/>
                <path d="M12 18h.01"/>
              </svg>
            </div>
            <h3>Nenhum dispositivo ativado</h3>
            <p>Abra o app CAMSTREAMER BR no seu Android e faça login para ativar automaticamente.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {(devices as Device[]).map((device) => (
              <div key={device.id} style={{
                display: 'flex', alignItems: 'center', gap: '0.875rem',
                padding: '0.875rem 1rem',
                background: 'var(--color-surface-offset)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)'
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--radius-md)',
                  background: 'rgba(1,105,111,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-primary)', flexShrink: 0
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="2" width="14" height="20" rx="2"/>
                    <path d="M12 18h.01"/>
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)' }}>
                    {device.device_name || 'Dispositivo Android'}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                    {device.device_id.substring(0, 24)}…
                  </div>
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', flexShrink: 0, textAlign: 'right' }}>
                  <div>Último acesso</div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                    {new Date(device.last_seen_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
