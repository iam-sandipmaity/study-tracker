import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { OnboardingTour } from './components/OnboardingTour';
import { DataExportImport } from './components/DataExportImport';
import { CommandPalette } from './components/CommandPalette';
import { NotificationCenter } from './components/NotificationCenter';
import { LucideIcon } from './components/LucideIcon';
import { Dashboard } from './components/Dashboard';
import { Timer } from './components/Timer';
import { Tasks } from './components/Tasks';
import { Subjects } from './components/Subjects';
import { Analytics } from './components/Analytics';
import { Calendar } from './components/Calendar';
import { Habits } from './components/Habits';
import { Notes } from './components/Notes';
import { Achievements } from './components/Achievements';

const AppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    theme,
    setTheme,
    setCommandPaletteOpen,
    focusMode,
    stats,
    soundType
  } = useApp();

  const { user, signOut, isConfigured } = useAuth();

  // Onboarding state
  const [showTour, setShowTour] = useState(() => {
    return isConfigured && !localStorage.getItem('study_tour_completed');
  });
  const [showExportImport, setShowExportImport] = useState(false);

  const completeTour = () => {
    localStorage.setItem('study_tour_completed', 'true');
    setShowTour(false);
  };

  // Get user's display name from Supabase metadata
  const userDisplayName = (user?.user_metadata?.display_name as string) || user?.email?.split('@')[0] || 'Scholar';

  // Navigation Items definitions
  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: 'Layout' },
    { id: 'timer', name: 'Focus Timer', icon: 'Clock' },
    { id: 'tasks', name: 'Tasks Board', icon: 'CheckSquare' },
    { id: 'subjects', name: 'Subject Plans', icon: 'BookOpen' },
    { id: 'analytics', name: 'Analytics', icon: 'BarChart2' },
    { id: 'calendar', name: 'Calendar', icon: 'Calendar' },
    { id: 'habits', name: 'Habit Tracker', icon: 'Heart' },
    { id: 'notes', name: 'Study Notes', icon: 'PenTool' },
    { id: 'achievements', name: 'Achievements', icon: 'Award' }
  ];

  // Render active tab content
  const renderContent = () => {
    switch (activeTab) {
      case 'timer': return <Timer />;
      case 'tasks': return <Tasks />;
      case 'subjects': return <Subjects />;
      case 'analytics': return <Analytics />;
      case 'calendar': return <Calendar />;
      case 'habits': return <Habits />;
      case 'notes': return <Notes />;
      case 'achievements': return <Achievements />;
      default: return <Dashboard />;
    }
  };

  // Capitalize path for breadcrumbs
  const getActiveTabLabel = () => {
    const activeItem = navItems.find(item => item.id === activeTab);
    return activeItem ? activeItem.name : 'Dashboard';
  };

  // Focus Mode strips away all navigation wrappers
  if (focusMode) {
    return (
      <div className="min-h-screen bg-[#0c0a09] transition-colors duration-300 text-white font-sans selection:bg-brand-900/30 selection:text-brand-400">
        <Timer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-warm-50 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 font-sans selection:bg-brand-100 dark:selection:bg-brand-950/20 transition-colors duration-300 flex flex-col md:flex-row relative overflow-x-hidden">
      
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-0 w-[50%] h-[50%] rounded-full bg-brand-200/20 dark:bg-brand-900/5 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] right-0 w-[50%] h-[50%] rounded-full bg-emerald-200/10 dark:bg-emerald-950/5 blur-[120px] pointer-events-none -z-10" />

      {/* 1. Sidebar (Desktop Navigation) */}
      <aside className="hidden md:flex md:w-64 border-r border-neutral-200/60 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/90 backdrop-blur-md flex-col justify-between shrink-0 sticky top-0 h-screen z-20">
        <div className="p-6 flex flex-col space-y-7">
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <LucideIcon name="Brain" size={16} />
            </div>
            <span className="font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 text-sm">
              Study Tracker
            </span>
          </div>

          {/* Nav List */}
          <nav className="flex flex-col space-y-1">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 shadow-2xs' 
                      : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                >
                  <LucideIcon name={item.icon} size={15} />
                  <span>{item.name}</span>
                  {isActive && <div className="ml-auto w-1 h-3.5 rounded-full bg-brand-500" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Profile Card / Streaks Footer */}
        <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/10">
          <div className="flex items-center gap-3 bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/60 p-3 rounded-xl">
            <div className="h-7 w-7 rounded-full bg-brand-100 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400 flex items-center justify-center text-xs font-black">
              {stats.level}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-[10px] font-bold text-neutral-700 dark:text-neutral-250 truncate">{userDisplayName}</p>
              <div className="flex items-center gap-2.5 mt-0.5">
                <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-semibold">{stats.xp} XP</span>
                <span className="h-1 w-1 bg-neutral-300 dark:bg-neutral-750 rounded-full" />
                <span className="text-[9px] text-orange-500 font-bold flex items-center gap-0.5">
                  <LucideIcon name="Flame" size={10} /> {stats.streak}d
                </span>
              </div>
            </div>
            {/* Logout button */}
            {isConfigured && (
              <button
                onClick={() => signOut()}
                className="p-1.5 text-neutral-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg transition-colors"
                title="Sign out"
              >
                <LucideIcon name="LogOut" size={14} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* 2. Main Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* Top Header Navigation */}
        <header className="sticky top-0 bg-neutral-warm-50/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200/40 dark:border-neutral-800/40 px-6 py-4 flex items-center justify-between z-10 shrink-0">
          {/* Breadcrumb / Section Label */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Workspace</span>
            <span className="text-xs text-neutral-300 dark:text-neutral-700">/</span>
            <span className="text-xs font-bold text-neutral-700 dark:text-neutral-200">
              {getActiveTabLabel()}
            </span>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2">
            {/* Ambient Sound Status Indicator */}
            {soundType !== 'none' && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-50/60 dark:bg-brand-950/20 text-[9px] font-bold text-brand-600 dark:text-brand-400 border border-brand-100/50 dark:border-brand-800/50 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-ping" />
                Audio: {soundType}
              </span>
            )}

            {/* Export/Import button */}
            <button
              onClick={() => setShowExportImport(true)}
              className="p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-150 dark:hover:bg-neutral-800 rounded-xl transition-all duration-200 focus:outline-hidden"
              title="Backup & Restore"
            >
              <LucideIcon name="HardDrive" size={18} />
            </button>

            {/* Raycast Trigger Help Tag */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200/60 dark:bg-neutral-800/60 dark:hover:bg-neutral-800 text-[10px] font-bold text-neutral-500 dark:text-neutral-400 rounded-lg border border-neutral-200/30 dark:border-neutral-700/30 transition-all focus:outline-hidden"
              title="Open Command Menu"
            >
              <span>Command Menu</span>
              <kbd className="text-[9px] opacity-70 bg-neutral-200 dark:bg-neutral-750 px-1 rounded-sm ml-0.5">⌘K</kbd>
            </button>

            {/* Notification Center Popover */}
            <NotificationCenter />

            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-150 dark:hover:bg-neutral-800 rounded-xl transition-all duration-200 focus:outline-hidden"
              title={theme === 'dark' ? 'Use light mode' : 'Use dark mode'}
            >
              <LucideIcon name={theme === 'dark' ? 'Sun' : 'Moon'} size={18} />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 overflow-y-auto min-h-0 md:mb-0 mb-16">
          {renderContent()}
        </main>

        {/* 3. Mobile Footer Navigation (Visible on mobile only) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-neutral-900/95 border-t border-neutral-200/60 dark:border-neutral-800/80 backdrop-blur-md flex items-center justify-around py-2.5 px-4 z-30 shadow-lg">
          {navItems.slice(0, 5).map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center gap-1 p-1 transition-all ${
                  isActive 
                    ? 'text-brand-500 scale-103 font-bold' 
                    : 'text-neutral-450 dark:text-neutral-500 hover:text-neutral-600'
                }`}
              >
                <LucideIcon name={item.icon} size={18} />
                <span className="text-[9px] font-semibold">{item.name.split(' ')[0]}</span>
              </button>
            );
          })}
          {/* More menu button to trigger achievements/calendar/notes */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex flex-col items-center justify-center gap-1 p-1 text-neutral-450 dark:text-neutral-500"
          >
            <LucideIcon name="Menu" size={18} />
            <span className="text-[9px] font-semibold">More</span>
          </button>
        </nav>

        {/* Floating Quick Command Palette Button */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="fixed bottom-20 right-6 md:bottom-8 md:right-8 h-12 w-12 rounded-full bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-108 active:scale-95 transition-all z-30 cursor-pointer"
          title="Open Command Palette (⌘K)"
        >
          <LucideIcon name="Terminal" size={20} />
        </button>

      </div>

      {/* Global Command Palette Dialog */}
      <CommandPalette />

      {/* Onboarding Tour */}
      {showTour && <OnboardingTour onComplete={completeTour} />}

      {/* Export/Import Modal */}
      {showExportImport && <DataExportImport onClose={() => setShowExportImport(false)} />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;
