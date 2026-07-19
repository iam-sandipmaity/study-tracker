import { supabase } from '../lib/supabase';
import type { Subject, Task, Session, HabitTrack, UserStats, Achievement, Note } from '../types';

// Check if user has existing data in Supabase
export async function userHasCloudData(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('subjects')
    .select('id')
    .eq('user_id', userId)
    .limit(1);

  if (error) {
    console.error('Error checking cloud data:', error);
    return false;
  }

  return data && data.length > 0;
}

// Export data from localStorage
export function exportLocalStorageData() {
  return {
    subjects: JSON.parse(localStorage.getItem('study_subjects') || '[]') as Subject[],
    tasks: JSON.parse(localStorage.getItem('study_tasks') || '[]') as Task[],
    sessions: JSON.parse(localStorage.getItem('study_sessions') || '[]') as Session[],
    habits: JSON.parse(localStorage.getItem('study_habits') || '[]') as HabitTrack[],
    stats: JSON.parse(localStorage.getItem('study_stats') || '{}') as UserStats,
    achievements: JSON.parse(localStorage.getItem('study_achievements') || '[]') as Achievement[],
    notes: JSON.parse(localStorage.getItem('study_notes') || '[]') as Note[],
  };
}

// Migrate localStorage data to Supabase
export async function migrateLocalStorageToSupabase(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const localData = exportLocalStorageData();

    // Migrate subjects
    if (localData.subjects.length > 0) {
      const subjectsToInsert = localData.subjects.map(subject => ({
        id: subject.id,
        user_id: userId,
        name: subject.name,
        color: subject.color,
        icon: subject.icon,
        target_score: subject.targetScore,
        exam_date: subject.examDate,
        total_hours: subject.totalHours,
      }));

      const { error } = await supabase.from('subjects').upsert(subjectsToInsert);
      if (error) throw new Error(`Failed to migrate subjects: ${error.message}`);
    }

    // Migrate tasks
    if (localData.tasks.length > 0) {
      const tasksToInsert = localData.tasks.map(task => ({
        id: task.id,
        user_id: userId,
        title: task.title,
        status: task.status,
        priority: task.priority,
        due_date: task.dueDate,
        subject_id: task.subjectId,
        estimated_duration: task.estimatedDuration,
        actual_duration: task.actualDuration,
        completed_at: task.completedAt,
      }));

      const { error } = await supabase.from('tasks').upsert(tasksToInsert);
      if (error) throw new Error(`Failed to migrate tasks: ${error.message}`);
    }

    // Migrate sessions
    if (localData.sessions.length > 0) {
      const sessionsToInsert = localData.sessions.map(session => ({
        id: session.id,
        user_id: userId,
        duration: session.duration,
        date: session.date,
        type: session.type,
        notes: session.notes,
        subject_id: session.subjectId || null,
        xp_earned: session.xpEarned,
      }));

      const { error } = await supabase.from('sessions').upsert(sessionsToInsert);
      if (error) throw new Error(`Failed to migrate sessions: ${error.message}`);
    }

    // Migrate habits
    if (localData.habits.length > 0) {
      const habitsToInsert = localData.habits.map(habit => ({
        user_id: userId,
        date: habit.date,
        study: habit.study,
        revision: habit.revision,
        practice: habit.practice,
        reading: habit.reading,
        exercise: habit.exercise,
        sleep: habit.sleep,
      }));

      const { error } = await supabase.from('habits').upsert(habitsToInsert);
      if (error) throw new Error(`Failed to migrate habits: ${error.message}`);
    }

    // Migrate user stats
    if (localData.stats && Object.keys(localData.stats).length > 0) {
      const statsToInsert = {
        user_id: userId,
        xp: localData.stats.xp || 0,
        level: localData.stats.level || 1,
        streak: localData.stats.streak || 0,
        best_streak: localData.stats.bestStreak || 0,
        last_study_date: localData.stats.lastStudyDate || null,
      };

      const { error } = await supabase.from('user_stats').upsert(statsToInsert);
      if (error) throw new Error(`Failed to migrate stats: ${error.message}`);
    }

    // Migrate achievements
    if (localData.achievements.length > 0) {
      const achievementsToInsert = localData.achievements
        .filter(a => a.unlockedAt) // Only migrate unlocked achievements
        .map(achievement => ({
          user_id: userId,
          achievement_id: achievement.id,
          unlocked_at: achievement.unlockedAt,
        }));

      if (achievementsToInsert.length > 0) {
        const { error } = await supabase.from('achievements').upsert(achievementsToInsert);
        if (error) throw new Error(`Failed to migrate achievements: ${error.message}`);
      }
    }

    // Migrate notes
    if (localData.notes.length > 0) {
      const notesToInsert = localData.notes.map(note => ({
        id: note.id,
        user_id: userId,
        title: note.title,
        content: note.content,
        subject_id: note.subjectId,
      }));

      const { error } = await supabase.from('notes').upsert(notesToInsert);
      if (error) throw new Error(`Failed to migrate notes: ${error.message}`);
    }

    console.log('Successfully migrated all data to Supabase');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error during migration';
    console.error('Migration failed:', message);
    return { success: false, error: message };
  }
}

// Clear localStorage after successful migration
export function clearLocalStorageData() {
  const keys = [
    'study_subjects',
    'study_tasks',
    'study_sessions',
    'study_habits',
    'study_stats',
    'study_achievements',
    'study_notes',
    'study_notifications',
    'study_theme',
    'study_soundType',
    'study_soundVolume',
  ];

  keys.forEach(key => localStorage.removeItem(key));
}

// Check if localStorage has data to migrate
export function hasLocalStorageData(): boolean {
  const keys = ['study_subjects', 'study_tasks', 'study_sessions', 'study_habits', 'study_stats'];
  return keys.some(key => {
    const data = localStorage.getItem(key);
    if (!data) return false;
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed.length > 0 : Object.keys(parsed).length > 0;
    } catch {
      return false;
    }
  });
}
