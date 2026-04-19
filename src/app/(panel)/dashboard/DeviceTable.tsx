"use client"

import { useState } from "react"
import { FleetDeviceDrawer } from "@/features/fleet/FleetDeviceDrawer"
import { getDeviceTimeline } from "@/features/fleet/query"
import type { FleetDevice } from "@/features/fleet/types"

type Device = {
  id: string
  license_id: string
  device_name?:     string | null
  device_brand?:    string | null
  device_model?:    string | null
  android_version?: string | null
  android_id?:      string | null
  sub_license_key?: string | null
  status?:          string | null
  activated_at:     string
  last_seen:        string | null
  streaming_now?:   boolean
  battery_level?:   number | null
  thermal_state?:   string | null
  network_type?:    string | null
  last_seen_at?:    string | null
}

function deviceStatusColor(status?: string | null) {
  if (status === 'SUSPENDED') return 'var(--color-warning)'
  if (status === 'REVOKED')   return 'var(--color-error)'
  return 'var(--color-success)'
}

function deviceStatusLabel(status?: string | null) {
  if (status === 'SUSPENDED') return 'Suspenso'
  if (status === 'REVOKED')   return 'Revogado'
  return 'Ativo'
}

function thermalBadge(state: string | null | undefined) {
  if (!state || state === 'nominal') return null
  const map: Record<string, { label: string; color: string }> = {
    fair:      { label: '🌡️ Morno',      color: 'var(--color-warning)' },
    serious:   { label: '🌡️ Quente',     color: '#f97316' },
    critical:  { label: '🌡️ Crítico',    color: 'var(--color-error)' },
    emergency: { label: '🌡️ Emergência', color: 'var(--color-error)' },
    shutdown:  { label: '🌡️ Desligando', color: 'var(--color-error)' },
  }
  return map[state] ?? null
}

export function DeviceTable({ devices }: { devices: Device[] }) {
  const [selected, setSelected] = useState<FleetDevice | null>(null)

  return (
    <>
      <style>{`
        .device-row { transition: background 0.15s; cursor: pointer; }
        .device-row:hover { background: var(--color-surface-offset); }
      `}</style>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              {['Dispositivo', 'Marca / Modelo', 'Android', 'Sub-licença', 'Telemetria', 'Status', 'Último acesso'].map(col => (
                <th key={col} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted)', whiteSpace: 'nowrap', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {devices.map((device, i) => {
              const lastSeenAt = device.last_seen_at ? new Date(device.last_seen_at) : null
              const minutesAgo = lastSeenAt ? Math.floor((Date.now() - lastSeenAt.getTime()) / 60000) : null
              const isOnline   = minutesAgo !== null && minutesAgo < 5
              const thermal    = thermalBadge(device.thermal_state)

              return (
                <tr
                  key={device.id}
                  className="device-row"
                  style={{ borderBottom: i < devices.length - 1 ? '1px solid var(--color-border)' : 'none' }}
                  onClick={() => setSelected(device as unknown as FleetDevice)}
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
                        <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{device.device_name || 'Android'}</div>
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
                        <span style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem', borderRadius: 999, background: device.battery_level < 20 ? 'rgba(239,68,68,0.1)' : 'var(--color-surface-offset)', color: device.battery_level < 20 ? 'var(--color-error)' : 'var(--color-text-muted)', border: `1px solid ${device.battery_level < 20 ? 'rgba(239,68,68,0.3)' : 'var(--color-border)'}` }}>
                          🔋 {device.battery_level}%
                        </span>
                      )}
                      {device.network_type && (
                        <span style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem', borderRadius: 999, background: 'var(--color-surface-offset)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
                          📶 {device.network_type.toUpperCase()}
                        </span>
                      )}
                      {thermal && (
                        <span style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem', borderRadius: 999, background: 'var(--color-surface-offset)', color: thermal.color, border: `1px solid ${thermal.color}44` }}>
                          {thermal.label}
                        </span>
                      )}
                      {!device.battery_level && !device.network_type && !thermal && (
                        <span style={{ color: 'var(--color-text-faint)', fontSize: '0.75rem' }}>—</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600, color: deviceStatusColor(device.status) }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: deviceStatusColor(device.status), display: 'inline-block' }} />
                      {deviceStatusLabel(device.status)}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
                    {lastSeenAt
                      ? isOnline
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

      {/* Drawer — fora da tabela para overlay correto */}
      <FleetDeviceDrawer
        device={selected}
        onClose={() => setSelected(null)}
        onLoadTimeline={getDeviceTimeline}
      />
    </>
  )
}
