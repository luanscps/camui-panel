import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"
import type { FleetDevice, FleetStats } from "./types"

const THERMAL_CRITICAL = new Set(["serious", "critical"])
const ONLINE_THRESHOLD_MS = 5 * 60 * 1000

function isOnline(device: FleetDevice): boolean {
  if (!device.last_seen) return false
  return Date.now() - new Date(device.last_seen).getTime() < ONLINE_THRESHOLD_MS
}

function isBatteryCritical(device: FleetDevice): boolean {
  return device.battery_level !== null && device.battery_level < 20 && !device.is_charging
}

function isThermalCritical(device: FleetDevice): boolean {
  return THERMAL_CRITICAL.has(device.thermal_state ?? "")
}

export async function getFleetDashboard(userId: string) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. busca o license_id do usuário
  const { data: license, error: licenseError } = await supabase
    .from("licenses")
    .select("id")
    .eq("user_id", userId)
    .single()

  if (licenseError) throw licenseError

  // 2. busca todos os devices da licença
  const { data, error } = await supabase
    .from("device_activations")
    .select("*")
    .eq("license_id", license.id)
    .order("last_seen", { ascending: false, nullsFirst: false })

  if (error) throw error

  const devices: FleetDevice[] = data ?? []

  // 3. calcula FleetStats no frontend
  const stats: FleetStats = {
    total_devices: devices.length,
    online_now: devices.filter(isOnline).length,
    streaming_now: devices.filter(d => d.streaming_now).length,
    active_devices: devices.filter(d => d.status === "active").length,
    suspended_devices: devices.filter(d => d.status === "suspended").length,
    last_activity: devices[0]?.last_seen ?? null,
    user_id: userId,
  }

  return { devices, stats }
}
