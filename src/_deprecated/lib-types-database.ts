// ARQUIVO OBSOLETO — movido de src/lib/types/database.ts
// Mantido apenas como referência histórica
// NÃO importar este arquivo — use src/types/database.ts

export type Plan = 'BASIC' | 'PRO'
export type LicenseStatus = 'ACTIVE' | 'SUSPENDED' | 'EXPIRED'

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

export interface License {
  id: string
  user_id: string
  plan: Plan
  status: LicenseStatus
  expires_at: string | null
  max_devices: number
  created_at: string
  updated_at: string
}

export interface DeviceActivation {
  id: string
  license_id: string
  device_id: string
  device_name: string | null
  activated_at: string
  last_seen_at: string
}

export interface LicenseValidationResult {
  valid: boolean
  plan?: Plan
  expires_at?: string | null
  features?: {
    rtmp_enabled: boolean
    max_profiles: number
    overlay: boolean
  }
  reason?: 'no_active_license' | 'device_limit_reached'
  max_devices?: number
}
