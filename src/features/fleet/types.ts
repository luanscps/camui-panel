import type { Database } from "@/types/database"

export type FleetDevice      = Database["public"]["Tables"]["device_activations"]["Row"]
export type FleetStats       = Database["public"]["Views"]["fleet_dashboard"]["Row"]
export type StreamSession    = Database["public"]["Tables"]["stream_sessions"]["Row"]
export type RemoteCommandRow = Database["public"]["Tables"]["remote_commands"]["Row"]
