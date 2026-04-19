"use client"

import { useState, useTransition } from "react"
import { sendRemoteCommand, getRecentCommands, type RemoteCommandName } from "./query"
import type { FleetDevice, RemoteCommandRow } from "./types"

const BITRATES  = ["500", "1000", "2500", "4000", "6000"]
const RESOLUTIONS = ["1280x720", "1920x1080", "2560x1440"]

const STATUS_LABEL: Record<string, string> = {
  pending:   "⏳ Aguardando",
  delivered: "📡 Entregue",
  executed:  "✅ Executado",
  failed:    "❌ Falhou",
}

const STATUS_CLASS: Record<string, string> = {
  pending:   "text-yellow-600 dark:text-yellow-400",
  delivered: "text-blue-600 dark:text-blue-400",
  executed:  "text-green-600 dark:text-green-400",
  failed:    "text-red-600 dark:text-red-400",
}

function formatIssuedAt(ts: string): string {
  return new Date(ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

interface Props {
  device: FleetDevice
}

export function RemoteCommandPanel({ device }: Props) {
  const [bitrate, setBitrate]       = useState("2500")
  const [resolution, setResolution] = useState("1920x1080")
  const [history, setHistory]       = useState<RemoteCommandRow[]>([])
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [sending, setSending]       = useState<string | null>(null)
  const [error, setError]           = useState<string | null>(null)
  const [, startTransition]         = useTransition()

  const online = device.last_seen_at
    ? Date.now() - new Date(device.last_seen_at).getTime() < 5 * 60 * 1000
    : false

  async function send(command: RemoteCommandName, payload?: Record<string, string>) {
    setError(null)
    setSending(command)
    try {
      const row = await sendRemoteCommand(device.id, command, payload)
      setHistory(prev => [row, ...prev])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao enviar comando")
    } finally {
      setSending(null)
    }
  }

  function loadHistory() {
    if (historyLoaded) return
    setHistoryLoaded(true)
    startTransition(() => {
      getRecentCommands(device.id).then(rows => setHistory(rows))
    })
  }

  const btnBase = "rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
  const btnPrimary = `${btnBase} bg-foreground text-background hover:opacity-80`
  const btnOutline = `${btnBase} border border-border hover:bg-muted`
  const btnRed     = `${btnBase} bg-red-600 text-white hover:bg-red-700`
  const btnGreen   = `${btnBase} bg-green-600 text-white hover:bg-green-700`

  return (
    <div className="space-y-5">

      {!online && (
        <div className="rounded-md bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-300 px-4 py-3 text-sm text-yellow-800 dark:text-yellow-300">
          ⚠️ Device offline — comandos serão enfileirados e executados quando reconectar.
        </div>
      )}

      {/* Stream control */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Stream</p>
        <div className="flex gap-2 flex-wrap">
          <button
            className={btnGreen}
            disabled={!!sending || device.streaming_now}
            onClick={() => send("start_stream")}
          >
            {sending === "start_stream" ? "Enviando…" : "▶ Start stream"}
          </button>
          <button
            className={btnRed}
            disabled={!!sending || !device.streaming_now}
            onClick={() => send("stop_stream")}
          >
            {sending === "stop_stream" ? "Enviando…" : "■ Stop stream"}
          </button>
          <button
            className={btnOutline}
            disabled={!!sending}
            onClick={() => send("switch_camera")}
          >
            {sending === "switch_camera" ? "Enviando…" : "🔄 Switch câmera"}
          </button>
          <button
            className={btnOutline}
            disabled={!!sending}
            onClick={() => send("request_status")}
          >
            {sending === "request_status" ? "Enviando…" : "📊 Forçar status"}
          </button>
        </div>
      </div>

      {/* Bitrate */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Bitrate</p>
        <div className="flex gap-2 items-center flex-wrap">
          <select
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={bitrate}
            onChange={e => setBitrate(e.target.value)}
          >
            {BITRATES.map(b => (
              <option key={b} value={b}>{b} kbps</option>
            ))}
          </select>
          <button
            className={btnPrimary}
            disabled={!!sending}
            onClick={() => send("set_bitrate", { bitrate })}
          >
            {sending === "set_bitrate" ? "Enviando…" : "Aplicar"}
          </button>
        </div>
      </div>

      {/* Resolução */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Resolução</p>
        <div className="flex gap-2 items-center flex-wrap">
          <select
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={resolution}
            onChange={e => setResolution(e.target.value)}
          >
            {RESOLUTIONS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <button
            className={btnPrimary}
            disabled={!!sending}
            onClick={() => send("set_resolution", { resolution })}
          >
            {sending === "set_resolution" ? "Enviando…" : "Aplicar"}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* Histórico */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Histórico</p>
          {!historyLoaded && (
            <button className="text-xs text-muted-foreground hover:text-foreground" onClick={loadHistory}>
              Carregar
            </button>
          )}
        </div>
        {history.length === 0 && historyLoaded && (
          <p className="text-sm text-muted-foreground">Nenhum comando enviado ainda.</p>
        )}
        {history.map(row => (
          <div key={row.id} className="flex items-center justify-between text-xs border-b border-border py-2 last:border-0">
            <div>
              <span className="font-mono font-medium">{row.command}</span>
              {row.payload && (
                <span className="ml-2 text-muted-foreground">
                  {Object.entries(row.payload as Record<string, string>)
                    .map(([k, v]) => `${k}=${v}`)
                    .join(" ")}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className={STATUS_CLASS[row.status] ?? "text-muted-foreground"}>
                {STATUS_LABEL[row.status] ?? row.status}
              </span>
              <span className="text-muted-foreground">{formatIssuedAt(row.issued_at)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
