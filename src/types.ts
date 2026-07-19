export interface Subject {
  id: string;
  name: string;
  color: string; // e.g. '#3b82f6'
  icon: string;  // name of Lucide icon
  targetScore: number; // e.g. 95
  examDate: string; // ISO string or date string YYYY-MM-DD
  totalHours: number; // calculated hours
}

export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string; // YYYY-MM-DD
  subjectId: string;
  estimatedDuration: number; // in minutes
  actualDuration: number; // in minutes
  completedAt?: string; // ISO string
}

export interface Session {
  id: string;
  duration: number; // in seconds
  date: string; // ISO string
  type: 'focus' | 'short_break' | 'long_break';
  notes: string;
  subjectId?: string;
  xpEarned: number;
}

export interface HabitTrack {
  date: string; // YYYY-MM-DD
  study: boolean;
  revision: boolean;
  practice: boolean;
  reading: boolean;
  exercise: boolean;
  sleep: boolean; // meets target sleep (e.g. 7-8h)
}

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  bestStreak: number;
  lastStudyDate?: string; // YYYY-MM-DD
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string; // ISO date string if unlocked
  category: 'xp' | 'streak' | 'hours' | 'tasks' | 'notes';
  threshold: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  subjectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  timestamp: string;
  read: boolean;
}
