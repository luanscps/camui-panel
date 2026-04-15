'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function revokeDeviceAction(deviceId: string) {
  const supabase = await createClient()
  await supabase.from('device_activations').delete().eq('id', deviceId)
  revalidatePath('/admin/licenses')
}
