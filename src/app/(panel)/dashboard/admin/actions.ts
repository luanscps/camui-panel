'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

async function assertAdmin(): Promise<SupabaseClient<Database>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  // ← correção: verifica null explicitamente antes de acessar .is_admin
  if (!profile || !profile.is_admin) throw new Error('Acesso negado')

  return supabase
}

export async function createLicenseAction(data: {
  userId: string
  plan: 'BASIC' | 'PRO'
  status: 'ACTIVE' | 'SUSPENDED'
  maxDevices: number
  expiresAt: string | null
}) {
  const supabase = await assertAdmin()
  const { error } = await supabase.from('licenses').insert({
    user_id:        data.userId,
    plan:           data.plan,
    status:         data.status,
    max_devices:    data.maxDevices,
    expires_at:     data.expiresAt || null,
    account_number: crypto.randomUUID(),
  })
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
  const supabase = await assertAdmin()
  const { error } = await supabase
    .from('licenses')
    .update({
      plan:        data.plan,
      status:      data.status,
      max_devices: data.maxDevices,
      expires_at:  data.expiresAt || null,
    })
    .eq('id', data.licenseId)
  if (error) throw new Error(`Erro ao atualizar licença: ${error.message}`)
  revalidatePath('/dashboard/admin/users')
  revalidatePath('/dashboard/admin/licenses')
  revalidatePath('/dashboard/admin')
}

export async function deleteLicenseAction(licenseId: string) {
  const supabase = await assertAdmin()
  await supabase.from('device_activations').delete().eq('license_id', licenseId)
  const { error } = await supabase.from('licenses').delete().eq('id', licenseId)
  if (error) throw new Error(`Erro ao deletar licença: ${error.message}`)
  revalidatePath('/dashboard/admin/users')
  revalidatePath('/dashboard/admin/licenses')
  revalidatePath('/dashboard/admin')
}