import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Perfil — CAMUI Panel' }

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, created_at')
    .eq('id', user.id)
    .single()

  return (
    <main className="camui-content">
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>Perfil</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Suas informações de conta</p>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Dados pessoais</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>Nome completo</div>
            <div style={{ fontSize: '0.9375rem', color: 'var(--color-text)' }}>{profile?.full_name ?? '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>E-mail</div>
            <div style={{ fontSize: '0.9375rem', color: 'var(--color-text)' }}>{user.email}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>Função</div>
            <div style={{ fontSize: '0.9375rem', color: 'var(--color-text)' }}>{profile?.role === 'admin' ? 'Administrador' : 'Usuário'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>Membro desde</div>
            <div style={{ fontSize: '0.9375rem', color: 'var(--color-text)' }}>
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
