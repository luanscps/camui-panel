'use client'
import { useTransition } from 'react'
import { updateLicenseAction } from './actions'

interface Props {
  licenseId: string
  currentPlan: string
  currentStatus: string
}

export default function AdminUserActions({ licenseId, currentPlan, currentStatus }: Props) {
  const [pending, startTransition] = useTransition()

  function handle(patch: { plan?: string; status?: string; max_devices?: number }) {
    startTransition(async () => {
      await updateLicenseAction(licenseId, patch)
    })
  }

  return (
    <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', alignItems: 'center' }}>
      {currentPlan !== 'PRO' ? (
        <button
          disabled={pending}
          onClick={() => handle({ plan: 'PRO', max_devices: 3 })}
          className="btn btn-sm"
          style={{
            background: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            border: '1px solid var(--color-success)',
            opacity: pending ? 0.5 : 1,
            cursor: pending ? 'not-allowed' : 'pointer',
          }}
        >
          {pending ? '…' : '↑ PRO'}
        </button>
      ) : (
        <button
          disabled={pending}
          onClick={() => handle({ plan: 'BASIC', max_devices: 1 })}
          className="btn btn-sm"
          style={{
            background: 'rgba(1,105,111,0.08)',
            color: 'var(--color-brand)',
            border: '1px solid var(--color-brand)',
            opacity: pending ? 0.5 : 1,
            cursor: pending ? 'not-allowed' : 'pointer',
          }}
        >
          {pending ? '…' : '↓ BASIC'}
        </button>
      )}

      {currentStatus === 'ACTIVE' ? (
        <button
          disabled={pending}
          onClick={() => handle({ status: 'SUSPENDED' })}
          className="btn btn-sm"
          style={{
            background: 'var(--color-warning-bg)',
            color: 'var(--color-warning)',
            border: '1px solid var(--color-warning)',
            opacity: pending ? 0.5 : 1,
            cursor: pending ? 'not-allowed' : 'pointer',
          }}
        >
          {pending ? '…' : 'Suspender'}
        </button>
      ) : (
        <button
          disabled={pending}
          onClick={() => handle({ status: 'ACTIVE' })}
          className="btn btn-sm"
          style={{
            background: 'var(--color-surface-offset)',
            color: 'var(--color-text-muted)',
            border: '1px solid var(--color-border)',
            opacity: pending ? 0.5 : 1,
            cursor: pending ? 'not-allowed' : 'pointer',
          }}
        >
          {pending ? '…' : 'Reativar'}
        </button>
      )}
    </div>
  )
}
