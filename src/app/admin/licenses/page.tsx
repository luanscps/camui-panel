import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import RevokeButton from './RevokeButton'

export const metadata = { title: 'Devices — Admin' }

type LicenseInfo = { plan: string; user_id: string }
type DeviceRow = {
  id: string
  device_id: string
  device_name: string | null
  activated_at: string | null
  last_seen_at: string | null
  license: LicenseInfo | null
}

export default async function AdminLicensesPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('device_activations')
    .select('id, device_id, device_name, activated_at, last_seen_at, license:licenses(plan, user_id)')
    .order('last_seen_at', { ascending: false })

  const devices = (data ?? []) as DeviceRow[]

  return (
    <>
      {/* Topbar */}
      <header className="camui-topbar">
        <nav className="camui-topbar-breadcrumb">
          <Link href="/admin">Admin</Link>
          <span>›</span>
          <span style={{ color: 'var(--color-text)' }}>Devices Ativados</span>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="badge badge-neutral">{devices.length} dispositivos</span>
        </div>
      </header>

      <main className="camui-content">
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
            Devices Ativados
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Todos os dispositivos Android registrados no sistema
          </p>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {devices.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="5" y="2" width="14" height="20" rx="2"/>
                  <path d="M12 18h.01"/>
                </svg>
              </div>
              <h3>Nenhum device ativado</h3>
              <p>Nenhum dispositivo Android foi ativado ainda.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="camui-table">
                <thead>
                  <tr>
                    <th>Dispositivo</th>
                    <th>Plano</th>
                    <th>Ativado em</th>
                    <th>Último acesso</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((d) => (
                    <tr key={d.id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--color-text)' }}>
                          {d.device_name || 'Dispositivo Android'}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                          {d.device_id}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${d.license?.plan === 'PRO' ? 'badge-pro' : 'badge-basic'}`}>
                          {d.license?.plan ?? '—'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                        {d.activated_at ? new Date(d.activated_at).toLocaleDateString('pt-BR') : '—'}
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
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
    </>
  )
}
