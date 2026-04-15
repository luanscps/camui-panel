import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Perfil — CAMUI Panel' }

type Profile = {
  full_name: string | null
  is_admin: boolean
  created_at: string | null
}

export default async function ProfilePage() {
  const supabase = (await createClient()) as any // eslint-disable-line @typescript-eslint/no-explicit-any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, is_admin, created_at')
    .eq('id', user.id)
    .single() as { data: Profile | null }

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.9375rem', color: 'var(--color-text)' }}>
                {profile?.is_admin ? 'Administrador' : 'Usuário'}
              </div>
              {profile?.is_admin && (
                <span style={{
                  fontSize: '0.65rem', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  color: 'var(--color-primary)',
                  background: 'var(--color-primary-highlight)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-full)'
                }}>Admin</span>
              )}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>Membro desde</div>
            <div style={{ fontSize: '0.9375rem', color: 'var(--color-text)' }}>
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
                : '—'}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
