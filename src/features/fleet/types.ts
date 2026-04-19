import type { Database } from "@/types/database"

export type FleetDevice = Database["public"]["Tables"]["device_activations"]["Row"]

export type FleetStats = Database["public"]["Views"]["fleet_dashboard"]["Row"]
