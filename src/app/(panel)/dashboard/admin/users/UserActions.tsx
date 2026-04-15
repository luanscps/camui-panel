'use client'

import { useState } from 'react'
import { updateLicenseAction } from './actions'

export default function UserActions({
  licenseId,
  currentPlan,
  currentStatus,
}: {
  licenseId: string
  currentPlan: string
  currentStatus: string
}) {
  const [loading, setLoading] = useState(false)

  async function handle(action: 'upgrade' | 'suspend' | 'activate') {
    setLoading(true)
    await updateLicenseAction(licenseId, action)
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      {currentPlan !== 'PRO' && (
        <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem' }}
          onClick={() => handle('upgrade')} disabled={loading}>
          → PRO
        </button>
      )}
      {currentStatus === 'ACTIVE' ? (
        <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem', color: 'var(--color-warning)' }}
          onClick={() => handle('suspend')} disabled={loading}>
          Suspender
        </button>
      ) : (
        <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem', color: 'var(--color-success)' }}
          onClick={() => handle('activate')} disabled={loading}>
          Ativar
        </button>
      )}
    </div>
  )
}
