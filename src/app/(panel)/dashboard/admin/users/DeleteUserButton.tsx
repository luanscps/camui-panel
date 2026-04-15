'use client'

import { useState } from 'react'
import { deleteUserAction } from './actions'

export default function DeleteUserButton({ userId, userEmail }: { userId: string; userEmail: string }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setLoading(true)
    setError(null)
    try {
      await deleteUserAction(userId)
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', maxWidth: 160 }}>
        Deletar <strong>{userEmail}</strong>?
      </span>
      <div style={{ display: 'flex', gap: '0.375rem' }}>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="btn"
          style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'var(--color-error)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Deletando...' : 'Confirmar'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="btn btn-secondary"
          style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
        >
          Cancelar
        </button>
      </div>
    </div>
  )

  return (
    <button
      onClick={() => setConfirming(true)}
      className="btn btn-secondary"
      style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem', color: 'var(--color-error)' }}
    >
      Excluir
    </button>
  )
}
