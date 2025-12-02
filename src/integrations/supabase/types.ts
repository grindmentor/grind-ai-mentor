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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      available_achievements: {
        Row: {
          category: string
          created_at: string
          description: string
          icon_name: string | null
          id: string
          is_active: boolean
          points: number
          title: string
          unlock_criteria: Json
        }
        Insert: {
          category?: string
          created_at?: string
          description: string
          icon_name?: string | null
          id?: string
          is_active?: boolean
          points?: number
          title: string
          unlock_criteria?: Json
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          icon_name?: string | null
          id?: string
          is_active?: boolean
          points?: number
          title?: string
          unlock_criteria?: Json
        }
        Relationships: []
      }
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
          email_verification_attempts: number | null
          email_verification_sent_at: string | null
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
          email_verification_attempts?: number | null
          email_verification_sent_at?: string | null
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
          email_verification_attempts?: number | null
          email_verification_sent_at?: string | null
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
      exercises: {
        Row: {
          category: string
          created_at: string
          description: string | null
          difficulty_level: string | null
          equipment: string
          external_id: string | null
          force_type: string | null
          form_cues: string | null
          gif_url: string | null
          id: string
          image_url: string | null
          instructions: string | null
          is_active: boolean
          is_bodyweight: boolean | null
          is_weighted: boolean | null
          mechanics: string | null
          movement_type: string | null
          muscle_bias: string | null
          name: string
          primary_muscles: string[]
          secondary_muscles: string[]
          technique_notes: string | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          equipment: string
          external_id?: string | null
          force_type?: string | null
          form_cues?: string | null
          gif_url?: string | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_active?: boolean
          is_bodyweight?: boolean | null
          is_weighted?: boolean | null
          mechanics?: string | null
          movement_type?: string | null
          muscle_bias?: string | null
          name: string
          primary_muscles?: string[]
          secondary_muscles?: string[]
          technique_notes?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          equipment?: string
          external_id?: string | null
          force_type?: string | null
          form_cues?: string | null
          gif_url?: string | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_active?: boolean
          is_bodyweight?: boolean | null
          is_weighted?: boolean | null
          mechanics?: string | null
          movement_type?: string | null
          muscle_bias?: string | null
          name?: string
          primary_muscles?: string[]
          secondary_muscles?: string[]
          technique_notes?: string | null
          updated_at?: string
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
      goal_progress_logs: {
        Row: {
          created_at: string
          goal_id: string
          id: string
          logged_date: string
          notes: string | null
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string
          goal_id: string
          id?: string
          logged_date?: string
          notes?: string | null
          user_id: string
          value?: number
        }
        Update: {
          created_at?: string
          goal_id?: string
          id?: string
          logged_date?: string
          notes?: string | null
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "goal_progress_logs_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "user_goals"
            referencedColumns: ["id"]
          },
        ]
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
      password_resets: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          token: string
          used: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          token: string
          used?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          token?: string
          used?: boolean
          user_id?: string
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
          age_verified: boolean | null
          birthday: string | null
          body_fat_percentage: number | null
          created_at: string
          date_of_birth: string | null
          dietary_preferences: string | null
          display_name: string | null
          email: string
          experience: string | null
          goal: string | null
          height: number | null
          id: string
          injuries: string | null
          preferred_workout_style: string | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          activity?: string | null
          age_verified?: boolean | null
          birthday?: string | null
          body_fat_percentage?: number | null
          created_at?: string
          date_of_birth?: string | null
          dietary_preferences?: string | null
          display_name?: string | null
          email: string
          experience?: string | null
          goal?: string | null
          height?: number | null
          id: string
          injuries?: string | null
          preferred_workout_style?: string | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          activity?: string | null
          age_verified?: boolean | null
          birthday?: string | null
          body_fat_percentage?: number | null
          created_at?: string
          date_of_birth?: string | null
          dietary_preferences?: string | null
          display_name?: string | null
          email?: string
          experience?: string | null
          goal?: string | null
          height?: number | null
          id?: string
          injuries?: string | null
          preferred_workout_style?: string | null
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
          billing_cycle: string | null
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscribed_at: string
          subscription_end: string | null
          subscription_tier: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          billing_cycle?: string | null
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscribed_at?: string
          subscription_end?: string | null
          subscription_tier?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          billing_cycle?: string | null
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscribed_at?: string
          subscription_end?: string | null
          subscription_tier?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      support_requests: {
        Row: {
          created_at: string
          email: string
          file_url: string | null
          id: string
          message: string
          name: string
          subject: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          file_url?: string | null
          id?: string
          message: string
          name: string
          subject: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          file_url?: string | null
          id?: string
          message?: string
          name?: string
          subject?: string
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
      user_achievements: {
        Row: {
          category: string
          created_at: string
          description: string
          icon_name: string | null
          id: string
          points: number
          title: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          description: string
          icon_name?: string | null
          id?: string
          points?: number
          title: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          icon_name?: string | null
          id?: string
          points?: number
          title?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_custom_exercises: {
        Row: {
          category: string
          created_at: string
          description: string | null
          difficulty_level: string | null
          equipment: string
          force_type: string | null
          form_cues: string | null
          id: string
          is_bodyweight: boolean | null
          is_weighted: boolean | null
          mechanics: string | null
          movement_type: string | null
          name: string
          primary_muscles: string[]
          secondary_muscles: string[]
          technique_notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          equipment: string
          force_type?: string | null
          form_cues?: string | null
          id?: string
          is_bodyweight?: boolean | null
          is_weighted?: boolean | null
          mechanics?: string | null
          movement_type?: string | null
          name: string
          primary_muscles?: string[]
          secondary_muscles?: string[]
          technique_notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          equipment?: string
          force_type?: string | null
          form_cues?: string | null
          id?: string
          is_bodyweight?: boolean | null
          is_weighted?: boolean | null
          mechanics?: string | null
          movement_type?: string | null
          name?: string
          primary_muscles?: string[]
          secondary_muscles?: string[]
          technique_notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          category: string
          created_at: string
          current_value: number | null
          deadline: string | null
          description: string | null
          frequency: string | null
          goal_type: string | null
          id: string
          is_completed: boolean | null
          priority: string | null
          status: string | null
          target_value: number | null
          title: string
          tracking_unit: string | null
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          current_value?: number | null
          deadline?: string | null
          description?: string | null
          frequency?: string | null
          goal_type?: string | null
          id?: string
          is_completed?: boolean | null
          priority?: string | null
          status?: string | null
          target_value?: number | null
          title: string
          tracking_unit?: string | null
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          current_value?: number | null
          deadline?: string | null
          description?: string | null
          frequency?: string | null
          goal_type?: string | null
          id?: string
          is_completed?: boolean | null
          priority?: string | null
          status?: string | null
          target_value?: number | null
          title?: string
          tracking_unit?: string | null
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          dark_mode: boolean | null
          email_updates: boolean | null
          favorite_modules: string[] | null
          height_unit: string | null
          id: string
          notification_preferences: Json | null
          notifications: boolean | null
          updated_at: string
          user_id: string
          weight_unit: string | null
        }
        Insert: {
          created_at?: string
          dark_mode?: boolean | null
          email_updates?: boolean | null
          favorite_modules?: string[] | null
          height_unit?: string | null
          id?: string
          notification_preferences?: Json | null
          notifications?: boolean | null
          updated_at?: string
          user_id: string
          weight_unit?: string | null
        }
        Update: {
          created_at?: string
          dark_mode?: boolean | null
          email_updates?: boolean | null
          favorite_modules?: string[] | null
          height_unit?: string | null
          id?: string
          notification_preferences?: Json | null
          notifications?: boolean | null
          updated_at?: string
          user_id?: string
          weight_unit?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_saved_exercises: {
        Row: {
          category: string
          created_at: string
          description: string | null
          difficulty_level: string | null
          equipment: string
          id: string
          name: string
          primary_muscles: string[]
          secondary_muscles: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          equipment: string
          id?: string
          name: string
          primary_muscles?: string[]
          secondary_muscles?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          equipment?: string
          id?: string
          name?: string
          primary_muscles?: string[]
          secondary_muscles?: string[]
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
          food_photo_analyses: number | null
          habit_checks: number | null
          id: string
          last_physique_analysis: string | null
          meal_plan_generations: number | null
          month_year: string
          photo_uploads: number | null
          physique_analyses: number | null
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
          food_photo_analyses?: number | null
          habit_checks?: number | null
          id?: string
          last_physique_analysis?: string | null
          meal_plan_generations?: number | null
          month_year: string
          photo_uploads?: number | null
          physique_analyses?: number | null
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
          food_photo_analyses?: number | null
          habit_checks?: number | null
          id?: string
          last_physique_analysis?: string | null
          meal_plan_generations?: number | null
          month_year?: string
          photo_uploads?: number | null
          physique_analyses?: number | null
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
      calculate_age: { Args: { birthdate: string }; Returns: number }
      cleanup_expired_password_resets: { Args: never; Returns: undefined }
      get_current_usage: {
        Args: { p_user_id: string }
        Returns: {
          coach_gpt_queries: number
          cut_calc_uses: number
          food_log_analyses: number
          food_photo_analyses: number
          habit_checks: number
          meal_plan_generations: number
          photo_uploads: number
          progress_analyses: number
          tdee_calculations: number
          training_programs: number
          workout_timer_sessions: number
        }[]
      }
      get_user_profile_data: {
        Args: { p_user_id: string }
        Returns: {
          activity: string
          age: number
          display_name: string
          experience: string
          goal: string
          height: number
          weight: number
        }[]
      }
      get_user_role: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      search_exercises: {
        Args: {
          equipment_filter?: string
          limit_count?: number
          muscle_filter?: string[]
          search_query: string
        }
        Returns: {
          category: string
          created_at: string
          description: string | null
          difficulty_level: string | null
          equipment: string
          external_id: string | null
          force_type: string | null
          form_cues: string | null
          gif_url: string | null
          id: string
          image_url: string | null
          instructions: string | null
          is_active: boolean
          is_bodyweight: boolean | null
          is_weighted: boolean | null
          mechanics: string | null
          movement_type: string | null
          muscle_bias: string | null
          name: string
          primary_muscles: string[]
          secondary_muscles: string[]
          technique_notes: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "exercises"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      search_exercises_optimized: {
        Args: {
          equipment_filter?: string
          limit_count?: number
          muscle_filter?: string[]
          search_query?: string
          search_user_id?: string
        }
        Returns: {
          category: string
          description: string
          difficulty_level: string
          equipment: string
          force_type: string
          form_cues: string
          id: string
          is_bodyweight: boolean
          is_custom: boolean
          is_weighted: boolean
          mechanics: string
          movement_type: string
          name: string
          primary_muscles: string[]
          relevance_score: number
          secondary_muscles: string[]
          technique_notes: string
        }[]
      }
      validate_password_reset_token: {
        Args: { p_email: string; p_token: string }
        Returns: boolean
      }
      verify_user_age: { Args: { p_user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "premium" | "free"
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
      app_role: ["admin", "premium", "free"],
    },
  },
} as const
