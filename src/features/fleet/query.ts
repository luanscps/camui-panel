import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"
import type { FleetDevice, FleetStats } from "./types"

export async function getFleetDashboard(userId: string) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from("fleet_dashboard")
    .select("*")
    .eq("user_id", userId)
    .order("last_seen_at", { ascending: false, nullsFirst: false })

  if (error) throw error

  const devices = (data ?? []) as FleetDevice[]

  const stats: FleetStats = {
    totalDevices: devices.length,
    onlineNow: devices.filter(d => d.is_online).length,
    streamingNow: devices.filter(d => d.streaming_now).length,
    batteryCritical: devices.filter(d => d.battery_critical).length,
    thermalCritical: devices.filter(d => d.thermal_critical).length,
  }

  return { devices, stats }
}
