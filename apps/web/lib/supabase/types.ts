/**
 * Database types for the Career Transformation Engine.
 *
 * In production, regenerate this file from your live schema:
 *   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts
 *
 * These types are maintained manually until the Supabase project is connected.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // ===== PROFILES (extended) =====
      profiles: {
        Row: {
          id: string;
          clerk_id: string;
          username: string | null;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          github_username: string | null;
          experience_level: string | null;
          weekly_hours: string | null;
          primary_goal: string | null;
          recommended_path: string | null;
          current_level: number;
          total_xp: number;
          current_streak: number;
          longest_streak: number;
          last_activity_date: string | null;
          theme: string;
          email_notifications: boolean;
          public_profile: boolean;
          // New CTE fields
          role: string;
          is_discoverable: boolean;
          availability: string;
          location_city: string | null;
          location_country: string | null;
          profile_visibility: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clerk_id: string;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          github_username?: string | null;
          experience_level?: string | null;
          weekly_hours?: string | null;
          primary_goal?: string | null;
          recommended_path?: string | null;
          current_level?: number;
          total_xp?: number;
          current_streak?: number;
          longest_streak?: number;
          last_activity_date?: string | null;
          theme?: string;
          email_notifications?: boolean;
          public_profile?: boolean;
          role?: string;
          is_discoverable?: boolean;
          availability?: string;
          location_city?: string | null;
          location_country?: string | null;
          profile_visibility?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clerk_id?: string;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          github_username?: string | null;
          experience_level?: string | null;
          weekly_hours?: string | null;
          primary_goal?: string | null;
          recommended_path?: string | null;
          current_level?: number;
          total_xp?: number;
          current_streak?: number;
          longest_streak?: number;
          last_activity_date?: string | null;
          theme?: string;
          email_notifications?: boolean;
          public_profile?: boolean;
          role?: string;
          is_discoverable?: boolean;
          availability?: string;
          location_city?: string | null;
          location_country?: string | null;
          profile_visibility?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      // ===== LESSON PROGRESS =====
      lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_slug: string;
          path_slug: string;
          module_slug: string;
          status: string;
          started_at: string | null;
          completed_at: string | null;
          time_spent_seconds: number;
          xp_earned: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_slug: string;
          path_slug: string;
          module_slug: string;
          status?: string;
          started_at?: string | null;
          completed_at?: string | null;
          time_spent_seconds?: number;
          xp_earned?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_slug?: string;
          path_slug?: string;
          module_slug?: string;
          status?: string;
          started_at?: string | null;
          completed_at?: string | null;
          time_spent_seconds?: number;
          xp_earned?: number;
        };
        Relationships: [
          {
            foreignKeyName: "lesson_progress_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      // ===== EXERCISE PROGRESS =====
      exercise_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_slug: string;
          exercise_id: string;
          completed: boolean;
          completed_at: string | null;
          attempts: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_slug: string;
          exercise_id: string;
          completed?: boolean;
          completed_at?: string | null;
          attempts?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_slug?: string;
          exercise_id?: string;
          completed?: boolean;
          completed_at?: string | null;
          attempts?: number;
        };
        Relationships: [
          {
            foreignKeyName: "exercise_progress_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      // ===== MODULE PROGRESS =====
      module_progress: {
        Row: {
          id: string;
          user_id: string;
          path_slug: string;
          module_slug: string;
          lessons_total: number;
          lessons_completed: number;
          percentage: number;
          started_at: string | null;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          path_slug: string;
          module_slug: string;
          lessons_total: number;
          lessons_completed?: number;
          percentage?: number;
          started_at?: string | null;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          path_slug?: string;
          module_slug?: string;
          lessons_total?: number;
          lessons_completed?: number;
          percentage?: number;
          started_at?: string | null;
          completed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "module_progress_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      // ===== PATH PROGRESS =====
      path_progress: {
        Row: {
          id: string;
          user_id: string;
          path_slug: string;
          modules_total: number;
          modules_completed: number;
          percentage: number;
          started_at: string | null;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          path_slug: string;
          modules_total: number;
          modules_completed?: number;
          percentage?: number;
          started_at?: string | null;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          path_slug?: string;
          modules_total?: number;
          modules_completed?: number;
          percentage?: number;
          started_at?: string | null;
          completed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "path_progress_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      // ===== QUIZ ATTEMPTS =====
      quiz_attempts: {
        Row: {
          id: string;
          user_id: string;
          quiz_id: string;
          lesson_slug: string | null;
          module_slug: string | null;
          score: number;
          total_questions: number;
          correct_answers: number;
          time_spent_seconds: number | null;
          passed: boolean;
          xp_earned: number;
          attempted_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          quiz_id: string;
          lesson_slug?: string | null;
          module_slug?: string | null;
          score: number;
          total_questions: number;
          correct_answers: number;
          time_spent_seconds?: number | null;
          passed: boolean;
          xp_earned?: number;
          attempted_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          quiz_id?: string;
          lesson_slug?: string | null;
          module_slug?: string | null;
          score?: number;
          total_questions?: number;
          correct_answers?: number;
          time_spent_seconds?: number | null;
          passed?: boolean;
          xp_earned?: number;
          attempted_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      // ===== QUIZ RESPONSES =====
      quiz_responses: {
        Row: {
          id: string;
          attempt_id: string;
          question_id: string;
          selected_answer: string | null;
          correct: boolean;
          time_spent_seconds: number | null;
        };
        Insert: {
          id?: string;
          attempt_id: string;
          question_id: string;
          selected_answer?: string | null;
          correct: boolean;
          time_spent_seconds?: number | null;
        };
        Update: {
          id?: string;
          attempt_id?: string;
          question_id?: string;
          selected_answer?: string | null;
          correct?: boolean;
          time_spent_seconds?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_responses_attempt_id_fkey";
            columns: ["attempt_id"];
            referencedRelation: "quiz_attempts";
            referencedColumns: ["id"];
          },
        ];
      };

      // ===== PROJECT PROGRESS =====
      project_progress: {
        Row: {
          id: string;
          user_id: string;
          project_slug: string;
          project_type: string;
          status: string;
          started_at: string | null;
          completed_at: string | null;
          repository_url: string | null;
          xp_earned: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_slug: string;
          project_type: string;
          status?: string;
          started_at?: string | null;
          completed_at?: string | null;
          repository_url?: string | null;
          xp_earned?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_slug?: string;
          project_type?: string;
          status?: string;
          started_at?: string | null;
          completed_at?: string | null;
          repository_url?: string | null;
          xp_earned?: number;
        };
        Relationships: [
          {
            foreignKeyName: "project_progress_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      // ===== CERTIFICATES =====
      certificates: {
        Row: {
          id: string;
          user_id: string;
          certificate_type: string;
          title: string;
          description: string | null;
          path_slug: string | null;
          module_slug: string | null;
          issued_at: string;
          verification_code: string;
          public_url: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          certificate_type: string;
          title: string;
          description?: string | null;
          path_slug?: string | null;
          module_slug?: string | null;
          issued_at?: string;
          verification_code: string;
          public_url?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          certificate_type?: string;
          title?: string;
          description?: string | null;
          path_slug?: string | null;
          module_slug?: string | null;
          issued_at?: string;
          verification_code?: string;
          public_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "certificates_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      // ===== USER ACHIEVEMENTS =====
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          unlocked_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          unlocked_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          achievement_id?: string;
          unlocked_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      // ===== DAILY ACTIVITY =====
      daily_activity: {
        Row: {
          id: string;
          user_id: string;
          activity_date: string;
          lessons_completed: number;
          exercises_completed: number;
          quizzes_completed: number;
          xp_earned: number;
          time_spent_seconds: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          activity_date: string;
          lessons_completed?: number;
          exercises_completed?: number;
          quizzes_completed?: number;
          xp_earned?: number;
          time_spent_seconds?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          activity_date?: string;
          lessons_completed?: number;
          exercises_completed?: number;
          quizzes_completed?: number;
          xp_earned?: number;
          time_spent_seconds?: number;
        };
        Relationships: [
          {
            foreignKeyName: "daily_activity_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      // ===================================================================
      // NEW CTE TABLES
      // ===================================================================

      // ===== INSTITUTES =====
      institutes: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          description: string | null;
          website: string | null;
          location_city: string | null;
          location_country: string | null;
          plan: string;
          max_students: number;
          billing_email: string | null;
          stripe_customer_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          description?: string | null;
          website?: string | null;
          location_city?: string | null;
          location_country?: string | null;
          plan?: string;
          max_students?: number;
          billing_email?: string | null;
          stripe_customer_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          description?: string | null;
          website?: string | null;
          location_city?: string | null;
          location_country?: string | null;
          plan?: string;
          max_students?: number;
          billing_email?: string | null;
          stripe_customer_id?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };

      // ===== INSTITUTE MEMBERS =====
      institute_members: {
        Row: {
          id: string;
          institute_id: string;
          user_id: string;
          role: string;
          invited_by: string | null;
          joined_at: string;
        };
        Insert: {
          id?: string;
          institute_id: string;
          user_id: string;
          role: string;
          invited_by?: string | null;
          joined_at?: string;
        };
        Update: {
          id?: string;
          institute_id?: string;
          user_id?: string;
          role?: string;
          invited_by?: string | null;
          joined_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "institute_members_institute_id_fkey";
            columns: ["institute_id"];
            referencedRelation: "institutes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "institute_members_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      // ===== BATCHES =====
      batches: {
        Row: {
          id: string;
          institute_id: string;
          name: string;
          description: string | null;
          assigned_path_slugs: string[];
          start_date: string | null;
          end_date: string | null;
          is_active: boolean;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          institute_id: string;
          name: string;
          description?: string | null;
          assigned_path_slugs?: string[];
          start_date?: string | null;
          end_date?: string | null;
          is_active?: boolean;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          institute_id?: string;
          name?: string;
          description?: string | null;
          assigned_path_slugs?: string[];
          start_date?: string | null;
          end_date?: string | null;
          is_active?: boolean;
          created_by?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "batches_institute_id_fkey";
            columns: ["institute_id"];
            referencedRelation: "institutes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "batches_created_by_fkey";
            columns: ["created_by"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      // ===== BATCH ENROLLMENTS =====
      batch_enrollments: {
        Row: {
          id: string;
          batch_id: string;
          user_id: string;
          enrolled_at: string;
          enrolled_by: string | null;
          status: string;
        };
        Insert: {
          id?: string;
          batch_id: string;
          user_id: string;
          enrolled_at?: string;
          enrolled_by?: string | null;
          status?: string;
        };
        Update: {
          id?: string;
          batch_id?: string;
          user_id?: string;
          enrolled_at?: string;
          enrolled_by?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "batch_enrollments_batch_id_fkey";
            columns: ["batch_id"];
            referencedRelation: "batches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "batch_enrollments_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      // ===== ORGANIZATIONS =====
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          description: string | null;
          website: string | null;
          tech_stack: string[];
          company_size: string | null;
          location_city: string | null;
          location_country: string | null;
          plan: string;
          max_seats: number;
          profile_views_remaining: number;
          contacts_remaining: number;
          billing_email: string | null;
          stripe_customer_id: string | null;
          is_verified: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          description?: string | null;
          website?: string | null;
          tech_stack?: string[];
          company_size?: string | null;
          location_city?: string | null;
          location_country?: string | null;
          plan?: string;
          max_seats?: number;
          profile_views_remaining?: number;
          contacts_remaining?: number;
          billing_email?: string | null;
          stripe_customer_id?: string | null;
          is_verified?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          description?: string | null;
          website?: string | null;
          tech_stack?: string[];
          company_size?: string | null;
          location_city?: string | null;
          location_country?: string | null;
          plan?: string;
          max_seats?: number;
          profile_views_remaining?: number;
          contacts_remaining?: number;
          billing_email?: string | null;
          stripe_customer_id?: string | null;
          is_verified?: boolean;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };

      // ===== ORG MEMBERS =====
      org_members: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          role: string;
          invited_by: string | null;
          joined_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id: string;
          role: string;
          invited_by?: string | null;
          joined_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          user_id?: string;
          role?: string;
          invited_by?: string | null;
          joined_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "org_members_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "org_members_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      // ===== LAB SESSIONS =====
      lab_sessions: {
        Row: {
          id: string;
          user_id: string;
          lab_id: string;
          lab_type: string;
          tier: number;
          sandbox_id: string | null;
          status: string;
          started_at: string | null;
          active_at: string | null;
          completed_at: string | null;
          destroyed_at: string | null;
          expires_at: string;
          total_commands: number;
          relevant_commands: number;
          validation_result: Json | null;
          hints_used: number;
          score: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lab_id: string;
          lab_type: string;
          tier: number;
          sandbox_id?: string | null;
          status?: string;
          started_at?: string | null;
          active_at?: string | null;
          completed_at?: string | null;
          destroyed_at?: string | null;
          expires_at: string;
          total_commands?: number;
          relevant_commands?: number;
          validation_result?: Json | null;
          hints_used?: number;
          score?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          lab_id?: string;
          lab_type?: string;
          tier?: number;
          sandbox_id?: string | null;
          status?: string;
          started_at?: string | null;
          active_at?: string | null;
          completed_at?: string | null;
          destroyed_at?: string | null;
          expires_at?: string;
          total_commands?: number;
          relevant_commands?: number;
          validation_result?: Json | null;
          hints_used?: number;
          score?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "lab_sessions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      // ===== LAB COMMANDS =====
      lab_commands: {
        Row: {
          id: string;
          session_id: string;
          command: string;
          output_hash: string | null;
          exit_code: number | null;
          is_relevant: boolean;
          executed_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          command: string;
          output_hash?: string | null;
          exit_code?: number | null;
          is_relevant?: boolean;
          executed_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          command?: string;
          output_hash?: string | null;
          exit_code?: number | null;
          is_relevant?: boolean;
          executed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lab_commands_session_id_fkey";
            columns: ["session_id"];
            referencedRelation: "lab_sessions";
            referencedColumns: ["id"];
          },
        ];
      };

      // ===== SIMULATION DEFINITIONS =====
      simulation_definitions: {
        Row: {
          id: string;
          title: string;
          description: string;
          category: string;
          difficulty: number;
          target_time_minutes: number;
          environment_base: string;
          setup_config: Json;
          validation_config: Json;
          scoring_config: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          title: string;
          description: string;
          category: string;
          difficulty: number;
          target_time_minutes: number;
          environment_base: string;
          setup_config: Json;
          validation_config: Json;
          scoring_config: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          category?: string;
          difficulty?: number;
          target_time_minutes?: number;
          environment_base?: string;
          setup_config?: Json;
          validation_config?: Json;
          scoring_config?: Json;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };

      // ===== SIMULATION ATTEMPTS =====
      simulation_attempts: {
        Row: {
          id: string;
          user_id: string;
          simulation_id: string;
          session_id: string | null;
          status: string;
          parameters: Json | null;
          started_at: string;
          resolved_at: string | null;
          time_to_resolve_seconds: number | null;
          rca_text: string | null;
          rca_submitted_at: string | null;
          diagnostic_accuracy: number | null;
          fix_correctness: number | null;
          rca_quality: number | null;
          time_efficiency: number | null;
          command_efficiency: number | null;
          total_score: number | null;
          total_commands: number;
          relevant_commands: number;
          hints_used: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          simulation_id: string;
          session_id?: string | null;
          status?: string;
          parameters?: Json | null;
          started_at?: string;
          resolved_at?: string | null;
          time_to_resolve_seconds?: number | null;
          rca_text?: string | null;
          rca_submitted_at?: string | null;
          diagnostic_accuracy?: number | null;
          fix_correctness?: number | null;
          rca_quality?: number | null;
          time_efficiency?: number | null;
          command_efficiency?: number | null;
          total_score?: number | null;
          total_commands?: number;
          relevant_commands?: number;
          hints_used?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          simulation_id?: string;
          session_id?: string | null;
          status?: string;
          parameters?: Json | null;
          started_at?: string;
          resolved_at?: string | null;
          time_to_resolve_seconds?: number | null;
          rca_text?: string | null;
          rca_submitted_at?: string | null;
          diagnostic_accuracy?: number | null;
          fix_correctness?: number | null;
          rca_quality?: number | null;
          time_efficiency?: number | null;
          command_efficiency?: number | null;
          total_score?: number | null;
          total_commands?: number;
          relevant_commands?: number;
          hints_used?: number;
        };
        Relationships: [
          {
            foreignKeyName: "simulation_attempts_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "simulation_attempts_simulation_id_fkey";
            columns: ["simulation_id"];
            referencedRelation: "simulation_definitions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "simulation_attempts_session_id_fkey";
            columns: ["session_id"];
            referencedRelation: "lab_sessions";
            referencedColumns: ["id"];
          },
        ];
      };

      // ===== SKILL SCORES =====
      skill_scores: {
        Row: {
          id: string;
          user_id: string;
          domain: string;
          theory_score: number;
          lab_score: number;
          incident_score: number;
          quiz_score: number;
          consistency_score: number;
          composite_score: number;
          percentile: number | null;
          last_activity_at: string | null;
          decay_applied: boolean;
          calculated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          domain: string;
          theory_score?: number;
          lab_score?: number;
          incident_score?: number;
          quiz_score?: number;
          consistency_score?: number;
          composite_score?: number;
          percentile?: number | null;
          last_activity_at?: string | null;
          decay_applied?: boolean;
          calculated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          domain?: string;
          theory_score?: number;
          lab_score?: number;
          incident_score?: number;
          quiz_score?: number;
          consistency_score?: number;
          composite_score?: number;
          percentile?: number | null;
          last_activity_at?: string | null;
          decay_applied?: boolean;
          calculated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "skill_scores_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      // ===== JOB POSTINGS =====
      job_postings: {
        Row: {
          id: string;
          org_id: string | null;
          source: string;
          external_id: string | null;
          external_url: string | null;
          title: string;
          description: string | null;
          company_name: string;
          location_city: string | null;
          location_country: string | null;
          is_remote: boolean;
          salary_min: number | null;
          salary_max: number | null;
          salary_currency: string;
          required_skills: string[];
          experience_years_min: number | null;
          experience_years_max: number | null;
          employment_type: string | null;
          is_active: boolean;
          posted_at: string;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id?: string | null;
          source?: string;
          external_id?: string | null;
          external_url?: string | null;
          title: string;
          description?: string | null;
          company_name: string;
          location_city?: string | null;
          location_country?: string | null;
          is_remote?: boolean;
          salary_min?: number | null;
          salary_max?: number | null;
          salary_currency?: string;
          required_skills?: string[];
          experience_years_min?: number | null;
          experience_years_max?: number | null;
          employment_type?: string | null;
          is_active?: boolean;
          posted_at?: string;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string | null;
          source?: string;
          external_id?: string | null;
          external_url?: string | null;
          title?: string;
          description?: string | null;
          company_name?: string;
          location_city?: string | null;
          location_country?: string | null;
          is_remote?: boolean;
          salary_min?: number | null;
          salary_max?: number | null;
          salary_currency?: string;
          required_skills?: string[];
          experience_years_min?: number | null;
          experience_years_max?: number | null;
          employment_type?: string | null;
          is_active?: boolean;
          posted_at?: string;
          expires_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "job_postings_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };

      // ===== JOB APPLICATIONS =====
      job_applications: {
        Row: {
          id: string;
          user_id: string;
          job_id: string;
          status: string;
          applied_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_id: string;
          status?: string;
          applied_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          job_id?: string;
          status?: string;
          applied_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "job_applications_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "job_applications_job_id_fkey";
            columns: ["job_id"];
            referencedRelation: "job_postings";
            referencedColumns: ["id"];
          },
        ];
      };

      // ===== CANDIDATE INTERACTIONS =====
      candidate_interactions: {
        Row: {
          id: string;
          org_id: string;
          recruiter_id: string;
          candidate_id: string;
          interaction_type: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          recruiter_id: string;
          candidate_id: string;
          interaction_type: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          recruiter_id?: string;
          candidate_id?: string;
          interaction_type?: string;
          notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "candidate_interactions_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "candidate_interactions_recruiter_id_fkey";
            columns: ["recruiter_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "candidate_interactions_candidate_id_fkey";
            columns: ["candidate_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      // ===== EVENTS (Append-only event store) =====
      events: {
        Row: {
          id: string;
          user_id: string;
          event_type: string;
          entity_type: string | null;
          entity_id: string | null;
          data: Json;
          session_id: string | null;
          ip_hash: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_type: string;
          entity_type?: string | null;
          entity_id?: string | null;
          data?: Json;
          session_id?: string | null;
          ip_hash?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_type?: string;
          entity_type?: string | null;
          entity_id?: string | null;
          data?: Json;
          session_id?: string | null;
          ip_hash?: string | null;
        };
        Relationships: [];
      };

      // ===== ACTIVE TIME LOG =====
      active_time_log: {
        Row: {
          id: string;
          user_id: string;
          entity_type: string;
          entity_id: string;
          session_start: string;
          session_end: string;
          active_seconds: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          entity_type: string;
          entity_id: string;
          session_start: string;
          session_end: string;
          active_seconds: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          entity_type?: string;
          entity_id?: string;
          session_start?: string;
          session_end?: string;
          active_seconds?: number;
        };
        Relationships: [
          {
            foreignKeyName: "active_time_log_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      // ===== XP LOG =====
      xp_log: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          source: string;
          source_id: string | null;
          dedup_key: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          source: string;
          source_id?: string | null;
          dedup_key?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          source?: string;
          source_id?: string | null;
          dedup_key?: string | null;
          metadata?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "xp_log_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      // ===== BADGE DEFINITIONS =====
      badge_definitions: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string;
          category: string;
          tier: string;
          criteria: Json;
          xp_reward: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          description: string;
          icon?: string;
          category: string;
          tier?: string;
          criteria: Json;
          xp_reward?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          icon?: string;
          category?: string;
          tier?: string;
          criteria?: Json;
          xp_reward?: number;
          is_active?: boolean;
        };
        Relationships: [];
      };

      // ===== USER BADGES =====
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          earned_at: string;
          metadata: Json;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_id: string;
          earned_at?: string;
          metadata?: Json;
        };
        Update: {
          id?: string;
          user_id?: string;
          badge_id?: string;
          earned_at?: string;
          metadata?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "user_badges_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_badges_badge_id_fkey";
            columns: ["badge_id"];
            referencedRelation: "badge_definitions";
            referencedColumns: ["id"];
          },
        ];
      };

      // ===== SUBSCRIPTIONS (existing) =====
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          plan: string;
          status: string;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at: string | null;
          canceled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          plan?: string;
          status?: string;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at?: string | null;
          canceled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          plan?: string;
          status?: string;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at?: string | null;
          canceled_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      // ===== NOTIFICATIONS =====
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          data: Json;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          data?: Json;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string;
          data?: Json;
          read?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      // ===== DISCUSSIONS (existing) =====
      discussions: {
        Row: {
          id: string;
          user_id: string;
          lesson_slug: string;
          parent_id: string | null;
          content: string;
          is_pinned: boolean;
          is_resolved: boolean;
          upvotes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_slug: string;
          parent_id?: string | null;
          content: string;
          is_pinned?: boolean;
          is_resolved?: boolean;
          upvotes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_slug?: string;
          parent_id?: string | null;
          content?: string;
          is_pinned?: boolean;
          is_resolved?: boolean;
          upvotes?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "discussions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_current_profile_id: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
