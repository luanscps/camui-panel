'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/types/database'

type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export async function updateNameAction(fullName: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const payload: ProfileUpdate = { full_name: fullName }
  const { error } = await supabase
    .from('profiles')
    .update(payload as never)
    .eq('id', user.id)

  if (error) throw new Error(`Falha ao atualizar nome: ${error.message}`)
  revalidatePath('/dashboard/profile')
}
