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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      green_champions: {
        Row: {
          appointed_at: string | null
          area_assigned: string
          id: string
          is_active: boolean | null
          responsibilities: string[] | null
          user_id: string
        }
        Insert: {
          appointed_at?: string | null
          area_assigned: string
          id?: string
          is_active?: boolean | null
          responsibilities?: string[] | null
          user_id: string
        }
        Update: {
          appointed_at?: string | null
          area_assigned?: string
          id?: string
          is_active?: boolean | null
          responsibilities?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      incentives: {
        Row: {
          awarded_by: string | null
          created_at: string | null
          id: string
          points: number | null
          reason: string | null
          user_id: string
        }
        Insert: {
          awarded_by?: string | null
          created_at?: string | null
          id?: string
          points?: number | null
          reason?: string | null
          user_id: string
        }
        Update: {
          awarded_by?: string | null
          created_at?: string | null
          id?: string
          points?: number | null
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          full_name: string
          id: string
          is_verified: boolean | null
          phone: string | null
          pincode: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          state: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          full_name: string
          id?: string
          is_verified?: boolean | null
          phone?: string | null
          pincode?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          state?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          is_verified?: boolean | null
          phone?: string | null
          pincode?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          state?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      training_modules: {
        Row: {
          content: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_mandatory: boolean | null
          target_role: Database["public"]["Enums"]["user_role"]
          title: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_mandatory?: boolean | null
          target_role: Database["public"]["Enums"]["user_role"]
          title: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_mandatory?: boolean | null
          target_role?: Database["public"]["Enums"]["user_role"]
          title?: string
        }
        Relationships: []
      }
      training_progress: {
        Row: {
          completed_at: string | null
          id: string
          module_id: string
          score: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["training_status"] | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          module_id: string
          score?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["training_status"] | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          module_id?: string
          score?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["training_status"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      waste_facilities: {
        Row: {
          address: string
          capacity_tons: number | null
          city: string
          contact_person: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          type: Database["public"]["Enums"]["facility_type"]
        }
        Insert: {
          address: string
          capacity_tons?: number | null
          city: string
          contact_person?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          type: Database["public"]["Enums"]["facility_type"]
        }
        Update: {
          address?: string
          capacity_tons?: number | null
          city?: string
          contact_person?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          type?: Database["public"]["Enums"]["facility_type"]
        }
        Relationships: []
      }
      waste_reports: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          description: string | null
          id: string
          latitude: number | null
          location: string
          longitude: number | null
          photo_url: string | null
          reporter_id: string
          resolved_at: string | null
          status: string | null
          title: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          latitude?: number | null
          location: string
          longitude?: number | null
          photo_url?: string | null
          reporter_id: string
          resolved_at?: string | null
          status?: string | null
          title: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          latitude?: number | null
          location?: string
          longitude?: number | null
          photo_url?: string | null
          reporter_id?: string
          resolved_at?: string | null
          status?: string | null
          title?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      facility_type:
        | "biomethanization"
        | "waste_to_energy"
        | "recycling"
        | "scrap_collection"
      training_status: "not_started" | "in_progress" | "completed"
      user_role: "citizen" | "waste_worker" | "green_champion" | "admin"
      waste_type: "dry" | "wet" | "hazardous"
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
  public: {
    Enums: {
      facility_type: [
        "biomethanization",
        "waste_to_energy",
        "recycling",
        "scrap_collection",
      ],
      training_status: ["not_started", "in_progress", "completed"],
      user_role: ["citizen", "waste_worker", "green_champion", "admin"],
      waste_type: ["dry", "wet", "hazardous"],
    },
  },
} as const
