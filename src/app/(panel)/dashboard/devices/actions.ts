'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

async function getOwnedActivation(
  supabase: SupabaseClient<Database>,
  activationId: string,
  userId: string
) {
  const { data } = await supabase
    .from('device_activations')
    .select('id, status, license_id, licenses!inner(user_id)')
    .eq('id', activationId)
    .single()

  const licenseUserId = (data?.licenses as { user_id: string } | null)?.user_id
  if (!data || licenseUserId !== userId) throw new Error('Permissão negada')
  return data
}

export async function revokeDeviceAction(activationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  await getOwnedActivation(supabase, activationId, user.id)

  const { error } = await supabase
    .from('device_activations')
    .delete()
    .eq('id', activationId)

  if (error) throw new Error(`Falha ao revogar: ${error.message}`)
  revalidatePath('/dashboard/devices')
}

export async function suspendDeviceAction(activationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const activation = await getOwnedActivation(supabase, activationId, user.id)
  if (activation.status === 'SUSPENDED') throw new Error('Já está suspenso')

  const { error } = await supabase
    .from('device_activations')
    .update({ status: 'SUSPENDED' })
    .eq('id', activationId)

  if (error) throw new Error(`Falha ao suspender: ${error.message}`)
  revalidatePath('/dashboard/devices')
}

export async function reactivateDeviceAction(activationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const activation = await getOwnedActivation(supabase, activationId, user.id)
  if (activation.status === 'ACTIVE') throw new Error('Já está ativo')

  const { error } = await supabase
    .from('device_activations')
    .update({ status: 'ACTIVE' })
    .eq('id', activationId)

  if (error) throw new Error(`Falha ao reativar: ${error.message}`)
  revalidatePath('/dashboard/devices')
}