import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/sidebar'

type AdminProfile = { is_admin: boolean }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  const profile = data as AdminProfile | null
  if (error || !profile || !profile.is_admin) redirect('/dashboard')

  const initials = (user.email ?? 'A')
    .split('@')[0]
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="camui-layout">
      <Sidebar
        userEmail={user.email ?? ''}
        isAdmin={true}
        userInitials={initials}
      />
      <div className="camui-main">
        {children}
      </div>
    </div>
  )
}
