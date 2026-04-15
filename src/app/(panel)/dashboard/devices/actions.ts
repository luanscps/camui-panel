'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function revokeDeviceAction(activationId: string) {
  const supabase = (await createClient()) as any // eslint-disable-line @typescript-eslint/no-explicit-any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  // Verifica que a ativação pertence ao usuário via licença
  const { data: activation } = await supabase
    .from('device_activations')
    .select('id, license_id, licenses!inner(user_id)')
    .eq('id', activationId)
    .single()

  if (!activation || (activation.licenses as any).user_id !== user.id)
    throw new Error('Permissão negada')

  const { error } = await supabase
    .from('device_activations')
    .delete()
    .eq('id', activationId)

  if (error) throw new Error(`Falha ao revogar: ${error.message}`)

  revalidatePath('/dashboard/devices')
}
