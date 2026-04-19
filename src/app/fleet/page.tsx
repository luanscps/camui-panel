import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getFleetDashboard } from "@/features/fleet/query"
import { FleetDashboardView } from "@/features/fleet/FleetDashboardView"

// impede prerender em build time — página depende de sessão autenticada
export const dynamic = "force-dynamic"

export default async function FleetPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { devices, stats } = await getFleetDashboard(user.id)

  return (
    <main className="container mx-auto py-8">
      <FleetDashboardView devices={devices} stats={stats} />
    </main>
  )
}
