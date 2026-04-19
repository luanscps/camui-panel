"use client"

import { useMemo, useState } from "react"
import { FleetDeviceDrawer } from "@/features/fleet/FleetDeviceDrawer"
import { FleetFilters, applyFilters, DEFAULT_FILTERS } from "@/features/fleet/FleetFilters"
import { getDeviceTimeline } from "@/features/fleet/query"
import type { FleetDevice } from "@/features/fleet/types"
import type { FleetFilterState } from "@/features/fleet/FleetFilters"

const THERMAL_CRITICAL = new Set(["serious", "critical"])
const ONLINE_MS = 5 * 60 * 1000

function isOnline(device: FleetDevice): boolean {
  if (!device.last_seen_at) return false
  return Date.now() - new Date(device.last_seen_at).getTime() < ONLINE_MS
}

function deviceStatusColor(status?: string | null) {
  if (status === "SUSPENDED") return "var(--color-warning)"
  if (status === "REVOKED") return "var(--color-error)"
  return "var(--color-success)"
}

function deviceStatusLabel(status?: string | null) {
  if (status === "SUSPENDED") return "Suspenso"
  if (status === "REVOKED") return "Revogado"
  return "Ativo"
}

function thermalBadge(state: string | null | undefined) {
  if (!state || state === "nominal") return null
  const map: Record<string, { label: string; color: string }> = {
    fair: { label: "🌡️ Morno", color: "var(--color-warning)" },
    serious: { label: "🌡️ Quente", color: "#f97316" },
    critical: { label: "🌡️ Crítico", color: "var(--color-error)" },
    emergency: { label: "🌡️ Emergência", color: "var(--color-error)" },
    shutdown: { label: "🌡️ Desligando", color: "var(--color-error)" },
  }
  return map[state] ?? null
}

function isBatteryCritical(device: FleetDevice): boolean {
  return device.battery_level !== null && device.battery_level < 20 && !device.is_charging
}

function isThermalCritical(device: FleetDevice): boolean {
  return THERMAL_CRITICAL.has(device.thermal_state ?? "")
}

export function DeviceTable({ devices }: { devices: FleetDevice[] }) {
  const [selected, setSelected] = useState<FleetDevice | null>(null)
  const [filters, setFilters] = useState<FleetFilterState>(DEFAULT_FILTERS)

  const filtered = useMemo(() => applyFilters(devices, filters), [devices, filters])

  return (
    <>
      <style>{`
        .device-row { transition: background 0.15s; cursor: pointer; }
        .device-row:hover { background: var(--color-surface-offset); }
        .fleet-filter-wrap select, .fleet-filter-wrap button {
          height: 2rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
          background: var(--color-surface);
          color: var(--color-text);
          padding: 0 0.625rem;
          font-size: 0.8125rem;
        }
        .fleet-filter-wrap button {
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .fleet-filter-wrap button:hover {
          background: var(--color-surface-offset);
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="fleet-filter-wrap">
          <FleetFilters devices={devices} value={filters} onChange={setFilters} />
        </div>

        {filtered.length !== devices.length && (
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            Exibindo {filtered.length} de {devices.length} dispositivos
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Dispositivo', 'Marca / Modelo', 'Android', 'Sub-licença', 'Telemetria', 'Rede', 'Bitrate', 'Sessões', 'Status', 'Último acesso'].map(col => (
                  <th key={col} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted)', whiteSpace: 'nowrap', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    Nenhum device encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}

              {filtered.map((device, i) => {
                const lastSeenAt = device.last_seen_at ? new Date(device.last_seen_at) : null
                const minutesAgo = lastSeenAt ? Math.floor((Date.now() - lastSeenAt.getTime()) / 60000) : null
                const online = isOnline(device)
                const thermal = thermalBadge(device.thermal_state)
                const batteryCritical = isBatteryCritical(device)
                const thermalCritical = isThermalCritical(device)

                return (
                  <tr
                    key={device.id}
                    className="device-row"
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : 'none' }}
                    onClick={() => setSelected(device)}
                  >
                    <td style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div style={{ width: 30, height: 30, borderRadius: 'var(--radius-sm)', background: 'rgba(1,105,111,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', flexShrink: 0 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="5" y="2" width="14" height="20" rx="2"/>
                            <path d="M12 18h.01"/>
                          </svg>
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{device.device_name || device.device_model || 'Android'}</div>
                          {device.streaming_now && (
                            <div style={{ fontSize: '0.65rem', color: 'var(--color-error)', fontWeight: 700 }}>● AO VIVO</div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '0.75rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      {[device.device_brand, device.device_model].filter(Boolean).join(' ') || '—'}
                    </td>

                    <td style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}>
                      {device.android_version
                        ? <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', background: 'rgba(1,105,111,0.08)', color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 600 }}>Android {device.android_version}</span>
                        : <span style={{ color: 'var(--color-text-faint)' }}>—</span>}
                    </td>

                    <td style={{ padding: '0.75rem' }}>
                      {device.sub_license_key
                        ? <code style={{ fontSize: '0.7rem', background: 'var(--color-surface-offset)', padding: '0.15rem 0.4rem', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-muted)', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{device.sub_license_key}</code>
                        : <span style={{ color: 'var(--color-text-faint)' }}>—</span>}
                    </td>

                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        {device.battery_level !== null && device.battery_level !== undefined && (
                          <span style={{
                            fontSize: '0.68rem', padding: '0.1rem 0.4rem', borderRadius: 999,
                            background: batteryCritical ? 'rgba(239,68,68,0.1)' : 'var(--color-surface-offset)',
                            color: batteryCritical ? 'var(--color-error)' : 'var(--color-text-muted)',
                            border: `1px solid ${batteryCritical ? 'rgba(239,68,68,0.3)' : 'var(--color-border)'}`,
                            fontWeight: batteryCritical ? 700 : 500,
                          }}>
                            🔋 {device.battery_level}%{device.is_charging ? ' ⚡' : ''}
                          </span>
                        )}
                        {thermal && (
                          <span style={{
                            fontSize: '0.68rem', padding: '0.1rem 0.4rem', borderRadius: 999,
                            background: thermalCritical ? 'rgba(239,68,68,0.08)' : 'var(--color-surface-offset)',
                            color: thermal.color,
                            border: `1px solid ${thermal.color}44`,
                            fontWeight: thermalCritical ? 700 : 500,
                          }}>
                            {thermal.label}
                          </span>
                        )}
                        {!device.battery_level && !thermal && (
                          <span style={{ color: 'var(--color-text-faint)', fontSize: '0.75rem' }}>—</span>
                        )}
                      </div>
                    </td>

                    <td style={{ padding: '0.75rem', whiteSpace: 'nowrap', color: 'var(--color-text-muted)' }}>
                      {device.network_type ? (
                        <span>
                          📶 {device.network_type.toUpperCase()}
                          {device.network_strength !== null && device.network_strength !== undefined && (
                            <span style={{ marginLeft: 4, fontSize: '0.75rem', color: 'var(--color-text-faint)' }}>({device.network_strength}/4)</span>
                          )}
                        </span>
                      ) : '—'}
                    </td>

                    <td style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}>
                      {device.last_bitrate_kbps !== null && device.last_bitrate_kbps !== undefined
                        ? <span style={{ color: 'var(--color-text)' }}>{device.last_bitrate_kbps} kbps</span>
                        : <span style={{ color: 'var(--color-text-faint)' }}>—</span>}
                    </td>

                    <td style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}>
                      <span style={{ color: 'var(--color-text)' }}>{device.stream_session_count ?? 0}</span>
                      <span style={{ color: 'var(--color-text-muted)', marginLeft: 4, fontSize: '0.75rem' }}>
                        ({Math.round((device.total_stream_seconds ?? 0) / 60)}min)
                      </span>
                    </td>

                    <td style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600, color: deviceStatusColor(device.status) }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: deviceStatusColor(device.status), display: 'inline-block' }} />
                        {device.streaming_now ? 'Streaming' : online ? 'Online' : deviceStatusLabel(device.status)}
                      </span>
                    </td>

                    <td style={{ padding: '0.75rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
                      {lastSeenAt
                        ? online
                          ? <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>● {minutesAgo === 0 ? 'Agora' : `há ${minutesAgo}min`}</span>
                          : lastSeenAt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
                        : device.last_seen
                          ? new Date(device.last_seen).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <FleetDeviceDrawer
        device={selected}
        onClose={() => setSelected(null)}
        onLoadTimeline={getDeviceTimeline}
      />
    </>
  )
}
