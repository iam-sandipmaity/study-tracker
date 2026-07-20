import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { LucideIcon } from './LucideIcon';

interface TableCount {
  table: string;
  label: string;
  count: number | null;
}

export const SyncStatus: React.FC = () => {
  const { user, isConfigured } = useAuth();
  const userId = user?.id ?? null;

  const [counts, setCounts] = useState<TableCount[]>([
    { table: 'subjects', label: 'Subjects', count: null },
    { table: 'tasks', label: 'Tasks', count: null },
    { table: 'sessions', label: 'Sessions', count: null },
    { table: 'habits', label: 'Habits', count: null },
    { table: 'notes', label: 'Notes', count: null },
    { table: 'achievements', label: 'Achievements', count: null },
  ]);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [connectionOk, setConnectionOk] = useState<boolean | null>(null);
  const [syncMessage, setSyncMessage] = useState('');

  const fetchCounts = useCallback(async () => {
    if (!isConfigured || !userId) return;

    const results = await Promise.all(
      counts.map(async (c) => {
        const { count, error } = await supabase
          .from(c.table)
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
        return { ...c, count: error ? null : (count ?? 0) };
      })
    );

    setCounts(results);
    setConnectionOk(results.every(r => r.count !== null));
  }, [isConfigured, userId]);

  // Initial fetch
  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const forceReSync = async () => {
    if (!isConfigured || !userId || syncing) return;

    setSyncing(true);
    setSyncMessage('');

    try {
      await fetchCounts();
      setLastSync(new Date());
      setSyncMessage('Sync complete — all tables reachable.');
    } catch {
      setConnectionOk(false);
      setSyncMessage('Sync failed — check your connection.');
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(''), 3000);
    }
  };

  if (!isConfigured) {
    return (
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 p-5 rounded-3xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500">
            <LucideIcon name="CloudOff" size={16} />
          </div>
          <div>
            <p className="text-xs font-bold text-neutral-700 dark:text-neutral-250">Cloud Sync</p>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
              Not configured — running in demo mode (localStorage only).
            </p>
          </div>
        </div>
      </div>
    );
  }

  const totalRows = counts.reduce((acc, c) => acc + (c.count ?? 0), 0);

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 p-5 rounded-3xl shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            connectionOk === false
              ? 'bg-red-50 dark:bg-red-950/20 text-red-500'
              : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500'
          }`}>
            <LucideIcon name={connectionOk === false ? 'CloudOff' : 'Cloud'} size={16} />
          </div>
          <div>
            <p className="text-xs font-bold text-neutral-700 dark:text-neutral-250">Cloud Sync</p>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
              {connectionOk === false
                ? 'Connection issue — data may not be syncing'
                : `${totalRows} rows across ${counts.length} tables`}
            </p>
          </div>
        </div>

        <button
          onClick={forceReSync}
          disabled={syncing}
          className="px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 hover:border-brand-400 dark:hover:border-brand-500 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-brand-400 rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5"
        >
          <LucideIcon name={syncing ? 'Loader2' : 'RefreshCw'} size={12} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Syncing...' : 'Re-sync'}
        </button>
      </div>

      {/* Table counts */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {counts.map(c => (
          <div key={c.table} className="text-center p-2.5 bg-neutral-50/40 dark:bg-neutral-800/20 rounded-xl border border-neutral-100 dark:border-neutral-800/50">
            <p className="text-sm font-bold text-neutral-800 dark:text-neutral-150">
              {c.count === null ? '—' : c.count}
            </p>
            <p className="text-[9px] font-semibold text-neutral-400 dark:text-neutral-500 mt-0.5 uppercase tracking-wider">
              {c.label}
            </p>
          </div>
        ))}
      </div>

      {/* Sync status message */}
      {syncMessage && (
        <p className={`text-[11px] font-semibold ${
          syncMessage.includes('failed')
            ? 'text-red-500'
            : 'text-emerald-500'
        }`}>
          {syncMessage}
        </p>
      )}

      {/* Last sync */}
      {lastSync && (
        <p className="text-[9px] text-neutral-350 dark:text-neutral-550">
          Last checked: {lastSync.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
};
