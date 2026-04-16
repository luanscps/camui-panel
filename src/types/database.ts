export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          is_admin: boolean
          created_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          is_admin?: boolean
          created_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          is_admin?: boolean
          created_at?: string | null
        }
      }
      licenses: {
        Row: {
          id: string
          user_id: string
          plan: string
          status: string
          expires_at: string | null
          max_devices: number
          license_key: string | null
          account_number: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          plan?: string
          status?: string
          expires_at?: string | null
          max_devices?: number
          license_key?: string | null
          account_number: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          plan?: string
          status?: string
          expires_at?: string | null
          max_devices?: number
          license_key?: string | null
          account_number?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      device_activations: {
        Row: {
          id: string
          license_id: string
          device_id: string
          device_name: string | null
          device_brand: string | null
          device_model: string | null
          device_hardware: string | null
          android_version: string | null
          sdk_int: number | null
          android_id: string | null
          app_version: string | null
          fingerprint: string | null
          sub_license_key: string | null
          status: string
          phone_image_url: string | null
          phone_specs: Json | null
          mobileapi_device_id: number | null
          activated_at: string | null
          last_seen_at: string | null
          last_seen: string | null
        }
        Insert: {
          id?: string
          license_id: string
          device_id: string
          device_name?: string | null
          device_brand?: string | null
          device_model?: string | null
          device_hardware?: string | null
          android_version?: string | null
          sdk_int?: number | null
          android_id?: string | null
          app_version?: string | null
          fingerprint?: string | null
          sub_license_key?: string | null
          status?: string
          phone_image_url?: string | null
          phone_specs?: Json | null
          mobileapi_device_id?: number | null
          activated_at?: string | null
          last_seen_at?: string | null
          last_seen?: string | null
        }
        Update: {
          id?: string
          license_id?: string
          device_id?: string
          device_name?: string | null
          device_brand?: string | null
          device_model?: string | null
          device_hardware?: string | null
          android_version?: string | null
          sdk_int?: number | null
          android_id?: string | null
          app_version?: string | null
          fingerprint?: string | null
          sub_license_key?: string | null
          status?: string
          phone_image_url?: string | null
          phone_specs?: Json | null
          mobileapi_device_id?: number | null
          activated_at?: string | null
          last_seen_at?: string | null
          last_seen?: string | null
        }
      }
      plan_features: {
        Row: {
          plan: string
          max_rtmp_outputs: number
          max_resolution: string
          max_bitrate_kbps: number
          web_control: boolean
          local_recording: boolean
          max_stream_minutes: number
          front_camera: boolean
          max_devices: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          plan: string
          max_rtmp_outputs?: number
          max_resolution?: string
          max_bitrate_kbps?: number
          web_control?: boolean
          local_recording?: boolean
          max_stream_minutes?: number
          front_camera?: boolean
          max_devices?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          plan?: string
          max_rtmp_outputs?: number
          max_resolution?: string
          max_bitrate_kbps?: number
          web_control?: boolean
          local_recording?: boolean
          max_stream_minutes?: number
          front_camera?: boolean
          max_devices?: number
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      admin_users_overview: {
        Row: {
          id: string | null
          email: string | null
          full_name: string | null
          is_admin: boolean | null
          registered_at: string | null
          last_sign_in_at: string | null
          email_confirmed_at: string | null
          license_id: string | null
          plan: string | null
          license_status: string | null
          max_devices: number | null
          expires_at: string | null
          active_devices_count: number | null
        }
      }
      admin_license_stats: {
        Row: {
          total_users: number | null
          total_basic: number | null
          total_pro: number | null
          total_active: number | null
          total_suspended: number | null
          total_expired: number | null
          total_devices: number | null
        }
      }
    }
    Functions: {}
    Enums: {}
  }
}

// Helpers de conveniência
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Views<T extends keyof Database['public']['Views']> =
  Database['public']['Views'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']