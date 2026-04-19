"use client"

import { Badge } from "@/components/ui/badge"
import type { FleetDevice, FleetStats } from "./types"

function getStatusVariant(device: FleetDevice): "default" | "secondary" | "destructive" | "outline" {
  if (device.thermal_critical) return "destructive"
  if (device.battery_critical) return "secondary"
  if (device.streaming_now) return "default"
  return "outline"
}

function getStatusLabel(device: FleetDevice): string {
  if (device.streaming_now) return "Streaming"
  if (device.is_online) return "Online"
  return "Offline"
}

function StatBox({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  return (
    <div className={`rounded-lg border p-4 text-center ${warn && value > 0 ? "border-red-500 bg-red-50 dark:bg-red-950" : "border-border bg-card"}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  )
}

export function FleetDashboardView({ devices, stats }: { devices: FleetDevice[]; stats: FleetStats }) {
  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatBox label="Total" value={stats.totalDevices} />
        <StatBox label="Online" value={stats.onlineNow} />
        <StatBox label="Streaming" value={stats.streamingNow} />
        <StatBox label="Bateria crítica" value={stats.batteryCritical} warn />
        <StatBox label="Térmico crítico" value={stats.thermalCritical} warn />
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
              <th className="px-4 py-3 text-left font-medium">Sessões 24h</th>
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
              <tr key={device.device_id ?? device.sub_license_key ?? Math.random()} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium leading-none">{device.device_name ?? device.device_model ?? "—"}</p>
                  <p className="text-xs text-muted-foreground mt-1">{device.device_brand} · {device.plan}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={getStatusVariant(device)}>{getStatusLabel(device)}</Badge>
                </td>
                <td className="px-4 py-3">
                  {device.battery_level != null ? (
                    <span className={device.battery_critical ? "text-red-500 font-semibold" : ""}>
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
                  <span>{device.sessions_last_24h ?? 0}</span>
                  <span className="text-muted-foreground ml-1 text-xs">
                    ({Math.round((device.stream_seconds_last_24h ?? 0) / 60)}min)
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
