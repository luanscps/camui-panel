'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// Tipo espelho das colunas editáveis da tabela licenses
type LicensePatch = {
  plan?: string
  status?: string
  max_devices?: number
}

interface Props {
  licenseId: string
  currentPlan: string
  currentStatus: string
}

export default function AdminUserActions({ licenseId, currentPlan, currentStatus }: Props) {
  const supabase = createClient()
  const router = useRouter()

  async function updateLicense(patch: LicensePatch) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('licenses') as any).update(patch).eq('id', licenseId)
    router.refresh()
  }

  return (
    <div className="flex gap-1 flex-wrap">
      {currentPlan !== 'PRO' && (
        <button
          onClick={() => updateLicense({ plan: 'PRO', max_devices: 3 })}
          className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
        >
          UP PRO
        </button>
      )}
      {currentPlan === 'PRO' && (
        <button
          onClick={() => updateLicense({ plan: 'BASIC', max_devices: 1 })}
          className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          DOWN BASIC
        </button>
      )}
      {currentStatus === 'ACTIVE' ? (
        <button
          onClick={() => updateLicense({ status: 'SUSPENDED' })}
          className="text-xs px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Suspender
        </button>
      ) : (
        <button
          onClick={() => updateLicense({ status: 'ACTIVE' })}
          className="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Reativar
        </button>
      )}
    </div>
  )
}