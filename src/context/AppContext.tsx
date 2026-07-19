import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  // Load initial states from LocalStorage or use Mock Data
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('study_subjects');
    return saved ? JSON.parse(saved) : initialSubjects;
  });
  
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('study_tasks');
    return saved ? JSON.parse(saved) : initialTasks;
  });
  
  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem('study_sessions');
    return saved ? JSON.parse(saved) : initialSessions;
  });
  
  const [habits, setHabits] = useState<HabitTrack[]>(() => {
    const saved = localStorage.getItem('study_habits');
    return saved ? JSON.parse(saved) : initialHabits;
  });
  
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('study_stats');
    return saved ? JSON.parse(saved) : initialStats;
  });
  
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('study_achievements');
    return saved ? JSON.parse(saved) : initialAchievements;
  });
  
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('study_notes');
    return saved ? JSON.parse(saved) : initialNotes;
  });
  
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('study_notifications');
    return saved ? JSON.parse(saved) : initialNotifications;
  });

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
      
      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        lastStudyDate: new Date().toISOString().split('T')[0]
      };
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
          return { ...ach, unlockedAt: new Date().toISOString() };
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
  };

  const updateSubject = (id: string, data: Partial<Subject>) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  };

  const deleteSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    // Orphaned tasks can remain or be cleaned up, let's keep them and remove the link
    setTasks(prev => prev.filter(t => t.subjectId !== id));
    setNotes(prev => prev.filter(n => n.subjectId !== id));
    addNotification('Subject Deleted', 'Related tasks and notes were also removed.', 'warning');
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
  };

  const updateTask = (id: string, data: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const completeTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task || task.status === 'completed') return;
    
    setTasks(prev => prev.map(t => t.id === id ? { 
      ...t, 
      status: 'completed',
      completedAt: new Date().toISOString()
    } : t));
    
    // Complete trigger
    playCompletionChime();
    triggerConfetti();
    gainXP(50, 'task_completed');
    addNotification('Task Completed! 🎉', `Completed: "${task.title}". +50 XP`, 'success');
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

    if (type === 'focus') {
      const minutes = Math.round(durationSeconds / 60);
      const xp = minutes * 10;
      
      // Update subject hours
      if (subjectId) {
        setSubjects(prevSubjs => prevSubjs.map(subj => {
          if (subj.id === subjectId) {
            return { ...subj, totalHours: Number((subj.totalHours + (durationSeconds / 3600)).toFixed(1)) };
          }
          return subj;
        }));
      }

      // If active session was linked to a task, update its actual study duration
      if (activeSessionTask) {
        setTasks(prev => prev.map(t => {
          if (t.id === activeSessionTask.id) {
            return { ...t, actualDuration: t.actualDuration + minutes };
          }
          return t;
        }));
        setActiveSessionTask(null);
      }

      // Trigger gamification updates
      gainXP(xp, 'focus_session');
      addNotification('Session Completed 🎯', `Studied for ${minutes} mins. Earned +${xp} XP!`, 'success');
      
      // Recalculate streak
      setTimeout(() => {
        setStats(prevStats => {
          const { currentStreak, bestStreak } = recalculateStreak([...sessions, newSession], habits, prevStats.bestStreak);
          return {
            ...prevStats,
            streak: currentStreak,
            bestStreak
          };
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
      }

      // If they check it and it's study, recalculate streak
      if (key === 'study') {
        setTimeout(() => {
          setStats(p => {
            const { currentStreak, bestStreak } = recalculateStreak(sessions, updatedHabits, p.bestStreak);
            return {
              ...p,
              streak: currentStreak,
              bestStreak
            };
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
  };

  const updateNote = (id: string, data: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === id ? { 
      ...n, 
      ...data, 
      updatedAt: new Date().toISOString() 
    } : n));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
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
