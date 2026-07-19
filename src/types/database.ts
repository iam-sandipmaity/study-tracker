// Database types for Supabase
// These types match our existing data model and will be used for type-safe queries

export interface Database {
  public: {
    Tables: {
      subjects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          icon: string;
          target_score: number;
          exam_date: string;
          total_hours: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color: string;
          icon: string;
          target_score: number;
          exam_date: string;
          total_hours?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string;
          icon?: string;
          target_score?: number;
          exam_date?: string;
          total_hours?: number;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          status: 'todo' | 'in_progress' | 'completed';
          priority: 'low' | 'medium' | 'high';
          due_date: string;
          subject_id: string;
          estimated_duration: number;
          actual_duration: number;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          status: 'todo' | 'in_progress' | 'completed';
          priority: 'low' | 'medium' | 'high';
          due_date: string;
          subject_id: string;
          estimated_duration: number;
          actual_duration?: number;
          completed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          status?: 'todo' | 'in_progress' | 'completed';
          priority?: 'low' | 'medium' | 'high';
          due_date?: string;
          subject_id?: string;
          estimated_duration?: number;
          actual_duration?: number;
          completed_at?: string;
          updated_at?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          duration: number;
          date: string;
          type: 'focus' | 'short_break' | 'long_break';
          notes: string;
          subject_id: string | null;
          xp_earned: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          duration: number;
          date: string;
          type: 'focus' | 'short_break' | 'long_break';
          notes: string;
          subject_id?: string;
          xp_earned: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          duration?: number;
          date?: string;
          type?: 'focus' | 'short_break' | 'long_break';
          notes?: string;
          subject_id?: string;
          xp_earned?: number;
        };
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          study: boolean;
          revision: boolean;
          practice: boolean;
          reading: boolean;
          exercise: boolean;
          sleep: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          study?: boolean;
          revision?: boolean;
          practice?: boolean;
          reading?: boolean;
          exercise?: boolean;
          sleep?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          study?: boolean;
          revision?: boolean;
          practice?: boolean;
          reading?: boolean;
          exercise?: boolean;
          sleep?: boolean;
        };
      };
      user_stats: {
        Row: {
          id: string;
          user_id: string;
          xp: number;
          level: number;
          streak: number;
          best_streak: number;
          last_study_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          xp?: number;
          level?: number;
          streak?: number;
          best_streak?: number;
          last_study_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          xp?: number;
          level?: number;
          streak?: number;
          best_streak?: number;
          last_study_date?: string;
          updated_at?: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          unlocked_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          unlocked_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          achievement_id?: string;
          unlocked_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          subject_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          subject_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          subject_id?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: 'info' | 'success' | 'warning' | 'alert';
          timestamp: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type: 'info' | 'success' | 'warning' | 'alert';
          timestamp: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: 'info' | 'success' | 'warning' | 'alert';
          timestamp?: string;
          read?: boolean;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
