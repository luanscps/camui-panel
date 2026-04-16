'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function revokeLicenseAction(licenseId: string) {
  const supabase = await createClient()
  await supabase
    .from('licenses')
    .update({ status: 'REVOKED' })
    .eq('id', licenseId)
  revalidatePath('/dashboard/admin/licenses')
}