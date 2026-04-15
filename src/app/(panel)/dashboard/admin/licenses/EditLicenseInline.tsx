'use client'

import { useState } from 'react'
import { updateLicenseAction, deleteLicenseAction } from '../actions'

type Props = {
  licenseId: string
  userId: string
  userName: string
  currentPlan: string
  currentStatus: string
  currentMaxDevices: number
  currentExpiresAt: string | null
}

export default function EditLicenseInline(props: Props) {
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [plan, setPlan] = useState(props.currentPlan)
  const [status, setStatus] = useState(props.currentStatus)
  const [maxDevices, setMaxDevices] = useState(props.currentMaxDevices)
  const [expiresAt, setExpiresAt] = useState(props.currentExpiresAt ? props.currentExpiresAt.slice(0, 10) : '')

  const inputStyle = {
    width: '100%', padding: '0.4rem 0.6rem',
    border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
    background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: '0.8125rem',
  }

  async function handleSave() {
    setLoading(true); setError(null)
    try {
      await updateLicenseAction({ licenseId: props.licenseId, plan, status, maxDevices, expiresAt: expiresAt || null })
      setOpen(false)
    } catch (e: any) { setError(e.message) } // eslint-disable-line
    finally { setLoading(false) }
  }

  async function handleDelete() {
    setDeleting(true); setError(null)
    try { await deleteLicenseAction(props.licenseId) }
    catch (e: any) { setError(e.message); setDeleting(false) } // eslint-disable-line
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn btn-secondary btn-xs">Editar</button>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 440, padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Editar Licença</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>{props.userName}</div>
              </div>
              <button onClick={() => setOpen(false)} className="btn btn-ghost btn-sm">✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.3rem' }}>Plano</label>
                  <select value={plan} onChange={e => setPlan(e.target.value)} style={inputStyle}>
                    <option value="BASIC">BASIC</option>
                    <option value="PRO">PRO</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.3rem' }}>Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} style={inputStyle}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="EXPIRED">EXPIRED</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.3rem' }}>Máx. Devices</label>
                  <input type="number" min={1} max={10} value={maxDevices} onChange={e => setMaxDevices(Number(e.target.value))} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.3rem' }}>Expiração</label>
                  <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} style={inputStyle} />
                </div>
              </div>

              {error && <p style={{ fontSize: '0.8rem', color: 'var(--color-error)' }}>⚠️ {error}</p>}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.25rem', borderTop: '1px solid var(--color-border)', marginTop: '0.25rem' }}>
                <button
                  onClick={handleDelete} disabled={deleting || loading}
                  className="btn btn-danger btn-sm"
                  style={{ opacity: deleting ? 0.6 : 1 }}
                >{deleting ? 'Deletando...' : '🗑 Deletar licença'}</button>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => setOpen(false)} disabled={loading} className="btn btn-ghost btn-sm">Cancelar</button>
                  <button onClick={handleSave} disabled={loading} className="btn btn-primary btn-sm">
                    {loading ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
