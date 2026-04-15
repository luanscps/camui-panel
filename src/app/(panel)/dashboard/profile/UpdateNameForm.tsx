'use client'

import { useState } from 'react'
import { updateNameAction } from './actions'

export default function UpdateNameForm({ currentName }: { currentName: string | null }) {
  const [name, setName] = useState(currentName ?? '')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setSuccess(false)
    setError(null)
    try {
      await updateNameAction(name.trim())
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Seu nome completo"
          maxLength={80}
          disabled={loading}
          style={{
            flex: 1, minWidth: 180,
            padding: '0.5rem 0.75rem',
            fontSize: '0.9375rem',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={loading || !name.trim() || name.trim() === (currentName ?? '')}
          className="btn btn-primary"
          style={{ flexShrink: 0 }}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
      {success && <span style={{ fontSize: '0.8rem', color: 'var(--color-success)' }}>✓ Nome atualizado com sucesso!</span>}
      {error   && <span style={{ fontSize: '0.8rem', color: 'var(--color-error)' }}>⚠️ {error}</span>}
    </form>
  )
}
