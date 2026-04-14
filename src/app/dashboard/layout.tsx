import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profileData } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  const isAdmin = (profileData as { is_admin: boolean } | null)?.is_admin ?? false

  const initials = (user.email ?? 'U')
    .split('@')[0]
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="camui-layout">
      <Sidebar
        userEmail={user.email ?? ''}
        isAdmin={isAdmin}
        userInitials={initials}
      />
      <div className="camui-main">
        {children}
      </div>
    </div>
  )
}
