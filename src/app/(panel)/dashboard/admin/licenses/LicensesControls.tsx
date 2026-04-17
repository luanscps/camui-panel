import EditLicenseInline from './EditLicenseInline'

type LicenseRow = {
  id: string
  plan: string
  status: string
  expires_at: string | null
  user_id: string
  max_devices: number | null
  created_at: string | null
  userName: string
  isExpiring: boolean
  isExpiredButActive: boolean
}

export default function LicensesTable({ licenses }: { licenses: LicenseRow[] }) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-offset)' }}>
              {['Usuário', 'Plano', 'Status', 'Devices', 'Expira em', 'Criado em', 'Ações'].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600,
                  color: 'var(--color-text-muted)', fontSize: '0.7rem',
                  textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {licenses.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  Nenhuma licença encontrada
                </td>
              </tr>
            )}
            {licenses.map(lic => (
              <tr key={lic.id} style={{
                borderBottom: '1px solid var(--color-border)',
                background: lic.isExpiring
                  ? 'rgba(150,66,25,0.03)'
                  : lic.isExpiredButActive
                  ? 'rgba(161,44,123,0.03)'
                  : '',
              }}>
                <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>
                  {lic.userName || <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>Sem nome</span>}
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <span className={`badge badge-${lic.plan === 'PRO' ? 'pro' : 'basic'}`}>{lic.plan}</span>
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <span style={{
                    fontWeight: 600, fontSize: '0.8rem',
                    color: lic.status === 'ACTIVE' ? 'var(--color-success)'
                      : lic.status === 'EXPIRED' ? 'var(--color-error)'
                      : 'var(--color-warning)',
                  }}>{lic.status}</span>
                  {lic.isExpiring && (
                    <span style={{ marginLeft: '0.375rem', fontSize: '0.7rem', color: 'var(--color-warning)' }}>⚠️ expira em breve</span>
                  )}
                </td>
                <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  {lic.max_devices ?? 1}
                </td>
                <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', whiteSpace: 'nowrap', color: lic.isExpiredButActive ? 'var(--color-error)' : 'var(--color-text-muted)' }}>
                  {lic.expires_at ? new Date(lic.expires_at).toLocaleDateString('pt-BR') : '—'}
                  {lic.isExpiredButActive && ' 🔴'}
                </td>
                <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                  {lic.created_at ? new Date(lic.created_at).toLocaleDateString('pt-BR') : '—'}
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <EditLicenseInline
                    licenseId={lic.id}
                    userId={lic.user_id}
                    userName={lic.userName || lic.user_id.slice(0, 8) + '…'}
                    currentPlan={lic.plan}
                    currentStatus={lic.status}
                    currentMaxDevices={lic.max_devices ?? 1}
                    currentExpiresAt={lic.expires_at}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}