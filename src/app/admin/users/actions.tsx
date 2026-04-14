'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { type Database } from '@/types/supabase'

type LicensePatch = Database['public']['Tables']['licenses']['Update']

export async function updateLicenseAction(
  licenseId: string,
  patch: LicensePatch
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('licenses')
    .update(patch)
    .eq('id', licenseId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/users')
}