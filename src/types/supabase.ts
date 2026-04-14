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
    Views: {
      admin_license_stats: {
        Row: {
          total_active: number | null
          total_basic: number | null
          total_devices: number | null
          total_expired: number | null
          total_pro: number | null
          total_suspended: number | null
          total_users: number | null
        }
        Relationships: []
      }
      admin_users_overview: {
        Row: {
          active_devices_count: number | null
          email: string | null
          email_confirmed_at: string | null
          expires_at: string | null
          full_name: string | null
          id: string | null
          is_admin: boolean | null
          last_sign_in_at: string | null
          license_id: string | null
          license_status: string | null
          max_devices: number | null
          plan: string | null
          registered_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean }
      validate_license: { Args: { p_device_id: string }; Returns: Json }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
