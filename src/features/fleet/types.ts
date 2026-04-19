import type { Database } from "@/types/database"

export type FleetDevice = Database["public"]["Views"]["fleet_dashboard"]["Row"]

export type FleetStats = {
  totalDevices: number
  onlineNow: number
  streamingNow: number
  batteryCritical: number
  thermalCritical: number
}
