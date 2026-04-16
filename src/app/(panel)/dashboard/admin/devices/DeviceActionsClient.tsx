'use client'

import { useTransition, useState } from 'react'
import { suspendDevice, reactivateDevice, revokeDevice } from './actions'

type Props = {
  deviceId: string
  currentStatus: string
  deviceName: string
}

export default function DeviceActionsClient({ deviceId, currentStatus, deviceName }: Props) {
  const [pending, startTransition] = useTransition()
  const [error, setError]           = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)

  function run(action: () => Promise<void>) {
    setError(null)
    startTransition(async () => {
      try { await action() }
      catch (e: any) { setError(e.message) }
    })
  }

  const base: React.CSSProperties = {
    fontSize: '0.75rem', fontWeight: 600,
    padding: '0.3rem 0.65rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid',
    cursor: pending ? 'not-allowed' : 'pointer',
    opacity: pending ? 0.55 : 1,
    transition: '180ms',
    background: 'transparent',
  }

  if (confirming) {
    return (
      <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-error)', fontWeight: 500 }}>
          Revogar "{deviceName}"?
        </span>
        <button
          disabled={pending}
          onClick={() => { setConfirming(false); run(() => revokeDevice(deviceId)) }}
          style={{ ...base, color: 'var(--color-error)', borderColor: 'var(--color-error)', background: 'var(--color-error-highlight)' }}
        >
          {pending ? '…' : '✓ Confirmar'}
        </button>
        <button
          disabled={pending}
          onClick={() => setConfirming(false)}
          style={{ ...base, color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }}
        >
          Cancelar
        </button>
        {error && <span style={{ fontSize: '0.7rem', color: 'var(--color-error)' }}>{error}</span>}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', alignItems: 'center' }}>

      {currentStatus === 'ACTIVE' && (
        <button
          disabled={pending}
          onClick={() => run(() => suspendDevice(deviceId))}
          style={{ ...base, color: 'var(--color-warning)', borderColor: 'var(--color-warning)', background: 'var(--color-warning-highlight)' }}
        >
          {pending ? '…' : '⏸ Suspender'}
        </button>
      )}

      {currentStatus === 'SUSPENDED' && (
        <button
          disabled={pending}
          onClick={() => run(() => reactivateDevice(deviceId))}
          style={{ ...base, color: 'var(--color-success)', borderColor: 'var(--color-success)', background: 'var(--color-success-highlight)' }}
        >
          {pending ? '…' : '▶ Reativar'}
        </button>
      )}

      {currentStatus === 'REVOKED' && (
        <button
          disabled={pending}
          onClick={() => run(() => reactivateDevice(deviceId))}
          style={{ ...base, color: 'var(--color-primary)', borderColor: 'var(--color-primary)', background: 'var(--color-primary-highlight)' }}
        >
          {pending ? '…' : '↩ Restaurar'}
        </button>
      )}

      {currentStatus !== 'REVOKED' && (
        <button
          disabled={pending}
          onClick={() => setConfirming(true)}
          style={{ ...base, color: 'var(--color-error)', borderColor: 'var(--color-error)', background: 'var(--color-error-highlight)' }}
        >
          ✕ Revogar
        </button>
      )}

      {error && !confirming && (
        <span style={{ fontSize: '0.7rem', color: 'var(--color-error)' }}>{error}</span>
      )}
    </div>
  )
}