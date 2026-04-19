export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  graphql_public: {
    Tables: { [_ in never]: never }
    Views: { [_ in never]: never }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
  public: {
    Tables: {
      device_activations: {
        Row: {
          activated_at: string | null
          android_id: string | null
          android_version: string | null
          app_build_number: number | null
          app_version: string | null
          battery_level: number | null
          camera_summary: Json | null
          cameras: Json | null
          current_protocol: string
          device_brand: string | null
          device_hardware: string | null
          device_id: string
          device_model: string | null
          device_name: string | null
          fingerprint: string | null
          id: string
          is_charging: boolean | null
          last_app_version: string | null
          last_bitrate_kbps: number | null
          last_rtmp_url: string | null
          last_seen: string | null
          last_seen_at: string | null
          last_stream_error: string | null
          license_id: string
          local_ip: string | null
          mobileapi_device_id: number | null
          network_strength: number | null
          network_type: string | null
          phone_image_url: string | null
          phone_specs: Json | null
          public_ip: string | null
          sdk_int: number | null
          status: string
          stream_ended_at: string | null
          stream_session_count: number
          stream_started_at: string | null
          streaming_now: boolean
          sub_license_key: string
          thermal_state: string | null
          total_stream_seconds: number
        }
        Insert: {
          activated_at?: string | null
          android_id?: string | null
          android_version?: string | null
          app_build_number?: number | null
          app_version?: string | null
          battery_level?: number | null
          camera_summary?: Json | null
          cameras?: Json | null
          current_protocol?: string
          device_brand?: string | null
          device_hardware?: string | null
          device_id: string
          device_model?: string | null
          device_name?: string | null
          fingerprint?: string | null
          id?: string
          is_charging?: boolean | null
          last_app_version?: string | null
          last_bitrate_kbps?: number | null
          last_rtmp_url?: string | null
          last_seen?: string | null
          last_seen_at?: string | null
          last_stream_error?: string | null
          license_id: string
          local_ip?: string | null
          mobileapi_device_id?: number | null
          network_strength?: number | null
          network_type?: string | null
          phone_image_url?: string | null
          phone_specs?: Json | null
          public_ip?: string | null
          sdk_int?: number | null
          status?: string
          stream_ended_at?: string | null
          stream_session_count?: number
          stream_started_at?: string | null
          streaming_now?: boolean
          sub_license_key: string
          thermal_state?: string | null
          total_stream_seconds?: number
        }
        Update: {
          activated_at?: string | null
          android_id?: string | null
          android_version?: string | null
          app_build_number?: number | null
          app_version?: string | null
          battery_level?: number | null
          camera_summary?: Json | null
          cameras?: Json | null
          current_protocol?: string
          device_brand?: string | null
          device_hardware?: string | null
          device_id?: string
          device_model?: string | null
          device_name?: string | null
          fingerprint?: string | null
          id?: string
          is_charging?: boolean | null
          last_app_version?: string | null
          last_bitrate_kbps?: number | null
          last_rtmp_url?: string | null
          last_seen?: string | null
          last_seen_at?: string | null
          last_stream_error?: string | null
          license_id?: string
          local_ip?: string | null
          mobileapi_device_id?: number | null
          network_strength?: number | null
          network_type?: string | null
          phone_image_url?: string | null
          phone_specs?: Json | null
          public_ip?: string | null
          sdk_int?: number | null
          status?: string
          stream_ended_at?: string | null
          stream_session_count?: number
          stream_started_at?: string | null
          streaming_now?: boolean
          sub_license_key?: string
          thermal_state?: string | null
          total_stream_seconds?: number
        }
        Relationships: []
      }
      remote_commands: {
        Row: {
          id: string
          device_id: string
          issued_by: string | null
          command: string
          payload: Json | null
          status: string
          issued_at: string
          delivered_at: string | null
          executed_at: string | null
          expires_at: string
          result: Json | null
          error_message: string | null
        }
        Insert: {
          id?: string
          device_id: string
          issued_by?: string | null
          command: string
          payload?: Json | null
          status?: string
          issued_at?: string
          delivered_at?: string | null
          executed_at?: string | null
          expires_at?: string
          result?: Json | null
          error_message?: string | null
        }
        Update: {
          id?: string
          device_id?: string
          issued_by?: string | null
          command?: string
          payload?: Json | null
          status?: string
          issued_at?: string
          delivered_at?: string | null
          executed_at?: string | null
          expires_at?: string
          result?: Json | null
          error_message?: string | null
        }
        Relationships: []
      }
      stream_sessions: {
        Row: {
          id: string
          device_id: string
          protocol: string
          rtmp_url: string | null
          started_at: string
          ended_at: string | null
          duration_seconds: number | null
          avg_bitrate_kbps: number | null
          peak_bitrate_kbps: number | null
          resolution: string | null
          fps: number | null
          end_reason: string | null
          error_message: string | null
          bytes_sent: number | null
          frames_sent: number | null
          frames_dropped: number | null
          created_at: string
        }
        Insert: {
          id?: string
          device_id: string
          protocol?: string
          rtmp_url?: string | null
          started_at?: string
          ended_at?: string | null
          avg_bitrate_kbps?: number | null
          peak_bitrate_kbps?: number | null
          resolution?: string | null
          fps?: number | null
          end_reason?: string | null
          error_message?: string | null
          bytes_sent?: number | null
          frames_sent?: number | null
          frames_dropped?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          device_id?: string
          protocol?: string
          rtmp_url?: string | null
          started_at?: string
          ended_at?: string | null
          avg_bitrate_kbps?: number | null
          peak_bitrate_kbps?: number | null
          resolution?: string | null
          fps?: number | null
          end_reason?: string | null
          error_message?: string | null
          bytes_sent?: number | null
          frames_sent?: number | null
          frames_dropped?: number | null
          created_at?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          id: string
          performed_by: string | null
          target_type: string
          target_id: string
          action: string
          details: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          performed_by?: string | null
          target_type: string
          target_id: string
          action: string
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          performed_by?: string | null
          target_type?: string
          target_id?: string
          action?: string
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          body: string | null
          device_id: string | null
          license_id: string | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          body?: string | null
          device_id?: string | null
          license_id?: string | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          body?: string | null
          device_id?: string | null
          license_id?: string | null
          read?: boolean
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      fleet_dashboard: {
        Row: {
          device_id: string | null
          license_id: string | null
          user_id: string | null
          plan: string | null
          license_status: string | null
          expires_at: string | null
          device_name: string | null
          device_brand: string | null
          device_model: string | null
          android_version: string | null
          app_version: string | null
          app_build_number: number | null
          device_status: string | null
          sub_license_key: string | null
          streaming_now: boolean | null
          current_protocol: string | null
          last_rtmp_url: string | null
          stream_started_at: string | null
          last_bitrate_kbps: number | null
          last_stream_error: string | null
          total_stream_seconds: number | null
          stream_session_count: number | null
          battery_level: number | null
          is_charging: boolean | null
          thermal_state: string | null
          network_type: string | null
          network_strength: number | null
          last_seen_at: string | null
          activated_at: string | null
          phone_image_url: string | null
          phone_specs: Json | null
          cameras: Json | null
          camera_summary: Json | null
          is_online: boolean | null
          battery_critical: boolean | null
          thermal_critical: boolean | null
          sessions_last_24h: number | null
          stream_seconds_last_24h: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      device_heartbeat: {
        Args: {
          p_sub_license_key: string
          p_streaming_now?: boolean
          p_rtmp_url?: string
          p_bitrate_kbps?: number
          p_battery_level?: number
          p_is_charging?: boolean
          p_thermal_state?: string
          p_network_type?: string
          p_network_strength?: number
          p_stream_error?: string
        }
        Returns: Json
      }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
