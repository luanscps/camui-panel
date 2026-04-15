import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DevicesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: licenseData } = await supabase
    .from('licenses')
    .select('plan')
    .eq('user_id', user.id)
    .single()

  const { data: devices } = await supabase
    .from('devices')
    .select('*')
    .eq('user_id', user.id)
    .order('last_seen', { ascending: false })

  const license: { plan: string } | null = licenseData ?? null
  const isPro = license?.plan === 'pro'
  const maxDevices = isPro ? 5 : 1
  const activeCount = (devices ?? []).filter((d: { status: string }) => d.status === 'active').length

  return (
    <div className="camui-content">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>Dispositivos</h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Aparelhos autorizados a usar o CAMSTREAMER-BR com sua conta.</p>
        </div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', textAlign: 'right', flexShrink: 0 }}>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>
            <strong style={{ color: 'var(--color-text)' }}>{activeCount}</strong> / {maxDevices} ativos
          </span>
          <span style={{ marginLeft: '0.5rem' }}>
            <span className={`badge badge-${isPro ? 'pro' : 'basic'}`}>{isPro ? 'Pro' : 'Basic'}</span>
          </span>
        </div>
      </div>

      <div style={{ marginBottom: '2rem', maxWidth: '720px' }}>
        <div style={{ height: 6, borderRadius: 999, background: 'var(--color-divider)', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${Math.min((activeCount / maxDevices) * 100, 100)}%`,
            background: activeCount >= maxDevices ? 'var(--color-error)' : 'var(--color-primary)',
            borderRadius: 999,
            transition: 'width 0.4s ease',
          }} />
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.375rem' }}>
          {activeCount >= maxDevices
            ? 'Limite de dispositivos atingido. Remova um para adicionar outro.'
            : `${maxDevices - activeCount} slot${maxDevices - activeCount !== 1 ? 's' : ''} disponível.`}
        </div>
      </div>

      {!devices || devices.length === 0 ? (
        <div className="card" style={{ maxWidth: '720px' }}>
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <line x1="12" y1="18" x2="12" y2="18.01" />
              </svg>
            </div>
            <h3>Nenhum dispositivo registrado</h3>
            <p>Faça login no app CAMSTREAMER-BR para registrar seu dispositivo automaticamente.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '720px' }}>
          {devices.map((device: {
            id: string
            device_name?: string | null
            device_model?: string | null
            android_version?: string | null
            last_seen?: string | null
            status: string
          }) => {
            const lastSeen = device.last_seen
              ? new Date(device.last_seen).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
              : '—'
            const isActive = device.status === 'active'
            return (
              <div key={device.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 'var(--radius-md)',
                  background: isActive ? 'rgba(1,105,111,0.08)' : 'var(--color-surface-offset)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, color: isActive ? 'var(--color-primary)' : 'var(--color-text-faint)',
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" />
                    <line x1="12" y1="18" x2="12" y2="18.01" />
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text)', marginBottom: '0.125rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {device.device_name ?? 'Dispositivo Android'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {device.device_model ?? ''}{device.device_model && device.android_version ? ' · ' : ''}Android {device.android_version ?? '—'}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-faint)', marginTop: '0.125rem' }}>Último acesso: {lastSeen}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                  <span className={`badge ${isActive ? 'badge-success' : 'badge-neutral'}`}>
                    {isActive ? 'Ativo' : 'Inativo'}
                  </span>
                  <form action={`/api/devices/${device.id}/revoke`} method="POST">
                    <button type="submit" className="btn btn-danger btn-xs" title="Revogar acesso">Revogar</button>
                  </form>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!isPro && (
        <div className="upgrade-banner" style={{ maxWidth: '720px', marginTop: '1.5rem' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-primary)', marginBottom: '0.25rem' }}>Precisa de mais dispositivos?</div>
            <p>Com o plano Pro você pode usar até 5 aparelhos simultaneamente.</p>
          </div>
          <a href="/dashboard/license" className="btn btn-primary" style={{ flexShrink: 0 }}>Ver planos</a>
        </div>
      )}
    </div>
  )
}
