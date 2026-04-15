'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

async function assertAdmin(): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')
  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (!isAdmin) throw new Error('Acesso negado')
}

export async function updateLicenseAction(
  licenseId: string,
  action: 'upgrade' | 'suspend' | 'activate'
) {
  await assertAdmin()
  const supabase = await createClient()

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

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: licenses } = await adminClient
    .from('licenses').select('id').eq('user_id', userId)

  if (licenses && licenses.length > 0) {
    const licenseIds = licenses.map((l: { id: string }) => l.id)
    const { error: devErr } = await adminClient
      .from('device_activations').delete().in('license_id', licenseIds)
    if (devErr) throw new Error(`Erro ao deletar devices: ${devErr.message}`)
  }

  const { error: licErr } = await adminClient
    .from('licenses').delete().eq('user_id', userId)
  if (licErr) throw new Error(`Erro ao deletar licenças: ${licErr.message}`)

  const { error: profErr } = await adminClient
    .from('profiles').delete().eq('id', userId)
  if (profErr) throw new Error(`Erro ao deletar perfil: ${profErr.message}`)

  const { error: authErr } = await adminClient.auth.admin.deleteUser(userId)
  if (authErr) throw new Error(`Erro ao deletar usuário: ${authErr.message}`)

  revalidatePath('/dashboard/admin/users')
}
