import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getFleetDashboard } from "@/features/fleet/query"
import { FleetDashboardView } from "@/features/fleet/FleetDashboardView"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { devices, stats } = await getFleetDashboard(user.id)

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Fleet Dashboard</h1>
      <FleetDashboardView devices={devices} stats={stats} />
    </main>
  )
}
