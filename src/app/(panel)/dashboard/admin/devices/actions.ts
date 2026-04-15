'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function guardAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!profile?.is_admin) throw new Error('Sem permissão')
  return supabase as any
}

export async function suspendDevice(deviceId: string) {
  const supabase = await guardAdmin()
  const { error } = await supabase
    .from('device_activations')
    .update({ status: 'SUSPENDED' })
    .eq('id', deviceId)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/devices')
}

export async function reactivateDevice(deviceId: string) {
  const supabase = await guardAdmin()
  const { error } = await supabase
    .from('device_activations')
    .update({ status: 'ACTIVE' })
    .eq('id', deviceId)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/devices')
}

export async function revokeDevice(deviceId: string) {
  const supabase = await guardAdmin()
  const { error } = await supabase
    .from('device_activations')
    .update({ status: 'REVOKED' })
    .eq('id', deviceId)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/devices')
}
