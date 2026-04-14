'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email ou senha invalidos. Verifique seus dados e tente novamente.')
      setLoading(false)
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #0f3638 0%, #01696f 100%)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <svg width="44" height="44" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="8" fill="white" fillOpacity="0.15"/>
              <circle cx="18" cy="18" r="7" stroke="white" strokeWidth="2"/>
              <circle cx="18" cy="18" r="3" fill="white"/>
              <path d="M26 12l4-3v14l-4-3V12z" fill="white"/>
            </svg>
            <span className="text-white text-xl font-bold">CamStreamer BR</span>
          </Link>
          <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>Acesse seu painel de licenca</p>
        </div>

        {/* Card */}
        <div className="card" style={{ background: 'white', border: 'none' }}>
          <h1 className="text-xl font-bold mb-6" style={{ color: '#28251d' }}>Entrar na conta</h1>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: '#28251d' }}>Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none transition-all"
                style={{ borderColor: '#d4d1ca', background: '#fafaf8' }}
                onFocus={e => e.target.style.borderColor = '#01696f'}
                onBlur={e => e.target.style.borderColor = '#d4d1ca'}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: '#28251d' }}>Senha</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none transition-all"
                style={{ borderColor: '#d4d1ca', background: '#fafaf8' }}
                onFocus={e => e.target.style.borderColor = '#01696f'}
                onBlur={e => e.target.style.borderColor = '#d4d1ca'}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
              style={{ justifyContent: 'center', padding: '0.75rem', fontSize: '0.95rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t text-center text-sm" style={{ borderColor: '#e5e3df', color: '#7a7974' }}>
            Nao tem conta?{' '}
            <Link href="/register" className="font-medium" style={{ color: '#01696f' }}>Criar conta gratis</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
