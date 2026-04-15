import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Admin layout — apenas guarda de segurança.
 * A shell visual (sidebar, topbar) vem do DashboardShell
 * herdado pelo dashboard/layout.tsx que envolve toda a área autenticada.
 * Se o usuário não for admin, redireciona para /dashboard.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') redirect('/dashboard')

  return <>{children}</>
}
