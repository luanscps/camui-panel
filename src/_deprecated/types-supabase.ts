// ARQUIVO OBSOLETO — movido de src/types/supabase.ts
// Mantido apenas como referência histórica
// NÃO importar este arquivo — use src/types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      device_activations: {
        Row: {
          activated_at: string | null
          device_id: string
          device_name: string | null
          id: string
          last_seen_at: string | null
          license_id: string
        }
        Insert: {
          activated_at?: string | null
          device_id: string
          device_name?: string | null
          id?: string
          last_seen_at?: string | null
          license_id: string
        }
        Update: {
          activated_at?: string | null
          device_id?: string
          device_name?: string | null
          id?: string
          last_seen_at?: string | null
          license_id?: string
        }
        Relationships: []
      }
      licenses: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          max_devices: number
          plan: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          max_devices?: number
          plan?: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          max_devices?: number
          plan?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          is_admin: boolean
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          is_admin?: boolean
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean
        }
        Relationships: []
      }
    }
    Views: {}
    Functions: {
      validate_license: { Args: { p_device_id: string }; Returns: Json }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
