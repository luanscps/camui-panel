"use client"

import type { StreamSession } from "./types"

function formatDuration(sec: number | null): string {
  if (!sec || sec <= 0) return "—"
  if (sec < 60)  return `${sec}s`
  if (sec < 3600) return `${Math.floor(sec / 60)}min ${sec % 60}s`
  return `${Math.floor(sec / 3600)}h ${Math.floor((sec % 3600) / 60)}min`
}

function formatDate(ts: string): string {
  return new Date(ts).toLocaleString("pt-BR", {
    day:    "2-digit",
    month:  "2-digit",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  })
}

interface Props {
  sessions: StreamSession[]
  loading?:  boolean
}

export function FleetDeviceTimeline({ sessions, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-14 rounded-md bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        Nenhuma sessão registrada ainda.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {sessions.map((s) => (
        <div
          key={s.id}
          className={`rounded-md border px-4 py-3 text-sm ${
            s.error_msg
              ? "border-red-300 bg-red-50 dark:bg-red-950/40"
              : "border-border bg-card"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium">{formatDate(s.started_at)}</span>
            <span className="text-muted-foreground tabular-nums">
              {formatDuration(s.duration_sec)}
            </span>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
            {s.resolution && <span>📹 {s.resolution}</span>}
            {s.bitrate_kbps && <span>📡 {s.bitrate_kbps} kbps</span>}
            {s.rtmp_url && (
              <span className="truncate max-w-[240px]" title={s.rtmp_url}>
                🔗 {s.rtmp_url}
              </span>
            )}
          </div>

          {s.error_msg && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              ⚠️ {s.error_msg}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
