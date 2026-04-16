import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Licença — CAMUI Panel' }

type License = {
  plan: string
  status: string
  expires_at: string | null
  max_devices: number | null
  created_at: string | null
  account_number: string | null
}

type DeviceRow = {
  id: string
  device_name: string | null
  device_brand: string | null
  device_model: string | null
  android_version: string | null
  status: string
  last_seen_at: string | null
  activated_at: string | null
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

export default async function LicensePage() {
  const supabase = (await createClient()) as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: license } = await supabase
    .from('licenses')
    .select('plan, status, expires_at, max_devices, created_at, account_number')
    .eq('user_id', user.id)
    .single() as { data: License | null }

  const { data: devices } = await supabase
    .from('device_activations')
    .select('id, device_name, device_brand, device_model, android_version, status, last_seen_at, activated_at')
    .eq('license_id',
      (await supabase.from('licenses').select('id').eq('user_id', user.id).single()).data?.id
    )
    .order('activated_at', { ascending: false }) as { data: DeviceRow[] | null }

  const isPro = license?.plan === 'PRO'
  const daysLeft = daysUntil(license?.expires_at ?? null)
  const expiringSoon = daysLeft !== null && daysLeft <= 7 && daysLeft >= 0
  const isExpired = daysLeft !== null && daysLeft < 0

  const activeDevices = devices?.filter(d => d.status === 'ACTIVE').length ?? 0
  const maxDevices = license?.max_devices ?? 1
  const devicePct = Math.min(100, Math.round((activeDevices / maxDevices) * 100))

  const features = [
    { label: 'Outputs RTMP',    basic: '1',      pro: 'até 5'    },
    { label: 'Resolução',       basic: '1080p',  pro: '4K'       },
    { label: 'Bitrate máx.',    basic: '4 Mbps', pro: '20 Mbps'  },
    { label: 'WebControl API',  basic: '❌',     pro: '✅'       },
    { label: 'Gravação local',  basic: '❌',     pro: '✅'       },
    { label: 'Stream contínuo', basic: '30 min', pro: '∞'        },
    { label: 'Câmera frontal',  basic: '❌',     pro: '✅'       },
    { label: 'Dispositivos',    basic: '1',      pro: 'até 5'    },
  ]

  return (
    <main className="camui-content">
      <style>{`.device-row:hover { background: var(--color-surface-offset); }`}</style>

      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>Licença</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Detalhes do seu plano e dispositivos ativos</p>
      </div>

      {/* Alertas */}
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
          <span style={{ fontSize: '0.875rem', color: 'var(--color-error)', fontWeight: 500 }}>Sua licença <strong>expirou</strong>. Entre em contato com o suporte.</span>
        </div>
      )}

      {license ? (
        <>
          {/* Card da conta */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <div>
                <div className="card-title">Minha conta</div>
                <div className="card-subtitle" style={{ fontFamily: 'monospace', fontSize: '1rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                  #{license.account_number ?? '——'}
                </div>
              </div>
              <span className={`badge badge-${isPro ? 'pro' : 'basic'}`}>{license.plan}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              {[
                {
                  label: 'Status',
                  value: <span style={{ fontWeight: 700, color: license.status === 'ACTIVE' ? 'var(--color-success)' : 'var(--color-error)' }}>{license.status}</span>
                },
                {
                  label: 'Dispositivos',
                  value: <span style={{ fontWeight: 700 }}>{activeDevices} / {maxDevices}</span>
                },
                {
                  label: 'Expiração',
                  value: <span style={{ fontWeight: 700, color: isExpired ? 'var(--color-error)' : expiringSoon ? 'var(--color-warning)' : 'var(--color-text)' }}>
                    {license.expires_at ? new Date(license.expires_at).toLocaleDateString('pt-BR') : 'Vitalício'}
                  </span>
                },
                {
                  label: 'Membro desde',
                  value: <span style={{ fontWeight: 700 }}>
                    {license.created_at ? new Date(license.created_at).toLocaleDateString('pt-BR') : '—'}
                  </span>
                },
              ].map(({ label, value }) => (
                <div key={label} className="stat-card">
                  <div className="stat-label">{label}</div>
                  <div className="stat-value" style={{ fontSize: '1rem' }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Barra de dispositivos */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.375rem' }}>
                <span>Dispositivos ativos</span>
                <span>{activeDevices} de {maxDevices}</span>
              </div>
              <div style={{ height: 8, borderRadius: 999, background: 'var(--color-divider)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${devicePct}%`,
                  background: devicePct >= 100 ? 'var(--color-error)' : devicePct >= 75 ? 'var(--color-warning)' : 'var(--color-primary)',
                  borderRadius: 999, transition: 'width 0.4s ease',
                }} />
              </div>
            </div>

            {/* Instrução de ativação */}
            <div style={{ padding: '0.875rem 1rem', background: 'var(--color-surface-offset)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              📱 Para ativar um novo dispositivo, basta fazer login no app <strong>CAMSTREAMER-BR</strong> com seu email e senha. A sub-licença é gerada automaticamente.
            </div>

            {/* CTA upgrade */}
            {!isPro && (
              <div className="upgrade-banner" style={{ marginTop: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-primary)', marginBottom: '0.25rem' }}>🚀 Faça upgrade para PRO</div>
                  <p>Desbloqueie até 5 dispositivos, 4K, gravação local e muito mais.</p>
                </div>
                <a
                  href="https://wa.me/?text=Olá! Gostaria de fazer upgrade para o plano PRO do CAMSTREAMER-BR."
                  target="_blank" rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ flexShrink: 0 }}
                >💬 Quero o PRO</a>
              </div>
            )}
          </div>

          {/* Dispositivos da conta */}
          <div className="card" style={{ marginBottom: '1.5rem', padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)' }}>
              <div className="card-title">Meus dispositivos</div>
              <div className="card-subtitle">Celulares com login ativo na sua conta</div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-offset)' }}>
                    {['Dispositivo', 'Android', 'Status', 'Ativado em', 'Último acesso'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {!devices?.length && (
                    <tr>
                      <td colSpan={5} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        Nenhum dispositivo ativado ainda. Faça login no app para ativar.
                      </td>
                    </tr>
                  )}
                  {devices?.map(dev => {
                    const lastSeen = dev.last_seen_at ? new Date(dev.last_seen_at) : null
                    const minutesAgo = lastSeen ? Math.floor((Date.now() - lastSeen.getTime()) / 60000) : null
                    const isOnline = minutesAgo !== null && minutesAgo < 5
                    const statusColor = dev.status === 'ACTIVE' ? 'var(--color-success)' : dev.status === 'SUSPENDED' ? 'var(--color-warning)' : 'var(--color-error)'

                    return (
                      <tr key={dev.id} className="device-row" style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', display: 'inline-block', flexShrink: 0, background: isOnline ? 'var(--color-success)' : 'var(--color-border)' }} />
                            {dev.device_name ?? <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>{[dev.device_brand, dev.device_model].filter(Boolean).join(' ') || 'Dispositivo'}</span>}
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                          {dev.android_version ? `Android ${dev.android_version}` : '—'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.8rem', color: statusColor }}>{dev.status}</span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                          {dev.activated_at ? new Date(dev.activated_at).toLocaleDateString('pt-BR') : '—'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                          {lastSeen
                            ? isOnline
                              ? <span style={{ color: 'var(--color-success)', fontWeight: 500 }}>Online agora</span>
                              : lastSeen.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
                            : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Comparativo de planos */}
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
                    <th style={{ textAlign: 'center', padding: '0.75rem 1rem' }}>
                      <span className={`badge badge-basic`} style={{ fontWeight: !isPro ? 800 : 600 }}>BASIC {!isPro && '← você'}</span>
                    </th>
                    <th style={{ textAlign: 'center', padding: '0.75rem 1rem' }}>
                      <span className={`badge badge-pro`} style={{ fontWeight: isPro ? 800 : 600 }}>PRO {isPro && '← você'}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {features.map(row => (
                    <tr key={row.label} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text)' }}>{row.label}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600 }}>{row.basic}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600 }}>{row.pro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!isPro && (
              <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)', textAlign: 'center' }}>
                <a href="https://wa.me/?text=Olá! Gostaria de fazer upgrade para o plano PRO do CAMSTREAMER-BR." target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  💬 Quero o PRO — Falar com suporte
                </a>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔑</div>
          <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Nenhuma licença encontrada</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>Entre em contato com o suporte para obter sua licença.</p>
          <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="btn btn-primary">Falar com suporte</a>
        </div>
      )}
    </main>
  )
}
