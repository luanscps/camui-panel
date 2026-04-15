import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardShell from '@/components/DashboardShell'

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  const { data: license } = await supabase
    .from('licenses')
    .select('plan, status')
    .eq('user_id', user.id)
    .maybeSingle()

  return (
    <DashboardShell
      user={{ email: user.email ?? '', id: user.id }}
      profile={profile ?? { full_name: null, role: 'user' }}
      license={license ?? null}
    >
      {children}
    </DashboardShell>
  )
}
