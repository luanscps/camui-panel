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

// Tipo generico do banco (para o cliente Supabase tipado)
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at'> & { created_at?: string }
        Update: Partial<Omit<Profile, 'id'>>
      }
      licenses: {
        Row: License
        Insert: Omit<License, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Omit<License, 'id' | 'user_id'>>
      }
      device_activations: {
        Row: DeviceActivation
        Insert: Omit<DeviceActivation, 'id' | 'activated_at' | 'last_seen_at'> & { id?: string; activated_at?: string; last_seen_at?: string }
        Update: Partial<Omit<DeviceActivation, 'id'>>
      }
    }
    Functions: {
      validate_license: {
        Args: { p_device_id: string }
        Returns: LicenseValidationResult
      }
    }
  }
}
