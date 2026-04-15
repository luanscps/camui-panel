import { createClient } from '@/lib/supabase/server'
import RevokeButton from './RevokeButton'

export const metadata = { title: 'Licenças — Admin' }

type LicenseRow = {
  id: string
  user_id: string
  plan: string
  status: string
  max_devices: number
  expires_at: string | null
  created_at: string
  profiles: { email?: string; full_name?: string } | null
}

type DeviceRow = {
  id: string
  license_id: string
  device_id: string
  device_name?: string | null
  last_seen_at?: string | null
}

export default async function AdminLicensesPage() {
  const supabase = await createClient()

  const { data: licenses } = await supabase
    .from('licenses')
    .select('*, profiles(email, full_name)')
    .order('created_at', { ascending: false })

  const { data: devices } = await supabase
    .from('device_activations')
    .select('*')
    .order('last_seen_at', { ascending: false })

  const rows = (licenses ?? []) as LicenseRow[]
  const devRows = (devices ?? []) as DeviceRow[]

  const planBadge = (plan: string) => plan === 'PRO' ? 'badge-pro' : 'badge-basic'
  const statusBadge = (s: string) =>
    s === 'ACTIVE' ? 'badge-success' : s === 'SUSPENDED' ? 'badge-warning' : 'badge-error'

  return (
    <main className="camui-content">
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>Licenças</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Todas as licenças e dispositivos do sistema</p>
        </div>
        <span className="badge badge-neutral" style={{ marginTop: '0.25rem' }}>{rows.length} licenças</span>
      </div>

      {/* Tabela licenças */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '2rem' }}>
        {rows.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="7.5" cy="15.5" r="5.5"/>
                <path d="M21 2l-9.6 9.6M15.5 7.5l3 3"/>
              </svg>
            </div>
            <h3>Nenhuma licença encontrada</h3>
            <p>Nenhuma licença foi criada ainda.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="camui-table">
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>Plano</th>
                  <th>Status</th>
                  <th>Devices</th>
                  <th>Expira</th>
                  <th>Criada</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((l) => {
                  const devCount = devRows.filter(d => d.license_id === l.id).length
                  return (
                    <tr key={l.id}>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: '0.8125rem', color: 'var(--color-text)' }}>
                          {l.profiles?.full_name ?? l.profiles?.email ?? l.user_id.substring(0, 8)}
                        </div>
                        {l.profiles?.email && l.profiles?.full_name && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{l.profiles.email}</div>
                        )}
                      </td>
                      <td><span className={`badge ${planBadge(l.plan)}`}>{l.plan}</span></td>
                      <td><span className={`badge ${statusBadge(l.status)}`}>{l.status}</span></td>
                      <td style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--color-text-muted)' }}>
                        {devCount}<span style={{ color: 'var(--color-text-faint)' }}> / {l.max_devices}</span>
                      </td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                        {l.expires_at ? new Date(l.expires_at).toLocaleDateString('pt-BR') : 'Vitalício'}
                      </td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(l.created_at).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tabela devices */}
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.25rem' }}>Dispositivos</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Todos os devices ativos no sistema</p>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {devRows.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2"/>
                <line x1="12" y1="18" x2="12" y2="18.01"/>
              </svg>
            </div>
            <h3>Nenhum dispositivo registrado</h3>
            <p>Ainda nenhum device foi ativado no sistema.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="camui-table">
              <thead>
                <tr>
                  <th>Device</th>
                  <th>ID</th>
                  <th>Último acesso</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {devRows.map((d) => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 500, fontSize: '0.8125rem', color: 'var(--color-text)' }}>
                      {d.device_name ?? 'Android Device'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {d.device_id.substring(0, 20)}…
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      {d.last_seen_at ? new Date(d.last_seen_at).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td>
                      <RevokeButton deviceId={d.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
