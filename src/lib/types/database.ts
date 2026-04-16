// Re-exporta os tipos gerados pelo CLI (fonte unica de verdade)
export type { Database, Json, Tables, TablesInsert, TablesUpdate, Enums } from '@/types/database'

// Tipos customizados mantidos para compatibilidade com o restante do projeto
export type Plan = 'BASIC' | 'PRO'
export type LicenseStatus = 'ACTIVE' | 'SUSPENDED' | 'EXPIRED'

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
