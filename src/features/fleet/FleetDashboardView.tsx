"use client"

import { Badge } from "@/components/ui/badge"
import type { FleetDevice, FleetStats } from "./types"

// thermal_state pode ser: 'none' | 'light' | 'moderate' | 'serious' | 'critical'
const THERMAL_CRITICAL = new Set(["serious", "critical"])

function isThermalCritical(device: FleetDevice): boolean {
  return THERMAL_CRITICAL.has(device.thermal_state ?? "")
}

function isBatteryCritical(device: FleetDevice): boolean {
  return device.battery_level !== null && device.battery_level < 20 && !device.is_charging
}

function isOnline(device: FleetDevice): boolean {
  if (!device.last_seen) return false
  return new Date().getTime() - new Date(device.last_seen).getTime() < 5 * 60 * 1000
}

function getStatusVariant(device: FleetDevice): "default" | "success" | "destructive" | "warning" | "info" | "outline" {
  if (isThermalCritical(device)) return "destructive"
  if (isBatteryCritical(device)) return "warning"
  if (device.streaming_now) return "success"
  if (isOnline(device)) return "info"
  return "outline"
}

function getStatusLabel(device: FleetDevice): string {
  if (device.streaming_now) return "Streaming"
  if (isOnline(device)) return "Online"
  return "Offline"
}

function StatBox({ label, value, warn }: { label: string; value: number | null; warn?: boolean }) {
  const v = value ?? 0
  return (
    <div className={`rounded-lg border p-4 text-center ${
      warn && v > 0 ? "border-red-500 bg-red-50 dark:bg-red-950" : "border-border bg-card"
    }`}>
      <p className="text-2xl font-bold">{v}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  )
}

export function FleetDashboardView({ devices, stats }: { devices: FleetDevice[]; stats: FleetStats }) {
  const batteryCritical = devices.filter(isBatteryCritical).length
  const thermalCritical = devices.filter(isThermalCritical).length

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatBox label="Total" value={stats.total_devices} />
        <StatBox label="Online" value={stats.online_now} />
        <StatBox label="Streaming" value={stats.streaming_now} />
        <StatBox label="Bateria crítica" value={batteryCritical} warn />
        <StatBox label="Térmico crítico" value={thermalCritical} warn />
      </div>

      {/* Devices Table */}
      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Device</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Bateria</th>
              <th className="px-4 py-3 text-left font-medium">Rede</th>
              <th className="px-4 py-3 text-left font-medium">Bitrate</th>
              <th className="px-4 py-3 text-left font-medium">Sessões</th>
              <th className="px-4 py-3 text-left font-medium">Último erro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {devices.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhum device encontrado.
                </td>
              </tr>
            )}
            {devices.map((device) => (
              <tr key={device.device_id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium leading-none">{device.device_name ?? device.device_model ?? "—"}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {device.device_brand ?? "—"} · {device.android_version ?? "—"}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={getStatusVariant(device)}>{getStatusLabel(device)}</Badge>
                </td>
                <td className="px-4 py-3">
                  {device.battery_level != null ? (
                    <span className={isBatteryCritical(device) ? "text-red-500 font-semibold" : ""}>
                      {device.battery_level}%{device.is_charging ? " ⚡" : ""}
                    </span>
                  ) : "—"}
                </td>
                <td className="px-4 py-3">
                  <span>{device.network_type ?? "—"}</span>
                  {device.network_strength != null && (
                    <span className="text-muted-foreground ml-1">({device.network_strength}/4)</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {device.last_bitrate_kbps != null ? `${device.last_bitrate_kbps} kbps` : "—"}
                </td>
                <td className="px-4 py-3">
                  <span>{device.stream_session_count ?? 0}</span>
                  <span className="text-muted-foreground ml-1 text-xs">
                    ({Math.round((device.total_stream_seconds ?? 0) / 60)}min)
                  </span>
                </td>
                <td className="px-4 py-3 max-w-[200px] truncate text-xs text-muted-foreground">
                  {device.last_stream_error ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
