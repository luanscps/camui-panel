'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('N\u00e3o autenticado')
  const { data } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!data || !(data as { is_admin: boolean }).is_admin)
    throw new Error('Acesso negado')
  return user
}

export async function createLicenseAction(data: {
  userId: string
  plan: 'BASIC' | 'PRO'
  status: 'ACTIVE' | 'SUSPENDED'
  maxDevices: number
  expiresAt: string | null
}) {
  await checkAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from('licenses').insert({
    user_id:        data.userId,
    plan:           data.plan,
    status:         data.status,
    max_devices:    data.maxDevices,
    expires_at:     data.expiresAt || null,
    account_number: crypto.randomUUID(),
  })
  if (error) throw new Error(`Erro ao criar licen\u00e7a: ${error.message}`)
  revalidatePath('/dashboard/admin/users')
  revalidatePath('/dashboard/admin/licenses')
  revalidatePath('/dashboard/admin')
}

export async function updateLicenseAction(data: {
  licenseId: string
  plan: string
  status: string
  maxDevices: number
  expiresAt: string | null
}) {
  await checkAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from('licenses')
    .update({
      plan:        data.plan,
      status:      data.status,
      max_devices: data.maxDevices,
      expires_at:  data.expiresAt || null,
    })
    .eq('id', data.licenseId)
  if (error) throw new Error(`Erro ao atualizar licen\u00e7a: ${error.message}`)
  revalidatePath('/dashboard/admin/users')
  revalidatePath('/dashboard/admin/licenses')
  revalidatePath('/dashboard/admin')
}

export async function deleteLicenseAction(licenseId: string) {
  await checkAdmin()
  const supabase = await createClient()
  await supabase.from('device_activations').delete().eq('license_id', licenseId)
  const { error } = await supabase.from('licenses').delete().eq('id', licenseId)
  if (error) throw new Error(`Erro ao deletar licen\u00e7a: ${error.message}`)
  revalidatePath('/dashboard/admin/users')
  revalidatePath('/dashboard/admin/licenses')
  revalidatePath('/dashboard/admin')
}
