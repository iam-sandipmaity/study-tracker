import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { Subject, Task, Session, HabitTrack, UserStats, Achievement, Note, NotificationItem } from '../types';
import {
  initialSubjects,
  initialTasks,
  initialSessions,
  initialHabits,
  initialStats,
  initialAchievements,
  initialNotes,
  initialNotifications,
  quotes
} from '../mockData';
import { ambientSound, playCompletionChime } from '../audioSynthesis';
import type { AmbientType } from '../audioSynthesis';
import { triggerConfetti } from '../utils/confetti';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface AppContextType {
  subjects: Subject[];
  tasks: Task[];
  sessions: Session[];
  habits: HabitTrack[];
  stats: UserStats;
  achievements: Achievement[];
  notes: Note[];
  notifications: NotificationItem[];
  theme: 'light' | 'dark';
  activeTab: string;
  focusMode: boolean;
  soundType: AmbientType;
  soundVolume: number;
  commandPaletteOpen: boolean;
  activeSessionTask: Task | null;
  currentQuote: { text: string; author: string };
  
  // Handlers
  setTheme: (theme: 'light' | 'dark') => void;
  setActiveTab: (tab: string) => void;
  setFocusMode: (mode: boolean) => void;
  setSoundType: (type: AmbientType) => void;
  setSoundVolume: (volume: number) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setActiveSessionTask: (task: Task | null) => void;
  rotateQuote: () => void;
  
  // Subjects
  addSubject: (name: string, color: string, icon: string, targetScore: number, examDate: string) => void;
  updateSubject: (id: string, data: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  
  // Tasks
  addTask: (title: string, priority: Task['priority'], dueDate: string, subjectId: string, estimatedDuration: number) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  
  // Sessions
  logSession: (durationSeconds: number, type: Session['type'], notes: string, subjectId?: string) => void;
  
  // Habits
  toggleHabit: (date: string, key: keyof Omit<HabitTrack, 'date'>) => void;
  
  // Notes
  addNote: (title: string, content: string, subjectId: string) => void;
  updateNote: (id: string, data: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  
  // Notifications
  addNotification: (title: string, message: string, type: NotificationItem['type']) => void;
  clearNotification: (id: string) => void;
  markAllNotificationsRead: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get auth user for Supabase sync
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const isConfigured = isSupabaseConfigured();

  // Helper: get localStorage value with fallback
  const getLocalStorage = <T,>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved) as unknown;
        // Handle both array and object types
        if (Array.isArray(fallback)) {
          return (Array.isArray(parsed) ? parsed : fallback) as T;
        }
        return (typeof parsed === 'object' && parsed !== null ? parsed : fallback) as T;
      }
    } catch {
      // Ignore parse errors
    }
    return fallback;
  };

  // Load initial states from LocalStorage or use Mock Data
  const [subjects, setSubjects] = useState<Subject[]>(() => 
    getLocalStorage('study_subjects', initialSubjects)
  );
  
  const [tasks, setTasks] = useState<Task[]>(() => 
    getLocalStorage('study_tasks', initialTasks)
  );
  
  const [sessions, setSessions] = useState<Session[]>(() => 
    getLocalStorage('study_sessions', initialSessions)
  );
  
  const [habits, setHabits] = useState<HabitTrack[]>(() => 
    getLocalStorage('study_habits', initialHabits)
  );
  
  const [stats, setStats] = useState<UserStats>(() => 
    getLocalStorage('study_stats', initialStats)
  );
  
  const [achievements, setAchievements] = useState<Achievement[]>(() => 
    getLocalStorage('study_achievements', initialAchievements)
  );
  
  const [notes, setNotes] = useState<Note[]>(() => 
    getLocalStorage('study_notes', initialNotes)
  );
  
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => 
    getLocalStorage('study_notifications', initialNotifications)
  );

  // UI state
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('study_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [focusMode, setFocusMode] = useState<boolean>(false);
  const [soundType, setSoundTypeState] = useState<AmbientType>(() => {
    const saved = localStorage.getItem('study_soundType');
    if (saved === 'none' || saved === 'white' || saved === 'rain' || saved === 'ocean' || saved === 'focus') return saved;
    return 'none';
  });
  const [soundVolume, setSoundVolumeState] = useState<number>(() => {
    const saved = localStorage.getItem('study_soundVolume');
    return saved !== null ? parseFloat(saved) : 0.4;
  });
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [activeSessionTask, setActiveSessionTask] = useState<Task | null>(null);
  
  const [currentQuote, setCurrentQuote] = useState(() => {
    const idx = Math.floor(Math.random() * quotes.length);
    return quotes[idx];
  });

  // Refs for latest state to avoid stale closures in checkAchievements
  const sessionsRef = useRef(sessions);
  const tasksRef = useRef(tasks);
  const notesRef = useRef(notes);
  const statsRef = useRef(stats);
  useEffect(() => { sessionsRef.current = sessions; }, [sessions]);
  useEffect(() => { tasksRef.current = tasks; }, [tasks]);
  useEffect(() => { notesRef.current = notes; }, [notes]);
  useEffect(() => { statsRef.current = stats; }, [stats]);

  // Load data from Supabase when user is authenticated
  useEffect(() => {
    if (!isConfigured || !userId) return;

    const loadFromSupabase = async () => {
      try {
        // Load subjects
        const { data: subjectsData } = await supabase
          .from('subjects')
          .select('*')
          .eq('user_id', userId);
        
        if (subjectsData && subjectsData.length > 0) {
          setSubjects(subjectsData.map(s => ({
            id: s.id,
            name: s.name,
            color: s.color,
            icon: s.icon,
            targetScore: s.target_score,
            examDate: s.exam_date,
            totalHours: s.total_hours,
          })));
        }

        // Load tasks
        const { data: tasksData } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', userId);
        
        if (tasksData && tasksData.length > 0) {
          setTasks(tasksData.map(t => ({
            id: t.id,
            title: t.title,
            status: t.status,
            priority: t.priority,
            dueDate: t.due_date,
            subjectId: t.subject_id,
            estimatedDuration: t.estimated_duration,
            actualDuration: t.actual_duration,
            completedAt: t.completed_at,
          })));
        }

        // Load sessions
        const { data: sessionsData } = await supabase
          .from('sessions')
          .select('*')
          .eq('user_id', userId);
        
        if (sessionsData && sessionsData.length > 0) {
          setSessions(sessionsData.map(s => ({
            id: s.id,
            duration: s.duration,
            date: s.date,
            type: s.type,
            notes: s.notes,
            subjectId: s.subject_id,
            xpEarned: s.xp_earned,
          })));
        }

        // Load habits
        const { data: habitsData } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', userId);
        
        if (habitsData && habitsData.length > 0) {
          setHabits(habitsData.map(h => ({
            date: h.date,
            study: h.study,
            revision: h.revision,
            practice: h.practice,
            reading: h.reading,
            exercise: h.exercise,
            sleep: h.sleep,
          })));
        }

        // Load stats — auto-create if missing (replaces the fragile DB trigger)
        const { data: statsData, error: statsError } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (statsData) {
          setStats({
            xp: statsData.xp,
            level: statsData.level,
            streak: statsData.streak,
            bestStreak: statsData.best_streak,
            lastStudyDate: statsData.last_study_date,
          });
        } else if (statsError || !statsData) {
          // First login — create user_stats row
          await supabase.from('user_stats').insert({
            user_id: userId,
            xp: 0,
            level: 1,
            streak: 0,
            best_streak: 0,
          } as never);
        }

        // Load notes
        const { data: notesData } = await supabase
          .from('notes')
          .select('*')
          .eq('user_id', userId);
        
        if (notesData && notesData.length > 0) {
          setNotes(notesData.map(n => ({
            id: n.id,
            title: n.title,
            content: n.content,
            subjectId: n.subject_id,
            createdAt: n.created_at,
            updatedAt: n.updated_at,
          })));
        }

        // Load achievements
        const { data: achievementsData } = await supabase
          .from('achievements')
          .select('*')
          .eq('user_id', userId);
        
        if (achievementsData && achievementsData.length > 0) {
          setAchievements(prev => prev.map(a => {
            const cloudAch = achievementsData.find(ca => ca.achievement_id === a.id);
            if (cloudAch && cloudAch.unlocked_at) {
              return { ...a, unlockedAt: cloudAch.unlocked_at };
            }
            return a;
          }));
        }

        console.log('Loaded data from Supabase');
      } catch (error) {
        console.error('Error loading from Supabase:', error);
      }
    };

    loadFromSupabase();
  }, [userId, isConfigured]);

  // Sync to Supabase helper
  const syncToSupabase = useCallback(async (table: string, data: Record<string, unknown>[], operation: 'upsert' | 'delete' = 'upsert') => {
    if (!isConfigured || !userId) return;

    try {
      if (operation === 'delete') {
        // For deletes, data should contain the id
        if (data.length > 0 && data[0].id) {
          await supabase.from(table).delete().eq('id', data[0].id as string).eq('user_id', userId);
        }
      } else {
        // Add user_id to all records
        const dataWithUserId = data.map(item => ({ ...item, user_id: userId }));
        await supabase.from(table).upsert(dataWithUserId as never);
      }
    } catch (error) {
      console.error(`Error syncing ${table} to Supabase:`, error);
    }
  }, [userId, isConfigured]);

  // Sync state to local storage when state changes
  useEffect(() => {
    localStorage.setItem('study_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('study_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('study_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('study_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('study_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('study_achievements', JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem('study_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('study_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Persist sound settings
  useEffect(() => {
    localStorage.setItem('study_soundType', soundType);
  }, [soundType]);

  useEffect(() => {
    localStorage.setItem('study_soundVolume', String(soundVolume));
  }, [soundVolume]);

  // Set document class for dark mode
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('study_theme', theme);
  }, [theme]);

  // Handle ambient sounds playing/stopping
  useEffect(() => {
    if (soundType !== 'none') {
      ambientSound.start(soundType, soundVolume);
    } else {
      ambientSound.stop();
    }
    return () => {
      ambientSound.stop();
    };
  }, [soundType]);

  // Dynamic sound volume adjuster
  useEffect(() => {
    ambientSound.setVolume(soundVolume);
  }, [soundVolume]);

  const setTheme = (t: 'light' | 'dark') => setThemeState(t);

  const rotateQuote = () => {
    let nextQuote = currentQuote;
    while (nextQuote.text === currentQuote.text) {
      nextQuote = quotes[Math.floor(Math.random() * quotes.length)];
    }
    setCurrentQuote(nextQuote);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CMD/CTRL + K for command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
      
      // ESC to close modal, focus mode, command palette
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
        setFocusMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Recalculate Streak whenever sessions or habits change
  const recalculateStreak = (allSessions: Session[], allHabits: HabitTrack[], currentBestStreak: number) => {
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    // Create a Set of all days that have studies
    const activeDays = new Set<string>();
    
    // Check sessions
    allSessions.forEach(s => {
      if (s.type === 'focus') {
        const dateStr = s.date.split('T')[0];
        activeDays.add(dateStr);
      }
    });

    // Check habits (if study habit is checked)
    allHabits.forEach(h => {
      if (h.study) {
        activeDays.add(h.date);
      }
    });

    let currentStreak = 0;
    
    // Determine start date for current streak (either today or yesterday)
    let checkDate = new Date();
    let checkStr = checkDate.toISOString().split('T')[0];
    
    const studiedToday = activeDays.has(checkStr);
    const studiedYesterday = activeDays.has(yesterdayStr);
    
    if (studiedToday) {
      currentStreak = 1;
      checkDate.setDate(checkDate.getDate() - 1);
      checkStr = checkDate.toISOString().split('T')[0];
      while (activeDays.has(checkStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
        checkStr = checkDate.toISOString().split('T')[0];
      }
    } else if (studiedYesterday) {
      currentStreak = 1;
      checkDate.setDate(checkDate.getDate() - 2);
      checkStr = checkDate.toISOString().split('T')[0];
      while (activeDays.has(checkStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
        checkStr = checkDate.toISOString().split('T')[0];
      }
    } else {
      currentStreak = 0;
    }

    // Now find Best Streak across all time
    const sortedDatesAsc = Array.from(activeDays).sort((a, b) => a.localeCompare(b));
    let bestStreak = currentBestStreak;
    let runStreak = 0;
    let prevTime: number | null = null;

    sortedDatesAsc.forEach(dateStr => {
      const currTime = new Date(dateStr).getTime();
      if (prevTime === null) {
        runStreak = 1;
      } else {
        const diffDays = Math.round((currTime - prevTime) / 86400000);
        if (diffDays === 1) {
          runStreak++;
        } else if (diffDays > 1) {
          runStreak = 1;
        }
      }
      prevTime = currTime;
      if (runStreak > bestStreak) {
        bestStreak = runStreak;
      }
    });

    if (currentStreak > bestStreak) {
      bestStreak = currentStreak;
    }

    return { currentStreak, bestStreak };
  };

  // Gamification helper: add XP, check level-up, and check achievement unlocks
  const gainXP = (amount: number, _sourceName: string) => {
    setStats(prev => {
      const newXp = prev.xp + amount;
      // level = floor(sqrt(xp / 150)) + 1
      const newLevel = Math.floor(Math.sqrt(newXp / 150)) + 1;
      
      const leveledUp = newLevel > prev.level;
      if (leveledUp) {
        // Trigger level up notification
        setTimeout(() => {
          addNotification(
            'Level Up! 🌟',
            `Congratulations! You have reached Level ${newLevel}! Keep going!`,
            'success'
          );
          playCompletionChime();
          triggerConfetti();
        }, 100);
      }

      const newStats = {
        ...prev,
        xp: newXp,
        level: newLevel,
        lastStudyDate: new Date().toISOString().split('T')[0]
      };

      // Sync stats to Supabase
      if (isConfigured && userId) {
        syncToSupabase('user_stats', [{
          xp: newXp,
          level: newLevel,
          last_study_date: newStats.lastStudyDate,
        }]);
      }
      
      return newStats;
    });

    // Check achievement rules after XP update
    setTimeout(() => checkAchievements(), 200);
  };

  const checkAchievements = () => {
    // Use refs to get latest state (avoid stale closures from setTimeout)
    const currentSessions = sessionsRef.current;
    const currentTasks = tasksRef.current;
    const currentNotes = notesRef.current;
    const currentStats = statsRef.current;

    setAchievements(prev => {
      let updated = false;
      const next = prev.map(ach => {
        if (ach.unlockedAt) return ach;
        
        let unlock = false;
        
        switch (ach.id) {
          case 'ach-first-step':
            unlock = currentSessions.length > 0;
            break;
          case 'ach-deep-focus':
            unlock = currentSessions.some(s => s.type === 'focus' && s.duration >= 2700);
            break;
          case 'ach-streak-5':
            unlock = currentStats.streak >= 5;
            break;
          case 'ach-xp-1000':
            unlock = currentStats.xp >= 1000;
            break;
          case 'ach-hours-10':
            const totalSecs = currentSessions.reduce((acc, s) => acc + (s.type === 'focus' ? s.duration : 0), 0);
            unlock = (totalSecs / 3600) >= 10;
            break;
          case 'ach-tasks-10':
            const completedCount = currentTasks.filter(t => t.status === 'completed').length;
            unlock = completedCount >= 10;
            break;
          case 'ach-notes-3':
            unlock = currentNotes.length >= 3;
            break;
          default:
            break;
        }

        if (unlock) {
          updated = true;
          const unlockedAt = new Date().toISOString();
          
          // Sync achievement to Supabase
          if (isConfigured && userId) {
            syncToSupabase('achievements', [{
              achievement_id: ach.id,
              unlocked_at: unlockedAt,
            }]);
          }

          // Notify unlock
          setTimeout(() => {
            addNotification(
              `Badge Unlocked: ${ach.title} 🏆`,
              ach.description,
              'success'
            );
            playCompletionChime();
            triggerConfetti();
          }, 100);
          return { ...ach, unlockedAt };
        }
        return ach;
      });
      return updated ? next : prev;
    });
  };

  // SUBJECT HANDLERS
  const addSubject = (name: string, color: string, icon: string, targetScore: number, examDate: string) => {
    const newSubject: Subject = {
      id: `subj-${Date.now()}`,
      name,
      color,
      icon,
      targetScore,
      examDate,
      totalHours: 0
    };
    setSubjects(prev => [...prev, newSubject]);
    addNotification('New Subject Added', `You started tracking "${name}"`, 'info');

    // Sync to Supabase
    if (isConfigured && userId) {
      syncToSupabase('subjects', [{
        id: newSubject.id,
        name,
        color,
        icon,
        target_score: targetScore,
        exam_date: examDate,
        total_hours: 0,
      }]);
    }
  };

  const updateSubject = (id: string, data: Partial<Subject>) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));

    // Sync to Supabase
    if (isConfigured && userId) {
      const dbData: Record<string, unknown> = { id };
      if (data.name !== undefined) dbData.name = data.name;
      if (data.color !== undefined) dbData.color = data.color;
      if (data.icon !== undefined) dbData.icon = data.icon;
      if (data.targetScore !== undefined) dbData.target_score = data.targetScore;
      if (data.examDate !== undefined) dbData.exam_date = data.examDate;
      if (data.totalHours !== undefined) dbData.total_hours = data.totalHours;
      syncToSupabase('subjects', [dbData]);
    }
  };

  const deleteSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    // Orphaned tasks can remain or be cleaned up, let's keep them and remove the link
    setTasks(prev => prev.filter(t => t.subjectId !== id));
    setNotes(prev => prev.filter(n => n.subjectId !== id));
    addNotification('Subject Deleted', 'Related tasks and notes were also removed.', 'warning');

    // Sync to Supabase
    if (isConfigured && userId) {
      syncToSupabase('subjects', [{ id }], 'delete');
      // Also delete related tasks and notes
      syncToSupabase('tasks', [{ subject_id: id }], 'delete');
      syncToSupabase('notes', [{ subject_id: id }], 'delete');
    }
  };

  // TASK HANDLERS
  const addTask = (title: string, priority: Task['priority'], dueDate: string, subjectId: string, estimatedDuration: number) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      status: 'todo',
      priority,
      dueDate,
      subjectId,
      estimatedDuration,
      actualDuration: 0
    };
    setTasks(prev => [newTask, ...prev]);
    addNotification('Task Added', `"${title}" has been added to your backlog.`, 'info');

    // Sync to Supabase
    if (isConfigured && userId) {
      syncToSupabase('tasks', [{
        id: newTask.id,
        title,
        status: 'todo',
        priority,
        due_date: dueDate,
        subject_id: subjectId,
        estimated_duration: estimatedDuration,
        actual_duration: 0,
      }]);
    }
  };

  const updateTask = (id: string, data: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));

    // Sync to Supabase
    if (isConfigured && userId) {
      const dbData: Record<string, unknown> = { id };
      if (data.title !== undefined) dbData.title = data.title;
      if (data.status !== undefined) dbData.status = data.status;
      if (data.priority !== undefined) dbData.priority = data.priority;
      if (data.dueDate !== undefined) dbData.due_date = data.dueDate;
      if (data.subjectId !== undefined) dbData.subject_id = data.subjectId;
      if (data.estimatedDuration !== undefined) dbData.estimated_duration = data.estimatedDuration;
      if (data.actualDuration !== undefined) dbData.actual_duration = data.actualDuration;
      if (data.completedAt !== undefined) dbData.completed_at = data.completedAt;
      syncToSupabase('tasks', [dbData]);
    }
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));

    // Sync to Supabase
    if (isConfigured && userId) {
      syncToSupabase('tasks', [{ id }], 'delete');
    }
  };

  const completeTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task || task.status === 'completed') return;
    
    const completedAt = new Date().toISOString();
    setTasks(prev => prev.map(t => t.id === id ? { 
      ...t, 
      status: 'completed',
      completedAt
    } : t));
    
    // Complete trigger
    playCompletionChime();
    triggerConfetti();
    gainXP(50, 'task_completed');
    addNotification('Task Completed! 🎉', `Completed: "${task.title}". +50 XP`, 'success');

    // Sync to Supabase
    if (isConfigured && userId) {
      syncToSupabase('tasks', [{
        id,
        status: 'completed',
        completed_at: completedAt,
      }]);
    }
  };

  // STUDY SESSION LOGGERS
  const logSession = (durationSeconds: number, type: Session['type'], notesText: string, subjectId?: string) => {
    const newSession: Session = {
      id: `sess-${Date.now()}`,
      duration: durationSeconds,
      date: new Date().toISOString(),
      type,
      notes: notesText,
      subjectId,
      xpEarned: type === 'focus' ? Math.round(durationSeconds / 60) * 10 : 0
    };

    setSessions(prev => [newSession, ...prev]);

    // Sync to Supabase
    if (isConfigured && userId) {
      syncToSupabase('sessions', [{
        id: newSession.id,
        duration: durationSeconds,
        date: newSession.date,
        type,
        notes: notesText,
        subject_id: subjectId || null,
        xp_earned: newSession.xpEarned,
      }]);
    }

    if (type === 'focus') {
      const minutes = Math.round(durationSeconds / 60);
      const xp = minutes * 10;
      
      // Update subject hours
      if (subjectId) {
        setSubjects(prevSubjs => {
          const updated = prevSubjs.map(subj => {
            if (subj.id === subjectId) {
              return { ...subj, totalHours: Number((subj.totalHours + (durationSeconds / 3600)).toFixed(1)) };
            }
            return subj;
          });

          // Sync subject update to Supabase
          if (isConfigured && userId) {
            const subj = updated.find(s => s.id === subjectId);
            if (subj) {
              syncToSupabase('subjects', [{
                id: subjectId,
                total_hours: subj.totalHours,
              }]);
            }
          }

          return updated;
        });
      }

      // If active session was linked to a task, update its actual study duration
      if (activeSessionTask) {
        setTasks(prev => {
          const updated = prev.map(t => {
            if (t.id === activeSessionTask.id) {
              return { ...t, actualDuration: t.actualDuration + minutes };
            }
            return t;
          });

          // Sync task update to Supabase
          if (isConfigured && userId) {
            const task = updated.find(t => t.id === activeSessionTask.id);
            if (task) {
              syncToSupabase('tasks', [{
                id: task.id,
                actual_duration: task.actualDuration,
              }]);
            }
          }

          return updated;
        });
        setActiveSessionTask(null);
      }

      // Trigger gamification updates
      gainXP(xp, 'focus_session');
      addNotification('Session Completed 🎯', `Studied for ${minutes} mins. Earned +${xp} XP!`, 'success');
      
      // Recalculate streak
      setTimeout(() => {
        setStats(prevStats => {
          const { currentStreak, bestStreak } = recalculateStreak([...sessions, newSession], habits, prevStats.bestStreak);
          const newStats = {
            ...prevStats,
            streak: currentStreak,
            bestStreak
          };

          // Sync stats to Supabase
          if (isConfigured && userId) {
            syncToSupabase('user_stats', [{
              streak: currentStreak,
              best_streak: bestStreak,
            }]);
          }

          return newStats;
        });
      }, 300);
    }
  };

  // HABIT TRACKERS
  const toggleHabit = (date: string, key: keyof Omit<HabitTrack, 'date'>) => {
    let checked = false;
    
    setHabits(prev => {
      const dayIndex = prev.findIndex(h => h.date === date);
      let updatedHabits = [...prev];
      
      if (dayIndex >= 0) {
        // Toggle existing record
        const nextVal = !prev[dayIndex][key];
        checked = nextVal;
        updatedHabits[dayIndex] = {
          ...prev[dayIndex],
          [key]: nextVal
        };

        // Sync to Supabase
        if (isConfigured && userId) {
          syncToSupabase('habits', [{
            id: prev[dayIndex].date, // Using date as identifier for habits
            date,
            [key]: nextVal,
          }]);
        }
      } else {
        // Create new record for this date
        const newTrack: HabitTrack = {
          date,
          study: false,
          revision: false,
          practice: false,
          reading: false,
          exercise: false,
          sleep: false,
          [key]: true
        };
        checked = true;
        updatedHabits = [newTrack, ...updatedHabits];

        // Sync to Supabase
        if (isConfigured && userId) {
          syncToSupabase('habits', [{
            date,
            study: key === 'study' ? true : false,
            revision: key === 'revision' ? true : false,
            practice: key === 'practice' ? true : false,
            reading: key === 'reading' ? true : false,
            exercise: key === 'exercise' ? true : false,
            sleep: key === 'sleep' ? true : false,
          }]);
        }
      }

      // If they check it and it's study, recalculate streak
      if (key === 'study') {
        setTimeout(() => {
          setStats(p => {
            const { currentStreak, bestStreak } = recalculateStreak(sessions, updatedHabits, p.bestStreak);
            const newStats = {
              ...p,
              streak: currentStreak,
              bestStreak
            };

            // Sync stats to Supabase
            if (isConfigured && userId) {
              syncToSupabase('user_stats', [{
                streak: currentStreak,
                best_streak: bestStreak,
              }]);
            }

            return newStats;
          });
        }, 100);
      }

      return updatedHabits;
    });

    // Award small XP for positive habits
    if (checked) {
      gainXP(20, 'habit_completed');
      
      const labelMap: Record<string, string> = {
        study: 'Daily Study',
        revision: 'Revision session',
        practice: 'Practice problems',
        reading: 'Reading logs',
        exercise: 'Physical exercise',
        sleep: 'Healthy sleep schedule'
      };
      
      addNotification('Habit Completed!', `Completed "${labelMap[key]}". +20 XP`, 'success');
    }
  };

  // NOTE HANDLERS
  const addNote = (title: string, content: string, subjectId: string) => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title,
      content,
      subjectId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setNotes(prev => [newNote, ...prev]);
    gainXP(30, 'note_created');
    addNotification('Note Created', `Saved "${title}". +30 XP`, 'success');

    // Sync to Supabase
    if (isConfigured && userId) {
      syncToSupabase('notes', [{
        id: newNote.id,
        title,
        content,
        subject_id: subjectId,
      }]);
    }
  };

  const updateNote = (id: string, data: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === id ? { 
      ...n, 
      ...data, 
      updatedAt: new Date().toISOString() 
    } : n));

    // Sync to Supabase
    if (isConfigured && userId) {
      const dbData: Record<string, unknown> = { id };
      if (data.title !== undefined) dbData.title = data.title;
      if (data.content !== undefined) dbData.content = data.content;
      if (data.subjectId !== undefined) dbData.subject_id = data.subjectId;
      syncToSupabase('notes', [dbData]);
    }
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));

    // Sync to Supabase
    if (isConfigured && userId) {
      syncToSupabase('notes', [{ id }], 'delete');
    }
  };

  // NOTIFICATION HANDLERS
  const addNotification = (title: string, message: string, type: NotificationItem['type']) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Send browser native notification if allowed
    if (Notification.permission === 'granted') {
      new Notification(title, { body: message });
    }
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Auto-request browser notifications on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <AppContext.Provider value={{
      subjects,
      tasks,
      sessions,
      habits,
      stats,
      achievements,
      notes,
      notifications,
      theme,
      activeTab,
      focusMode,
      soundType,
      soundVolume,
      commandPaletteOpen,
      activeSessionTask,
      currentQuote,
      
      setTheme,
      setActiveTab,
      setFocusMode,
      setSoundType: setSoundTypeState,
      setSoundVolume: setSoundVolumeState,
      setCommandPaletteOpen,
      setActiveSessionTask,
      rotateQuote,
      
      addSubject,
      updateSubject,
      deleteSubject,
      addTask,
      updateTask,
      deleteTask,
      completeTask,
      logSession,
      toggleHabit,
      addNote,
      updateNote,
      deleteNote,
      addNotification,
      clearNotification,
      markAllNotificationsRead
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
