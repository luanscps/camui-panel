"use client"

import { useState, useTransition } from "react"
import { sendRemoteCommand, getRecentCommands, type RemoteCommandName } from "./query"
import type { FleetDevice, RemoteCommandRow } from "./types"

const BITRATES = ["500", "1000", "2500", "4000", "6000"]
const RESOLUTIONS = ["1280x720", "1920x1080", "2560x1440"]

const STATUS_LABEL: Record<string, string> = {
  pending:   "⏳ Aguardando",
  delivered: "📡 Entregue",
  executed:  "✅ Executado",
  failed:    "❌ Falhou",
}

const STATUS_COLOR: Record<string, string> = {
  pending:   "var(--color-warning, #d97706)",
  delivered: "var(--color-info, #2563eb)",
  executed:  "var(--color-success, #16a34a)",
  failed:    "var(--color-error, #ef4444)",
}

function formatIssuedAt(ts: string): string {
  return new Date(ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

const sectionLabel: React.CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "var(--color-text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
}

const selectStyle: React.CSSProperties = {
  borderRadius: "var(--radius-md, 6px)",
  border: "1px solid var(--color-border)",
  background: "var(--color-bg)",
  color: "var(--color-text)",
  padding: "0.375rem 0.75rem",
  fontSize: "0.875rem",
}

interface Props {
  device: FleetDevice
}

export function RemoteCommandPanel({ device }: Props) {
  const [bitrate, setBitrate] = useState("2500")
  const [resolution, setResolution] = useState("1920x1080")
  const [history, setHistory] = useState<RemoteCommandRow[]>([])
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [sending, setSending] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const online = device.last_seen_at
    ? Date.now() - new Date(device.last_seen_at).getTime() < 5 * 60 * 1000
    : false

  async function send(command: RemoteCommandName, payload?: Record<string, string>) {
    setError(null)
    setSending(command)
    try {
      const row = await sendRemoteCommand(device.id, command, payload)
      setHistory((prev) => [row, ...prev])
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
      getRecentCommands(device.id).then((rows) => setHistory(rows))
    })
  }

  function btn(bg: string, color: string, extraDisabled = false): React.CSSProperties {
    return {
      borderRadius: "var(--radius-md, 6px)",
      padding: "0.375rem 0.75rem",
      fontSize: "0.875rem",
      fontWeight: 500,
      cursor: sending || extraDisabled ? "not-allowed" : "pointer",
      opacity: sending || extraDisabled ? 0.4 : 1,
      transition: "opacity 0.15s",
      border: bg === "outline" ? "1px solid var(--color-border)" : "none",
      background: bg === "outline" ? "transparent" : bg,
      color,
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {!online && (
        <div style={{
          borderRadius: "var(--radius-md, 6px)",
          background: "var(--color-warning-subtle, rgba(217,119,6,0.08))",
          border: "1px solid var(--color-warning, #d97706)",
          padding: "0.75rem 1rem",
          fontSize: "0.875rem",
          color: "var(--color-warning, #d97706)",
        }}>
          ⚠️ Device offline — comandos serão enfileirados e executados quando reconectar.
        </div>
      )}

      {/* Stream */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <p style={sectionLabel}>Stream</p>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            style={btn("var(--color-success, #16a34a)", "#fff", !!device.streaming_now)}
            disabled={!!sending || !!device.streaming_now}
            onClick={() => send("start_stream")}
          >
            {sending === "start_stream" ? "Enviando…" : "▶ Start stream"}
          </button>
          <button
            style={btn("var(--color-error, #ef4444)", "#fff", !device.streaming_now)}
            disabled={!!sending || !device.streaming_now}
            onClick={() => send("stop_stream")}
          >
            {sending === "stop_stream" ? "Enviando…" : "■ Stop stream"}
          </button>
          <button
            style={btn("outline", "var(--color-text)")}
            disabled={!!sending}
            onClick={() => send("switch_camera")}
          >
            {sending === "switch_camera" ? "Enviando…" : "🔄 Switch câmera"}
          </button>
          <button
            style={btn("outline", "var(--color-text)")}
            disabled={!!sending}
            onClick={() => send("request_status")}
          >
            {sending === "request_status" ? "Enviando…" : "📊 Forçar status"}
          </button>
        </div>
      </div>

      {/* Bitrate */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <p style={sectionLabel}>Bitrate</p>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <select style={selectStyle} value={bitrate} onChange={(e) => setBitrate(e.target.value)}>
            {BITRATES.map((b) => <option key={b} value={b}>{b} kbps</option>)}
          </select>
          <button
            style={btn("var(--color-text)", "var(--color-bg)")}
            disabled={!!sending}
            onClick={() => send("set_bitrate", { bitrate })}
          >
            {sending === "set_bitrate" ? "Enviando…" : "Aplicar"}
          </button>
        </div>
      </div>

      {/* Resolução */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <p style={sectionLabel}>Resolução</p>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <select style={selectStyle} value={resolution} onChange={(e) => setResolution(e.target.value)}>
            {RESOLUTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <button
            style={btn("var(--color-text)", "var(--color-bg)")}
            disabled={!!sending}
            onClick={() => send("set_resolution", { resolution })}
          >
            {sending === "set_resolution" ? "Enviando…" : "Aplicar"}
          </button>
        </div>
      </div>

      {error && (
        <p style={{ fontSize: "0.875rem", color: "var(--color-error, #ef4444)" }}>{error}</p>
      )}

      {/* Histórico */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={sectionLabel}>Histórico</p>
          {!historyLoaded && (
            <button
              onClick={loadHistory}
              style={{ background: "none", border: "none", fontSize: "0.75rem", color: "var(--color-text-muted)", cursor: "pointer" }}
            >
              Carregar
            </button>
          )}
        </div>
        {history.length === 0 && historyLoaded && (
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>Nenhum comando enviado ainda.</p>
        )}
        {history.map((row) => (
          <div
            key={row.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "0.75rem",
              borderBottom: "1px solid var(--color-border)",
              padding: "0.5rem 0",
            }}
          >
            <div>
              <span style={{ fontFamily: "monospace", fontWeight: 500 }}>{row.command}</span>
              {row.payload && (
                <span style={{ marginLeft: "0.5rem", color: "var(--color-text-muted)" }}>
                  {Object.entries(row.payload as Record<string, string>).map(([k, v]) => `${k}=${v}`).join(" ")}
                </span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ color: STATUS_COLOR[row.status] ?? "var(--color-text-muted)" }}>
                {STATUS_LABEL[row.status] ?? row.status}
              </span>
              <span style={{ color: "var(--color-text-muted)" }}>{formatIssuedAt(row.issued_at)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
