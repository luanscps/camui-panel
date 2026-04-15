'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateLicenseAction(
  licenseId: string,
  action: 'upgrade' | 'suspend' | 'activate'
) {
  // Bug 3 fix: verifica se o caller é admin antes de qualquer update
  const supabase = (await createClient()) as any // eslint-disable-line @typescript-eslint/no-explicit-any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single() as unknown as { data: { is_admin: boolean } | null }

  if (!profile?.is_admin) throw new Error('Acesso negado: apenas administradores podem alterar licenças')

  let update: Record<string, string>
  if (action === 'upgrade') {
    update = { plan: 'PRO' }
  } else if (action === 'suspend') {
    update = { status: 'SUSPENDED' }
  } else {
    update = { status: 'ACTIVE' }
  }

  // Bug 5 fix: verifica erro antes de revalidar
  const { error } = await supabase
    .from('licenses')
    .update(update)
    .eq('id', licenseId)

  if (error) throw new Error(`Falha ao atualizar licença: ${error.message}`)

  revalidatePath('/dashboard/admin/users')
}
