import React from 'react';
import { useApp } from '../context/AppContext';
import { LucideIcon } from './LucideIcon';
import type { HabitTrack } from '../types';

export const Habits: React.FC = () => {
  const { habits, toggleHabit } = useApp();

  // Generate last 7 days dates
  const getLast7Days = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const dates = getLast7Days();
  const todayStr = new Date().toISOString().split('T')[0];

  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const getDayLabel = (dateStr: string) => {
    if (dateStr === todayStr) return 'Today';
    const dayIndex = new Date(dateStr).getDay();
    return weekdayNames[dayIndex];
  };

  const getDayNumber = (dateStr: string) => {
    return new Date(dateStr).getDate();
  };

  // List of habits to track
  const habitCategories: { key: keyof Omit<HabitTrack, 'date'>; name: string; icon: string; desc: string; color: string }[] = [
    { key: 'study', name: 'Daily Study', icon: 'BookOpen', desc: 'Focus study for at least 25 minutes', color: 'text-brand-500 bg-brand-50 dark:bg-brand-950/20' },
    { key: 'revision', name: 'Revision Checks', icon: 'RotateCw', desc: 'Review notes or flashcards of past topics', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' },
    { key: 'practice', name: 'Practice Problems', icon: 'FileCode', desc: 'Solve exercises or writing prompts', color: 'text-violet-500 bg-violet-50 dark:bg-violet-950/20' },
    { key: 'reading', name: 'Textbook Reading', icon: 'Library', desc: 'Read course literature or technical articles', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
    { key: 'exercise', name: 'Physical Exercise', icon: 'Flame', desc: 'Stretch, walk, run, or light gym work', color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20' },
    { key: 'sleep', name: 'Healthy Sleep', icon: 'Moon', desc: 'Sleep for 7-8 hours to boost retention', color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/20' }
  ];

  // Helper to get status of a habit on a date
  const isHabitChecked = (date: string, key: keyof Omit<HabitTrack, 'date'>) => {
    const day = habits.find(h => h.date === date);
    return day ? !!day[key] : false;
  };

  // Calculate habit progress of today
  const getTodayProgress = () => {
    const todayHabit = habits.find(h => h.date === todayStr);
    if (!todayHabit) return 0;
    
    let count = 0;
    habitCategories.forEach(cat => {
      if (todayHabit[cat.key]) count++;
    });
    return count;
  };

  const todayCount = getTodayProgress();
  const completionPercent = Math.round((todayCount / habitCategories.length) * 100);

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 mb-1.5">
          Habit Tracker
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
          Track consistency across core habits. Toggling logs earns you +20 XP each.
        </p>
      </div>

      {/* Progress Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 p-5 rounded-3xl shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-sm font-bold text-neutral-800 dark:text-neutral-100 mb-0.5">
            Today's Disciplines
          </h2>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            You completed {todayCount} of {habitCategories.length} habits today.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-64">
          <div className="flex-1 bg-neutral-150 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-brand-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <span className="text-xs font-bold text-neutral-600 dark:text-neutral-350">{completionPercent}%</span>
        </div>
      </div>

      {/* Grid container */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 rounded-3xl shadow-xs overflow-hidden">
        
        {/* Table representation */}
        <div className="min-w-full overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-150 dark:divide-neutral-850">
            
            {/* Headers (Dates) */}
            <thead className="bg-neutral-50/50 dark:bg-neutral-900/30">
              <tr>
                <th scope="col" className="px-5 py-4 text-left text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider min-w-[200px]">
                  Habit Category
                </th>
                {dates.map(dateStr => {
                  const isToday = dateStr === todayStr;
                  return (
                    <th 
                      key={dateStr} 
                      scope="col" 
                      className={`px-3 py-4 text-center text-[10px] font-bold uppercase tracking-wider ${
                        isToday ? 'text-brand-500 font-extrabold' : 'text-neutral-450 dark:text-neutral-500'
                      }`}
                    >
                      <span className="block">{getDayLabel(dateStr)}</span>
                      <span className={`inline-block mt-1 font-semibold text-xs text-center ${
                        isToday ? 'bg-brand-500 text-white rounded-full h-5 w-5 flex items-center justify-center mx-auto' : ''
                      }`}>
                        {getDayNumber(dateStr)}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Habit Rows */}
            <tbody className="divide-y divide-neutral-150 dark:divide-neutral-850 bg-white dark:bg-neutral-900">
              {habitCategories.map(cat => (
                <tr key={cat.key} className="hover:bg-neutral-50/20 dark:hover:bg-neutral-900/30 transition-colors">
                  
                  {/* Category info */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${cat.color} shrink-0`}>
                        <LucideIcon name={cat.icon} size={15} />
                      </div>
                      <div className="text-left">
                        <span className="text-xs font-bold text-neutral-800 dark:text-neutral-250 block">
                          {cat.name}
                        </span>
                        <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                          {cat.desc}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Toggle bubbles */}
                  {dates.map(dateStr => {
                    const isChecked = isHabitChecked(dateStr, cat.key);
                    return (
                      <td key={dateStr} className="px-3 py-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => toggleHabit(dateStr, cat.key)}
                          className={`h-7 w-7 rounded-full flex items-center justify-center mx-auto transition-all transform active:scale-90 ${
                            isChecked
                              ? 'bg-brand-500 text-white shadow-xs'
                              : 'bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 dark:bg-neutral-800/40 dark:hover:bg-neutral-800 dark:border-neutral-750'
                          }`}
                        >
                          {isChecked && <LucideIcon name="Check" size={13} />}
                        </button>
                      </td>
                    );
                  })}

                </tr>
              ))}
            </tbody>
            
          </table>
        </div>
      </div>
      
    </div>
  );
};
