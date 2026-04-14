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
    <div className="flex gap-1 flex-wrap">
      {currentPlan !== 'PRO' && (
        <button
          disabled={pending}
          onClick={() => handle({ plan: 'PRO', max_devices: 3 })}
          className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? '...' : 'UP PRO'}
        </button>
      )}
      {currentPlan === 'PRO' && (
        <button
          disabled={pending}
          onClick={() => handle({ plan: 'BASIC', max_devices: 1 })}
          className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? '...' : 'DOWN BASIC'}
        </button>
      )}
      {currentStatus === 'ACTIVE' ? (
        <button
          disabled={pending}
          onClick={() => handle({ status: 'SUSPENDED' })}
          className="text-xs px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? '...' : 'Suspender'}
        </button>
      ) : (
        <button
          disabled={pending}
          onClick={() => handle({ status: 'ACTIVE' })}
          className="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? '...' : 'Reativar'}
        </button>
      )}
    </div>
  )
}
