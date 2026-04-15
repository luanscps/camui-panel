import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardShell from '@/components/DashboardShell'
import type { Database } from '@/types/database'

type ProfileRow = Database['public']['Tables']['profiles']['Row']
type LicenseRow = Database['public']['Tables']['licenses']['Row']

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, is_admin')
    .eq('id', user.id)
    .single() as unknown as { data: Pick<ProfileRow, 'full_name' | 'is_admin'> | null }

  const { data: license } = await supabase
    .from('licenses')
    .select('plan, status')
    .eq('user_id', user.id)
    .maybeSingle() as unknown as { data: Pick<LicenseRow, 'plan' | 'status'> | null }

  return (
    <DashboardShell
      user={{ email: user.email ?? '', id: user.id }}
      profile={{
        full_name: profile?.full_name ?? null,
        is_admin: profile?.is_admin ?? false,
      }}
      license={license ?? null}
    >
      {children}
    </DashboardShell>
  )
}
