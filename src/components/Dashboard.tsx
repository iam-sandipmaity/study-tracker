import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LucideIcon } from './LucideIcon';
import type { Task } from '../types';

export const Dashboard: React.FC = () => {
  const {
    stats,
    tasks,
    sessions,
    subjects,
    currentQuote,
    rotateQuote,
    addTask,
    completeTask,
    setActiveSessionTask,
    setActiveTab
  } = useApp();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('medium');

  // Greeting based on current time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Calculate stats
  const totalFocusTimeSecs = sessions
    .filter(s => s.type === 'focus')
    .reduce((acc, s) => acc + s.duration, 0);
  const totalHours = (totalFocusTimeSecs / 3600).toFixed(1);

  // Focus time this week (last 7 days)
  const oneWeekAgo = Date.now() - 7 * 86400000;
  const weekFocusSecs = sessions
    .filter(s => s.type === 'focus' && new Date(s.date).getTime() >= oneWeekAgo)
    .reduce((acc, s) => acc + s.duration, 0);
  const weeklyHours = (weekFocusSecs / 3600).toFixed(1);
  const weeklyGoalHours = 10;
  const weeklyProgressPercent = Math.min(100, Math.round((parseFloat(weeklyHours) / weeklyGoalHours) * 100));

  // XP Progress to next level
  const currentLevelXpStart = Math.pow(stats.level - 1, 2) * 150;
  const nextLevelXpStart = Math.pow(stats.level, 2) * 150;
  const xpInCurrentLevel = stats.xp - currentLevelXpStart;
  const xpNeededForNextLevel = nextLevelXpStart - currentLevelXpStart;
  const xpProgressPercent = Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100));

  // Find incomplete tasks for today or overdue
  const todayStr = new Date().toISOString().split('T')[0];
  const activeTasks = tasks.filter(t => t.status !== 'completed');
  const todaysTasks = activeTasks.filter(t => t.dueDate <= todayStr);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    // Choose first subject if none selected
    const selectedSubj = newTaskSubject || (subjects[0]?.id || 'subj-general');
    addTask(
      newTaskTitle,
      newTaskPriority,
      todayStr,
      selectedSubj,
      45 // default 45 mins
    );

    setNewTaskTitle('');
    setNewTaskPriority('medium');
  };

  const getSubjectName = (id: string) => {
    return subjects.find(s => s.id === id)?.name || 'General';
  };

  const getSubjectColor = (id: string) => {
    return subjects.find(s => s.id === id)?.color || '#9ca3af';
  };

  return (
    <div className="space-y-7 text-left max-w-5xl mx-auto pb-10">
      {/* Welcome header & quote */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 mb-1.5">
            {getGreeting()}, Scholar
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            Ready to make some progress today? You are level {stats.level}.
          </p>
        </div>

        {/* Level Ring or Streak Badge */}
        <div className="flex items-center gap-3 bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 p-3 rounded-2xl shadow-xs">
          <div className="relative flex items-center justify-center w-11 h-11">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="22" cy="22" r="18" className="stroke-neutral-100 dark:stroke-neutral-800" strokeWidth="3" fill="transparent" />
              <circle 
                cx="22" 
                cy="22" 
                r="18" 
                className="stroke-brand-500 transition-all duration-500" 
                strokeWidth="3" 
                fill="transparent" 
                strokeDasharray={2 * Math.PI * 18}
                strokeDashoffset={2 * Math.PI * 18 * (1 - xpProgressPercent / 100)}
              />
            </svg>
            <span className="absolute text-xs font-bold text-neutral-800 dark:text-neutral-100">{stats.level}</span>
          </div>
          <div className="text-xs">
            <p className="font-semibold text-neutral-800 dark:text-neutral-200">Level {stats.level}</p>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500">{stats.xp} Total XP</p>
          </div>
        </div>
      </div>

      {/* Quote card */}
      <div className="bg-amber-50/40 dark:bg-amber-950/10 border border-amber-200/30 dark:border-amber-900/10 p-5 rounded-2xl relative overflow-hidden group transition-all duration-300">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-sm italic font-medium text-neutral-700 dark:text-neutral-300">
              "{currentQuote.text}"
            </p>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1 font-semibold">
              — {currentQuote.author}
            </p>
          </div>
          <button 
            onClick={rotateQuote}
            className="p-1.5 text-neutral-400 dark:text-neutral-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-100/30 dark:hover:bg-amber-900/20 rounded-xl transition-all duration-200 focus:outline-hidden self-end sm:self-center"
            title="Next Quote"
          >
            <LucideIcon name="RefreshCw" size={14} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Streak card */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 p-5 rounded-2xl shadow-xs flex items-center gap-4 group hover:shadow-md transition-all duration-300">
          <div className="p-3 bg-orange-50 dark:bg-orange-950/20 text-orange-500 rounded-xl">
            <LucideIcon name="Flame" className="animate-pulse" size={24} />
          </div>
          <div>
            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 block">
              {stats.streak} Days
            </span>
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              Study Streak (Best: {stats.bestStreak})
            </span>
          </div>
        </div>

        {/* Weekly focus card */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 p-5 rounded-2xl shadow-xs flex flex-col justify-between group hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-4 mb-2.5">
            <div className="p-3 bg-brand-50 dark:bg-brand-950/20 text-brand-500 rounded-xl">
              <LucideIcon name="Clock" size={24} />
            </div>
            <div>
              <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 block">
                {weeklyHours}h
              </span>
              <span className="text-xs text-neutral-400 dark:text-neutral-500">
                This Week (Goal: {weeklyGoalHours}h)
              </span>
            </div>
          </div>
          <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-brand-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${weeklyProgressPercent}%` }}
            />
          </div>
        </div>

        {/* Total focus card */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 p-5 rounded-2xl shadow-xs flex items-center gap-4 group hover:shadow-md transition-all duration-300">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-xl">
            <LucideIcon name="CheckCircle" size={24} />
          </div>
          <div>
            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 block">
              {totalHours} hrs
            </span>
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              Total Focus Study Time
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left = Focus / Quick Task, Right = Daily Agenda */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Side (7 Cols) */}
        <div className="md:col-span-7 space-y-6">
          {/* Quick Focus Selector */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 p-5 rounded-2xl shadow-xs">
            <h2 className="text-base font-bold text-neutral-800 dark:text-neutral-200 mb-3 flex items-center gap-2">
              <LucideIcon name="Compass" size={16} /> Today's Focus
            </h2>
            {todaysTasks.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Select a task to commit your concentration to. Starting a study session will link directly here.
                </p>
                <div className="divide-y divide-neutral-100 dark:divide-neutral-800 border border-neutral-100 dark:border-neutral-800 rounded-xl overflow-hidden bg-neutral-50/30 dark:bg-neutral-900/30">
                  {todaysTasks.slice(0, 3).map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3.5 hover:bg-neutral-100/30 dark:hover:bg-neutral-800/20 transition-all duration-200">
                      <div className="flex items-center min-w-0 pr-4">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0 mr-3" 
                          style={{ backgroundColor: getSubjectColor(task.subjectId) }}
                        />
                        <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 truncate">
                          {task.title}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setActiveSessionTask(task);
                          setActiveTab('timer');
                        }}
                        className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-brand-100 dark:hover:bg-brand-900/30 text-neutral-700 dark:text-neutral-300 hover:text-brand-600 dark:hover:text-brand-400 text-[10px] font-bold rounded-lg transition-all"
                      >
                        Focus Task
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-neutral-400 dark:text-neutral-500 text-xs">
                <LucideIcon name="Sparkles" className="mx-auto text-neutral-300 dark:text-neutral-700 mb-1.5" size={24} />
                No pending tasks due today. Create one below!
              </div>
            )}
          </div>

          {/* Quick Task Add Form */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 p-5 rounded-2xl shadow-xs">
            <h2 className="text-base font-bold text-neutral-800 dark:text-neutral-200 mb-3.5 flex items-center gap-2">
              <LucideIcon name="PlusCircle" size={16} /> Quick Add Task
            </h2>
            <form onSubmit={handleQuickAdd} className="space-y-3.5">
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 text-xs rounded-xl focus:outline-hidden focus:border-brand-500 dark:focus:border-brand-500 placeholder-neutral-400 dark:placeholder-neutral-500 text-neutral-800 dark:text-neutral-100"
                placeholder="What do you need to study? (e.g. Write literature draft)"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                required
              />
              <div className="flex flex-wrap sm:flex-nowrap gap-3">
                {/* Subject Selector */}
                <select
                  className="flex-1 px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 text-xs rounded-xl focus:outline-hidden text-neutral-700 dark:text-neutral-300"
                  value={newTaskSubject}
                  onChange={e => setNewTaskSubject(e.target.value)}
                >
                  <option value="">Select Subject...</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>

                {/* Priority Selector */}
                <div className="flex bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 p-0.5 rounded-xl">
                  {(['low', 'medium', 'high'] as Task['priority'][]).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewTaskPriority(p)}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-lg capitalize transition-all ${
                        newTaskPriority === p
                          ? 'bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 shadow-xs'
                          : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side (5 Cols) */}
        <div className="md:col-span-5">
          {/* Today's Agenda list */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 p-5 rounded-2xl shadow-xs h-full flex flex-col">
            <h2 className="text-base font-bold text-neutral-800 dark:text-neutral-200 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <LucideIcon name="ListTodo" size={16} /> Today's Agenda
              </span>
              <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full text-neutral-500 dark:text-neutral-400 font-semibold">
                {todaysTasks.length} left
              </span>
            </h2>

            {todaysTasks.length > 0 ? (
              <div className="space-y-3 overflow-y-auto max-h-[310px] pr-1 flex-1">
                {todaysTasks.map(task => (
                  <div 
                    key={task.id} 
                    className="p-3 bg-neutral-50/40 dark:bg-neutral-800/20 border border-neutral-100 dark:border-neutral-800/50 rounded-xl flex items-start justify-between group hover:border-neutral-200 dark:hover:border-neutral-700 transition-all duration-200"
                  >
                    <div className="flex items-start gap-3 min-w-0 pr-3">
                      <button 
                        onClick={() => completeTask(task.id)}
                        className="mt-0.5 h-4 w-4 border border-neutral-300 dark:border-neutral-600 rounded-full hover:border-brand-500 flex items-center justify-center shrink-0 group-hover:bg-brand-50/40 dark:group-hover:bg-brand-950/20 transition-all"
                        title="Complete task"
                      >
                        <LucideIcon name="Check" className="text-brand-500 opacity-0 hover:opacity-100" size={10} />
                      </button>
                      <div className="min-w-0 text-left">
                        <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block leading-tight truncate">
                          {task.title}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500">
                            {getSubjectName(task.subjectId)}
                          </span>
                          <span className="w-1 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full" />
                          <span className={`text-[9px] font-bold uppercase ${
                            task.priority === 'high' 
                              ? 'text-rose-500' 
                              : task.priority === 'medium' 
                                ? 'text-amber-500' 
                                : 'text-neutral-400'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-full flex items-center justify-center mb-3">
                  <LucideIcon name="Sparkles" size={24} />
                </div>
                <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Peaceful day!</p>
                <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1 max-w-[180px]">
                  No tasks left on your list today. Ready to relax or get ahead for tomorrow?
                </p>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className="mt-3.5 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-[10px] font-bold rounded-lg transition-all"
                >
                  Go to Tasks
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
