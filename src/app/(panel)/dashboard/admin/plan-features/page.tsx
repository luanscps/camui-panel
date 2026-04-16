import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Features por Plano — CAMUI Panel' }

type PlanFeature = {
  plan: string
  max_rtmp_outputs: number
  max_resolution: string
  max_bitrate_kbps: number
  web_control: boolean
  local_recording: boolean
  max_stream_minutes: number
  front_camera: boolean
  max_devices: number
  updated_at: string | null
}

export default async function PlanFeaturesPage() {
  const supabase = (await createClient()) as any
  const { data: features } = await supabase
    .from('plan_features')
    .select('*')
    .order('plan') as { data: PlanFeature[] | null }

  const rows: { label: string; key: keyof PlanFeature; format?: (v: any) => string }[] = [
    { label: 'Máx. outputs RTMP',   key: 'max_rtmp_outputs' },
    { label: 'Resolução máxima',    key: 'max_resolution' },
    { label: 'Bitrate máx. (kbps)', key: 'max_bitrate_kbps' },
    { label: 'WebControl API',      key: 'web_control',        format: v => v ? '✅ Sim' : '❌ Não' },
    { label: 'Gravação local',      key: 'local_recording',    format: v => v ? '✅ Sim' : '❌ Não' },
    { label: 'Stream (minutos)',    key: 'max_stream_minutes', format: v => v === 0 ? '∞ Ilimitado' : String(v) },
    { label: 'Câmera frontal',      key: 'front_camera',       format: v => v ? '✅ Sim' : '❌ Não' },
    { label: 'Máx. dispositivos',   key: 'max_devices' },
  ]

  return (
    <main className="camui-content">
      <style>{`.feat-row:hover { background: var(--color-surface-offset); }`}</style>

      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
          Features por Plano
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          Controle o que cada plano pode acessar no app Android
        </p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-offset)' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Feature
                </th>
                {features?.map(f => (
                  <th key={f.plan} style={{ textAlign: 'center', padding: '0.75rem 1rem', fontWeight: 700, fontSize: '0.875rem',
                    color: f.plan === 'PRO' ? 'var(--color-primary)' : 'var(--color-text)' }}>
                    {f.plan}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.key} className="feat-row" style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                    {row.label}
                  </td>
                  {features?.map(f => (
                    <td key={f.plan} style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600 }}>
                      {row.format ? row.format(f[row.key]) : String(f[row.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
        Última atualização: {features?.[0]?.updated_at
          ? new Date(features[0].updated_at).toLocaleString('pt-BR')
          : '—'}
      </p>
    </main>
  )
}
