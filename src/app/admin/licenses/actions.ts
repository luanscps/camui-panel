'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function revokeDeviceAction(deviceId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('device_activations')
    .delete()
    .eq('id', deviceId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/licenses')
}
