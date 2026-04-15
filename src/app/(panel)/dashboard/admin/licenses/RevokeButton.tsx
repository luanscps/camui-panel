'use client'

import { useState } from 'react'
import { revokeLicenseAction } from './actions'

export default function RevokeButton({ licenseId }: { licenseId: string }) {
  const [loading, setLoading] = useState(false)
  async function handle() {
    if (!confirm('Revogar esta licença?')) return
    setLoading(true)
    await revokeLicenseAction(licenseId)
    setLoading(false)
  }
  return (
    <button
      className="btn btn-secondary"
      style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem', color: 'var(--color-error)' }}
      onClick={handle}
      disabled={loading}
    >
      Revogar
    </button>
  )
}
