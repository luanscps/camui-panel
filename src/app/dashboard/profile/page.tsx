import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Tables } from '@/types/database'

type Profile = Tables<'profiles'>

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const profile: Profile | null = profileData ?? null

  const initials = (profile?.full_name ?? user.email ?? '?')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const joinedAt = new Date(user.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

  return (
    <div className="camui-content">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
          Perfil
        </h1>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
          Suas informações pessoais e configurações de conta.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '1.25rem', maxWidth: '720px' }}>
        {/* Avatar + info */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'var(--color-brand)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.25rem', fontWeight: 700, flexShrink: 0,
            }}>
              {initials}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--color-text)' }}>
                {profile?.full_name ?? '—'}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                {user.email}
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <span className={`badge ${profile?.is_admin ? 'badge-admin' : 'badge-neutral'}`}>
                  {profile?.is_admin ? 'admin' : 'user'}
                </span>
              </div>
            </div>
          </div>

          <div className="info-row">
            <div className="info-cell">
              <div className="info-cell-label">ID da Conta</div>
              <div className="info-cell-value" style={{ fontSize: '0.75rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {user.id}
              </div>
            </div>
            <div className="info-cell">
              <div className="info-cell-label">Membro desde</div>
              <div className="info-cell-value">{joinedAt}</div>
            </div>
            <div className="info-cell">
              <div className="info-cell-label">Email verificado</div>
              <div className="info-cell-value">
                <span className={`badge ${user.email_confirmed_at ? 'badge-success' : 'badge-warning'}`}>
                  {user.email_confirmed_at ? 'Verificado' : 'Pendente'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário de atualização de nome */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Informações pessoais</div>
              <div className="card-subtitle">Atualize seu nome de exibição.</div>
            </div>
          </div>
          <form action="/api/profile/update" method="POST" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text)' }}>Nome completo</label>
              <input
                name="full_name"
                defaultValue={profile?.full_name ?? ''}
                placeholder="Seu nome"
                style={{
                  padding: '0.5rem 0.75rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  background: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  outline: 'none',
                  width: '100%',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary btn-sm">Salvar alterações</button>
            </div>
          </form>
        </div>

        {/* Segurança */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Segurança</div>
              <div className="card-subtitle">Gerencie sua senha e sessões ativas.</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.875rem 1rem',
              background: 'var(--color-surface-offset)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
            }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>Senha</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Última alteração desconhecida</div>
              </div>
              <button className="btn btn-secondary btn-sm">Alterar senha</button>
            </div>
          </div>
        </div>

        {/* Zona de perigo */}
        <div className="card" style={{ borderColor: 'rgba(161,44,123,0.2)' }}>
          <div className="card-header">
            <div>
              <div className="card-title" style={{ color: '#a12c7b' }}>Zona de perigo</div>
              <div className="card-subtitle">Ações irreversíveis relacionadas à sua conta.</div>
            </div>
          </div>
          <button className="btn btn-danger btn-sm">Excluir minha conta</button>
        </div>
      </div>
    </div>
  )
}
