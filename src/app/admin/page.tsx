import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export const metadata = { title: 'Admin' }

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verificar se o usuario e admin via user_metadata
  const isAdmin = user.app_metadata?.role === 'admin' || user.email === 'luanscps@gmail.com'
  if (!isAdmin) redirect('/dashboard')

  // Usar admin client para ver TODOS os dados (bypassa RLS)
  const adminClient = createAdminClient()

  const { data: licenses, count: licenseCount } = await adminClient
    .from('licenses')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(50)

  const { count: proCount } = await adminClient
    .from('licenses')
    .select('*', { count: 'exact', head: true })
    .eq('plan', 'PRO')

  const { count: deviceCount } = await adminClient
    .from('device_activations')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="min-h-screen" style={{ background: '#f7f6f2' }}>
      <header style={{ background: '#0f3638', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="8" fill="white" fillOpacity="0.15"/>
              <circle cx="18" cy="18" r="7" stroke="white" strokeWidth="2"/>
              <circle cx="18" cy="18" r="3" fill="white"/>
            </svg>
            <span className="font-bold text-white">CamStreamer BR</span>
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}>ADMIN</span>
          </div>
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{user.email}</span>
        </div>
      </header>

      <main className="container py-10">
        <h1 className="text-2xl font-bold mb-8" style={{ color: '#28251d' }}>Painel Administrativo</h1>

        {/* KPIs */}
        <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          {[
            { label: 'Total de Licencas', value: licenseCount || 0, color: '#01696f' },
            { label: 'Plano PRO', value: proCount || 0, color: '#437a22' },
            { label: 'Plano BASIC', value: (licenseCount || 0) - (proCount || 0), color: '#7a7974' },
            { label: 'Devices Ativos', value: deviceCount || 0, color: '#2793a0' },
          ].map((kpi, i) => (
            <div key={i} className="card">
              <div className="text-xs mb-1" style={{ color: '#7a7974' }}>{kpi.label}</div>
              <div className="text-3xl font-bold" style={{ color: kpi.color }}>{kpi.value}</div>
            </div>
          ))}
        </div>

        {/* Tabela de licencas */}
        <div className="card">
          <h2 className="font-semibold text-lg mb-4" style={{ color: '#28251d' }}>Licencas Recentes</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(40,37,29,0.08)' }}>
                  {['User ID', 'Plano', 'Status', 'Max Devices', 'Criado em'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.75rem 0.5rem', color: '#7a7974', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(licenses || []).map((lic: { id: string; user_id: string; plan: string; status: string; max_devices: number; created_at: string }) => (
                  <tr key={lic.id} style={{ borderBottom: '1px solid rgba(40,37,29,0.04)' }}>
                    <td style={{ padding: '0.75rem 0.5rem', color: '#7a7974', fontFamily: 'monospace' }}>{lic.user_id.substring(0, 12)}...</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span style={{
                        display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                        background: lic.plan === 'PRO' ? '#f0fafb' : '#f5f5f4',
                        color: lic.plan === 'PRO' ? '#01696f' : '#7a7974'
                      }}>{lic.plan}</span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span style={{
                        display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                        background: lic.status === 'ACTIVE' ? '#f0fdf4' : '#fef2f2',
                        color: lic.status === 'ACTIVE' ? '#437a22' : '#991b1b'
                      }}>{lic.status}</span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', color: '#28251d' }}>{lic.max_devices}</td>
                    <td style={{ padding: '0.75rem 0.5rem', color: '#7a7974' }}>{new Date(lic.created_at).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!licenses || licenses.length === 0) && (
              <div className="text-center py-10" style={{ color: '#7a7974' }}>Nenhuma licenca registrada ainda.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
