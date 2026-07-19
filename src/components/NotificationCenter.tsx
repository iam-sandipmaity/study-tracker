import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { LucideIcon } from './LucideIcon';

export const NotificationCenter: React.FC = () => {
  const {
    notifications,
    clearNotification,
    markAllNotificationsRead
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <LucideIcon name="CheckCircle" className="text-emerald-500" size={16} />;
      case 'warning': return <LucideIcon name="AlertTriangle" className="text-amber-500" size={16} />;
      case 'alert': return <LucideIcon name="AlertOctagon" className="text-rose-500" size={16} />;
      default: return <LucideIcon name="Info" className="text-sky-500" size={16} />;
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadCount > 0) {
            markAllNotificationsRead();
          }
        }}
        className="relative p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-all duration-200 focus:outline-hidden"
        aria-label="Notifications"
      >
        <LucideIcon name="Bell" size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-semibold text-white ring-2 ring-white dark:ring-neutral-900 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl shadow-xl overflow-hidden z-40 animate-fade-in origin-top-right">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-neutral-50/50 dark:bg-neutral-800/20 border-b border-neutral-100 dark:border-neutral-800">
            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Notifications</span>
            {notifications.length > 0 && (
              <button
                onClick={() => markAllNotificationsRead()}
                className="text-[10px] font-medium text-brand-600 dark:text-brand-400 hover:underline focus:outline-hidden"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
            {notifications.length > 0 ? (
              notifications.map(notif => (
                <div 
                  key={notif.id} 
                  className={`flex items-start p-3.5 transition-colors duration-150 relative group ${
                    !notif.read ? 'bg-brand-50/20 dark:bg-brand-950/10' : ''
                  }`}
                >
                  <div className="mr-3 mt-0.5 shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0 pr-4 text-left">
                    <p className={`text-xs font-medium text-neutral-800 dark:text-neutral-200 leading-tight ${
                      !notif.read ? 'font-semibold' : ''
                    }`}>
                      {notif.title}
                    </p>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-normal">
                      {notif.message}
                    </p>
                    <span className="text-[9px] text-neutral-400 dark:text-neutral-500 mt-1.5 block">
                      {formatTime(notif.timestamp)}
                    </span>
                  </div>
                  
                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearNotification(notif.id);
                    }}
                    className="absolute right-3 top-3.5 text-neutral-300 dark:text-neutral-600 hover:text-rose-500 dark:hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150 focus:outline-hidden"
                    title="Dismiss"
                  >
                    <LucideIcon name="X" size={13} />
                  </button>
                </div>
              ))
            ) : (
              <div className="py-10 text-center flex flex-col items-center justify-center">
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-full text-neutral-300 dark:text-neutral-600 mb-2">
                  <LucideIcon name="BellOff" size={24} />
                </div>
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">All caught up!</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">No new notifications here.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
