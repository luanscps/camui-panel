'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateLicenseAction(
  licenseId: string,
  action: 'upgrade' | 'suspend' | 'activate'
) {
  const supabase = await createClient()
  const update =
    action === 'upgrade'  ? { plan: 'PRO' } :
    action === 'suspend'  ? { status: 'SUSPENDED' } :
                            { status: 'ACTIVE' }
  await supabase.from('licenses').update(update).eq('id', licenseId)
  revalidatePath('/admin/users')
}
