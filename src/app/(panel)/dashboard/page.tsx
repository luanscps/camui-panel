import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { DeviceTable } from './DeviceTable'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Dashboard — CAMUI Panel' }

type License = {
  id: string; user_id: string
  plan: 'BASIC' | 'PRO'
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED'
  expires_at: string | null
  max_devices: number; created_at: string
}

type Device = {
  id: string
  license_id: string
  device_name?:     string | null
  device_brand?:    string | null
  device_model?:    string | null
  android_version?: string | null
  android_id?:      string | null
  sub_license_key?: string | null
  status?:          string | null
  activated_at:     string
  last_seen:        string | null
  streaming_now?:   boolean
  battery_level?:   number | null
  thermal_state?:   string | null
  network_type?:    string | null
  last_seen_at?:    string | null
}

type FleetDashboard = {
  user_id:           string | null
  total_devices:     number | null
  active_devices:    number | null
  suspended_devices: number | null
  online_now:        number | null
  streaming_now:     number | null
  last_activity:     string | null
}

function greeting(name: string) {
  const h = new Date().getHours()
  const period = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
  return `${period}, ${name}! 👋`
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await (supabase as any)
    .from('profiles').select('full_name').eq('id', user.id).single()

  const { data: license } = await (supabase as any)
    .from('licenses').select('*').eq('user_id', user.id).maybeSingle() as { data: License | null }

  const { data: fleet } = license
    ? await (supabase as any)
        .from('fleet_dashboard')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle() as { data: FleetDashboard | null }
    : { data: null as FleetDashboard | null }

  const { data: devices } = license
    ? await (supabase as any)
        .from('device_activations')
        .select(`id, device_name, device_brand, device_model, android_version,
                 android_id, sub_license_key, status, activated_at, last_seen,
                 last_seen_at, streaming_now, battery_level, thermal_state, network_type`)
        .eq('license_id', license.id)
        .order('last_seen', { ascending: false, nullsFirst: false }) as { data: Device[] | null }
    : { data: [] as Device[] }

  const displayName  = profile?.full_name ?? user.email?.split('@')[0] ?? 'usuário'
  const isPro        = license?.plan === 'PRO'
  const daysLeft     = daysUntil(license?.expires_at ?? null)
  const expiringSoon = daysLeft !== null && daysLeft <= 7 && daysLeft >= 0
  const isExpired    = daysLeft !== null && daysLeft < 0

  const totalDevices     = fleet?.total_devices     ?? devices?.length ?? 0
  const activeDevices    = fleet?.active_devices    ?? devices?.filter(d => d.status === 'ACTIVE').length ?? 0
  const suspendedDevices = fleet?.suspended_devices ?? devices?.filter(d => d.status === 'SUSPENDED').length ?? 0
  const onlineNow        = fleet?.online_now        ?? 0
  const streamingNow     = fleet?.streaming_now     ?? devices?.filter(d => d.streaming_now).length ?? 0

  const planFeatures: Record<string, { label: string; included: boolean }[]> = {
    BASIC: [
      { label: 'Streaming RTMP básico',        included: true  },
      { label: '1 dispositivo simultâneo',     included: true  },
      { label: 'Suporte por email',            included: true  },
      { label: 'RTMP avançado / multi-stream', included: false },
      { label: 'Até 5 dispositivos',           included: false },
      { label: 'Suporte prioritário',          included: false },
    ],
    PRO: [
      { label: 'Streaming RTMP básico',         included: true },
      { label: 'RTMP avançado / multi-stream',  included: true },
      { label: 'Até 5 dispositivos simultâneos',included: true },
      { label: 'Suporte prioritário',           included: true },
      { label: 'Atualizações antecipadas',      included: true },
      { label: 'Acesso a recursos beta',        included: true },
    ],
  }
  const features = planFeatures[license?.plan ?? 'BASIC']

  return (
    <main className="camui-content">

      {/* Cabeçalho */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
          {greeting(displayName)}
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          Aqui está um resumo da sua conta CAMSTREAMER-BR.
        </p>
      </div>

      {/* Alertas */}
      {expiringSoon && (
        <div style={{ marginBottom: '1.25rem', padding: '0.875rem 1.25rem', background: 'var(--color-warning-bg)', border: '1px solid rgba(150,66,25,0.25)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span>⏳</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-warning)', fontWeight: 500 }}>
              Sua licença expira em <strong>{daysLeft} dia{daysLeft !== 1 ? 's' : ''}</strong>. Renove para não perder o acesso.
            </span>
          </div>
          <Link href="/dashboard/license" className="btn btn-sm" style={{ background: 'var(--color-warning)', color: '#fff', fontSize: '0.75rem', flexShrink: 0 }}>Ver licença</Link>
        </div>
      )}
      {isExpired && (
        <div style={{ marginBottom: '1.25rem', padding: '0.875rem 1.25rem', background: 'var(--color-error-bg)', border: '1px solid rgba(161,44,123,0.25)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span>🔴</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-error)', fontWeight: 500 }}>
              Sua licença <strong>expirou</strong>. O app pode ter parado de funcionar.
            </span>
          </div>
          <Link href="/dashboard/license" className="btn btn-danger btn-sm" style={{ flexShrink: 0 }}>Renovar agora</Link>
        </div>
      )}
      {license?.status === 'SUSPENDED' && (
        <div style={{ marginBottom: '1.25rem', padding: '0.875rem 1.25rem', background: 'var(--color-warning-bg)', border: '1px solid rgba(150,66,25,0.25)', borderRadius: 'var(--radius-lg)' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-warning)', fontWeight: 500 }}>⚠️ Sua licença está <strong>suspensa</strong>. Entre em contato com o suporte.</span>
        </div>
      )}

      {/* Stat Cards */}
      {license && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="stat-card">
            <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{isPro ? '⭐' : '🔵'}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: isPro ? 'var(--color-primary)' : '#1d4ed8' }}>{license.plan}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plano atual</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>📱</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: activeDevices >= license.max_devices ? 'var(--color-error)' : 'var(--color-text)' }}>
              {activeDevices}<span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--color-text-muted)' }}> / {license.max_devices}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ativos</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🟢</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: onlineNow > 0 ? 'var(--color-success)' : 'var(--color-text-muted)' }}>{onlineNow}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Online agora</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>📡</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: streamingNow > 0 ? 'var(--color-error)' : 'var(--color-text-muted)' }}>
              {streamingNow}
              {streamingNow > 0 && <span style={{ fontSize: '0.65rem', marginLeft: 4, color: 'var(--color-error)' }}>● AO VIVO</span>}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Transmitindo</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
              {isExpired ? '❌' : expiringSoon ? '⏳' : daysLeft === null ? '♾️' : '✅'}
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: isExpired ? 'var(--color-error)' : expiringSoon ? 'var(--color-warning)' : 'var(--color-success)' }}>
              {daysLeft === null ? 'Vitalício' : isExpired ? 'Expirado' : `${daysLeft}d`}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dias restantes</div>
          </div>
          {suspendedDevices > 0 && (
            <div className="stat-card">
              <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>⚠️</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-warning)' }}>{suspendedDevices}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Suspensos</div>
            </div>
          )}
        </div>
      )}

      {/* Sem licença */}
      {!license && (
        <div className="card" style={{ marginBottom: '1.5rem', textAlign: 'center', padding: '2.5rem 1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔑</div>
          <h3 style={{ fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem' }}>Nenhuma licença encontrada</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>Sua conta ainda não possui uma licença ativa. Entre em contato com o suporte.</p>
          <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="btn btn-primary">Falar com suporte</a>
        </div>
      )}

      {/* Licença + features */}
      {license && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Minha Licença</div>
                <div className="card-subtitle">Detalhes do plano</div>
              </div>
              <span className={`badge badge-${isPro ? 'pro' : 'basic'}`}>{license.plan}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'Status', value: (
                  <span style={{ fontWeight: 600, color: license.status === 'ACTIVE' ? 'var(--color-success)' : license.status === 'EXPIRED' ? 'var(--color-error)' : 'var(--color-warning)' }}>{license.status}</span>
                )},
                { label: 'Expiração', value: (
                  <span style={{ color: isExpired ? 'var(--color-error)' : expiringSoon ? 'var(--color-warning)' : 'var(--color-text)' }}>
                    {license.expires_at ? new Date(license.expires_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Vitalício'}
                    {daysLeft !== null && !isExpired && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: '0.375rem' }}>({daysLeft}d)</span>
                    )}
                  </span>
                )},
                { label: 'Dispositivos', value: `${activeDevices} / ${license.max_devices} ativos` },
                { label: 'Plano desde', value: new Date(license.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.625rem', borderBottom: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{label}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>
            {license.expires_at && daysLeft !== null && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.3rem' }}>
                  <span>Tempo de licença</span>
                  <span>{Math.max(daysLeft, 0)} dias restantes</span>
                </div>
                <div style={{ height: 6, borderRadius: 999, background: 'var(--color-divider)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.max(0, Math.min(100, (daysLeft / 365) * 100))}%`, background: isExpired ? 'var(--color-error)' : expiringSoon ? 'var(--color-warning)' : 'var(--color-primary)', borderRadius: 999, transition: 'width 0.4s ease' }} />
                </div>
              </div>
            )}
            {!isPro && license.status === 'ACTIVE' && (
              <div className="upgrade-banner" style={{ marginTop: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.125rem' }}>🚀 Faça upgrade para PRO</div>
                  <p>Desbloqueie RTMP avançado e até 5 dispositivos.</p>
                </div>
                <Link href="/dashboard/license" className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>Ver planos</Link>
              </div>
            )}
          </div>
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Recursos incluídos</div>
                <div className="card-subtitle">Plano {license.plan}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {features.map(f => (
                <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <span style={{ fontSize: '0.9rem', flexShrink: 0, opacity: f.included ? 1 : 0.35 }}>
                    {f.included ? '✅' : '❌'}
                  </span>
                  <span style={{ fontSize: '0.8125rem', color: f.included ? 'var(--color-text)' : 'var(--color-text-muted)', textDecoration: f.included ? 'none' : 'line-through' }}>
                    {f.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Atalhos */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div className="card-title">Atalhos</div>
          <div className="card-subtitle">Acesso rápido</div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/dashboard/profile" className="btn btn-secondary">👤 Meu Perfil</Link>
          <Link href="/dashboard/license" className="btn btn-secondary">🔑 Licença</Link>
          <Link href="/dashboard/devices" className="btn btn-secondary">📱 Dispositivos</Link>
        </div>
      </div>

      {/* Tabela de dispositivos */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Dispositivos Ativados</div>
            <div className="card-subtitle">
              {activeDevices > 0
                ? `${activeDevices} dispositivo${activeDevices > 1 ? 's' : ''} ativo${activeDevices > 1 ? 's' : ''}${onlineNow > 0 ? ` · ${onlineNow} online agora` : ''}`
                : 'Nenhum dispositivo ativo'}
            </div>
          </div>
          {activeDevices > 0 && (
            <Link href="/dashboard/devices" style={{ fontSize: '0.8125rem', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500 }}>Gerenciar →</Link>
          )}
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
            <p>Abra o app CAMSTREAMER-BR no seu Android e faça login para ativar automaticamente.</p>
          </div>
        ) : (
          <DeviceTable devices={devices ?? []} />
        )}
      </div>
    </main>
  )
}
