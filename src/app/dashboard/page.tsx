import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const metadata = { title: 'Dashboard' }

type License = {
  id: string
  user_id: string
  plan: 'BASIC' | 'PRO'
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED'
  expires_at: string | null
  max_devices: number
  created_at: string
  updated_at: string
}

type Device = {
  id: string
  license_id: string
  device_id: string
  device_name?: string
  activated_at: string
  last_seen_at: string
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Buscar licenca do usuario (RLS garante que so ve a propria)
  const { data: license } = await supabase
    .from('licenses')
    .select('*')
    .single() as { data: License | null }

  // Buscar devices ativados
  const { data: devices } = license
    ? await supabase
        .from('device_activations')
        .select('*')
        .eq('license_id', license.id)
        .order('last_seen_at', { ascending: false }) as { data: Device[] | null }
    : { data: [] as Device[] }

  const planColor = license?.plan === 'PRO' ? '#01696f' : '#7a7974'
  const planBg = license?.plan === 'PRO' ? '#f0fafb' : '#f5f5f4'

  return (
    <div className="min-h-screen" style={{ background: '#f7f6f2' }}>
      {/* Header */}
      <header style={{ background: 'white', borderBottom: '1px solid rgba(40,37,29,0.08)' }}>
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="8" fill="#01696f"/>
              <circle cx="18" cy="18" r="7" stroke="white" strokeWidth="2"/>
              <circle cx="18" cy="18" r="3" fill="white"/>
              <path d="M26 12l4-3v14l-4-3V12z" fill="white"/>
            </svg>
            <span className="font-bold" style={{ color: '#28251d' }}>CamStreamer BR</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm" style={{ color: '#7a7974' }}>{user.email}</span>
            <form action="/auth/signout" method="post">
              <button type="submit" className="btn btn-secondary text-xs py-1.5 px-3">Sair</button>
            </form>
          </div>
        </div>
      </header>

      <main className="container py-10">
        <h1 className="text-2xl font-bold mb-8" style={{ color: '#28251d' }}>Meu Painel</h1>

        {/* Licenca */}
        <div className="card mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-semibold text-lg" style={{ color: '#28251d' }}>Minha Licenca</h2>
              <p className="text-sm mt-1" style={{ color: '#7a7974' }}>Status e plano atual</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: planBg, color: planColor }}>
              {license?.plan || 'SEM LICENCA'}
            </span>
          </div>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
            <div className="p-4 rounded-lg" style={{ background: '#f7f6f2' }}>
              <div className="text-xs mb-1" style={{ color: '#7a7974' }}>Status</div>
              <div className="font-semibold" style={{ color: license?.status === 'ACTIVE' ? '#437a22' : '#a12c7b' }}>
                {license?.status || '-'}
              </div>
            </div>
            <div className="p-4 rounded-lg" style={{ background: '#f7f6f2' }}>
              <div className="text-xs mb-1" style={{ color: '#7a7974' }}>Devices</div>
              <div className="font-semibold" style={{ color: '#28251d' }}>
                {devices?.length || 0} / {license?.max_devices || 1}
              </div>
            </div>
            <div className="p-4 rounded-lg" style={{ background: '#f7f6f2' }}>
              <div className="text-xs mb-1" style={{ color: '#7a7974' }}>Expiracao</div>
              <div className="font-semibold" style={{ color: '#28251d' }}>
                {license?.expires_at ? new Date(license.expires_at).toLocaleDateString('pt-BR') : 'Nunca'}
              </div>
            </div>
            <div className="p-4 rounded-lg" style={{ background: '#f7f6f2' }}>
              <div className="text-xs mb-1" style={{ color: '#7a7974' }}>RTMP</div>
              <div className="font-semibold" style={{ color: license?.plan === 'PRO' ? '#437a22' : '#7a7974' }}>
                {license?.plan === 'PRO' ? 'Habilitado' : 'Basico'}
              </div>
            </div>
          </div>
          {license?.plan === 'BASIC' && (
            <div className="mt-4 p-4 rounded-lg flex items-center justify-between" style={{ background: '#f0fafb', border: '1px solid #cedcd8' }}>
              <p className="text-sm" style={{ color: '#01696f' }}>🚀 Faca upgrade para PRO e desbloqueie RTMP avancado, overlay e mais devices.</p>
              <Link href="/upgrade" className="btn btn-primary text-xs py-1.5 px-4" style={{ whiteSpace: 'nowrap', marginLeft: '1rem' }}>Upgrade PRO</Link>
            </div>
          )}
        </div>

        {/* Devices */}
        <div className="card">
          <h2 className="font-semibold text-lg mb-4" style={{ color: '#28251d' }}>Dispositivos Ativados</h2>
          {!devices || devices.length === 0 ? (
            <div className="text-center py-10" style={{ color: '#7a7974' }}>
              <div className="text-4xl mb-3">📱</div>
              <p className="font-medium mb-1">Nenhum dispositivo ativado</p>
              <p className="text-sm">Abra o app CAMSTREAMER BR no seu Android e faca login para ativar.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {devices.map((device: Device) => (
                <div key={device.id} className="flex items-center gap-4 p-4 rounded-lg" style={{ background: '#f7f6f2' }}>
                  <div className="text-2xl">📱</div>
                  <div className="flex-1">
                    <div className="font-medium text-sm" style={{ color: '#28251d' }}>{device.device_name || 'Dispositivo Android'}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#7a7974' }}>ID: {device.device_id.substring(0, 16)}...</div>
                  </div>
                  <div className="text-xs" style={{ color: '#7a7974' }}>
                    Visto: {new Date(device.last_seen_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
