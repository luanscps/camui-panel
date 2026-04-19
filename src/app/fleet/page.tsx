import { getFleetDashboard } from "@/features/fleet/query"
import { FleetDashboardView } from "@/features/fleet/FleetDashboardView"

export default async function FleetPage() {
  const userId = "SUBSTITUIR_PELO_USER_ID_AUTENTICADO"
  const { devices, stats } = await getFleetDashboard(userId)

  return (
    <main className="container mx-auto py-8">
      <FleetDashboardView devices={devices} stats={stats} />
    </main>
  )
}
