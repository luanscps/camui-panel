'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateLicenseAction(
  licenseId: string,
  patch: {
    plan?: string
    status?: string
    max_devices?: number
    expires_at?: string | null
  }
) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('licenses')
    .update(patch)
    .eq('id', licenseId)
  if (error) throw new Error((error as { message: string }).message)
  revalidatePath('/admin/users')
}
