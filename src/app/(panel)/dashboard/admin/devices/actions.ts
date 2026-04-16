'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

function assertValidUUID(id: string) {
  if (!id || !UUID_REGEX.test(id)) throw new Error('ID de dispositivo inválido')
}

async function guardAdmin(): Promise<SupabaseServerClient> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile || !(profile as { is_admin: boolean }).is_admin)
    throw new Error('Sem permissão de administrador')

  return supabase
}

export async function suspendDevice(deviceId: string) {
  assertValidUUID(deviceId)
  const supabase = await guardAdmin()
  const { error } = await supabase
    .from('device_activations')
    .update({ status: 'SUSPENDED' })
    .eq('id', deviceId)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/devices')
}

export async function reactivateDevice(deviceId: string) {
  assertValidUUID(deviceId)
  const supabase = await guardAdmin()
  const { error } = await supabase
    .from('device_activations')
    .update({ status: 'ACTIVE' })
    .eq('id', deviceId)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/devices')
}

export async function revokeDevice(deviceId: string) {
  assertValidUUID(deviceId)
  const supabase = await guardAdmin()
  const { error } = await supabase
    .from('device_activations')
    .update({ status: 'REVOKED' })
    .eq('id', deviceId)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/devices')
}
