import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { LucideIcon } from './LucideIcon';

export const CommandPalette: React.FC = () => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setActiveTab,
    setTheme,
    theme,
    setSoundType,
    setFocusMode,
    addNotification
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (commandPaletteOpen) {
      setSearch('');
      setSelectedIndex(0);
      // Delay focus slightly to ensure DOM is rendered
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  const commands = [
    {
      id: 'nav-dash',
      title: 'Go to Dashboard',
      subtitle: 'View summary and streak info',
      icon: 'Layout',
      action: () => { setActiveTab('dashboard'); setCommandPaletteOpen(false); }
    },
    {
      id: 'nav-timer',
      title: 'Go to Focus Timer',
      subtitle: 'Start Pomodoro or Custom study session',
      icon: 'Clock',
      action: () => { setActiveTab('timer'); setCommandPaletteOpen(false); }
    },
    {
      id: 'nav-tasks',
      title: 'Go to Tasks',
      subtitle: 'Manage subjects checklist and due dates',
      icon: 'CheckSquare',
      action: () => { setActiveTab('tasks'); setCommandPaletteOpen(false); }
    },
    {
      id: 'nav-subjects',
      title: 'Go to Subjects',
      subtitle: 'Track exams, target scores, and hours',
      icon: 'BookOpen',
      action: () => { setActiveTab('subjects'); setCommandPaletteOpen(false); }
    },
    {
      id: 'nav-analytics',
      title: 'Go to Analytics & Heatmap',
      subtitle: 'Review study charts and consistencies',
      icon: 'BarChart2',
      action: () => { setActiveTab('analytics'); setCommandPaletteOpen(false); }
    },
    {
      id: 'nav-calendar',
      title: 'Go to Calendar',
      subtitle: 'Schedule events and exam countdowns',
      icon: 'Calendar',
      action: () => { setActiveTab('calendar'); setCommandPaletteOpen(false); }
    },
    {
      id: 'nav-habits',
      title: 'Go to Habit Tracker',
      subtitle: 'Log and review daily disciplines',
      icon: 'Heart',
      action: () => { setActiveTab('habits'); setCommandPaletteOpen(false); }
    },
    {
      id: 'nav-notes',
      title: 'Go to Notes Editor',
      subtitle: 'Create rich study logs and text notes',
      icon: 'PenTool',
      action: () => { setActiveTab('notes'); setCommandPaletteOpen(false); }
    },
    {
      id: 'nav-achieve',
      title: 'Go to Achievements & Levels',
      subtitle: 'View study badges and XP status',
      icon: 'Award',
      action: () => { setActiveTab('achievements'); setCommandPaletteOpen(false); }
    },
    {
      id: 'theme-toggle',
      title: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      subtitle: 'Toggle theme display mode',
      icon: theme === 'dark' ? 'Sun' : 'Moon',
      action: () => { setTheme(theme === 'dark' ? 'light' : 'dark'); setCommandPaletteOpen(false); }
    },
    {
      id: 'sound-white',
      title: 'Play White Noise',
      subtitle: 'Ambient constant sound spectrum',
      icon: 'Volume2',
      action: () => { setSoundType('white'); addNotification('Ambient Sound Started', 'Playing White Noise', 'info'); setCommandPaletteOpen(false); }
    },
    {
      id: 'sound-rain',
      title: 'Play Rainfall',
      subtitle: 'Soothing rain and crackling droplets',
      icon: 'Volume2',
      action: () => { setSoundType('rain'); addNotification('Ambient Sound Started', 'Playing Rainfall', 'info'); setCommandPaletteOpen(false); }
    },
    {
      id: 'sound-ocean',
      title: 'Play Deep Ocean Waves',
      subtitle: 'Rhythmic, deep washing waves',
      icon: 'Volume2',
      action: () => { setSoundType('ocean'); addNotification('Ambient Sound Started', 'Playing Ocean Waves', 'info'); setCommandPaletteOpen(false); }
    },
    {
      id: 'sound-focus',
      title: 'Play Focus Hum',
      subtitle: 'Deep resonance binaural generator',
      icon: 'Volume2',
      action: () => { setSoundType('focus'); addNotification('Ambient Sound Started', 'Playing Focus Hum', 'info'); setCommandPaletteOpen(false); }
    },
    {
      id: 'sound-stop',
      title: 'Stop Ambient Sound',
      subtitle: 'Silence background speakers',
      icon: 'VolumeX',
      action: () => { setSoundType('none'); setCommandPaletteOpen(false); }
    },
    {
      id: 'start-focus',
      title: 'Quick Focus Mode',
      subtitle: 'Toggle fullscreen focus timer right now',
      icon: 'Brain',
      action: () => { setActiveTab('timer'); setFocusMode(true); setCommandPaletteOpen(false); }
    }
  ];

  // Filter commands by search string
  const filteredCommands = commands.filter(cmd =>
    cmd.title.toLowerCase().includes(search.toLowerCase()) ||
    cmd.subtitle.toLowerCase().includes(search.toLowerCase())
  );

  // Keyboard navigation within list
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!commandPaletteOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, filteredCommands, selectedIndex]);

  // Adjust scroll position to keep selected item in view
  useEffect(() => {
    const activeEl = listRef.current?.children[selectedIndex] as HTMLElement;
    if (activeEl && listRef.current) {
      const containerHeight = listRef.current.clientHeight;
      const elemTop = activeEl.offsetTop;
      const elemHeight = activeEl.clientHeight;
      
      if (elemTop + elemHeight > listRef.current.scrollTop + containerHeight) {
        listRef.current.scrollTop = elemTop + elemHeight - containerHeight;
      } else if (elemTop < listRef.current.scrollTop) {
        listRef.current.scrollTop = elemTop;
      }
    }
  }, [selectedIndex]);

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-neutral-900/40 dark:bg-black/60 backdrop-blur-xs transition-opacity duration-300">
      <div 
        className="w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center px-4 border-b border-neutral-100 dark:border-neutral-800">
          <LucideIcon name="Search" className="text-neutral-400 dark:text-neutral-500 mr-3" size={18} />
          <input
            ref={inputRef}
            type="text"
            className="w-full py-4 bg-transparent border-0 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 text-sm focus:outline-hidden"
            placeholder="Type a command or search navigations... (Esc to close)"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Command List */}
        <div 
          ref={listRef}
          className="max-h-80 overflow-y-auto py-2"
        >
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  className={`flex items-center px-4 py-3 cursor-pointer transition-colors duration-150 ${
                    isSelected 
                      ? 'bg-neutral-100 dark:bg-neutral-800/60' 
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/20'
                  }`}
                  onClick={() => cmd.action()}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className={`p-2 rounded-lg mr-3.5 transition-colors ${
                    isSelected 
                      ? 'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400' 
                      : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
                  }`}>
                    <LucideIcon name={cmd.icon} size={16} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      {cmd.title}
                    </div>
                    <div className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                      {cmd.subtitle}
                    </div>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 flex items-center font-medium">
                      Select <LucideIcon name="CornerDownLeft" className="ml-1" size={10} />
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-neutral-400 dark:text-neutral-500 text-sm">
              No results found for "{search}"
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 bg-neutral-50 dark:bg-neutral-800/30 border-t border-neutral-100 dark:border-neutral-800 text-[10px] text-neutral-400 dark:text-neutral-500">
          <span>Use <kbd>↑</kbd> <kbd>↓</kbd> to navigate, <kbd>Enter</kbd> to select</span>
          <span>Press <kbd>Esc</kbd> to dismiss</span>
        </div>
      </div>
      
      {/* Backdrop Close Click */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
};
