import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardShell from '@/components/DashboardShell'

type ProfileRow = { full_name: string | null; role: string | null }
type LicenseRow = { plan: string; status: string }

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createClient()) as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single() as { data: ProfileRow | null }

  const { data: license } = await supabase
    .from('licenses')
    .select('plan, status')
    .eq('user_id', user.id)
    .maybeSingle() as { data: LicenseRow | null }

  return (
    <DashboardShell
      user={{ email: user.email ?? '', id: user.id }}
      profile={{ full_name: profile?.full_name ?? null, role: profile?.role ?? 'user' }}
      license={license ?? null}
    >
      {children}
    </DashboardShell>
  )
}
