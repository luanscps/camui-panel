'use client'

import { useState } from 'react'
import { revokeDeviceAction, suspendDeviceAction, reactivateDeviceAction } from './actions'

type Props = {
  activationId: string
  status: string // 'ACTIVE' | 'SUSPENDED'
}

export default function DeviceActions({ activationId, status }: Props) {
  const [confirmRevoke, setConfirmRevoke] = useState(false)
  const [loading, setLoading]   = useState<string | null>(null)
  const [error, setError]       = useState<string | null>(null)

  async function run(action: () => Promise<void>, key: string) {
    setLoading(key)
    setError(null)
    try {
      await action()
    } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setError(e.message)
    } finally {
      setLoading(null)
      setConfirmRevoke(false)
    }
  }

  const isSuspended = status === 'SUSPENDED'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.375rem' }}>

      {/* Erro */}
      {error && (
        <span style={{ fontSize: '0.6875rem', color: 'var(--color-error)', maxWidth: 160, textAlign: 'right' }}>
          ⚠️ {error}
        </span>
      )}

      {/* Botão Suspender / Reativar */}
      {!confirmRevoke && (
        <button
          onClick={() => run(
            isSuspended
              ? () => reactivateDeviceAction(activationId)
              : () => suspendDeviceAction(activationId),
            isSuspended ? 'reactivate' : 'suspend'
          )}
          disabled={loading !== null}
          className="btn btn-xs"
          style={{
            opacity: loading !== null ? 0.6 : 1,
            cursor: loading !== null ? 'not-allowed' : 'pointer',
            background: isSuspended ? 'rgba(67,122,34,0.12)' : 'rgba(218,113,1,0.1)',
            color: isSuspended ? 'var(--color-success)' : 'var(--color-warning)',
            border: `1px solid ${isSuspended ? 'rgba(67,122,34,0.25)' : 'rgba(218,113,1,0.25)'}`,
          }}
        >
          {loading === 'suspend'     ? 'Suspendendo...' :
           loading === 'reactivate' ? 'Reativando...'  :
           isSuspended              ? '▶ Reativar'     : '⏸ Suspender'}
        </button>
      )}

      {/* Botão Revogar com confirmação */}
      {!confirmRevoke ? (
        <button
          onClick={() => setConfirmRevoke(true)}
          disabled={loading !== null}
          className="btn btn-danger btn-xs"
          style={{ opacity: loading !== null ? 0.6 : 1 }}
        >
          Revogar
        </button>
      ) : (
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          <button
            onClick={() => run(() => revokeDeviceAction(activationId), 'revoke')}
            disabled={loading !== null}
            className="btn btn-danger btn-xs"
            style={{ opacity: loading !== null ? 0.6 : 1 }}
          >
            {loading === 'revoke' ? 'Removendo...' : 'Confirmar'}
          </button>
          <button
            onClick={() => setConfirmRevoke(false)}
            disabled={loading !== null}
            className="btn btn-ghost btn-xs"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}
