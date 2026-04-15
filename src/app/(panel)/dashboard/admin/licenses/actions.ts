'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function revokeLicenseAction(licenseId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createClient()) as any
  await supabase.from('licenses').update({ status: 'REVOKED' }).eq('id', licenseId)
  revalidatePath('/dashboard/admin/licenses')
}
