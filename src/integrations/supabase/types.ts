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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          career_goal: Database["public"]["Enums"]["career_goal"] | null
          created_at: string | null
          education_level: string | null
          full_name: string | null
          github_username: string | null
          id: string
          onboarding_completed: boolean | null
          resume_text: string | null
          target_role_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          career_goal?: Database["public"]["Enums"]["career_goal"] | null
          created_at?: string | null
          education_level?: string | null
          full_name?: string | null
          github_username?: string | null
          id?: string
          onboarding_completed?: boolean | null
          resume_text?: string | null
          target_role_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          career_goal?: Database["public"]["Enums"]["career_goal"] | null
          created_at?: string | null
          education_level?: string | null
          full_name?: string | null
          github_username?: string | null
          id?: string
          onboarding_completed?: boolean | null
          resume_text?: string | null
          target_role_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_target_role"
            columns: ["target_role_id"]
            isOneToOne: false
            referencedRelation: "target_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_recommendations: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty: string | null
          estimated_time: string | null
          id: string
          skills_covered: string[] | null
          title: string
          user_id: string
          why_this_project: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_time?: string | null
          id?: string
          skills_covered?: string[] | null
          title: string
          user_id: string
          why_this_project?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_time?: string | null
          id?: string
          skills_covered?: string[] | null
          title?: string
          user_id?: string
          why_this_project?: string | null
        }
        Relationships: []
      }
      roadmaps: {
        Row: {
          generated_at: string | null
          id: string
          phase_1: Json | null
          phase_2: Json | null
          phase_3: Json | null
          skill_match_percentage: number | null
          target_role_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          generated_at?: string | null
          id?: string
          phase_1?: Json | null
          phase_2?: Json | null
          phase_3?: Json | null
          skill_match_percentage?: number | null
          target_role_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          generated_at?: string | null
          id?: string
          phase_1?: Json | null
          phase_2?: Json | null
          phase_3?: Json | null
          skill_match_percentage?: number | null
          target_role_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roadmaps_target_role_id_fkey"
            columns: ["target_role_id"]
            isOneToOne: false
            referencedRelation: "target_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          aliases: string[] | null
          category: Database["public"]["Enums"]["skill_category"]
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          aliases?: string[] | null
          category: Database["public"]["Enums"]["skill_category"]
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          aliases?: string[] | null
          category?: Database["public"]["Enums"]["skill_category"]
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      target_roles: {
        Row: {
          category: Database["public"]["Enums"]["role_category"]
          created_at: string | null
          description: string | null
          id: string
          name: string
          required_skills: Json | null
        }
        Insert: {
          category: Database["public"]["Enums"]["role_category"]
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          required_skills?: Json | null
        }
        Update: {
          category?: Database["public"]["Enums"]["role_category"]
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          required_skills?: Json | null
        }
        Relationships: []
      }
      user_skills: {
        Row: {
          created_at: string | null
          id: string
          proficiency: Database["public"]["Enums"]["skill_proficiency"] | null
          skill_id: string
          source: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          proficiency?: Database["public"]["Enums"]["skill_proficiency"] | null
          skill_id: string
          source?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          proficiency?: Database["public"]["Enums"]["skill_proficiency"] | null
          skill_id?: string
          source?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      career_goal: "internship" | "full_time"
      experience_level: "beginner" | "intermediate" | "advanced"
      role_category: "tech" | "marketing" | "sales" | "hr" | "finance"
      skill_category:
        | "programming_languages"
        | "frameworks_libraries"
        | "tools_platforms"
        | "soft_skills"
        | "domain_specific"
        | "concepts"
      skill_proficiency: "missing" | "weak" | "strong"
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
      career_goal: ["internship", "full_time"],
      experience_level: ["beginner", "intermediate", "advanced"],
      role_category: ["tech", "marketing", "sales", "hr", "finance"],
      skill_category: [
        "programming_languages",
        "frameworks_libraries",
        "tools_platforms",
        "soft_skills",
        "domain_specific",
        "concepts",
      ],
      skill_proficiency: ["missing", "weak", "strong"],
    },
  },
} as const
