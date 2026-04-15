import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DeviceActions from './DeviceActions'

export const metadata = { title: 'Dispositivos — CAMUI Panel' }

type LicenseRow = { id: string; plan: string; max_devices: number | null }

type ActivationRow = {
  id: string
  status:          string | null
  sub_license_key: string | null
  device_name:     string | null
  device_brand:    string | null
  device_model:    string | null
  device_hardware: string | null
  android_version: string | null
  sdk_int:         number | null
  android_id:      string | null
  app_version:     string | null
  fingerprint:     string | null
  activated_at:    string | null
  last_seen:       string | null
}

function sdkToName(sdk: number | null): string {
  if (!sdk) return ''
  const map: Record<number, string> = {
    35: 'Android 15', 34: 'Android 14', 33: 'Android 13', 32: 'Android 12L',
    31: 'Android 12', 30: 'Android 11', 29: 'Android 10',
    28: 'Android 9',  27: 'Android 8.1', 26: 'Android 8.0',
  }
  return map[sdk] ?? `API ${sdk}`
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '—'
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)   return 'agora'
  if (m < 60)  return `há ${m}min`
  const h = Math.floor(m / 60)
  if (h < 24)  return `há ${h}h`
  const d = Math.floor(h / 24)
  if (d < 30)  return `há ${d}d`
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function isOnline(dateStr: string | null): boolean {
  if (!dateStr) return false
  return Date.now() - new Date(dateStr).getTime() < 5 * 60 * 1000
}

export default async function DevicesPage() {
  const supabase = (await createClient()) as any // eslint-disable-line
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: license } = await supabase
    .from('licenses')
    .select('id, plan, max_devices')
    .eq('user_id', user.id)
    .single() as { data: LicenseRow | null }

  const { data: activations } = license
    ? await supabase
        .from('device_activations')
        .select('id, status, sub_license_key, device_name, device_brand, device_model, device_hardware, android_version, sdk_int, android_id, app_version, fingerprint, activated_at, last_seen')
        .eq('license_id', license.id)
        .order('last_seen', { ascending: false })
    : { data: null }

  const devices: ActivationRow[] = activations ?? []
  const isPro       = license?.plan === 'PRO'
  const maxDevices  = license?.max_devices ?? (isPro ? 5 : 1)
  const activeCount = devices.length
  const atLimit     = activeCount >= maxDevices
  const pct         = Math.min((activeCount / maxDevices) * 100, 100)

  return (
    <main className="camui-content">

      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>Dispositivos</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Aparelhos autorizados a usar o CAMSTREAMER-BR com sua licença.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
          <span className={`badge badge-${isPro ? 'pro' : 'basic'}`}>{license?.plan ?? 'SEM LICENÇA'}</span>
          <span style={{ fontSize: '0.8125rem', color: atLimit ? 'var(--color-error)' : 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
            {activeCount} / {maxDevices}
          </span>
        </div>
      </div>

      {/* Barra de uso */}
      {license && (
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)' }}>Uso de slots</span>
            <span style={{ fontSize: '0.75rem', color: atLimit ? 'var(--color-error)' : 'var(--color-text-muted)' }}>
              {atLimit ? '⚠️ Limite atingido' : `${maxDevices - activeCount} slot${maxDevices - activeCount !== 1 ? 's' : ''} livre${maxDevices - activeCount !== 1 ? 's' : ''}`}
            </span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: 'var(--color-divider)', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${pct}%`,
              background: atLimit ? 'var(--color-error)' : pct >= 75 ? 'var(--color-warning)' : 'var(--color-primary)',
              borderRadius: 999,
              transition: 'width 0.4s ease',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--color-text-faint)', marginTop: '0.375rem' }}>
            <span>0</span><span>{maxDevices} max</span>
          </div>
        </div>
      )}

      {/* Empty states */}
      {!license && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6M15.5 7.5l3 3"/></svg>
            </div>
            <h3>Nenhuma licença encontrada</h3>
            <p>Você precisa de uma licença ativa para gerenciar dispositivos.</p>
          </div>
        </div>
      )}

      {license && devices.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18.01"/>
              </svg>
            </div>
            <h3>Nenhum dispositivo registrado</h3>
            <p>Abra o app CAMSTREAMER-BR e faça login para registrar este dispositivo automaticamente.</p>
          </div>
        </div>
      )}

      {/* Lista de dispositivos */}
      {license && devices.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {devices.map((device) => {
            const online      = isOnline(device.last_seen)
            const isSuspended = device.status === 'SUSPENDED'
            const brandModel  = [device.device_brand, device.device_name].filter(Boolean).join(' ')
            const androidLabel = device.android_version
              ? `Android ${device.android_version}${device.sdk_int ? ` (API ${device.sdk_int})` : ''}`
              : sdkToName(device.sdk_int)

            return (
              <div
                key={device.id}
                className="card"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  opacity: isSuspended ? 0.7 : 1,
                  border: isSuspended ? '1px solid var(--color-warning)' : undefined,
                  transition: 'opacity 0.2s ease',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)' }}>

                  {/* Ícone + dot */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 'var(--radius-md)',
                      background: isSuspended ? 'rgba(218,113,1,0.08)' : 'rgba(1,105,111,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: isSuspended ? 'var(--color-warning)' : 'var(--color-primary)',
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18.01"/>
                      </svg>
                    </div>
                    <span style={{
                      position: 'absolute', bottom: -2, right: -2,
                      width: 10, height: 10, borderRadius: '50%',
                      background: isSuspended ? 'var(--color-warning)' : online ? 'var(--color-success)' : 'var(--color-text-faint)',
                      border: '2px solid var(--color-surface)',
                    }} />
                  </div>

                  {/* Info principal */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text)' }}>
                        {brandModel || 'Dispositivo Android'}
                      </span>

                      {/* Badge de status da sub-licença */}
                      <span style={{
                        fontSize: '0.6875rem', fontWeight: 600,
                        color: isSuspended ? 'var(--color-warning)' : online ? 'var(--color-success)' : 'var(--color-text-muted)',
                        background: isSuspended ? 'rgba(218,113,1,0.08)' : online ? 'rgba(67,122,34,0.08)' : 'var(--color-surface-offset)',
                        padding: '0.1rem 0.45rem', borderRadius: 'var(--radius-full)',
                        textTransform: 'uppercase', letterSpacing: '0.04em',
                      }}>
                        {isSuspended ? '⏸ Suspenso' : online ? '● Online' : '○ Offline'}
                      </span>
                    </div>

                    {/* Sub-licença key */}
                    {device.sub_license_key && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.25rem' }}>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Sub-licença</span>
                        <code style={{
                          fontSize: '0.75rem', fontFamily: 'monospace',
                          color: 'var(--color-primary)',
                          background: 'rgba(1,105,111,0.06)',
                          padding: '0.1rem 0.4rem', borderRadius: 'var(--radius-sm)',
                          letterSpacing: '0.05em',
                        }}>
                          {device.sub_license_key}
                        </code>
                      </div>
                    )}

                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>
                      {device.device_model ?? device.device_brand ?? 'Modelo desconhecido'}
                      {device.device_hardware ? ` · ${device.device_hardware}` : ''}
                    </div>
                  </div>

                  {/* Ações */}
                  <div style={{ flexShrink: 0 }}>
                    <DeviceActions activationId={device.id} status={device.status ?? 'ACTIVE'} />
                  </div>
                </div>

                {/* Grade técnica */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 0 }}>
                  {[
                    { icon: '📱', label: 'Marca',           value: device.device_brand ?? '—' },
                    { icon: '⚙️',  label: 'Modelo',          value: device.device_model ?? device.device_hardware ?? '—' },
                    { icon: '🤖', label: 'Android',         value: androidLabel || '—' },
                    { icon: '🔑', label: 'Android ID',      value: device.android_id ? `${device.android_id.slice(0,8)}…` : '—', mono: true, title: device.android_id ?? undefined },
                    { icon: '🧬', label: 'Fingerprint',     value: device.fingerprint ? `${device.fingerprint.slice(0,28)}…` : '—', mono: true, title: device.fingerprint ?? undefined },
                    { icon: '📦', label: 'Versão do app',  value: device.app_version ?? '—' },
                    { icon: '📅', label: 'Ativado em',      value: device.activated_at ? new Date(device.activated_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
                    { icon: '🕐', label: 'Último acesso',  value: timeAgo(device.last_seen), highlight: online && !isSuspended },
                  ].map(({ icon, label, value, mono, title, highlight }) => (
                    <div key={label} title={title} style={{ padding: '0.75rem 1rem', borderRight: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>
                        {icon} {label}
                      </div>
                      <div style={{
                        fontSize: '0.8125rem', fontWeight: 600,
                        color: highlight ? 'var(--color-success)' : 'var(--color-text)',
                        fontFamily: mono ? 'monospace' : 'inherit',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )
          })}
        </div>
      )}

      {/* Banner upgrade */}
      {!isPro && license && (
        <div className="upgrade-banner" style={{ marginTop: '1.5rem' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-primary)', marginBottom: '0.25rem' }}>Precisa de mais dispositivos?</div>
            <p>Com o plano PRO você pode usar até 5 aparelhos simultaneamente.</p>
          </div>
          <a href="/dashboard/license" className="btn btn-primary" style={{ flexShrink: 0 }}>Ver planos</a>
        </div>
      )}

    </main>
  )
}
