'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import DeviceActionsClient from './DeviceActionsClient'
import type { AccountRow } from './types'

export default function DeviceDrawer({ account }: { account: AccountRow }) {
  const [open, setOpen] = useState(false)
  const [now, setNow]   = useState(() => Date.now())

  // Fecha com Escape
  useEffect(() => {
    if (!open) return
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [open])

  // Atualiza "online" a cada 30s
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(t)
  }, [])

  // Bloqueia scroll do body quando drawer aberto
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          fontSize: '0.75rem', fontWeight: 600,
          padding: '0.3rem 0.8rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-primary)',
          color: 'var(--color-primary)',
          background: 'var(--color-primary-highlight)',
          cursor: 'pointer', whiteSpace: 'nowrap',
        }}
      >
        📱 Ver devices ({account.deviceCount})
      </button>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000 }}
        />
      )}

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0,
        right: open ? 0 : '-540px',
        width: '100%', maxWidth: 540, height: '100%',
        background: 'var(--color-surface)',
        boxShadow: '-4px 0 32px rgba(0,0,0,0.25)',
        zIndex: 1001,
        display: 'flex', flexDirection: 'column',
        transition: 'right 0.28s cubic-bezier(0.4,0,0.2,1)',
        overflowY: 'auto',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--color-border)',
          position: 'sticky', top: 0,
          background: 'var(--color-surface)', zIndex: 1,
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)' }}>
              {account.fullName}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
              {account.email}
              {account.accountNumber && (
                <span style={{ marginLeft: '0.5rem', fontFamily: 'monospace', color: 'var(--color-primary)', fontWeight: 700 }}>
                  #{account.accountNumber}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Fechar"
            style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--color-text-muted)', lineHeight: 1, padding: '0.25rem' }}
          >
            ✕
          </button>
        </div>

        {/* Mini KPIs */}
        <div style={{ display: 'flex', gap: '0.75rem', padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border)', flexWrap: 'wrap' }}>
          {[
            { label: 'Total',     value: account.deviceCount,    color: 'var(--color-text)' },
            { label: 'Ativos',    value: account.activeCount,    color: 'var(--color-success)' },
            { label: 'Suspensos', value: account.suspendedCount, color: 'var(--color-warning)' },
            { label: 'Revogados', value: account.revokedCount,   color: 'var(--color-error)' },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, minWidth: 64, background: 'var(--color-surface-offset)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '0.2rem' }}>{s.label}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Lista devices */}
        <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {account.devices.length === 0 && (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', textAlign: 'center', paddingTop: '2rem' }}>
              Nenhum device vinculado.
            </p>
          )}

          {account.devices.map(dev => {
            const lastSeen    = dev.last_seen_at ? new Date(dev.last_seen_at) : null
            const isOnline    = lastSeen ? (now - lastSeen.getTime()) < 5 * 60 * 1000 : false
            const statusColor = dev.status === 'ACTIVE' ? 'var(--color-success)' : dev.status === 'SUSPENDED' ? 'var(--color-warning)' : 'var(--color-error)'

            return (
              <div key={dev.id} style={{ background: 'var(--color-surface-offset)', borderRadius: 'var(--radius)', padding: '1rem', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>

                  {/* Foto */}
                  <div style={{ width: 48, height: 48, flexShrink: 0, borderRadius: 8, overflow: 'hidden', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {dev.phone_image_url
                      ? <Image src={dev.phone_image_url} alt={dev.device_name ?? 'device'} width={48} height={48} style={{ objectFit: 'contain' }} />
                      : <span style={{ fontSize: '1.5rem' }}>📱</span>
                    }
                  </div>

                  {/* Infos */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, display: 'inline-block', background: isOnline ? 'var(--color-success)' : 'var(--color-border)' }} />
                      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text)' }}>
                        {dev.device_name ?? <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>Sem nome</span>}
                      </span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: statusColor }}>{dev.status}</span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                      {[dev.device_brand, dev.device_model].filter(Boolean).join(' / ') || '—'}
                      {dev.android_version ? ` · Android ${dev.android_version}` : ''}
                      {dev.app_version     ? ` · App ${dev.app_version}`           : ''}
                    </div>

                    {dev.android_id && (
                      <div style={{ marginTop: '0.3rem' }}>
                        <code style={{ background: 'var(--color-surface)', padding: '0.1rem 0.35rem', borderRadius: 'var(--radius-sm)', fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                          ID: {dev.android_id.slice(0, 16)}…
                        </code>
                      </div>
                    )}

                    {dev.sub_license_key && (
                      <div style={{ marginTop: '0.25rem' }}>
                        <code style={{ background: 'var(--color-surface)', padding: '0.1rem 0.35rem', borderRadius: 'var(--radius-sm)', fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                          Key: {dev.sub_license_key.slice(0, 16)}…
                        </code>
                      </div>
                    )}

                    {(dev.phone_specs?.ram || dev.phone_specs?.camera) && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', opacity: 0.8 }}>
                        {[dev.phone_specs.ram, dev.phone_specs.camera].filter(Boolean).join(' · ')}
                      </div>
                    )}

                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
                      {lastSeen
                        ? isOnline
                          ? <span style={{ color: 'var(--color-success)', fontWeight: 500 }}>🟢 Online agora</span>
                          : `Último acesso: ${lastSeen.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}`
                        : 'Nunca acessou'}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
                  <DeviceActionsClient
                    deviceId={dev.id}
                    currentStatus={dev.status}
                    deviceName={dev.device_name ?? 'Dispositivo'}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}