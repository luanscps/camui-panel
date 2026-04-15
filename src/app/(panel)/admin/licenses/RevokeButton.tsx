'use client'

import { useTransition } from 'react'
import { revokeDeviceAction } from './actions'

export default function RevokeButton({ deviceId }: { deviceId: string }) {
  const [isPending, startTransition] = useTransition()
  function handle() {
    if (!confirm('Confirma revogação deste device?')) return
    startTransition(() => revokeDeviceAction(deviceId))
  }
  return (
    <button
      onClick={handle}
      disabled={isPending}
      className="btn btn-xs"
      style={{ background: 'var(--color-error-highlight)', color: 'var(--color-error)', border: '1px solid var(--color-error)' }}
    >
      {isPending ? '...' : 'Revogar'}
    </button>
  )
}
