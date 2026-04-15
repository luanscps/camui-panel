'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

async function assertAdmin() {
  const supabase = (await createClient()) as any // eslint-disable-line @typescript-eslint/no-explicit-any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single() as unknown as { data: { is_admin: boolean } | null }
  if (!profile?.is_admin) throw new Error('Acesso negado')
  return supabase
}

export async function updateLicenseAction(
  licenseId: string,
  action: 'upgrade' | 'suspend' | 'activate'
) {
  const supabase = await assertAdmin()

  let update: Record<string, string>
  if (action === 'upgrade')       update = { plan: 'PRO' }
  else if (action === 'suspend')  update = { status: 'SUSPENDED' }
  else                            update = { status: 'ACTIVE' }

  const { error } = await supabase.from('licenses').update(update).eq('id', licenseId)
  if (error) throw new Error(`Falha ao atualizar licença: ${error.message}`)

  revalidatePath('/dashboard/admin/users')
}

export async function deleteUserAction(userId: string) {
  await assertAdmin()

  // Service Role client para deletar do auth.users (requer SUPABASE_SERVICE_ROLE_KEY)
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Deleta device_activations via licenças do usuário
  const { data: licenses } = await adminClient
    .from('licenses')
    .select('id')
    .eq('user_id', userId)

  if (licenses && licenses.length > 0) {
    const licenseIds = licenses.map((l: { id: string }) => l.id)
    const { error: devErr } = await adminClient
      .from('device_activations')
      .delete()
      .in('license_id', licenseIds)
    if (devErr) throw new Error(`Erro ao deletar devices: ${devErr.message}`)
  }

  // 2. Deleta licenças
  const { error: licErr } = await adminClient
    .from('licenses')
    .delete()
    .eq('user_id', userId)
  if (licErr) throw new Error(`Erro ao deletar licenças: ${licErr.message}`)

  // 3. Deleta profile
  const { error: profErr } = await adminClient
    .from('profiles')
    .delete()
    .eq('id', userId)
  if (profErr) throw new Error(`Erro ao deletar perfil: ${profErr.message}`)

  // 4. Deleta do auth.users (requer service role)
  const { error: authErr } = await adminClient.auth.admin.deleteUser(userId)
  if (authErr) throw new Error(`Erro ao deletar usuário: ${authErr.message}`)

  revalidatePath('/dashboard/admin/users')
}
