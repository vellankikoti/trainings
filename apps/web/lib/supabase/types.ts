/**
 * Database types for the DEVOPS ENGINEERS platform.
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
          updated_at?: string;
        };
        Relationships: [];
      };
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
