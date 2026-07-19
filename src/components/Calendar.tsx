import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LucideIcon } from './LucideIcon';

export const Calendar: React.FC = () => {
  const { tasks, subjects, completeTask } = useApp();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(() => new Date().toISOString().split('T')[0]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Helper arrays
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calendar dates generation
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const calendarCells = [];

  // Previous month buffer days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = prevMonthTotalDays - i;
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    const dateStr = `${y}-${(m + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    calendarCells.push({ day: d, isCurrentMonth: false, dateStr });
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
    calendarCells.push({ day: i, isCurrentMonth: true, dateStr });
  }

  // Next month buffer days (pad out to grid rows of 7)
  const remaining = 42 - calendarCells.length;
  for (let i = 1; i <= remaining; i++) {
    const m = month === 11 ? 0 : month + 1;
    const y = month === 11 ? year + 1 : year;
    const dateStr = `${y}-${(m + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
    calendarCells.push({ day: i, isCurrentMonth: false, dateStr });
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else {
      setCurrentDate(new Date(year, month + 1, 1));
    }
  };

  const getSubjectColor = (id: string) => {
    return subjects.find(s => s.id === id)?.color || '#9ca3af';
  };

  const getSubjectName = (id: string) => {
    return subjects.find(s => s.id === id)?.name || 'General';
  };

  // Get items due or scheduled for a date
  const getTasksForDate = (dateStr: string) => {
    return tasks.filter(t => t.dueDate === dateStr);
  };

  const getExamsForDate = (dateStr: string) => {
    return subjects.filter(s => s.examDate === dateStr);
  };

  // Find all upcoming exams
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingExams = subjects
    .filter(s => s.examDate >= todayStr)
    .sort((a, b) => a.examDate.localeCompare(b.examDate));

  // Find all upcoming high/medium priority deadlines
  const upcomingDeadlines = tasks
    .filter(t => t.status !== 'completed' && t.dueDate >= todayStr)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);

  const selectedTasks = getTasksForDate(selectedDateStr);
  const selectedExams = getExamsForDate(selectedDateStr);

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 mb-1.5">
          Schedule & Calendar
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
          Plan daily deadlines, track upcoming exams, and check off completed agendas.
        </p>
      </div>

      {/* Main Grid: Left = Monthly Calendar, Right = Daily Agenda & Countdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-7">
        
        {/* Left Side (8 columns) */}
        <div className="md:col-span-8 bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 p-6 rounded-3xl shadow-xs">
          {/* Nav header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-neutral-800 dark:text-neutral-100">
              {monthNames[month]} {year}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl text-neutral-500 dark:text-neutral-400"
              >
                <LucideIcon name="ChevronLeft" size={14} />
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl text-neutral-500 dark:text-neutral-400"
              >
                <LucideIcon name="ChevronRight" size={14} />
              </button>
            </div>
          </div>

          {/* Weekday labels */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase mb-2">
            {weekdays.map(d => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((cell, idx) => {
              const cellTasks = getTasksForDate(cell.dateStr);
              const cellExams = getExamsForDate(cell.dateStr);
              const isSelected = cell.dateStr === selectedDateStr;
              const isToday = cell.dateStr === todayStr;
              
              const hasExams = cellExams.length > 0;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`min-h-[56px] sm:min-h-[70px] p-2 rounded-xl border flex flex-col justify-between cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/15'
                      : cell.isCurrentMonth
                        ? 'border-neutral-100 hover:border-neutral-200 bg-white dark:border-neutral-800/40 dark:hover:border-neutral-800 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200'
                        : 'border-transparent bg-neutral-50/30 dark:bg-neutral-850/5 text-neutral-400 dark:text-neutral-600'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-semibold ${isToday ? 'bg-brand-500 text-white px-1.5 py-0.5 rounded-md text-[10px]' : ''}`}>
                      {cell.day}
                    </span>
                  </div>

                  {/* Indicators for tasks or exams */}
                  <div className="flex gap-1 items-center overflow-x-hidden min-h-[14px]">
                    {hasExams && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" title="Exam Scheduled" />
                    )}
                    {cellTasks.slice(0, 3).map(task => (
                      <span
                        key={task.id}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: task.status === 'completed' ? '#10b981' : getSubjectColor(task.subjectId) }}
                        title={task.title}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side (4 columns) */}
        <div className="md:col-span-4 space-y-6">
          {/* Daily Agenda */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 p-5 rounded-3xl shadow-xs text-left">
            <h3 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-3">
              Agenda: {new Date(selectedDateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </h3>

            {selectedTasks.length === 0 && selectedExams.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400 dark:text-neutral-500">
                No items on this date.
              </div>
            ) : (
              <div className="space-y-3">
                {/* Exams */}
                {selectedExams.map(exam => (
                  <div key={exam.id} className="p-3 bg-rose-50/40 dark:bg-rose-950/10 border border-rose-250/20 rounded-xl flex items-start gap-2.5">
                    <LucideIcon name="AlertTriangle" className="text-rose-500 mt-0.5 shrink-0" size={14} />
                    <div>
                      <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">
                        EXAM DAY
                      </span>
                      <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                        {exam.name} Exam
                      </span>
                    </div>
                  </div>
                ))}

                {/* Tasks */}
                {selectedTasks.map(task => (
                  <div key={task.id} className="p-3 bg-neutral-50/50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 rounded-xl flex items-start justify-between">
                    <div className="min-w-0 pr-2">
                      <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block truncate">
                        {task.title}
                      </span>
                      <span className="text-[9px] text-neutral-400 font-bold uppercase">
                        {getSubjectName(task.subjectId)}
                      </span>
                    </div>
                    {task.status !== 'completed' && (
                      <button
                        onClick={() => completeTask(task.id)}
                        className="p-1 bg-white hover:bg-emerald-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-750 hover:border-emerald-500 rounded-lg text-neutral-400 hover:text-emerald-500 transition-all"
                        title="Mark Complete"
                      >
                        <LucideIcon name="Check" size={11} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Exam Countdown & Deadlines checklist */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 p-5 rounded-3xl shadow-xs text-left space-y-4">
            <h3 className="text-xs font-bold text-neutral-850 dark:text-neutral-200 border-b border-neutral-100 dark:border-neutral-800 pb-2 flex items-center gap-1.5">
              <LucideIcon name="Hourglass" size={14} /> Upcoming Exams
            </h3>
            {upcomingExams.length > 0 ? (
              <div className="space-y-3">
                {upcomingExams.slice(0, 3).map(exam => {
                  const examTime = new Date(exam.examDate).getTime();
                  const todayTime = new Date(todayStr).getTime();
                  const diffDays = Math.ceil((examTime - todayTime) / 86400000);
                  
                  return (
                    <div key={exam.id} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: exam.color }} />
                        <span className="font-semibold text-neutral-700 dark:text-neutral-300 truncate">{exam.name}</span>
                      </div>
                      <span className={`text-[10px] font-bold shrink-0 ${diffDays <= 5 ? 'text-rose-500 animate-pulse' : 'text-neutral-400'}`}>
                        {diffDays === 0 ? 'Today!' : `${diffDays} days`}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[10px] text-neutral-400">No scheduled exams upcoming.</p>
            )}

            <h3 className="text-xs font-bold text-neutral-850 dark:text-neutral-200 border-b border-neutral-100 dark:border-neutral-800 pt-2 pb-2 flex items-center gap-1.5">
              <LucideIcon name="Clock" size={14} /> Next Deadlines
            </h3>
            {upcomingDeadlines.length > 0 ? (
              <div className="space-y-2.5">
                {upcomingDeadlines.map(deadline => (
                  <div key={deadline.id} className="text-xs flex justify-between items-start">
                    <span className="text-neutral-700 dark:text-neutral-300 font-semibold truncate max-w-[160px]">
                      {deadline.title}
                    </span>
                    <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-bold whitespace-nowrap bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded-md">
                      {deadline.dueDate === todayStr ? 'Today' : deadline.dueDate.slice(5)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-neutral-400">No upcoming task deadlines.</p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
