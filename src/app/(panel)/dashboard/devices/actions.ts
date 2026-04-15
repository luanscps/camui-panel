'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/** Verifica ownership e retorna a activation */
async function getOwnedActivation(supabase: any, activationId: string, userId: string) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const { data } = await supabase
    .from('device_activations')
    .select('id, status, license_id, licenses!inner(user_id)')
    .eq('id', activationId)
    .single()
  if (!data || (data.licenses as any).user_id !== userId) // eslint-disable-line @typescript-eslint/no-explicit-any
    throw new Error('Permissão negada')
  return data
}

/** Remove permanentemente o dispositivo */
export async function revokeDeviceAction(activationId: string) {
  const supabase = (await createClient()) as any // eslint-disable-line @typescript-eslint/no-explicit-any
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

/** Suspende a sub-licença do dispositivo (bloqueia o acesso sem remover) */
export async function suspendDeviceAction(activationId: string) {
  const supabase = (await createClient()) as any // eslint-disable-line @typescript-eslint/no-explicit-any
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

/** Reativa uma sub-licença suspensa */
export async function reactivateDeviceAction(activationId: string) {
  const supabase = (await createClient()) as any // eslint-disable-line @typescript-eslint/no-explicit-any
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
