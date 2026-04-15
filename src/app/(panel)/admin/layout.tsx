import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Guarda de segurança — redireciona não-admins para /dashboard.
 * A shell visual vem do (panel)/layout.tsx acima na hierarquia.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single<{ is_admin: boolean }>()

  if (!profile?.is_admin) redirect('/dashboard')

  return <>{children}</>
}
