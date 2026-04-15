'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/** Garante que o chamador é admin */
async function requireAdmin() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createClient()) as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!profile?.is_admin) throw new Error('Permissão negada')
  return supabase
}

/** Suspende a sub-licença de um dispositivo */
export async function adminSuspendDeviceAction(activationId: string) {
  const supabase = await requireAdmin()
  const { error } = await supabase
    .from('device_activations')
    .update({ status: 'SUSPENDED' })
    .eq('id', activationId)
  if (error) throw new Error(`Falha: ${error.message}`)
  revalidatePath('/admin/devices')
}

/** Reativa a sub-licença de um dispositivo */
export async function adminReactivateDeviceAction(activationId: string) {
  const supabase = await requireAdmin()
  const { error } = await supabase
    .from('device_activations')
    .update({ status: 'ACTIVE' })
    .eq('id', activationId)
  if (error) throw new Error(`Falha: ${error.message}`)
  revalidatePath('/admin/devices')
}

/** Revoga (remove) um dispositivo permanentemente */
export async function adminRevokeDeviceAction(activationId: string) {
  const supabase = await requireAdmin()
  const { error } = await supabase
    .from('device_activations')
    .delete()
    .eq('id', activationId)
  if (error) throw new Error(`Falha: ${error.message}`)
  revalidatePath('/admin/devices')
}
