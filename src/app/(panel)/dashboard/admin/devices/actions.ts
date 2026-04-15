'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function suspendDevice(deviceId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) throw new Error('Acesso negado')

  const { error } = await supabase
    .from('devices')
    .update({ status: 'suspended' })
    .eq('id', deviceId)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/admin/devices')
}

export async function reactivateDevice(deviceId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) throw new Error('Acesso negado')

  const { error } = await supabase
    .from('devices')
    .update({ status: 'active' })
    .eq('id', deviceId)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/admin/devices')
}

export async function revokeDevice(deviceId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) throw new Error('Acesso negado')

  const { error } = await supabase
    .from('devices')
    .update({ status: 'revoked' })
    .eq('id', deviceId)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/admin/devices')
}
