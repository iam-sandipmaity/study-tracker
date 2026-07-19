import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { LucideIcon } from './LucideIcon';

export const SessionHistory: React.FC = () => {
  const { sessions, subjects } = useApp();

  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('focus');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Helper to get subject name and color
  const getSubjectInfo = (id?: string) => {
    if (!id) return { name: 'General', color: '#9ca3af' };
    const subj = subjects.find(s => s.id === id);
    return subj ? { name: subj.name, color: subj.color } : { name: 'General', color: '#9ca3af' };
  };

  // Format duration seconds to human-readable
  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  // Format date to readable string
  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  // Format time
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter and sort sessions
  const filteredSessions = useMemo(() => {
    let result = [...sessions];

    // Filter by type
    if (filterType !== 'all') {
      result = result.filter(s => s.type === filterType);
    }

    // Filter by subject
    if (filterSubject !== 'all') {
      result = result.filter(s => s.subjectId === filterSubject);
    }

    // Search in notes
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.notes?.toLowerCase().includes(q) ||
        getSubjectInfo(s.subjectId).name.toLowerCase().includes(q)
      );
    }

    // Sort newest first
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return result;
  }, [sessions, filterType, filterSubject, searchQuery, subjects]);

  // Summary stats
  const totalSessions = filteredSessions.length;
  const totalFocusTime = filteredSessions
    .filter(s => s.type === 'focus')
    .reduce((acc, s) => acc + s.duration, 0);
  const totalXP = filteredSessions.reduce((acc, s) => acc + s.xpEarned, 0);
  const sessionsWithNotes = filteredSessions.filter(s => s.notes && s.notes.trim()).length;

  // Group sessions by date
  const groupedSessions = useMemo(() => {
    const groups: Record<string, typeof filteredSessions> = {};
    filteredSessions.forEach(session => {
      const dateKey = new Date(session.date).toISOString().split('T')[0];
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(session);
    });
    return Object.entries(groups);
  }, [filteredSessions]);

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
          Session History
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Review your past study sessions and reflections
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 p-4 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide">Sessions</span>
          <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">{totalSessions}</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 p-4 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide">Focus Time</span>
          <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">{formatDuration(totalFocusTime)}</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 p-4 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide">Total XP</span>
          <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">{totalXP}</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 p-4 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide">With Notes</span>
          <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">{sessionsWithNotes}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 p-4 rounded-2xl shadow-xs flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <LucideIcon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search notes, subjects..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 text-xs rounded-xl focus:outline-hidden focus:border-brand-500 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500"
          />
        </div>

        {/* Type filter */}
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 text-xs rounded-xl focus:outline-hidden text-neutral-700 dark:text-neutral-300"
        >
          <option value="all">All Types</option>
          <option value="focus">Focus</option>
          <option value="short_break">Short Break</option>
          <option value="long_break">Long Break</option>
        </select>

        {/* Subject filter */}
        <select
          value={filterSubject}
          onChange={e => setFilterSubject(e.target.value)}
          className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 text-xs rounded-xl focus:outline-hidden text-neutral-700 dark:text-neutral-300"
        >
          <option value="all">All Subjects</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Session List */}
      {groupedSessions.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 p-12 rounded-2xl shadow-xs text-center">
          <div className="w-14 h-14 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <LucideIcon name="Clock" size={24} className="text-neutral-400 dark:text-neutral-500" />
          </div>
          <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">No sessions found</p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1.5 max-w-[260px] mx-auto">
            {sessions.length === 0
              ? "You haven't logged any study sessions yet. Start your first focus session!"
              : "No sessions match your current filters. Try adjusting them."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedSessions.map(([dateKey, daySessions]) => {
            const dayLabel = formatDate(daySessions[0].date);
            const dayFocusTime = daySessions
              .filter(s => s.type === 'focus')
              .reduce((acc, s) => acc + s.duration, 0);
            const dayXP = daySessions.reduce((acc, s) => acc + s.xpEarned, 0);

            return (
              <div key={dateKey}>
                {/* Date header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{dayLabel}</h2>
                    <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full text-neutral-500 dark:text-neutral-400 font-semibold">
                      {daySessions.length} session{daySessions.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-semibold text-neutral-400 dark:text-neutral-500">
                    {dayFocusTime > 0 && <span>{formatDuration(dayFocusTime)} focus</span>}
                    {dayXP > 0 && <span>+{dayXP} XP</span>}
                  </div>
                </div>

                {/* Sessions for this day */}
                <div className="space-y-2">
                  {daySessions.map(session => {
                    const subj = getSubjectInfo(session.subjectId);
                    const isExpanded = expandedId === session.id;
                    const hasNotes = session.notes && session.notes.trim() &&
                      session.notes !== 'Completed focus session without notes.' &&
                      session.notes !== 'Completed break session.';
                    const typeLabel = session.type === 'focus' ? 'Focus' :
                      session.type === 'short_break' ? 'Short Break' : 'Long Break';

                    return (
                      <div
                        key={session.id}
                        className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 rounded-2xl shadow-xs overflow-hidden transition-all duration-200 hover:shadow-md"
                      >
                        {/* Session row */}
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : session.id)}
                          className="w-full p-4 flex items-center gap-4 text-left"
                        >
                          {/* Type icon */}
                          <div className={`p-2.5 rounded-xl ${
                            session.type === 'focus'
                              ? 'bg-brand-50 dark:bg-brand-950/20 text-brand-500'
                              : session.type === 'short_break'
                                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500'
                                : 'bg-amber-50 dark:bg-amber-950/20 text-amber-500'
                          }`}>
                            <LucideIcon
                              name={session.type === 'focus' ? 'Zap' : session.type === 'short_break' ? 'Coffee' : 'Timer'}
                              size={16}
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                                {typeLabel}
                              </span>
                              {session.subjectId && (
                                <span
                                  className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                                  style={{
                                    backgroundColor: `${subj.color}15`,
                                    color: subj.color
                                  }}
                                >
                                  {subj.name}
                                </span>
                              )}
                              {hasNotes && (
                                <LucideIcon name="FileText" size={10} className="text-neutral-300 dark:text-neutral-600" />
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold">
                              <span>{formatTime(session.date)}</span>
                              <span>{formatDuration(session.duration)}</span>
                              {session.xpEarned > 0 && <span className="text-brand-500">+{session.xpEarned} XP</span>}
                            </div>
                          </div>

                          {/* Expand arrow */}
                          <LucideIcon
                            name="ChevronDown"
                            size={14}
                            className={`text-neutral-300 dark:text-neutral-600 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </button>

                        {/* Expanded notes */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-0">
                            <div className="bg-neutral-50 dark:bg-neutral-800/30 border border-neutral-100 dark:border-neutral-800 rounded-xl p-3.5">
                              <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-1.5">
                                Session Notes
                              </p>
                              {hasNotes ? (
                                <p className="text-xs text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed">
                                  {session.notes}
                                </p>
                              ) : (
                                <p className="text-xs text-neutral-400 dark:text-neutral-500 italic">
                                  No notes recorded for this session.
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
