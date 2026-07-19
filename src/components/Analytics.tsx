import React from 'react';
import { useApp } from '../context/AppContext';
import { LucideIcon } from './LucideIcon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const Analytics: React.FC = () => {
  const { sessions, subjects, tasks, habits } = useApp();

  // Helper: Get past N days dates
  const getLastNDays = (n: number) => {
    const dates = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  // 1. Weekly Study Chart Data (past 7 days)
  const last7Days = getLastNDays(7);
  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const weeklyData = last7Days.map(dateStr => {
    const daySessions = sessions.filter(s => s.type === 'focus' && s.date.startsWith(dateStr));
    const totalMins = daySessions.reduce((acc, s) => acc + s.duration / 60, 0);
    const dayIndex = new Date(dateStr).getDay();
    return {
      day: weekdayNames[dayIndex],
      hours: Number((totalMins / 60).toFixed(1)),
      date: dateStr
    };
  });

  // 2. Subject Comparison (Time distribution)
  const subjectTimeData = subjects.map(subj => {
    const subjSessions = sessions.filter(s => s.type === 'focus' && s.subjectId === subj.id);
    const totalHours = subjSessions.reduce((acc, s) => acc + s.duration / 3600, 0);
    return {
      name: subj.name,
      value: Number(totalHours.toFixed(1)),
      color: subj.color
    };
  }).filter(item => item.value > 0);

  // If no subject has study sessions, provide dummy data to keep chart alive
  const pieData = subjectTimeData.length > 0 ? subjectTimeData : [
    { name: 'No focus logged yet', value: 1, color: '#e4e2dd' }
  ];

  // 3. GitHub style Heatmap (past 12 weeks)
  const getGitHubHeatmapData = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Saturday of the current week
    const endDate = new Date(today);
    const endDayIndex = endDate.getDay();
    endDate.setDate(endDate.getDate() + (6 - endDayIndex));
    
    // Sunday of 12 weeks ago (84 days before Saturday)
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 83);

    const days = [];
    for (let i = 0; i < 84; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];

      const isFuture = dateStr > todayStr;
      let hours = 0;
      let colorClass = 'bg-neutral-150 dark:bg-neutral-800/40';
      
      if (!isFuture) {
        const daySessions = sessions.filter(s => s.type === 'focus' && s.date.startsWith(dateStr));
        const dayHabits = habits.find(h => h.date === dateStr);
        const habitHours = dayHabits?.study ? 0.5 : 0;
        
        hours = daySessions.reduce((acc, s) => acc + s.duration / 3600, 0) + habitHours;

        if (hours > 0 && hours <= 0.5) colorClass = 'bg-emerald-100 dark:bg-emerald-950/20 text-emerald-700';
        else if (hours > 0.5 && hours <= 1.5) colorClass = 'bg-emerald-200 dark:bg-emerald-900/30 text-emerald-600';
        else if (hours > 1.5 && hours <= 3.0) colorClass = 'bg-emerald-400 dark:bg-emerald-700/60 text-emerald-100';
        else if (hours > 3.0) colorClass = 'bg-emerald-600 dark:bg-emerald-500 text-white';
      }

      days.push({
        date: dateStr,
        hours: Number(hours.toFixed(1)),
        colorClass
      });
    }
    return days;
  };

  const heatmapData = getGitHubHeatmapData();

  // 4. Statistics calculations
  const totalFocusSecs = sessions.filter(s => s.type === 'focus').reduce((acc, s) => acc + s.duration, 0);
  const avgSessionMin = sessions.filter(s => s.type === 'focus').length > 0 
    ? Math.round((totalFocusSecs / 60) / sessions.filter(s => s.type === 'focus').length) 
    : 0;

  // Most productive time of day
  // Categories: Morning (6:00 - 12:00), Afternoon (12:00 - 18:00), Evening/Night (18:00 - 6:00)
  let morningCount = 0;
  let afternoonCount = 0;
  let eveningCount = 0;
  
  sessions.filter(s => s.type === 'focus').forEach(s => {
    const hour = new Date(s.date).getHours();
    if (hour >= 6 && hour < 12) morningCount += s.duration;
    else if (hour >= 12 && hour < 18) afternoonCount += s.duration;
    else eveningCount += s.duration;
  });

  let productiveTime = 'Evening';
  let maxTimeSecs = eveningCount;
  if (morningCount > maxTimeSecs) {
    productiveTime = 'Morning';
    maxTimeSecs = morningCount;
  }
  if (afternoonCount > maxTimeSecs) {
    productiveTime = 'Afternoon';
  }
  if (totalFocusSecs === 0) productiveTime = 'Not enough data';

  // Most productive day of the week
  const dayMinutes = [0, 0, 0, 0, 0, 0, 0]; // Sun - Sat
  sessions.filter(s => s.type === 'focus').forEach(s => {
    const dayIndex = new Date(s.date).getDay();
    dayMinutes[dayIndex] += s.duration / 60;
  });
  
  const maxDayIndex = dayMinutes.indexOf(Math.max(...dayMinutes));
  const productiveDay = totalFocusSecs > 0 ? weekdayNames[maxDayIndex] : 'Not enough data';

  // Completion Rate
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 p-2.5 rounded-lg shadow-xs text-xs">
          <p className="font-semibold text-neutral-800 dark:text-neutral-200">
            {payload[0].name === 'hours' ? `${payload[0].value} hours studied` : ''}
          </p>
          <p className="text-[10px] text-neutral-400 mt-0.5">{payload[0].payload.date}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 mb-1.5">
          Analytics & Insights
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
          A summary of your study habits, streaks, and subject distribution charts.
        </p>
      </div>

      {/* Stats Cards grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Avg session length */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 p-4.5 rounded-2xl">
          <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 block uppercase tracking-wide mb-1">
            Avg Focus Session
          </span>
          <span className="text-xl font-bold text-neutral-850 dark:text-neutral-100">
            {avgSessionMin} mins
          </span>
        </div>

        {/* Completion rate */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 p-4.5 rounded-2xl">
          <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 block uppercase tracking-wide mb-1">
            Task Completion
          </span>
          <span className="text-xl font-bold text-neutral-850 dark:text-neutral-100">
            {completionRate}%
          </span>
        </div>

        {/* Most active day */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 p-4.5 rounded-2xl">
          <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 block uppercase tracking-wide mb-1">
            Most Active Day
          </span>
          <span className="text-xl font-bold text-neutral-850 dark:text-neutral-100">
            {productiveDay}
          </span>
        </div>

        {/* Peak focus time */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 p-4.5 rounded-2xl">
          <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 block uppercase tracking-wide mb-1">
            Peak Focus Time
          </span>
          <span className="text-xl font-bold text-neutral-850 dark:text-neutral-100">
            {productiveTime}
          </span>
        </div>
      </div>

      {/* Heatmap Section */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 p-5 rounded-3xl shadow-xs">
        <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-4 flex items-center gap-2">
          <LucideIcon name="Calendar" size={16} /> Study Intensity (GitHub style)
        </h3>
        
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 items-end overflow-x-auto pb-2">
            {/* Weekday indicators */}
            <div className="grid grid-rows-7 text-[8px] font-bold text-neutral-400 dark:text-neutral-500 h-28 pr-1 select-none leading-[16px]">
              <span>Sun</span>
              <span className="invisible">Mon</span>
              <span>Tue</span>
              <span className="invisible">Wed</span>
              <span>Thu</span>
              <span className="invisible">Fri</span>
              <span>Sat</span>
            </div>

            {/* Heatmap Grid columns */}
            <div className="grid grid-rows-7 grid-flow-col gap-1 pr-1 h-28">
              {heatmapData.map((day) => (
                <div
                  key={day.date}
                  className={`w-3.5 h-3.5 rounded-xs ${day.colorClass} group relative cursor-help transition-all duration-150 hover:scale-112`}
                >
                  {/* Hover Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 px-2 py-1 bg-neutral-900 dark:bg-neutral-800 text-white text-[9px] font-semibold rounded-md shadow-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-35">
                    {day.date}: {day.hours}h studied
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-850">
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500">Activity tracked over the past 12 weeks</span>
            <div className="flex items-center gap-1 text-[9px] font-semibold text-neutral-400 dark:text-neutral-500">
              <span>Less</span>
              <div className="w-3 h-3 rounded-xs bg-neutral-100 dark:bg-neutral-800" />
              <div className="w-3 h-3 rounded-xs bg-emerald-100 dark:bg-emerald-950/20" />
              <div className="w-3 h-3 rounded-xs bg-emerald-200 dark:bg-emerald-900/30" />
              <div className="w-3 h-3 rounded-xs bg-emerald-400 dark:bg-emerald-700/60" />
              <div className="w-3 h-3 rounded-xs bg-emerald-600 dark:bg-emerald-500" />
              <span>More</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Weekly Progress Bar Chart */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 p-5 rounded-3xl shadow-xs">
          <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-4 flex items-center gap-2">
            <LucideIcon name="BarChart" size={16} /> Weekly Hours Studied
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e2dd30" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                <Bar dataKey="hours" fill="#0ea5e9" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject distribution Pie Chart */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 p-5 rounded-3xl shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-4 flex items-center gap-2">
              <LucideIcon name="PieChart" size={16} /> Subject Distribution
            </h3>
            <div className="h-48 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} hrs`, 'Focused Time']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">FOCUS TIME</span>
                <span className="text-lg font-bold text-neutral-800 dark:text-neutral-100">
                  {Number((totalFocusSecs / 3600).toFixed(1))} hrs
                </span>
              </div>
            </div>
          </div>

          {/* Custom Legends list */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/60 text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 justify-center">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span>{item.name} {item.value > 0 && `(${item.value}h)`}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
