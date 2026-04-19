"use client"

import { useTransition } from "react"
import type { FleetDevice } from "./types"

export type SortField = "last_seen_at" | "activated_at" | "device_name" | "battery_level"
export type SortDir   = "asc" | "desc"

export interface FleetFilterState {
  status:    "all" | "active" | "suspended"
  online:    "all" | "online" | "offline"
  streaming: "all" | "yes"
  brand:     string
  sort:      SortField
  dir:       SortDir
}

export const DEFAULT_FILTERS: FleetFilterState = {
  status:    "all",
  online:    "all",
  streaming: "all",
  brand:     "",
  sort:      "last_seen_at",
  dir:       "desc",
}

const ONLINE_MS = 5 * 60 * 1000
function isOnline(d: FleetDevice) {
  if (!d.last_seen_at) return false
  return Date.now() - new Date(d.last_seen_at).getTime() < ONLINE_MS
}

export function applyFilters(devices: FleetDevice[], f: FleetFilterState): FleetDevice[] {
  let result = devices

  if (f.status !== "all")
    result = result.filter(d => (d.status ?? "").toUpperCase() === f.status.toUpperCase())

  if (f.online === "online")  result = result.filter(isOnline)
  if (f.online === "offline") result = result.filter(d => !isOnline(d))

  if (f.streaming === "yes")  result = result.filter(d => d.streaming_now)

  if (f.brand)
    result = result.filter(d =>
      (d.device_brand ?? "").toLowerCase() === f.brand.toLowerCase()
    )

  result = [...result].sort((a, b) => {
    let va: string | number | null = null
    let vb: string | number | null = null

    if (f.sort === "last_seen_at") {
      va = a.last_seen_at ?? ""
      vb = b.last_seen_at ?? ""
    } else if (f.sort === "activated_at") {
      va = a.activated_at ?? ""
      vb = b.activated_at ?? ""
    } else if (f.sort === "device_name") {
      va = (a.device_name ?? a.device_model ?? "").toLowerCase()
      vb = (b.device_name ?? b.device_model ?? "").toLowerCase()
    } else if (f.sort === "battery_level") {
      va = a.battery_level ?? -1
      vb = b.battery_level ?? -1
    }

    if (va === null || va === undefined) return 1
    if (vb === null || vb === undefined) return -1
    if (va < vb) return f.dir === "asc" ? -1 : 1
    if (va > vb) return f.dir === "asc" ? 1 : -1
    return 0
  })

  return result
}

interface Props {
  devices:  FleetDevice[]
  value:    FleetFilterState
  onChange: (f: FleetFilterState) => void
}

export function FleetFilters({ devices, value: f, onChange }: Props) {
  const [, startTransition] = useTransition()

  const brands = Array.from(
    new Set(devices.map(d => d.device_brand).filter(Boolean) as string[])
  ).sort()

  function set<K extends keyof FleetFilterState>(key: K, val: FleetFilterState[K]) {
    startTransition(() => onChange({ ...f, [key]: val }))
  }

  const selClass =
    "h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"

  const isDirty = JSON.stringify(f) !== JSON.stringify(DEFAULT_FILTERS)

  return (
    <div className="flex flex-wrap gap-2 items-center">

      <select className={selClass} value={f.status}
        onChange={e => set("status", e.target.value as FleetFilterState["status"])}>
        <option value="all">Todos os status</option>
        <option value="active">Ativo</option>
        <option value="suspended">Suspenso</option>
      </select>

      <select className={selClass} value={f.online}
        onChange={e => set("online", e.target.value as FleetFilterState["online"])}>
        <option value="all">Online + Offline</option>
        <option value="online">Online</option>
        <option value="offline">Offline</option>
      </select>

      <select className={selClass} value={f.streaming}
        onChange={e => set("streaming", e.target.value as FleetFilterState["streaming"])}>
        <option value="all">Todos</option>
        <option value="yes">Streaming agora</option>
      </select>

      <select className={selClass} value={f.brand}
        onChange={e => set("brand", e.target.value)}>
        <option value="">Todas as marcas</option>
        {brands.map(b => <option key={b} value={b}>{b}</option>)}
      </select>

      <select className={selClass} value={f.sort}
        onChange={e => set("sort", e.target.value as SortField)}>
        <option value="last_seen_at">Último heartbeat</option>
        <option value="activated_at">Data de ativação</option>
        <option value="device_name">Nome</option>
        <option value="battery_level">Bateria</option>
      </select>

      <select className={selClass} value={f.dir}
        onChange={e => set("dir", e.target.value as SortDir)}>
        <option value="desc">↓ Decrescente</option>
        <option value="asc">↑ Crescente</option>
      </select>

      {isDirty && (
        <button
          className="h-8 px-3 rounded-md text-sm text-muted-foreground hover:text-foreground border border-dashed border-input hover:border-foreground transition-colors"
          onClick={() => onChange(DEFAULT_FILTERS)}>
          Limpar filtros
        </button>
      )}
    </div>
  )
}
