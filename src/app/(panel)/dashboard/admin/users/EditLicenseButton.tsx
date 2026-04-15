'use client'

import { useState } from 'react'
import { updateLicenseAction } from '../actions'

type Props = {
  licenseId: string
  currentPlan: string
  currentStatus: string
  currentMaxDevices: number
  currentExpiresAt: string | null
}

export default function EditLicenseButton({ licenseId, currentPlan, currentStatus, currentMaxDevices, currentExpiresAt }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [plan, setPlan] = useState(currentPlan)
  const [status, setStatus] = useState(currentStatus)
  const [maxDevices, setMaxDevices] = useState(currentMaxDevices)
  const [expiresAt, setExpiresAt] = useState(currentExpiresAt ? currentExpiresAt.slice(0, 10) : '')

  async function handleSave() {
    setLoading(true); setError(null)
    try {
      await updateLicenseAction({ licenseId, plan, status, maxDevices, expiresAt: expiresAt || null })
      setOpen(false)
    } catch (e: any) { setError(e.message) } // eslint-disable-line
    finally { setLoading(false) }
  }

  const inputStyle = {
    width: '100%', padding: '0.4rem 0.6rem',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--color-surface)',
    color: 'var(--color-text)', fontSize: '0.8125rem',
  }

  if (!open) return (
    <button onClick={() => setOpen(true)} className="btn btn-secondary btn-xs">Editar</button>
  )

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 420, padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Editar Licença</div>
          <button onClick={() => setOpen(false)} className="btn btn-ghost btn-sm">✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.3rem' }}>Plano</label>
            <select value={plan} onChange={e => setPlan(e.target.value)} style={inputStyle}>
              <option value="BASIC">BASIC</option>
              <option value="PRO">PRO</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.3rem' }}>Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} style={inputStyle}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="EXPIRED">EXPIRED</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.3rem' }}>Máx. Dispositivos</label>
            <input type="number" min={1} max={10} value={maxDevices} onChange={e => setMaxDevices(Number(e.target.value))} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.3rem' }}>Expiração</label>
            <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} style={inputStyle} />
          </div>

          {error && <p style={{ fontSize: '0.8rem', color: 'var(--color-error)' }}>⚠️ {error}</p>}

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', paddingTop: '0.25rem' }}>
            <button onClick={() => setOpen(false)} disabled={loading} className="btn btn-ghost btn-sm">Cancelar</button>
            <button onClick={handleSave} disabled={loading} className="btn btn-primary btn-sm">
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
