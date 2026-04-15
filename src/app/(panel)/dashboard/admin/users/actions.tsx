'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateLicenseAction(
  licenseId: string,
  action: 'upgrade' | 'suspend' | 'activate'
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createClient()) as any

  let update: Record<string, string>
  if (action === 'upgrade') {
    update = { plan: 'PRO' }
  } else if (action === 'suspend') {
    update = { status: 'SUSPENDED' }
  } else {
    update = { status: 'ACTIVE' }
  }

  await supabase.from('licenses').update(update).eq('id', licenseId)
  revalidatePath('/dashboard/admin/users')
}
