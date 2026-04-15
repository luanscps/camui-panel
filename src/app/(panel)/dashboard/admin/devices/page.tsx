import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DeviceActionsClient from './DeviceActionsClient'

type DeviceRow = {
  id: string
  android_id: string | null
  device_brand: string | null
  device_model: string | null
  android_version: string | null
  status: 'active' | 'suspended' | 'revoked'
  last_seen_at: string | null
  created_at: string
  sub_license_id: string | null
  profiles: { full_name: string | null; email: string | null } | null
  sub_licenses: {
    id: string
    licenses: { plan: string; status: string } | null
  } | null
}

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: 'Ativo',      color: 'var(--color-success)', bg: 'rgba(67,122,34,0.1)' },
  suspended: { label: 'Suspenso',   color: 'var(--color-warning)', bg: 'rgba(218,113,1,0.1)' },
  revoked:   { label: 'Revogado',   color: 'var(--color-error)',   bg: 'rgba(161,44,123,0.1)' },
}

function fmt(date: string | null) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(date))
}

export default async function AdminDevicesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/dashboard')

  const { data: devices } = await supabase
    .from('devices')
    .select(`
      id,
      android_id,
      device_brand,
      device_model,
      android_version,
      status,
      last_seen_at,
      created_at,
      sub_license_id,
      profiles ( full_name, email ),
      sub_licenses (
        id,
        licenses ( plan, status )
      )
    `)
    .order('created_at', { ascending: false })

  const rows = (devices ?? []) as DeviceRow[]

  const total     = rows.length
  const active    = rows.filter(d => d.status === 'active').length
  const suspended = rows.filter(d => d.status === 'suspended').length
  const revoked   = rows.filter(d => d.status === 'revoked').length

  const kpis = [
    { label: 'Total',      value: total,     color: 'var(--color-text)' },
    { label: 'Ativos',     value: active,    color: 'var(--color-success)' },
    { label: 'Suspensos',  value: suspended, color: 'var(--color-warning)' },
    { label: 'Revogados',  value: revoked,   color: 'var(--color-error)' },
  ]

  return (
    <main style={{ padding: 'var(--space-6)', maxWidth: '100%' }}>
      <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-6)', color: 'var(--color-text)' }}>
        Dispositivos
      </h1>

      {/* KPIs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-8)',
      }}>
        {kpis.map(k => (
          <div key={k.label} style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4) var(--space-5)',
          }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              {k.label}
            </div>
            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: k.color, fontVariantNumeric: 'tabular-nums' }}>
              {k.value}
            </div>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-offset)', borderBottom: '1px solid var(--color-border)' }}>
                {['Marca', 'Modelo', 'Android', 'Android ID', 'Usuário', 'Plano', 'Sub-licença', 'Status', 'Último acesso', 'Ações'].map(h => (
                  <th key={h} style={{
                    padding: 'var(--space-3) var(--space-4)',
                    textAlign: 'left',
                    fontWeight: 600,
                    fontSize: 'var(--text-xs)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--color-text-muted)',
                    whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    Nenhum dispositivo registrado.
                  </td>
                </tr>
              )}
              {rows.map((d, i) => {
                const badge = STATUS_LABEL[d.status] ?? STATUS_LABEL.revoked
                const plan  = d.sub_licenses?.licenses?.plan ?? '—'
                const subId = d.sub_license_id ? d.sub_license_id.slice(0, 8) + '...' : '—'
                const userLabel = d.profiles?.full_name ?? d.profiles?.email ?? '—'

                return (
                  <tr key={d.id} style={{
                    borderBottom: i < rows.length - 1 ? '1px solid var(--color-divider)' : 'none',
                    transition: 'background 0.12s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-offset)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                  >
                    <td style={tdStyle}>{d.device_brand ?? '—'}</td>
                    <td style={tdStyle}>{d.device_model ?? '—'}</td>
                    <td style={tdStyle}>{d.android_version ?? '—'}</td>
                    <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                      {d.android_id ?? '—'}
                    </td>
                    <td style={tdStyle}>{userLabel}</td>
                    <td style={tdStyle}>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '0.04em',
                        color: plan === 'PRO' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                      }}>{plan}</span>
                    </td>
                    <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                      {subId}
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 600,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '9999px',
                        background: badge.bg,
                        color: badge.color,
                        whiteSpace: 'nowrap',
                      }}>{badge.label}</span>
                    </td>
                    <td style={{ ...tdStyle, whiteSpace: 'nowrap', color: 'var(--color-text-muted)' }}>
                      {fmt(d.last_seen_at)}
                    </td>
                    <td style={tdStyle}>
                      <DeviceActionsClient deviceId={d.id} currentStatus={d.status} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}

const tdStyle: React.CSSProperties = {
  padding: 'var(--space-3) var(--space-4)',
  verticalAlign: 'middle',
  color: 'var(--color-text)',
  whiteSpace: 'nowrap',
}
