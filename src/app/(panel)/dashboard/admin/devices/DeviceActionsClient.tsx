'use client'

import { useState, useTransition } from 'react'
import { suspendDevice, reactivateDevice, revokeDevice } from './actions'

type Status = 'active' | 'suspended' | 'revoked'

type Props = {
  deviceId: string
  currentStatus: Status
}

export default function DeviceActionsClient({ deviceId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handle(action: () => Promise<void>) {
    setError(null)
    startTransition(async () => {
      try {
        await action()
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Erro desconhecido')
      }
    })
  }

  return (
    <span style={{ display: 'inline-flex', gap: '0.375rem', alignItems: 'center', flexWrap: 'wrap' }}>
      {error && (
        <span style={{ fontSize: '0.7rem', color: 'var(--color-error)', marginRight: '0.25rem' }}>
          {error}
        </span>
      )}

      {currentStatus === 'active' && (
        <button
          disabled={isPending}
          onClick={() => handle(() => suspendDevice(deviceId))}
          style={buttonStyle('warning')}
          title="Suspender dispositivo"
        >
          {isPending ? '...' : 'Suspender'}
        </button>
      )}

      {currentStatus === 'suspended' && (
        <button
          disabled={isPending}
          onClick={() => handle(() => reactivateDevice(deviceId))}
          style={buttonStyle('success')}
          title="Reativar dispositivo"
        >
          {isPending ? '...' : 'Reativar'}
        </button>
      )}

      {currentStatus !== 'revoked' && (
        <button
          disabled={isPending}
          onClick={() => handle(() => revokeDevice(deviceId))}
          style={buttonStyle('danger')}
          title="Revogar dispositivo permanentemente"
        >
          {isPending ? '...' : 'Revogar'}
        </button>
      )}

      {currentStatus === 'revoked' && (
        <button
          disabled={isPending}
          onClick={() => handle(() => reactivateDevice(deviceId))}
          style={buttonStyle('success')}
          title="Restaurar dispositivo revogado"
        >
          {isPending ? '...' : 'Restaurar'}
        </button>
      )}
    </span>
  )
}

function buttonStyle(variant: 'warning' | 'success' | 'danger') {
  const base: React.CSSProperties = {
    fontSize: '0.7rem',
    fontWeight: 600,
    padding: '0.2rem 0.55rem',
    borderRadius: '0.375rem',
    border: 'none',
    cursor: 'pointer',
    letterSpacing: '0.02em',
    transition: 'opacity 0.15s',
  }
  if (variant === 'warning')  return { ...base, background: 'rgba(218,113,1,0.12)', color: 'var(--color-warning)' }
  if (variant === 'success')  return { ...base, background: 'rgba(67,122,34,0.12)',  color: 'var(--color-success)' }
  return { ...base, background: 'rgba(161,44,123,0.12)', color: 'var(--color-error)' }
}
