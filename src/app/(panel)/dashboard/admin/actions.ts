'use server'

import { createClient } from '@/lib/supabase/server'
import { type TablesInsert, type TablesUpdate } from '@/types/database'
import { revalidatePath } from 'next/cache'

async function assertAdmin(): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')
  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (!isAdmin) throw new Error('Acesso negado')
}

export async function createLicenseAction(data: {
  userId: string
  plan: 'BASIC' | 'PRO'
  status: 'ACTIVE' | 'SUSPENDED'
  maxDevices: number
  expiresAt: string | null
}) {
  await assertAdmin()
  const supabase = await createClient()
  const values: TablesInsert<'licenses'> = {
    user_id: data.userId,
    plan: data.plan,
    status: data.status,
    max_devices: data.maxDevices,
    expires_at: data.expiresAt || null,
  }
  const { error } = await supabase.from('licenses').insert(values)
  if (error) throw new Error(`Erro ao criar licença: ${error.message}`)
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
  await assertAdmin()
  const supabase = await createClient()
  const values: TablesUpdate<'licenses'> = {
    plan: data.plan,
    status: data.status,
    max_devices: data.maxDevices,
    expires_at: data.expiresAt || null,
  }
  const { error } = await supabase.from('licenses').update(values).eq('id', data.licenseId)
  if (error) throw new Error(`Erro ao atualizar licença: ${error.message}`)
  revalidatePath('/dashboard/admin/users')
  revalidatePath('/dashboard/admin/licenses')
  revalidatePath('/dashboard/admin')
}

export async function deleteLicenseAction(licenseId: string) {
  await assertAdmin()
  const supabase = await createClient()
  await supabase.from('device_activations').delete().eq('license_id', licenseId)
  const { error } = await supabase.from('licenses').delete().eq('id', licenseId)
  if (error) throw new Error(`Erro ao deletar licença: ${error.message}`)
  revalidatePath('/dashboard/admin/users')
  revalidatePath('/dashboard/admin/licenses')
  revalidatePath('/dashboard/admin')
}
