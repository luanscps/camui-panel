'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/types/database'

type LicenseUpdate = Database['public']['Tables']['licenses']['Update']

export async function revokeLicenseAction(licenseId: string) {
  const supabase = await createClient()
  const payload: LicenseUpdate = { status: 'REVOKED' }
  await supabase
    .from('licenses')
    .update(payload as never)
    .eq('id', licenseId)
  revalidatePath('/dashboard/admin/licenses')
}
