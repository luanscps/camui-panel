'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Props = {
  user: { email: string; id: string }
  profile: { full_name: string | null; role: string }
  license: { plan: string; status: string } | null
  children: React.ReactNode
}

const navItems = [
  {
    section: 'Principal',
    links: [
      { href: '/dashboard', label: 'Visão Geral', icon: HomeIcon },
    ],
  },
  {
    section: 'Minha Conta',
    links: [
      { href: '/dashboard/profile',  label: 'Perfil',        icon: UserIcon },
      { href: '/dashboard/license',  label: 'Licença',       icon: KeyIcon },
      { href: '/dashboard/devices',  label: 'Dispositivos',  icon: DeviceIcon },
    ],
  },
]

const adminItems = [
  { href: '/admin',          label: 'Painel Admin',  icon: ShieldIcon },
  { href: '/admin/users',    label: 'Usuários',      icon: UsersIcon },
  { href: '/admin/licenses', label: 'Licenças',      icon: KeyIcon },
]

export default function DashboardShell({ user, profile, license, children }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isAdmin = profile.role === 'admin'
  const isPro   = license?.plan === 'pro'

  const initials = (profile.full_name ?? user.email)
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const pageTitle = (() => {
    if (pathname === '/dashboard')          return 'Visão Geral'
    if (pathname.startsWith('/dashboard/profile'))  return 'Perfil'
    if (pathname.startsWith('/dashboard/license'))  return 'Licença'
    if (pathname.startsWith('/dashboard/devices'))  return 'Dispositivos'
    if (pathname.startsWith('/admin/users'))        return 'Usuários'
    if (pathname.startsWith('/admin/licenses'))     return 'Licenças'
    if (pathname.startsWith('/admin'))              return 'Painel Admin'
    return 'Dashboard'
  })()

  return (
    <div className="camui-layout">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
            zIndex: 49, display: 'none',
          }}
          className="sidebar-overlay"
        />
      )}

      {/* Sidebar */}
      <aside className={`camui-sidebar${sidebarOpen ? ' open' : ''}`}>
        {/* Logo */}
        <Link href="/dashboard" className="camui-sidebar-logo">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-label="CAMUI">
            <rect width="28" height="28" rx="7" fill="#01696f"/>
            <path d="M7 14c0-3.866 3.134-7 7-7a7 7 0 0 1 5.657 2.857" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="14" cy="14" r="2.5" fill="white"/>
            <path d="M17 17l3.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <div className="camui-sidebar-logo-text">
            CAMUI Panel
            <span>CAMSTREAMER-BR</span>
          </div>
        </Link>

        {/* Nav */}
        <nav className="camui-sidebar-nav" aria-label="Navegação principal">
          {navItems.map(({ section, links }) => (
            <div key={section}>
              <div className="camui-sidebar-section">{section}</div>
              {links.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`camui-nav-link${isActive(href) ? ' active' : ''}`}
                >
                  <Icon />
                  {label}
                  {href === '/dashboard/license' && (
                    <span className="camui-nav-link-badge">{isPro ? 'PRO' : 'BASIC'}</span>
                  )}
                </Link>
              ))}
            </div>
          ))}

          {isAdmin && (
            <div>
              <div className="camui-sidebar-section">Administração</div>
              {adminItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`camui-nav-link${isActive(href) ? ' active' : ''}`}
                >
                  <Icon />
                  {label}
                </Link>
              ))}
            </div>
          )}
        </nav>

        {/* Footer usuário */}
        <div className="camui-sidebar-footer">
          <div className="camui-sidebar-user">
            <div className="camui-sidebar-avatar">{initials}</div>
            <div className="camui-sidebar-user-info">
              <span className="camui-sidebar-user-email">{user.email}</span>
            </div>
          </div>
          <button onClick={handleSignOut} className="camui-sidebar-signout" style={{ width: '100%', textAlign: 'left', padding: '0.375rem 0.75rem' }}>
            Sair da conta
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="camui-main">
        {/* Topbar */}
        <header className="camui-topbar">
          {/* Hamburger mobile */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Abrir menu"
            style={{
              display: 'none', padding: '0.375rem',
              borderRadius: 'var(--radius-sm)', color: 'var(--color-text-muted)',
            }}
            className="hamburger-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          <nav className="camui-topbar-breadcrumb" aria-label="Breadcrumb">
            <Link href="/dashboard">Dashboard</Link>
            {pathname !== '/dashboard' && (
              <>
                <span aria-hidden>›</span>
                <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>{pageTitle}</span>
              </>
            )}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isPro ? (
              <span className="badge badge-pro">PRO</span>
            ) : (
              <Link href="/dashboard/license" className="badge badge-basic" style={{ textDecoration: 'none', cursor: 'pointer' }}>BASIC</Link>
            )}
          </div>
        </header>

        {children}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hamburger-btn { display: flex !important; }
          .sidebar-overlay { display: block !important; }
        }
      `}</style>
    </div>
  )
}

/* ─── Ícones inline SVG ─── */
function HomeIcon()   { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> }
function UserIcon()   { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> }
function KeyIcon()    { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6M15.5 7.5l3 3"/></svg> }
function DeviceIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18.01"/></svg> }
function ShieldIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> }
function UsersIcon()  { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> }
