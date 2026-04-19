"use client"

import { useEffect, useState, useTransition } from "react"
import { Badge } from "@/components/ui/badge"
import { FleetDeviceTimeline } from "./FleetDeviceTimeline"
import { RemoteCommandPanel } from "./RemoteCommandPanel"
import type { FleetDevice, StreamSession } from "./types"

type Tab = "geral" | "stream" | "cameras" | "controle"

const ONLINE_MS = 5 * 60 * 1000
function isOnline(d: FleetDevice) {
  if (!d.last_seen_at) return false
  return Date.now() - new Date(d.last_seen_at).getTime() < ONLINE_MS
}

function formatLastSeen(ts: string | null): string {
  if (!ts) return "—"
  const diff = Date.now() - new Date(ts).getTime()
  const min  = Math.floor(diff / 60000)
  if (min < 1)  return "agora"
  if (min < 60) return `${min}min atrás`
  const h = Math.floor(min / 60)
  if (h < 24)   return `${h}h atrás`
  return `${Math.floor(h / 24)}d atrás`
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-2 py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value ?? "—"}</span>
    </div>
  )
}

interface Props {
  device:   FleetDevice | null
  onClose:  () => void
  onLoadTimeline: (deviceId: string) => Promise<StreamSession[]>
}

export function FleetDeviceDrawer({ device, onClose, onLoadTimeline }: Props) {
  const [tab, setTab]           = useState<Tab>("geral")
  const [sessions, setSessions] = useState<StreamSession[]>([])
  const [, startTransition]     = useTransition()
  const [loading, setLoading]   = useState(false)

  useEffect(() => {
    if (!device) return
    setTab("geral")
    setSessions([])
  }, [device?.id])

  function handleTabStream() {
    setTab("stream")
    if (sessions.length > 0 || !device) return
    setLoading(true)
    startTransition(() => {
      onLoadTimeline(device.id).then(data => {
        setSessions(data)
        setLoading(false)
      })
    })
  }

  if (!device) return null

  const online    = isOnline(device)
  const streaming = device.streaming_now

  type CameraEntry = { facing?: string; max_resolution?: string; lens_facing?: string }
  let cameras: CameraEntry[] = []
  try {
    const raw = device.cameras
    if (Array.isArray(raw)) cameras = raw as CameraEntry[]
  } catch {}

  const tabClass = (t: Tab) =>
    `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
      tab === t
        ? "border-foreground text-foreground"
        : "border-transparent text-muted-foreground hover:text-foreground"
    }`

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-background shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b">
          <div>
            <p className="font-semibold text-base leading-tight">
              {device.device_name ?? device.device_model ?? "Device"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {device.device_brand ?? "—"} · Android {device.android_version ?? "—"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={streaming ? "success" : online ? "default" : "outline"}>
              {streaming ? "Streaming" : online ? "Online" : "Offline"}
            </Badge>
            <button
              onClick={onClose}
              className="ml-2 text-muted-foreground hover:text-foreground text-lg leading-none"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b overflow-x-auto">
          <button className={tabClass("geral")}    onClick={() => setTab("geral")}>Geral</button>
          <button className={tabClass("stream")}   onClick={handleTabStream}>Stream</button>
          <button className={tabClass("cameras")}  onClick={() => setTab("cameras")}>Câmeras</button>
          <button className={tabClass("controle")} onClick={() => setTab("controle")}>Controle</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">

          {tab === "geral" && (
            <div>
              <InfoRow label="Último heartbeat" value={formatLastSeen(device.last_seen_at)} />
              <InfoRow label="Status"           value={device.status} />
              <InfoRow label="IP local"         value={device.local_ip} />
              <InfoRow label="IP público"       value={device.public_ip} />
              <InfoRow label="Bateria"
                value={
                  device.battery_level != null
                    ? `${device.battery_level}%${device.is_charging ? " ⚡" : ""}`
                    : null
                }
              />
              <InfoRow label="Térmico"          value={device.thermal_state} />
              <InfoRow label="Rede"             value={
                device.network_type
                  ? `${device.network_type}${device.network_strength != null ? ` (${device.network_strength}/4)` : ""}`
                  : null
              } />
              <InfoRow label="Versão do app"    value={device.app_version} />
              <InfoRow label="Android ID"       value={device.android_id} />
              <InfoRow label="Ativado em"       value={
                device.activated_at
                  ? new Date(device.activated_at).toLocaleDateString("pt-BR")
                  : null
              } />
            </div>
          )}

          {tab === "stream" && (
            <div className="space-y-4">
              <div>
                <InfoRow label="Streaming agora" value={device.streaming_now ? "Sim" : "Não"} />
                <InfoRow label="URL RTMP"         value={
                  <span className="truncate max-w-[200px] block" title={device.last_rtmp_url ?? ""}>
                    {device.last_rtmp_url}
                  </span>
                } />
                <InfoRow label="Bitrate"          value={device.last_bitrate_kbps != null ? `${device.last_bitrate_kbps} kbps` : null} />
                <InfoRow label="Sessões totais"  value={device.stream_session_count} />
                <InfoRow label="Tempo total"      value={
                  device.total_stream_seconds > 0
                    ? `${Math.round(device.total_stream_seconds / 60)} min`
                    : "0 min"
                } />
                {device.last_stream_error && (
                  <InfoRow label="Último erro" value={
                    <span className="text-red-500">{device.last_stream_error}</span>
                  } />
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Histórico de sessões
                </p>
                <FleetDeviceTimeline sessions={sessions} loading={loading} />
              </div>
            </div>
          )}

          {tab === "cameras" && (
            <div className="space-y-2">
              {cameras.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Nenhuma informação de câmera disponível.
                </p>
              ) : (
                cameras.map((cam, i) => (
                  <div key={i} className="rounded-md border border-border bg-card px-4 py-3 text-sm">
                    <p className="font-medium">
                      {cam.facing ?? cam.lens_facing ?? `Câmera ${i + 1}`}
                    </p>
                    {cam.max_resolution && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {cam.max_resolution}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "controle" && (
            <RemoteCommandPanel device={device} />
          )}
        </div>
      </div>
    </>
  )
}
