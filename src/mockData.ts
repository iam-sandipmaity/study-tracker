import type { Subject, Task, Session, HabitTrack, UserStats, Achievement, Note, NotificationItem } from './types';

// Helper to get relative dates
const getDateNDaysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};

export const initialSubjects: Subject[] = [
  {
    id: 'subj-cs',
    name: 'Computer Science',
    color: '#0ea5e9', // Blue
    icon: 'Code',
    targetScore: 98,
    examDate: getDateNDaysAgo(-12), // 12 days in future
    totalHours: 14.5
  },
  {
    id: 'subj-math',
    name: 'Advanced Calculus',
    color: '#f97316', // Orange
    icon: 'Calculator',
    targetScore: 92,
    examDate: getDateNDaysAgo(-8), // 8 days in future
    totalHours: 18.2
  },
  {
    id: 'subj-lit',
    name: 'English Literature',
    color: '#10b981', // Green
    icon: 'BookOpen',
    targetScore: 88,
    examDate: getDateNDaysAgo(-20), // 20 days in future
    totalHours: 6.8
  },
  {
    id: 'subj-chem',
    name: 'Organic Chemistry',
    color: '#8b5cf6', // Purple
    icon: 'FlaskConical',
    targetScore: 90,
    examDate: getDateNDaysAgo(-5), // 5 days in future
    totalHours: 10.5
  }
];

export const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Implement Redux store in CS Project',
    status: 'in_progress',
    priority: 'high',
    dueDate: getDateNDaysAgo(0), // Today
    subjectId: 'subj-cs',
    estimatedDuration: 90,
    actualDuration: 45
  },
  {
    id: 'task-2',
    title: 'Practice Integration by Parts exercises',
    status: 'todo',
    priority: 'high',
    dueDate: getDateNDaysAgo(-1), // Tomorrow
    subjectId: 'subj-math',
    estimatedDuration: 60,
    actualDuration: 0
  },
  {
    id: 'task-3',
    title: 'Read Act IV of Hamlet',
    status: 'completed',
    priority: 'medium',
    dueDate: getDateNDaysAgo(1), // Yesterday
    subjectId: 'subj-lit',
    estimatedDuration: 45,
    actualDuration: 50,
    completedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'task-4',
    title: 'Review Organic Reaction Mechanisms',
    status: 'todo',
    priority: 'medium',
    dueDate: getDateNDaysAgo(-3),
    subjectId: 'subj-chem',
    estimatedDuration: 75,
    actualDuration: 0
  },
  {
    id: 'task-5',
    title: 'Write draft of literature essay',
    status: 'todo',
    priority: 'low',
    dueDate: getDateNDaysAgo(-5),
    subjectId: 'subj-lit',
    estimatedDuration: 120,
    actualDuration: 0
  },
  {
    id: 'task-6',
    title: 'CS 101 Lecture 5 review notes',
    status: 'completed',
    priority: 'low',
    dueDate: getDateNDaysAgo(2),
    subjectId: 'subj-cs',
    estimatedDuration: 30,
    actualDuration: 25,
    completedAt: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

export const initialSessions: Session[] = [
  {
    id: 'sess-1',
    duration: 1500, // 25 min
    date: new Date(Date.now() - 6 * 86400000).toISOString(),
    type: 'focus',
    notes: 'Calculus derivatives review. Understood chain rule better.',
    subjectId: 'subj-math',
    xpEarned: 250
  },
  {
    id: 'sess-2',
    duration: 3000, // 50 min
    date: new Date(Date.now() - 5 * 86400000).toISOString(),
    type: 'focus',
    notes: 'Coding React hooks assignment. Set up custom API fetches.',
    subjectId: 'subj-cs',
    xpEarned: 500
  },
  {
    id: 'sess-3',
    duration: 1500, // 25 min
    date: new Date(Date.now() - 4 * 86400000).toISOString(),
    type: 'focus',
    notes: 'Read Hamlet Act III notes. Summarized main themes.',
    subjectId: 'subj-lit',
    xpEarned: 250
  },
  {
    id: 'sess-4',
    duration: 3600, // 60 min
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    type: 'focus',
    notes: 'Reviewed chemistry carbon compounds. Confusing stereocenters resolved.',
    subjectId: 'subj-chem',
    xpEarned: 600
  },
  {
    id: 'sess-5',
    duration: 2700, // 45 min
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    type: 'focus',
    notes: 'Calculus mock problems. Scored 15/20. Need to revise limit proofs.',
    subjectId: 'subj-math',
    xpEarned: 450
  },
  {
    id: 'sess-6',
    duration: 1800, // 30 min
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
    type: 'focus',
    notes: 'Computer Science: debugging memory leaks in tree structures.',
    subjectId: 'subj-cs',
    xpEarned: 300
  },
  {
    id: 'sess-7',
    duration: 3000, // 50 min
    date: new Date().toISOString(), // Today
    type: 'focus',
    notes: 'Organic Chemistry reaction pathways. Created mindmap.',
    subjectId: 'subj-chem',
    xpEarned: 500
  }
];

export const initialHabits: HabitTrack[] = [
  {
    date: getDateNDaysAgo(6),
    study: true,
    revision: true,
    practice: false,
    reading: true,
    exercise: true,
    sleep: true
  },
  {
    date: getDateNDaysAgo(5),
    study: true,
    revision: false,
    practice: true,
    reading: true,
    exercise: false,
    sleep: true
  },
  {
    date: getDateNDaysAgo(4),
    study: true,
    revision: true,
    practice: true,
    reading: false,
    exercise: true,
    sleep: false
  },
  {
    date: getDateNDaysAgo(3),
    study: true,
    revision: false,
    practice: true,
    reading: true,
    exercise: true,
    sleep: true
  },
  {
    date: getDateNDaysAgo(2),
    study: true,
    revision: true,
    practice: false,
    reading: false,
    exercise: false,
    sleep: true
  },
  {
    date: getDateNDaysAgo(1),
    study: true,
    revision: true,
    practice: true,
    reading: true,
    exercise: true,
    sleep: true
  },
  {
    date: getDateNDaysAgo(0), // Today
    study: true,
    revision: false,
    practice: false,
    reading: true,
    exercise: true,
    sleep: false
  }
];

export const initialStats: UserStats = {
  xp: 2850,
  level: 4,
  streak: 6,
  bestStreak: 14,
  lastStudyDate: getDateNDaysAgo(0)
};

export const initialAchievements: Achievement[] = [
  {
    id: 'ach-first-step',
    title: 'First Step',
    description: 'Complete your first focus study session',
    icon: 'Play',
    unlockedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    category: 'hours',
    threshold: 0.1
  },
  {
    id: 'ach-deep-focus',
    title: 'Deep Focus',
    description: 'Complete a study session of at least 45 minutes',
    icon: 'Brain',
    unlockedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    category: 'hours',
    threshold: 0.75
  },
  {
    id: 'ach-streak-5',
    title: 'Consistent Scholar',
    description: 'Achieve a 5-day study streak',
    icon: 'Flame',
    unlockedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    category: 'streak',
    threshold: 5
  },
  {
    id: 'ach-xp-1000',
    title: 'Knowledge Miner',
    description: 'Earn a total of 1,000 XP',
    icon: 'Sparkles',
    unlockedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    category: 'xp',
    threshold: 1000
  },
  {
    id: 'ach-hours-10',
    title: 'Dedicated Focus',
    description: 'Accumulate 10 total hours of study time',
    icon: 'Clock',
    unlockedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
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

export const initialNotes: Note[] = [
  {
    id: 'note-1',
    title: 'React Custom Hooks & Context',
    content: `# React Hook & Context Patterns\n\nNotes on decoupling state and lifecycle logic.\n\n### Core Rules\n1. Only call hooks at the **top level**\n2. Only call hooks from **React functions**\n\n### Custom Hook Example\n\`\`\`typescript\nfunction useLocalStorage<T>(key: string, initial: T): [T, (val: T) => void] {\n  const [val, setVal] = useState(() => {\n    const item = localStorage.getItem(key);\n    return item ? JSON.parse(item) : initial;\n  });\n  const update = (newValue: T) => {\n    setVal(newValue);\n    localStorage.setItem(key, JSON.stringify(newValue));\n  };\n  return [val, update];\n}\n\`\`\`\n\nThis hook is perfect for saving user configurations or dashboard states!`,
  subjectId: 'subj-cs',
  createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  updatedAt: new Date(Date.now() - 4 * 86400000).toISOString()
},
{
  id: 'note-2',
  title: 'Integration by Parts: Formulas & Examples',
  content: `# Integration by Parts\n\nEssential calculus technique derived from the product rule.\n\n### Formula\n$$\\int u \\, dv = uv - \\int v \\, du$$\n\n### LIATE Rule for choosing $u$:\n- **L**: Logarithmic functions\n- **I**: Inverse trigonometric functions\n- **A**: Algebraic functions\n- **T**: Trigonometric functions\n- **E**: Exponential functions\n\n### Standard Example\nTo integrate $\\int x \\cos(x) \\, dx$:\n1. Choose $u = x$, so $du = dx$\n2. Choose $dv = \\cos(x)\\,dx$, so $v = \\sin(x)$\n3. Applying formula:\n   $$\\int x \\cos(x) \\, dx = x\\sin(x) - \\int \\sin(x) \\, dx = x\\sin(x) + \\cos(x) + C$$`,
  subjectId: 'subj-math',
  createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
}
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Welcome to Study Tracker',
    message: 'Welcome! Create your study plan, start a timer, and earn XP.',
    type: 'success',
    timestamp: new Date(Date.now() - 6 * 86400000).toISOString(),
    read: true
  },
  {
    id: 'notif-2',
    title: 'Exam Coming Up!',
    message: 'Organic Chemistry exam is in 5 days. Consider launching a Pomodoro focus session.',
    type: 'warning',
    timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
    read: false
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
