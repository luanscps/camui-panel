'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  userEmail: string
  isAdmin?: boolean
  userInitials: string
}

const CamuiLogo = () => (
  <svg width="28" height="28" viewBox="0 0 36 36" fill="none" aria-label="CamStreamer BR">
    <rect width="36" height="36" rx="8" fill="#01696f"/>
    <circle cx="18" cy="18" r="7" stroke="white" strokeWidth="2"/>
    <circle cx="18" cy="18" r="3" fill="white"/>
    <path d="M26 12l4-3v14l-4-3V12z" fill="white"/>
  </svg>
)

const iconUser = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

const iconGrid = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
)

const iconShield = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

const iconUsers = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

const iconKey = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7" cy="17" r="4"/><path d="M10.85 13.15 19 5"/>
    <path d="m19 5 2 2-2.5 2.5-2-2"/>
  </svg>
)

const iconMonitor = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <path d="M8 21h8M12 17v4"/>
  </svg>
)

export default function Sidebar({ userEmail, isAdmin, userInitials }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <aside className="camui-sidebar">
      {/* Logo */}
      <Link href="/dashboard" className="camui-sidebar-logo">
        <CamuiLogo />
        <div className="camui-sidebar-logo-text">
          CamStreamer BR
          <span>CAMUI Panel</span>
        </div>
      </Link>

      {/* Nav */}
      <nav className="camui-sidebar-nav">
        <span className="camui-sidebar-section">Geral</span>

        <Link href="/dashboard" className={`camui-nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
          {iconGrid}
          Dashboard
        </Link>

        <Link href="/dashboard/profile" className={`camui-nav-link ${isActive('/dashboard/profile') ? 'active' : ''}`}>
          {iconUser}
          Meu Perfil
        </Link>

        <Link href="/dashboard/devices" className={`camui-nav-link ${isActive('/dashboard/devices') ? 'active' : ''}`}>
          {iconMonitor}
          Dispositivos
        </Link>

        <Link href="/dashboard/license" className={`camui-nav-link ${isActive('/dashboard/license') ? 'active' : ''}`}>
          {iconKey}
          Minha Licença
        </Link>

        {isAdmin && (
          <>
            <span className="camui-sidebar-section" style={{ marginTop: '0.5rem' }}>Admin</span>

            <Link href="/admin" className={`camui-nav-link ${isActive('/admin') && !isActive('/admin/users') && !isActive('/admin/licenses') ? 'active' : ''}`}>
              {iconShield}
              Painel Admin
            </Link>

            <Link href="/admin/users" className={`camui-nav-link ${isActive('/admin/users') ? 'active' : ''}`}>
              {iconUsers}
              Usuários
            </Link>

            <Link href="/admin/licenses" className={`camui-nav-link ${isActive('/admin/licenses') ? 'active' : ''}`}>
              {iconKey}
              Devices / Licenças
            </Link>
          </>
        )}
      </nav>

      {/* Footer user */}
      <div className="camui-sidebar-footer">
        <div className="camui-sidebar-user">
          <div className="camui-sidebar-avatar">{userInitials}</div>
          <div className="camui-sidebar-user-info">
            <span className="camui-sidebar-user-email">{userEmail}</span>
          </div>
        </div>
        <form action="/auth/signout" method="post" style={{ marginTop: '0.375rem', paddingLeft: '0.75rem' }}>
          <button type="submit" className="camui-sidebar-signout">↩ Sair da conta</button>
        </form>
      </div>
    </aside>
  )
}
