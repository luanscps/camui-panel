'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      setLoading(false)
      return
    }

    const supabase = createClient()

    // 1. Registrar usuário no Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (signUpError) {
      if (signUpError.message.includes('already registered') || signUpError.code === 'user_already_exists') {
        setError('Este email já está cadastrado. Tente fazer login.')
      } else {
        setError(signUpError.message)
      }
      setLoading(false)
      return
    }

    if (signUpData.user) {
      // 2. Criar licença BASIC automática via RPC (tipada no database.types.ts)
      try {
        const { error: rpcError } = await supabase.rpc('create_default_license', {
          p_user_id: signUpData.user.id,
          p_plan: 'BASIC',
          p_max_devices: 1,
        })
        if (rpcError) console.error('[register] RPC create_default_license:', rpcError)
      } catch (err) {
        console.error('[register] RPC call failed:', err)
      }

      // 3. Criar profile padrão
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: signUpData.user.id,
            full_name: fullName,
            is_admin: false,
          })
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('[register] Profile creation:', profileError)
        }
      } catch (err) {
        console.error('[register] Profile insert failed:', err)
      }
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'linear-gradient(135deg, #0f3638 0%, #01696f 100%)' }}
      >
        <div className="card text-center max-w-md w-full" style={{ background: 'white', border: 'none' }}>
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#28251d' }}>Conta criada!</h2>
          <p className="mb-2" style={{ color: '#7a7974', fontSize: '0.9rem' }}>
            Verifique seu email e clique no link de confirmação para ativar sua conta.
          </p>
          <p className="mb-6 text-xs px-4" style={{ color: '#01696f' }}>
            🎉 Sua licença BASIC gratuita foi ativada automaticamente.
          </p>
          <Link
            href="/login"
            className="btn btn-primary"
            style={{ justifyContent: 'center', width: '100%' }}
          >
            Ir para o login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #0f3638 0%, #01696f 100%)' }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <svg width="44" height="44" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="8" fill="white" fillOpacity="0.15" />
              <circle cx="18" cy="18" r="7" stroke="white" strokeWidth="2" />
              <circle cx="18" cy="18" r="3" fill="white" />
              <path d="M26 12l4-3v14l-4-3V12z" fill="white" />
            </svg>
            <span className="text-white text-xl font-bold">CamStreamer BR</span>
          </Link>
          <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Crie sua conta e ative sua licença BASIC grátis
          </p>
        </div>

        <div className="card" style={{ background: 'white', border: 'none' }}>
          <h1 className="text-xl font-bold mb-6" style={{ color: '#28251d' }}>Criar conta grátis</h1>

          {error && (
            <div
              className="mb-4 p-3 rounded-lg text-sm"
              style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1.5" style={{ color: '#28251d' }}>
                Nome completo
              </label>
              <input
                id="name"
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Seu nome"
                required
                className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none transition-all"
                style={{ borderColor: '#d4d1ca', background: '#fafaf8' }}
                onFocus={e => (e.target.style.borderColor = '#01696f')}
                onBlur={e => (e.target.style.borderColor = '#d4d1ca')}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: '#28251d' }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none transition-all"
                style={{ borderColor: '#d4d1ca', background: '#fafaf8' }}
                onFocus={e => (e.target.style.borderColor = '#01696f')}
                onBlur={e => (e.target.style.borderColor = '#d4d1ca')}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: '#28251d' }}>
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none transition-all"
                style={{ borderColor: '#d4d1ca', background: '#fafaf8' }}
                onFocus={e => (e.target.style.borderColor = '#01696f')}
                onBlur={e => (e.target.style.borderColor = '#d4d1ca')}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
              style={{
                justifyContent: 'center',
                padding: '0.75rem',
                fontSize: '0.95rem',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Criando conta...' : 'Criar conta grátis'}
            </button>
          </form>

          <div
            className="mt-6 pt-6 border-t text-center text-sm"
            style={{ borderColor: '#e5e3df', color: '#7a7974' }}
          >
            Já tem conta?{' '}
            <Link href="/login" className="font-medium" style={{ color: '#01696f' }}>
              Entrar
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
