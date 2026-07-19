import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { userHasCloudData, migrateLocalStorageToSupabase, hasLocalStorageData } from '../utils/migration';
import type { UserStats } from '../types';

// Hook to sync data with Supabase
export function useSupabaseSync(userId: string | null) {
  const [syncing, setSyncing] = useState(false);
  const [migrationNeeded, setMigrationNeeded] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const isConfigured = isSupabaseConfigured();

  // Check if migration is needed on mount
  useEffect(() => {
    if (!isConfigured || !userId) return;

    const checkMigration = async () => {
      const hasCloud = await userHasCloudData(userId);
      const hasLocal = hasLocalStorageData();

      if (!hasCloud && hasLocal) {
        setMigrationNeeded(true);
      }
    };

    checkMigration();
  }, [userId, isConfigured]);

  const performMigration = useCallback(async () => {
    if (!userId) return false;

    setSyncing(true);
    setSyncError(null);

    try {
      const result = await migrateLocalStorageToSupabase(userId);
      if (result.success) {
        setMigrationNeeded(false);
        return true;
      } else {
        setSyncError(result.error || 'Migration failed');
        return false;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setSyncError(message);
      return false;
    } finally {
      setSyncing(false);
    }
  }, [userId]);

  return {
    syncing,
    migrationNeeded,
    syncError,
    performMigration,
    isConfigured,
  };
}

// Hook for user stats specifically
export function useSupabaseUserStats(userId: string | null, localFallback: UserStats) {
  const [stats, setStats] = useState<UserStats>(localFallback);
  const [loading, setLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    if (!isConfigured || !userId) {
      setStats(localFallback);
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const { data, error } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error) {
          console.error('Error fetching stats:', error);
          setStats(localFallback);
        } else if (data) {
          setStats({
            xp: data.xp,
            level: data.level,
            streak: data.streak,
            bestStreak: data.best_streak,
            lastStudyDate: data.last_study_date,
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats(localFallback);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId, isConfigured, localFallback]);

  const updateStats = useCallback(async (updates: Partial<UserStats>) => {
    if (!isConfigured || !userId) {
      setStats(prev => ({ ...prev, ...updates }));
      return { error: null };
    }

    const dbUpdates: Record<string, unknown> = {};
    if (updates.xp !== undefined) dbUpdates.xp = updates.xp;
    if (updates.level !== undefined) dbUpdates.level = updates.level;
    if (updates.streak !== undefined) dbUpdates.streak = updates.streak;
    if (updates.bestStreak !== undefined) dbUpdates.best_streak = updates.bestStreak;
    if (updates.lastStudyDate !== undefined) dbUpdates.last_study_date = updates.lastStudyDate;

    const { error } = await supabase
      .from('user_stats')
      .update(dbUpdates)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating stats:', error);
      return { error };
    }

    setStats(prev => ({ ...prev, ...updates }));
    return { error: null };
  }, [userId, isConfigured]);

  return {
    stats,
    loading,
    updateStats,
    setStats,
  };
}
