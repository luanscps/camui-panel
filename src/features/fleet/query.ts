import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"
import type { FleetDevice, FleetStats, StreamSession, RemoteCommandRow } from "./types"

const THERMAL_CRITICAL = new Set(["serious", "critical"])
const ONLINE_THRESHOLD_MS = 5 * 60 * 1000

function isOnline(device: FleetDevice): boolean {
  if (!device.last_seen_at) return false
  return Date.now() - new Date(device.last_seen_at).getTime() < ONLINE_THRESHOLD_MS
}

function isBatteryCritical(device: FleetDevice): boolean {
  return device.battery_level !== null && device.battery_level < 20 && !device.is_charging
}

function isThermalCritical(device: FleetDevice): boolean {
  return THERMAL_CRITICAL.has(device.thermal_state ?? "")
}

function makeSupabase() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function getFleetDashboard(userId: string) {
  const supabase = makeSupabase()

  const { data: license, error: licenseError } = await supabase
    .from("licenses")
    .select("id")
    .eq("user_id", userId)
    .single()

  if (licenseError) throw licenseError

  const { data, error } = await supabase
    .from("device_activations")
    .select("*")
    .eq("license_id", license.id)
    .order("last_seen_at", { ascending: false, nullsFirst: false })

  if (error) throw error

  const devices: FleetDevice[] = data ?? []

  const stats: FleetStats = {
    total_devices:     devices.length,
    online_now:        devices.filter(isOnline).length,
    streaming_now:     devices.filter(d => d.streaming_now).length,
    active_devices:    devices.filter(d => d.status === "ACTIVE").length,
    suspended_devices: devices.filter(d => d.status === "SUSPENDED").length,
    last_activity:     devices[0]?.last_seen_at ?? null,
    user_id:           userId,
  }

  return { devices, stats }
}

export async function getDeviceTimeline(
  deviceId: string,
  limit = 20
): Promise<StreamSession[]> {
  const supabase = makeSupabase()

  const { data, error } = await supabase
    .from("stream_sessions")
    .select("*")
    .eq("device_id", deviceId)
    .order("started_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}

// ─── P2: Remote Commands ──────────────────────────────────────────────────────

export type RemoteCommandName =
  | "start_stream"
  | "stop_stream"
  | "switch_camera"
  | "request_status"
  | "set_bitrate"
  | "set_resolution"

export async function sendRemoteCommand(
  deviceId: string,
  command: RemoteCommandName,
  payload?: Record<string, string>
): Promise<RemoteCommandRow> {
  const supabase = makeSupabase()

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString() // expira em 5 min

  const { data, error } = await supabase
    .from("remote_commands")
    .insert({
      device_id:  deviceId,
      command,
      payload:    payload ?? null,
      status:     "pending",
      issued_at:  new Date().toISOString(),
      expires_at: expiresAt,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getRecentCommands(
  deviceId: string,
  limit = 10
): Promise<RemoteCommandRow[]> {
  const supabase = makeSupabase()

  const { data, error } = await supabase
    .from("remote_commands")
    .select("*")
    .eq("device_id", deviceId)
    .order("issued_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}
