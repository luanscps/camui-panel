"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { FleetDevice, FleetStats } from "./types"

function statusColor(device: FleetDevice) {
  if (device.thermal_critical) return "destructive"
  if (device.battery_critical) return "secondary"
  if (device.streaming_now) return "default"
  return "outline"
}

export function FleetDashboardView({ devices, stats }: { devices: FleetDevice[]; stats: FleetStats }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <Card><CardHeader><CardTitle>Total</CardTitle></CardHeader><CardContent>{stats.totalDevices}</CardContent></Card>
        <Card><CardHeader><CardTitle>Online</CardTitle></CardHeader><CardContent>{stats.onlineNow}</CardContent></Card>
        <Card><CardHeader><CardTitle>Streaming</CardTitle></CardHeader><CardContent>{stats.streamingNow}</CardContent></Card>
        <Card><CardHeader><CardTitle>Bateria crítica</CardTitle></CardHeader><CardContent>{stats.batteryCritical}</CardContent></Card>
        <Card><CardHeader><CardTitle>Térmico crítico</CardTitle></CardHeader><CardContent>{stats.thermalCritical}</CardContent></Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {devices.map((device) => (
          <Card key={device.device_id ?? Math.random()}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{device.device_name ?? device.device_model ?? "Device"}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {device.device_brand} {device.device_model} · {device.plan}
                </p>
              </div>
              <Badge variant={statusColor(device)}>
                {device.streaming_now ? "Streaming" : device.is_online ? "Online" : "Offline"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>Bateria: {device.battery_level ?? "--"}%</div>
              <div>Rede: {device.network_type ?? "--"} / sinal {device.network_strength ?? "--"}</div>
              <div>Protocolo: {device.current_protocol ?? "--"}</div>
              <div>Bitrate: {device.last_bitrate_kbps ?? "--"} kbps</div>
              <div>Sessões 24h: {device.sessions_last_24h ?? 0}</div>
              <div>Tempo 24h: {device.stream_seconds_last_24h ?? 0}s</div>
              <div>Último erro: {device.last_stream_error ?? "nenhum"}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
