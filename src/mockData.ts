import type { Subject, Task, Session, HabitTrack, UserStats, Achievement, Note, NotificationItem } from './types';

// Empty initial data — new users start fresh
export const initialSubjects: Subject[] = [];
export const initialTasks: Task[] = [];
export const initialSessions: Session[] = [];
export const initialHabits: HabitTrack[] = [];
export const initialNotes: Note[] = [];
export const initialNotifications: NotificationItem[] = [];

export const initialStats: UserStats = {
  xp: 0,
  level: 1,
  streak: 0,
  bestStreak: 0,
};

// Achievement definitions (none unlocked yet)
export const initialAchievements: Achievement[] = [
  {
    id: 'ach-first-step',
    title: 'First Step',
    description: 'Complete your first focus study session',
    icon: 'Play',
    category: 'hours',
    threshold: 0.1
  },
  {
    id: 'ach-deep-focus',
    title: 'Deep Focus',
    description: 'Complete a study session of at least 45 minutes',
    icon: 'Brain',
    category: 'hours',
    threshold: 0.75
  },
  {
    id: 'ach-streak-5',
    title: 'Consistent Scholar',
    description: 'Achieve a 5-day study streak',
    icon: 'Flame',
    category: 'streak',
    threshold: 5
  },
  {
    id: 'ach-xp-1000',
    title: 'Knowledge Miner',
    description: 'Earn a total of 1,000 XP',
    icon: 'Sparkles',
    category: 'xp',
    threshold: 1000
  },
  {
    id: 'ach-hours-10',
    title: 'Dedicated Focus',
    description: 'Accumulate 10 total hours of study time',
    icon: 'Clock',
    category: 'hours',
    threshold: 10
  },
  {
    id: 'ach-tasks-10',
    title: 'Task Conqueror',
    description: 'Complete 10 tasks in your tracker',
    icon: 'CheckSquare',
    category: 'tasks',
    threshold: 10
  },
  {
    id: 'ach-notes-3',
    title: 'Scribe',
    description: 'Write 3 subject-related study notes',
    icon: 'PenTool',
    category: 'notes',
    threshold: 3
  }
];

export const quotes = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "Continuous learning is the minimum requirement for success in any field.", author: "Brian Tracy" },
  { text: "Our greatest weakness lies in giving up. The most certain way to succeed is always to try just one more time.", author: "Thomas A. Edison" },
  { text: "You don't have to see the whole staircase, just take the first step.", author: "Martin Luther King Jr." },
  { text: "Excellence is not a act, but a habit.", author: "Aristotle" }
];
