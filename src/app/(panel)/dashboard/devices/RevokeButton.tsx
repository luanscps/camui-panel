'use client'

import { useState } from 'react'
import { revokeDeviceAction } from './actions'

export default function RevokeButton({ activationId }: { activationId: string }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRevoke() {
    setLoading(true)
    setError(null)
    try {
      await revokeDeviceAction(activationId)
    } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setError(e.message)
      setLoading(false)
      setConfirming(false)
    }
  }

  if (error) return (
    <span style={{ fontSize: '0.75rem', color: 'var(--color-error)' }} title={error}>⚠️ Erro</span>
  )

  if (confirming) return (
    <div style={{ display: 'flex', gap: '0.375rem' }}>
      <button
        onClick={handleRevoke}
        disabled={loading}
        className="btn btn-danger btn-xs"
        style={{ opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
      >
        {loading ? 'Revogando...' : 'Confirmar'}
      </button>
      <button
        onClick={() => setConfirming(false)}
        disabled={loading}
        className="btn btn-ghost btn-xs"
      >
        Cancelar
      </button>
    </div>
  )

  return (
    <button
      onClick={() => setConfirming(true)}
      className="btn btn-danger btn-xs"
    >
      Revogar
    </button>
  )
}
