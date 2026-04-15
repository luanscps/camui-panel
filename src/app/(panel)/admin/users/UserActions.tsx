'use client'

import { useTransition } from 'react'
import { updateLicenseAction } from './actions'

type Props = {
  licenseId: string
  currentPlan: string
  currentStatus: string
}

export default function AdminUserActions({ licenseId, currentPlan, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition()

  function handle(action: 'upgrade' | 'suspend' | 'activate') {
    const msgs: Record<string, string> = {
      upgrade:  'Confirma upgrade para PRO?',
      suspend:  'Confirma suspensão desta licença?',
      activate: 'Confirma reativação desta licença?',
    }
    if (!confirm(msgs[action])) return
    startTransition(() => updateLicenseAction(licenseId, action))
  }

  return (
    <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
      {currentPlan !== 'PRO' && (
        <button
          onClick={() => handle('upgrade')}
          disabled={isPending}
          className="btn btn-xs"
          style={{ background: 'var(--color-primary-highlight)', color: 'var(--color-primary)', border: '1px solid var(--color-primary)' }}
        >
          → PRO
        </button>
      )}
      {currentStatus === 'ACTIVE' ? (
        <button
          onClick={() => handle('suspend')}
          disabled={isPending}
          className="btn btn-xs"
          style={{ background: 'var(--color-warning-highlight)', color: 'var(--color-warning)', border: '1px solid var(--color-warning)' }}
        >
          Suspender
        </button>
      ) : (
        <button
          onClick={() => handle('activate')}
          disabled={isPending}
          className="btn btn-xs"
          style={{ background: 'var(--color-success-highlight)', color: 'var(--color-success)', border: '1px solid var(--color-success)' }}
        >
          Reativar
        </button>
      )}
    </div>
  )
}
