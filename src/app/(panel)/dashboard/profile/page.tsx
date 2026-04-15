import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import UpdateNameForm from './UpdateNameForm'
import Link from 'next/link'

export const metadata = { title: 'Perfil — CAMUI Panel' }

type Profile = {
  full_name: string | null
  is_admin: boolean
  created_at: string | null
}

type License = { plan: string; status: string }

export default async function ProfilePage() {
  const supabase = (await createClient()) as any // eslint-disable-line
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('full_name, is_admin, created_at')
    .eq('id', user.id).single() as { data: Profile | null }

  const { data: license } = await supabase
    .from('licenses').select('plan, status')
    .eq('user_id', user.id).maybeSingle() as { data: License | null }

  const isPro = license?.plan === 'PRO'
  const initials = (profile?.full_name ?? user.email ?? '?')
    .split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <main className="camui-content">
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>Perfil</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Suas informações de conta</p>
      </div>

      {/* Header do perfil com avatar */}
      <div className="card" style={{ marginBottom: '1.25rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-primary) 0%, #014a4e 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.375rem', fontWeight: 700, color: '#fff',
            flexShrink: 0, letterSpacing: '-0.02em',
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
              {profile?.full_name ?? <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>Nome não definido</span>}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>{user.email}</div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {license && <span className={`badge badge-${isPro ? 'pro' : 'basic'}`}>{license.plan}</span>}
              {profile?.is_admin && (
                <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)', background: 'rgba(1,105,111,0.1)', padding: '0.15rem 0.5rem', borderRadius: '999px' }}>Admin</span>
              )}
              {license && (
                <span style={{
                  fontSize: '0.7rem', fontWeight: 600,
                  color: license.status === 'ACTIVE' ? 'var(--color-success)' : license.status === 'EXPIRED' ? 'var(--color-error)' : 'var(--color-warning)',
                  background: license.status === 'ACTIVE' ? 'var(--color-success-bg)' : license.status === 'EXPIRED' ? 'var(--color-error-bg)' : 'var(--color-warning-bg)',
                  padding: '0.15rem 0.5rem', borderRadius: '999px',
                }}>{license.status}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dados pessoais */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-header">
          <div className="card-title">Dados pessoais</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>Nome completo</div>
            <UpdateNameForm currentName={profile?.full_name ?? null} />
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.375rem' }}>Este nome será exibido em todo o painel.</p>
          </div>

          <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.375rem' }}>E-mail</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{ fontSize: '0.9375rem', color: 'var(--color-text)' }}>{user.email}</div>
              <span style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text-muted)', background: 'var(--color-surface-offset)', border: '1px solid var(--color-border)', padding: '0.1rem 0.45rem', borderRadius: '999px' }}>Não editável</span>
            </div>
          </div>

          <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.375rem' }}>Função</div>
            {profile?.is_admin ? (
              <span style={{ display: 'inline-block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)', background: 'rgba(1,105,111,0.1)', padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-full)' }}>Administrador</span>
            ) : (
              <div style={{ fontSize: '0.9375rem', color: 'var(--color-text)' }}>Usuário</div>
            )}
          </div>

          <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.375rem' }}>Membro desde</div>
            <div style={{ fontSize: '0.9375rem', color: 'var(--color-text)' }}>
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
                : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Segurança */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-header">
          <div className="card-title">Segurança</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text)', marginBottom: '0.25rem' }}>Senha</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Para alterar sua senha, use o link de redefinição.</div>
          </div>
          <a
            href={`https://camui-panel.vercel.app/reset-password`}
            className="btn btn-secondary btn-sm"
          >🔒 Redefinir senha</a>
        </div>
      </div>

      {/* Links rápidos */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Acesso rápido</div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/dashboard"         className="btn btn-secondary">🏠 Visão Geral</Link>
          <Link href="/dashboard/license" className="btn btn-secondary">🔑 Minha Licença</Link>
          <Link href="/dashboard/devices" className="btn btn-secondary">📱 Dispositivos</Link>
        </div>
      </div>
    </main>
  )
}
