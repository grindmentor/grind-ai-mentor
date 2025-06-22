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
      coach_conversations: {
        Row: {
          conversation_session: string
          created_at: string
          id: string
          message_content: string
          message_role: string
          user_id: string
        }
        Insert: {
          conversation_session: string
          created_at?: string
          id?: string
          message_content: string
          message_role: string
          user_id: string
        }
        Update: {
          conversation_session?: string
          created_at?: string
          id?: string
          message_content?: string
          message_role?: string
          user_id?: string
        }
        Relationships: []
      }
      customer_profiles: {
        Row: {
          created_at: string
          dietary_preferences: string | null
          display_name: string | null
          experience_level: string | null
          favorite_features: string[]
          fitness_goals: string | null
          id: string
          interaction_count: number
          last_active: string
          notes: string | null
          preferred_workout_style: string | null
          subscription_tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dietary_preferences?: string | null
          display_name?: string | null
          experience_level?: string | null
          favorite_features?: string[]
          fitness_goals?: string | null
          id?: string
          interaction_count?: number
          last_active?: string
          notes?: string | null
          preferred_workout_style?: string | null
          subscription_tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dietary_preferences?: string | null
          display_name?: string | null
          experience_level?: string | null
          favorite_features?: string[]
          fitness_goals?: string | null
          id?: string
          interaction_count?: number
          last_active?: string
          notes?: string | null
          preferred_workout_style?: string | null
          subscription_tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cut_calculations: {
        Row: {
          created_at: string
          current_bf_percentage: number | null
          current_weight: number
          estimated_duration_weeks: number
          id: string
          recommended_calories: number
          target_bf_percentage: number | null
          target_weight: number
          user_id: string
          weekly_deficit: number
        }
        Insert: {
          created_at?: string
          current_bf_percentage?: number | null
          current_weight: number
          estimated_duration_weeks: number
          id?: string
          recommended_calories: number
          target_bf_percentage?: number | null
          target_weight: number
          user_id: string
          weekly_deficit: number
        }
        Update: {
          created_at?: string
          current_bf_percentage?: number | null
          current_weight?: number
          estimated_duration_weeks?: number
          id?: string
          recommended_calories?: number
          target_bf_percentage?: number | null
          target_weight?: number
          user_id?: string
          weekly_deficit?: number
        }
        Relationships: []
      }
      food_log_entries: {
        Row: {
          calories: number | null
          carbs: number | null
          created_at: string
          fat: number | null
          fiber: number | null
          food_name: string
          id: string
          logged_date: string
          meal_type: string
          portion_size: string | null
          protein: number | null
          user_id: string
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          fat?: number | null
          fiber?: number | null
          food_name: string
          id?: string
          logged_date?: string
          meal_type: string
          portion_size?: string | null
          protein?: number | null
          user_id: string
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          fat?: number | null
          fiber?: number | null
          food_name?: string
          id?: string
          logged_date?: string
          meal_type?: string
          portion_size?: string | null
          protein?: number | null
          user_id?: string
        }
        Relationships: []
      }
      habit_completions: {
        Row: {
          completed_date: string
          created_at: string
          habit_id: string
          id: string
          user_id: string
        }
        Insert: {
          completed_date?: string
          created_at?: string
          habit_id: string
          id?: string
          user_id: string
        }
        Update: {
          completed_date?: string
          created_at?: string
          habit_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_completions_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          category: string
          color: string
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          color?: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          color?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      interaction_logs: {
        Row: {
          feature_used: string
          id: string
          interaction_type: string
          metadata: Json
          timestamp: string
          user_id: string
        }
        Insert: {
          feature_used: string
          id?: string
          interaction_type: string
          metadata?: Json
          timestamp?: string
          user_id: string
        }
        Update: {
          feature_used?: string
          id?: string
          interaction_type?: string
          metadata?: Json
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      meal_plans: {
        Row: {
          content: string
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
          user_requirements: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
          user_requirements?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
          user_requirements?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          payment_method: string
          status: string
          stripe_customer_id: string | null
          subscription_tier: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          payment_method: string
          status?: string
          stripe_customer_id?: string | null
          subscription_tier?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          payment_method?: string
          status?: string
          stripe_customer_id?: string | null
          subscription_tier?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activity: string | null
          birthday: string | null
          created_at: string
          display_name: string | null
          email: string
          experience: string | null
          goal: string | null
          height: number | null
          id: string
          updated_at: string
          weight: number | null
        }
        Insert: {
          activity?: string | null
          birthday?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          experience?: string | null
          goal?: string | null
          height?: number | null
          id: string
          updated_at?: string
          weight?: number | null
        }
        Update: {
          activity?: string | null
          birthday?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          experience?: string | null
          goal?: string | null
          height?: number | null
          id?: string
          updated_at?: string
          weight?: number | null
        }
        Relationships: []
      }
      progress_photos: {
        Row: {
          analysis_result: string | null
          created_at: string
          file_name: string
          file_url: string | null
          id: string
          notes: string | null
          photo_type: string | null
          taken_date: string
          user_id: string
          weight_at_time: number | null
        }
        Insert: {
          analysis_result?: string | null
          created_at?: string
          file_name: string
          file_url?: string | null
          id?: string
          notes?: string | null
          photo_type?: string | null
          taken_date?: string
          user_id: string
          weight_at_time?: number | null
        }
        Update: {
          analysis_result?: string | null
          created_at?: string
          file_name?: string
          file_url?: string | null
          id?: string
          notes?: string | null
          photo_type?: string | null
          taken_date?: string
          user_id?: string
          weight_at_time?: number | null
        }
        Relationships: []
      }
      progressive_overload_entries: {
        Row: {
          created_at: string
          exercise_name: string
          id: string
          notes: string | null
          reps: number
          rpe: number | null
          sets: number
          user_id: string
          weight: number
          workout_date: string
        }
        Insert: {
          created_at?: string
          exercise_name: string
          id?: string
          notes?: string | null
          reps: number
          rpe?: number | null
          sets: number
          user_id: string
          weight: number
          workout_date?: string
        }
        Update: {
          created_at?: string
          exercise_name?: string
          id?: string
          notes?: string | null
          reps?: number
          rpe?: number | null
          sets?: number
          user_id?: string
          weight?: number
          workout_date?: string
        }
        Relationships: []
      }
      recovery_data: {
        Row: {
          created_at: string
          energy_level: number | null
          id: string
          notes: string | null
          recorded_date: string
          sleep_hours: number | null
          sleep_quality: number | null
          soreness_level: number | null
          stress_level: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          energy_level?: number | null
          id?: string
          notes?: string | null
          recorded_date?: string
          sleep_hours?: number | null
          sleep_quality?: number | null
          soreness_level?: number | null
          stress_level?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          energy_level?: number | null
          id?: string
          notes?: string | null
          recorded_date?: string
          sleep_hours?: number | null
          sleep_quality?: number | null
          soreness_level?: number | null
          stress_level?: number | null
          user_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          email: string
          id: string
          subscribed: boolean
          subscribed_at: string
          user_id: string | null
        }
        Insert: {
          email: string
          id?: string
          subscribed?: boolean
          subscribed_at?: string
          user_id?: string | null
        }
        Update: {
          email?: string
          id?: string
          subscribed?: boolean
          subscribed_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tdee_calculations: {
        Row: {
          activity_level: string
          age: number
          bmr: number
          created_at: string
          gender: string
          goal: string | null
          height: number
          id: string
          recommended_calories: number | null
          tdee: number
          user_id: string
          weight: number
        }
        Insert: {
          activity_level: string
          age: number
          bmr: number
          created_at?: string
          gender: string
          goal?: string | null
          height: number
          id?: string
          recommended_calories?: number | null
          tdee: number
          user_id: string
          weight: number
        }
        Update: {
          activity_level?: string
          age?: number
          bmr?: number
          created_at?: string
          gender?: string
          goal?: string | null
          height?: number
          id?: string
          recommended_calories?: number | null
          tdee?: number
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      training_programs: {
        Row: {
          created_at: string
          description: string | null
          difficulty_level: string | null
          duration_weeks: number | null
          id: string
          name: string
          program_data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          duration_weeks?: number | null
          id?: string
          name: string
          program_data: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          duration_weeks?: number | null
          id?: string
          name?: string
          program_data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_usage: {
        Row: {
          coach_gpt_queries: number | null
          created_at: string
          cut_calc_uses: number | null
          food_log_analyses: number | null
          habit_checks: number | null
          id: string
          meal_plan_generations: number | null
          month_year: string
          progress_analyses: number | null
          tdee_calculations: number | null
          training_programs: number | null
          updated_at: string
          user_id: string
          workout_timer_sessions: number | null
        }
        Insert: {
          coach_gpt_queries?: number | null
          created_at?: string
          cut_calc_uses?: number | null
          food_log_analyses?: number | null
          habit_checks?: number | null
          id?: string
          meal_plan_generations?: number | null
          month_year: string
          progress_analyses?: number | null
          tdee_calculations?: number | null
          training_programs?: number | null
          updated_at?: string
          user_id: string
          workout_timer_sessions?: number | null
        }
        Update: {
          coach_gpt_queries?: number | null
          created_at?: string
          cut_calc_uses?: number | null
          food_log_analyses?: number | null
          habit_checks?: number | null
          id?: string
          meal_plan_generations?: number | null
          month_year?: string
          progress_analyses?: number | null
          tdee_calculations?: number | null
          training_programs?: number | null
          updated_at?: string
          user_id?: string
          workout_timer_sessions?: number | null
        }
        Relationships: []
      }
      workout_sessions: {
        Row: {
          calories_burned: number | null
          created_at: string
          duration_minutes: number
          exercises_data: Json | null
          id: string
          notes: string | null
          session_date: string
          user_id: string
          workout_name: string
          workout_type: string | null
        }
        Insert: {
          calories_burned?: number | null
          created_at?: string
          duration_minutes: number
          exercises_data?: Json | null
          id?: string
          notes?: string | null
          session_date?: string
          user_id: string
          workout_name: string
          workout_type?: string | null
        }
        Update: {
          calories_burned?: number | null
          created_at?: string
          duration_minutes?: number
          exercises_data?: Json | null
          id?: string
          notes?: string | null
          session_date?: string
          user_id?: string
          workout_name?: string
          workout_type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_age: {
        Args: { birthday: string }
        Returns: number
      }
      get_current_usage: {
        Args: { p_user_id: string }
        Returns: {
          coach_gpt_queries: number
          meal_plan_generations: number
          food_log_analyses: number
          tdee_calculations: number
          habit_checks: number
          training_programs: number
          progress_analyses: number
          cut_calc_uses: number
          workout_timer_sessions: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
