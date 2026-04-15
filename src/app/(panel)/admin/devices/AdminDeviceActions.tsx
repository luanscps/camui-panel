'use client'

import { useState } from 'react'
import {
  adminSuspendDeviceAction,
  adminReactivateDeviceAction,
  adminRevokeDeviceAction,
} from './actions'

type Props = { activationId: string; status: string }

export default function AdminDeviceActions({ activationId, status }: Props) {
  const [confirmRevoke, setConfirmRevoke] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError]     = useState<string | null>(null)

  async function run(fn: () => Promise<void>, key: string) {
    setLoading(key); setError(null)
    try { await fn() }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (e: any) { setError(e.message) }
    finally { setLoading(null); setConfirmRevoke(false) }
  }

  const isSuspended = status === 'SUSPENDED'
  const busy = loading !== null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
      {error && (
        <span style={{ fontSize: '0.6875rem', color: 'var(--color-error)', maxWidth: 160, textAlign: 'right' }}>
          ⚠️ {error}
        </span>
      )}

      {/* Suspender / Reativar */}
      {!confirmRevoke && (
        <button
          disabled={busy}
          onClick={() => run(
            isSuspended
              ? () => adminReactivateDeviceAction(activationId)
              : () => adminSuspendDeviceAction(activationId),
            isSuspended ? 'reactivate' : 'suspend'
          )}
          className="btn btn-xs"
          style={{
            opacity: busy ? 0.6 : 1,
            background: isSuspended ? 'rgba(67,122,34,0.1)' : 'rgba(218,113,1,0.1)',
            color: isSuspended ? 'var(--color-success)' : 'var(--color-warning)',
            border: `1px solid ${isSuspended ? 'rgba(67,122,34,0.25)' : 'rgba(218,113,1,0.25)'}`,
          }}
        >
          {loading === 'suspend'     && 'Suspendendo...'}
          {loading === 'reactivate' && 'Reativando...'}
          {!loading && (isSuspended  ? '▶ Reativar' : '⏸ Suspender')}
        </button>
      )}

      {/* Revogar com confirmação */}
      {!confirmRevoke ? (
        <button
          disabled={busy}
          onClick={() => setConfirmRevoke(true)}
          className="btn btn-danger btn-xs"
          style={{ opacity: busy ? 0.6 : 1 }}
        >
          Revogar
        </button>
      ) : (
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          <button
            disabled={busy}
            onClick={() => run(() => adminRevokeDeviceAction(activationId), 'revoke')}
            className="btn btn-danger btn-xs"
            style={{ opacity: busy ? 0.6 : 1 }}
          >
            {loading === 'revoke' ? 'Removendo...' : 'Confirmar'}
          </button>
          <button
            disabled={busy}
            onClick={() => setConfirmRevoke(false)}
            className="btn btn-ghost btn-xs"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}
