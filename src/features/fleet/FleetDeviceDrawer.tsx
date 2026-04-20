"use client"

import { useEffect, useState, useTransition } from "react"
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
  const min = Math.floor(diff / 60000)
  if (min < 1) return "agora"
  if (min < 60) return `${min}min atrás`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h atrás`
  return `${Math.floor(h / 24)}d atrás`
}

function StatusBadge({ streaming, online }: { streaming: boolean; online: boolean }) {
  const label = streaming ? "Streaming" : online ? "Online" : "Offline"
  const style: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 10px",
    borderRadius: "var(--radius-full, 9999px)",
    fontSize: "0.75rem",
    fontWeight: 600,
    background: streaming
      ? "var(--color-error-subtle, rgba(239,68,68,0.1))"
      : online
      ? "var(--color-success-subtle, rgba(34,197,94,0.1))"
      : "var(--color-surface-offset, #f1f5f9)",
    color: streaming
      ? "var(--color-error, #ef4444)"
      : online
      ? "var(--color-success, #16a34a)"
      : "var(--color-text-muted, #64748b)",
    border: "1px solid",
    borderColor: streaming
      ? "var(--color-error, #ef4444)"
      : online
      ? "var(--color-success, #16a34a)"
      : "var(--color-border, #e2e8f0)",
  }
  return <span style={style}>{label}</span>
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "0.5rem",
        padding: "0.5rem 0",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>{label}</span>
      <span style={{ fontSize: "0.875rem", fontWeight: 500, textAlign: "right" }}>{value ?? "—"}</span>
    </div>
  )
}

interface Props {
  device: FleetDevice | null
  onClose: () => void
  onLoadTimeline: (deviceId: string) => Promise<StreamSession[]>
}

export function FleetDeviceDrawer({ device, onClose, onLoadTimeline }: Props) {
  const [tab, setTab] = useState<Tab>("geral")
  const [sessions, setSessions] = useState<StreamSession[]>([])
  const [, startTransition] = useTransition()
  const [loading, setLoading] = useState(false)

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
      onLoadTimeline(device.id).then((data) => {
        setSessions(data)
        setLoading(false)
      })
    })
  }

  if (!device) return null

  const online = isOnline(device)
  const streaming = device.streaming_now

  type CameraEntry = { facing?: string; max_resolution?: string; lens_facing?: string }
  let cameras: CameraEntry[] = []
  try {
    const raw = device.cameras
    if (Array.isArray(raw)) cameras = raw as CameraEntry[]
  } catch {}

  const tabStyle = (t: Tab): React.CSSProperties => ({
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    background: "none",
    border: "none",
    borderBottom: tab === t ? "2px solid var(--color-text)" : "2px solid transparent",
    color: tab === t ? "var(--color-text)" : "var(--color-text-muted)",
    cursor: "pointer",
    transition: "color 0.15s",
    whiteSpace: "nowrap" as const,
  })

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 40,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(4px)",
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          zIndex: 50,
          height: "100%",
          width: "100%",
          maxWidth: "28rem",
          background: "var(--color-bg)",
          boxShadow: "var(--shadow-xl, 0 20px 60px rgba(0,0,0,0.3))",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            padding: "1rem 1.5rem",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div>
            <p style={{ fontWeight: 600, fontSize: "1rem", lineHeight: 1.3, color: "var(--color-text)" }}>
              {device.device_name ?? device.device_model ?? "Device"}
            </p>
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: 2 }}>
              {device.device_brand ?? "—"} · Android {device.android_version ?? "—"}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <StatusBadge streaming={!!streaming} online={online} />
            <button
              onClick={onClose}
              style={{
                marginLeft: "0.5rem",
                background: "none",
                border: "none",
                color: "var(--color-text-muted)",
                fontSize: "1.125rem",
                cursor: "pointer",
                lineHeight: 1,
                padding: "0.25rem",
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--color-border)",
            overflowX: "auto",
          }}
        >
          <button style={tabStyle("geral")} onClick={() => setTab("geral")}>Geral</button>
          <button style={tabStyle("stream")} onClick={handleTabStream}>Stream</button>
          <button style={tabStyle("cameras")} onClick={() => setTab("cameras")}>Câmeras</button>
          <button style={tabStyle("controle")} onClick={() => setTab("controle")}>Controle</button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.5rem" }}>

          {tab === "geral" && (
            <div>
              <InfoRow label="Último heartbeat" value={formatLastSeen(device.last_seen_at)} />
              <InfoRow label="Status" value={device.status} />
              <InfoRow label="IP local" value={device.local_ip} />
              <InfoRow label="IP público" value={device.public_ip} />
              <InfoRow
                label="Bateria"
                value={
                  device.battery_level != null
                    ? `${device.battery_level}%${device.is_charging ? " ⚡" : ""}`
                    : null
                }
              />
              <InfoRow label="Térmico" value={device.thermal_state} />
              <InfoRow
                label="Rede"
                value={
                  device.network_type
                    ? `${device.network_type}${device.network_strength != null ? ` (${device.network_strength}/4)` : ""}`
                    : null
                }
              />
              <InfoRow label="Versão do app" value={device.app_version} />
              <InfoRow label="Android ID" value={device.android_id} />
              <InfoRow
                label="Ativado em"
                value={
                  device.activated_at
                    ? new Date(device.activated_at).toLocaleDateString("pt-BR")
                    : null
                }
              />
            </div>
          )}

          {tab === "stream" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <InfoRow label="Streaming agora" value={device.streaming_now ? "Sim" : "Não"} />
                <InfoRow
                  label="URL RTMP"
                  value={
                    <span
                      style={{ display: "block", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      title={device.last_rtmp_url ?? ""}
                    >
                      {device.last_rtmp_url}
                    </span>
                  }
                />
                <InfoRow
                  label="Bitrate"
                  value={device.last_bitrate_kbps != null ? `${device.last_bitrate_kbps} kbps` : null}
                />
                <InfoRow label="Sessões totais" value={device.stream_session_count} />
                <InfoRow
                  label="Tempo total"
                  value={
                    device.total_stream_seconds > 0
                      ? `${Math.round(device.total_stream_seconds / 60)} min`
                      : "0 min"
                  }
                />
                {device.last_stream_error && (
                  <InfoRow
                    label="Último erro"
                    value={<span style={{ color: "var(--color-error, #ef4444)" }}>{device.last_stream_error}</span>}
                  />
                )}
              </div>
              <div>
                <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
                  Histórico de sessões
                </p>
                <FleetDeviceTimeline sessions={sessions} loading={loading} />
              </div>
            </div>
          )}

          {tab === "cameras" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {cameras.length === 0 ? (
                <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", textAlign: "center", padding: "1rem 0" }}>
                  Nenhuma informação de câmera disponível.
                </p>
              ) : (
                cameras.map((cam, i) => (
                  <div
                    key={i}
                    style={{
                      borderRadius: "var(--radius-md, 6px)",
                      border: "1px solid var(--color-border)",
                      background: "var(--color-surface)",
                      padding: "0.75rem 1rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    <p style={{ fontWeight: 500 }}>{cam.facing ?? cam.lens_facing ?? `Câmera ${i + 1}`}</p>
                    {cam.max_resolution && (
                      <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: 2 }}>
                        {cam.max_resolution}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "controle" && <RemoteCommandPanel device={device} />}
        </div>
      </div>
    </>
  )
}
