'use client'
import { useTransition } from 'react'
import { revokeDeviceAction } from './actions'

export default function RevokeButton({ deviceId }: { deviceId: string }) {
  const [pending, startTransition] = useTransition()

  function handleRevoke() {
    if (!confirm('Revogar este dispositivo? O app perderá acesso imediatamente.')) return
    startTransition(() => revokeDeviceAction(deviceId))
  }

  return (
    <button
      onClick={handleRevoke}
      disabled={pending}
      className="btn btn-sm"
      style={{
        background: 'var(--color-error-bg)',
        color: 'var(--color-error)',
        border: '1px solid var(--color-error)',
        opacity: pending ? 0.5 : 1,
        cursor: pending ? 'not-allowed' : 'pointer',
      }}
    >
      {pending ? '…' : 'Revogar'}
    </button>
  )
}
