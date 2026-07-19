import React from 'react';
import { useApp } from '../context/AppContext';
import { LucideIcon } from './LucideIcon';

export const Achievements: React.FC = () => {
  const { stats, achievements, sessions } = useApp();

  // XP Progress to next level
  const currentLevelXpStart = Math.pow(stats.level - 1, 2) * 150;
  const nextLevelXpStart = Math.pow(stats.level, 2) * 150;
  const xpInCurrentLevel = stats.xp - currentLevelXpStart;
  const xpNeededForNextLevel = nextLevelXpStart - currentLevelXpStart;
  const xpProgressPercent = Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100));

  // Daily Goal Calculations (Goal: 45 minutes of focus study today)
  const todayStr = new Date().toISOString().split('T')[0];
  const todayFocusSecs = sessions
    .filter(s => s.type === 'focus' && s.date.startsWith(todayStr))
    .reduce((acc, s) => acc + s.duration, 0);
  const todayFocusMins = Math.round(todayFocusSecs / 60);
  const dailyFocusGoalMins = 45;
  const dailyGoalProgress = Math.min(100, Math.round((todayFocusMins / dailyFocusGoalMins) * 100));
  const dailyGoalCompleted = todayFocusMins >= dailyFocusGoalMins;

  // Weekly Goal Calculations (Goal: 10 hours of focus study this week)
  const oneWeekAgo = Date.now() - 7 * 86400000;
  const weeklyFocusSecs = sessions
    .filter(s => s.type === 'focus' && new Date(s.date).getTime() >= oneWeekAgo)
    .reduce((acc, s) => acc + s.duration, 0);
  const weeklyFocusHours = Number((weeklyFocusSecs / 3600).toFixed(1));
  const weeklyFocusGoalHours = 10.0;
  const weeklyGoalProgress = Math.min(100, Math.round((weeklyFocusHours / weeklyFocusGoalHours) * 100));
  const weeklyGoalCompleted = weeklyFocusHours >= weeklyFocusGoalHours;

  const totalBadgesUnlocked = achievements.filter(ach => !!ach.unlockedAt).length;

  return (
    <div className="space-y-7 text-left max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 mb-1.5">
          Academy Badges & XP
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
          Earn XP by focusing and checkoff milestones. Unlock specialist badges as you level up.
        </p>
      </div>

      {/* Level Banner Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 p-6 rounded-3xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center w-24 h-24 shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="48" cy="48" r="42" className="stroke-neutral-100 dark:stroke-neutral-800" strokeWidth="5" fill="transparent" />
              <circle 
                cx="48" 
                cy="48" 
                r="42" 
                className="stroke-brand-500 transition-all duration-500" 
                strokeWidth="5" 
                fill="transparent" 
                strokeDasharray={2 * Math.PI * 42}
                strokeDashoffset={2 * Math.PI * 42 * (1 - xpProgressPercent / 100)}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black text-neutral-850 dark:text-white leading-none">{stats.level}</span>
              <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5">LEVEL</span>
            </div>
          </div>

          <div>
            <h2 className="text-base font-bold text-neutral-800 dark:text-neutral-100">
              Level {stats.level} Scholar
            </h2>
            <p className="text-xs text-neutral-550 dark:text-neutral-400 mt-1 max-w-sm leading-normal">
              Progress to Level {stats.level + 1}: Earn {nextLevelXpStart - stats.xp} more XP. Leveling up unlocks higher study status!
            </p>
            {/* Progress line indicator */}
            <div className="flex items-center gap-2.5 mt-3 w-56 sm:w-72">
              <div className="flex-1 bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-brand-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${xpProgressPercent}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                {xpInCurrentLevel} / {xpNeededForNextLevel} XP
              </span>
            </div>
          </div>
        </div>

        {/* Level Stats */}
        <div className="grid grid-cols-2 gap-4 border-t border-neutral-100 dark:border-neutral-850 pt-4 md:pt-0 md:border-t-0 md:border-l md:pl-8 shrink-0 w-full md:w-auto text-left md:text-right">
          <div>
            <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-bold block uppercase tracking-wider mb-0.5">TOTAL EXPERIENCE</span>
            <span className="text-base font-bold text-neutral-850 dark:text-neutral-100">{stats.xp} XP</span>
          </div>
          <div>
            <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-bold block uppercase tracking-wider mb-0.5">BADGES UNLOCKED</span>
            <span className="text-base font-bold text-neutral-850 dark:text-neutral-100">{totalBadgesUnlocked} / {achievements.length}</span>
          </div>
        </div>
      </div>

      {/* Goal Ring Progress Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Daily Goal Card */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] text-brand-500 font-bold tracking-wider uppercase block">DAILY GOAL</span>
            <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-150">Focus Study for {dailyFocusGoalMins} mins</h3>
            <p className="text-[10px] text-neutral-450 dark:text-neutral-500">
              {dailyGoalCompleted ? 'Goal achieved! You earned study XP.' : `${todayFocusMins}m studied today, ${dailyFocusGoalMins - todayFocusMins}m remaining.`}
            </p>
          </div>
          
          <div className="relative flex items-center justify-center w-14 h-14 shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="28" cy="28" r="23" className="stroke-neutral-100 dark:stroke-neutral-800" strokeWidth="3" fill="transparent" />
              <circle 
                cx="28" 
                cy="28" 
                r="23" 
                className="stroke-emerald-500 transition-all duration-500" 
                strokeWidth="3.5" 
                fill="transparent" 
                strokeDasharray={2 * Math.PI * 23}
                strokeDashoffset={2 * Math.PI * 23 * (1 - dailyGoalProgress / 100)}
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-neutral-800 dark:text-neutral-200">
              {dailyGoalCompleted ? <LucideIcon name="Check" className="text-emerald-500 mx-auto" size={14} /> : `${dailyGoalProgress}%`}
            </span>
          </div>
        </div>

        {/* Weekly Goal Card */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] text-brand-500 font-bold tracking-wider uppercase block">WEEKLY TARGET</span>
            <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-150">Focus Study for {weeklyFocusGoalHours} hours</h3>
            <p className="text-[10px] text-neutral-450 dark:text-neutral-500">
              {weeklyGoalCompleted ? 'Target unlocked!' : `${weeklyFocusHours}h focused, ${Math.max(0, Number((weeklyFocusGoalHours - weeklyFocusHours).toFixed(1)))}h remaining.`}
            </p>
          </div>
          
          <div className="relative flex items-center justify-center w-14 h-14 shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="28" cy="28" r="23" className="stroke-neutral-100 dark:stroke-neutral-800" strokeWidth="3" fill="transparent" />
              <circle 
                cx="28" 
                cy="28" 
                r="23" 
                className="stroke-brand-500 transition-all duration-500" 
                strokeWidth="3.5" 
                fill="transparent" 
                strokeDasharray={2 * Math.PI * 23}
                strokeDashoffset={2 * Math.PI * 23 * (1 - weeklyGoalProgress / 100)}
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-neutral-800 dark:text-neutral-200">
              {weeklyGoalCompleted ? <LucideIcon name="Check" className="text-brand-500 mx-auto" size={14} /> : `${weeklyGoalProgress}%`}
            </span>
          </div>
        </div>

      </div>

      {/* Badges Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
          Unlocked Milestones
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {achievements.map(ach => {
            const isUnlocked = !!ach.unlockedAt;
            return (
              <div 
                key={ach.id}
                className={`p-4 bg-white dark:bg-neutral-900 border rounded-2xl transition-all duration-300 relative overflow-hidden flex items-start gap-4 ${
                  isUnlocked 
                    ? 'border-neutral-200/60 dark:border-neutral-800/65 shadow-2xs hover:shadow-xs scale-100 opacity-100' 
                    : 'border-neutral-150/40 dark:border-neutral-800/20 opacity-40 select-none grayscale'
                }`}
              >
                {/* Badge Icon */}
                <div 
                  className={`p-3 rounded-2xl border shrink-0 ${
                    isUnlocked 
                      ? 'bg-amber-50/50 border-amber-250/20 text-amber-500 dark:bg-amber-950/20' 
                      : 'bg-neutral-50 border-neutral-150 text-neutral-400 dark:bg-neutral-850 dark:border-neutral-800'
                  }`}
                >
                  <LucideIcon name={ach.icon} size={22} />
                </div>

                {/* Badge details */}
                <div className="min-w-0 text-left">
                  <h4 className="text-xs font-bold text-neutral-850 dark:text-neutral-100 leading-tight">
                    {ach.title}
                  </h4>
                  <p className="text-[10px] text-neutral-450 dark:text-neutral-400 mt-1 leading-snug">
                    {ach.description}
                  </p>
                  
                  {isUnlocked && ach.unlockedAt && (
                    <span className="text-[8px] text-emerald-500 font-bold block mt-2 border-t border-neutral-50 dark:border-neutral-850 pt-1.5">
                      Unlocked {new Date(ach.unlockedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                  {!isUnlocked && (
                    <span className="text-[8px] text-neutral-400 font-bold block mt-2 border-t border-neutral-50 dark:border-neutral-850 pt-1.5 uppercase">
                      Locked
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
    </div>
  );
};
