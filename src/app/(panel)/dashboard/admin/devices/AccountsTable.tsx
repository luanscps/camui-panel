'use client'

import { useState, useMemo } from 'react'
import DeviceDrawer from './DeviceDrawer'
import type { AccountRow } from './types'

export default function AccountsTable({ accounts }: { accounts: AccountRow[] }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return accounts
    return accounts.filter(a =>
      a.fullName.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      (a.accountNumber ?? '').toLowerCase().includes(q)
    )
  }, [query, accounts])

  return (
    <div>
      {/* Barra de busca */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou conta..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.25rem',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)', fontSize: '0.875rem',
            }}
          />
        </div>
        <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>
          {filtered.length} de {accounts.length}
        </span>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-offset)' }}>
                {['Nome', 'E-mail', 'Conta', 'Plano', 'Devices', 'Ativos', 'Susp.', 'Revog.', 'Último acesso', 'Ações'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!filtered.length && (
                <tr>
                  <td colSpan={10} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    {query ? `Nenhum resultado para "${query}"` : 'Nenhuma conta com dispositivo cadastrado'}
                  </td>
                </tr>
              )}
              {filtered.map(acc => {
                const lastSeen = acc.lastSeen ? new Date(acc.lastSeen) : null
                const isOnline = lastSeen ? (Date.now() - lastSeen.getTime()) < 5 * 60 * 1000 : false

                return (
                  <tr
                    key={acc.userId}
                    style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 150ms' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-offset)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                  >
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {acc.fullName}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {acc.email}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-primary)', whiteSpace: 'nowrap' }}>
                      #{acc.accountNumber ?? '——'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {acc.plan !== '—'
                        ? <span className={`badge badge-${acc.plan === 'PRO' ? 'pro' : 'basic'}`}>{acc.plan}</span>
                        : <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>—</span>
                      }
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, textAlign: 'center' }}>
                      {acc.deviceCount}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--color-success)', fontWeight: 600 }}>
                      {acc.activeCount}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: acc.suspendedCount > 0 ? 'var(--color-warning)' : 'var(--color-text-muted)' }}>
                      {acc.suspendedCount}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: acc.revokedCount > 0 ? 'var(--color-error)' : 'var(--color-text-muted)' }}>
                      {acc.revokedCount}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      {lastSeen
                        ? isOnline
                          ? <span style={{ color: 'var(--color-success)', fontWeight: 500 }}>🟢 Online</span>
                          : lastSeen.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                      <DeviceDrawer account={acc} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}