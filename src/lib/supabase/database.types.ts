export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
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
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      device_activations: {
        Row: {
          activated_at: string | null
          android_id: string | null
          android_version: string | null
          app_version: string | null
          cameras: Json | null
          device_brand: string | null
          device_hardware: string | null
          device_id: string
          device_model: string | null
          device_name: string | null
          fingerprint: string | null
          id: string
          last_app_version: string | null
          last_seen: string | null
          last_seen_at: string | null
          license_id: string
          local_ip: string | null
          mobileapi_device_id: number | null
          network_type: string | null
          phone_image_url: string | null
          phone_specs: Json | null
          public_ip: string | null
          sdk_int: number | null
          status: string
          stream_started_at: string | null
          streaming_now: boolean
          sub_license_key: string
        }
        Insert: {
          activated_at?: string | null
          android_id?: string | null
          android_version?: string | null
          app_version?: string | null
          cameras?: Json | null
          device_brand?: string | null
          device_hardware?: string | null
          device_id: string
          device_model?: string | null
          device_name?: string | null
          fingerprint?: string | null
          id?: string
          last_app_version?: string | null
          last_seen?: string | null
          last_seen_at?: string | null
          license_id: string
          local_ip?: string | null
          mobileapi_device_id?: number | null
          network_type?: string | null
          phone_image_url?: string | null
          phone_specs?: Json | null
          public_ip?: string | null
          sdk_int?: number | null
          status?: string
          stream_started_at?: string | null
          streaming_now?: boolean
          sub_license_key: string
        }
        Update: {
          activated_at?: string | null
          android_id?: string | null
          android_version?: string | null
          app_version?: string | null
          cameras?: Json | null
          device_brand?: string | null
          device_hardware?: string | null
          device_id?: string
          device_model?: string | null
          device_name?: string | null
          fingerprint?: string | null
          id?: string
          last_app_version?: string | null
          last_seen?: string | null
          last_seen_at?: string | null
          license_id?: string
          local_ip?: string | null
          mobileapi_device_id?: number | null
          network_type?: string | null
          phone_image_url?: string | null
          phone_specs?: Json | null
          public_ip?: string | null
          sdk_int?: number | null
          status?: string
          stream_started_at?: string | null
          streaming_now?: boolean
          sub_license_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_activations_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "admin_users_overview"
            referencedColumns: ["license_id"]
          },
          {
            foreignKeyName: "device_activations_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
        ]
      }
      licenses: {
        Row: {
          account_number: string
          created_at: string | null
          expires_at: string | null
          id: string
          license_key: string | null
          max_devices: number
          plan: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_number: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          license_key?: string | null
          max_devices?: number
          plan?: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_number?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          license_key?: string | null
          max_devices?: number
          plan?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "licenses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "admin_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          device_id: string | null
          id: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          device_id?: string | null
          id?: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          device_id?: string | null
          id?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "device_activations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_features: {
        Row: {
          created_at: string | null
          front_camera: boolean
          local_recording: boolean
          max_bitrate_kbps: number
          max_devices: number
          max_resolution: string
          max_rtmp_outputs: number
          max_stream_minutes: number | null
          plan: string
          updated_at: string | null
          web_control: boolean
        }
        Insert: {
          created_at?: string | null
          front_camera?: boolean
          local_recording?: boolean
          max_bitrate_kbps?: number
          max_devices?: number
          max_resolution?: string
          max_rtmp_outputs?: number
          max_stream_minutes?: number | null
          plan: string
          updated_at?: string | null
          web_control?: boolean
        }
        Update: {
          created_at?: string | null
          front_camera?: boolean
          local_recording?: boolean
          max_bitrate_kbps?: number
          max_devices?: number
          max_resolution?: string
          max_rtmp_outputs?: number
          max_stream_minutes?: number | null
          plan?: string
          updated_at?: string | null
          web_control?: boolean
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
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "admin_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      remote_commands: {
        Row: {
          command: string
          created_at: string
          delivered_at: string | null
          device_id: string
          executed_at: string | null
          id: string
          payload: Json | null
          status: string
        }
        Insert: {
          command: string
          created_at?: string
          delivered_at?: string | null
          device_id: string
          executed_at?: string | null
          id?: string
          payload?: Json | null
          status?: string
        }
        Update: {
          command?: string
          created_at?: string
          delivered_at?: string | null
          device_id?: string
          executed_at?: string | null
          id?: string
          payload?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "remote_commands_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "device_activations"
            referencedColumns: ["id"]
          },
        ]
      }
      stream_sessions: {
        Row: {
          bitrate_kbps: number | null
          device_id: string
          duration_sec: number | null
          ended_at: string | null
          error_msg: string | null
          id: string
          resolution: string | null
          rtmp_url: string | null
          started_at: string
        }
        Insert: {
          bitrate_kbps?: number | null
          device_id: string
          duration_sec?: number | null
          ended_at?: string | null
          error_msg?: string | null
          id?: string
          resolution?: string | null
          rtmp_url?: string | null
          started_at?: string
        }
        Update: {
          bitrate_kbps?: number | null
          device_id?: string
          duration_sec?: number | null
          ended_at?: string | null
          error_msg?: string | null
          id?: string
          resolution?: string | null
          rtmp_url?: string | null
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stream_sessions_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "device_activations"
            referencedColumns: ["id"]
          },
        ]
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
      fleet_dashboard: {
        Row: {
          active_devices: number | null
          last_activity: string | null
          online_now: number | null
          streaming_now: number | null
          suspended_devices: number | null
          total_devices: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "licenses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "admin_users_overview"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      device_heartbeat: {
        Args: {
          p_app_version?: string
          p_local_ip?: string
          p_network_type?: string
          p_streaming_now?: boolean
          p_sub_license_key: string
        }
        Returns: Json
      }
      is_admin: { Args: never; Returns: boolean }
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
