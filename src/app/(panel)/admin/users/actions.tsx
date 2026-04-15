'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { TablesUpdate } from '@/types/database'

export async function updateLicenseAction(
  licenseId: string,
  action: 'upgrade' | 'suspend' | 'activate'
) {
  const supabase = await createClient()

  let update: TablesUpdate<'licenses'>
  if (action === 'upgrade') {
    update = { plan: 'PRO' }
  } else if (action === 'suspend') {
    update = { status: 'SUSPENDED' }
  } else {
    update = { status: 'ACTIVE' }
  }

  await supabase.from('licenses').update(update).eq('id', licenseId)
  revalidatePath('/admin/users')
}
