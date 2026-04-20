"use client"

import type { StreamSession } from "./types"

function formatDuration(sec: number | null): string {
  if (!sec || sec <= 0) return "—"
  if (sec < 60) return `${sec}s`
  if (sec < 3600) return `${Math.floor(sec / 60)}min ${sec % 60}s`
  return `${Math.floor(sec / 3600)}h ${Math.floor((sec % 3600) / 60)}min`
}

function formatDate(ts: string): string {
  return new Date(ts).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

interface Props {
  sessions: StreamSession[]
  loading?: boolean
}

export function FleetDeviceTimeline({ sessions, loading }: Props) {
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            style={{
              height: "3.5rem",
              borderRadius: "var(--radius-md, 6px)",
              background: "var(--color-surface-offset, #f1f5f9)",
              animation: "camui-pulse 1.5s ease-in-out infinite",
            }}
          />
        ))}
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", textAlign: "center", padding: "1rem 0" }}>
        Nenhuma sessão registrada ainda.
      </p>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {sessions.map((s) => (
        <div
          key={s.id}
          style={{
            borderRadius: "var(--radius-md, 6px)",
            border: "1px solid",
            borderColor: s.error_msg ? "var(--color-error, #ef4444)" : "var(--color-border)",
            background: s.error_msg ? "var(--color-error-subtle, rgba(239,68,68,0.08))" : "var(--color-surface)",
            padding: "0.75rem 1rem",
            fontSize: "0.875rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
            <span style={{ fontWeight: 500 }}>{formatDate(s.started_at)}</span>
            <span style={{ color: "var(--color-text-muted)", fontVariantNumeric: "tabular-nums" }}>
              {formatDuration(s.duration_sec)}
            </span>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem 1rem", marginTop: "0.25rem", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
            {s.resolution && <span>📹 {s.resolution}</span>}
            {s.bitrate_kbps && <span>📡 {s.bitrate_kbps} kbps</span>}
            {s.rtmp_url && (
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 240 }} title={s.rtmp_url}>
                🔗 {s.rtmp_url}
              </span>
            )}
          </div>

          {s.error_msg && (
            <p style={{ marginTop: "0.25rem", fontSize: "0.75rem", color: "var(--color-error, #ef4444)" }}>
              ⚠️ {s.error_msg}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
