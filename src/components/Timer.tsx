import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { LucideIcon } from './LucideIcon';
import { ambientOptions, playCompletionChime } from '../audioSynthesis';
import { triggerConfetti } from '../utils/confetti';

export const Timer: React.FC = () => {
  const {
    activeSessionTask,
    setActiveSessionTask,
    logSession,
    subjects,
    soundType,
    setSoundType,
    soundVolume,
    setSoundVolume,
    focusMode,
    setFocusMode,
    addNotification
  } = useApp();

  // Timer presets
  const presets = [
    { id: 'pomodoro', name: 'Pomodoro', duration: 25 * 60, type: 'focus' as const },
    { id: 'short_break', name: 'Short Break', duration: 5 * 60, type: 'short_break' as const },
    { id: 'long_break', name: 'Long Break', duration: 15 * 60, type: 'long_break' as const },
    { id: 'custom', name: 'Custom Focus', duration: 45 * 60, type: 'focus' as const }
  ];

  const [activePreset, setActivePreset] = useState(presets[0]);
  const [customMinutes, setCustomMinutes] = useState(45);
  const [timeLeft, setTimeLeft] = useState(presets[0].duration);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  
  // Post session note modal state
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [completedDuration, setCompletedDuration] = useState(0);
  const [sessionNotes, setSessionNotes] = useState('');
  const [completedType, setCompletedType] = useState<'focus' | 'short_break' | 'long_break'>('focus');
  const [completedSubjectId, setCompletedSubjectId] = useState('');

  const timerRef = useRef<any>(null);

  // Use refs to avoid stale closures in the interval callback
  const presetRef = useRef(activePreset);
  const customMinutesRef = useRef(customMinutes);
  const subjectIdRef = useRef(selectedSubjectId);
  
  useEffect(() => { presetRef.current = activePreset; }, [activePreset]);
  useEffect(() => { customMinutesRef.current = customMinutes; }, [customMinutes]);
  useEffect(() => { subjectIdRef.current = selectedSubjectId; }, [selectedSubjectId]);

  // Sync timer when preset changes
  useEffect(() => {
    setIsRunning(false);
    if (activePreset.id === 'custom') {
      setTimeLeft(customMinutes * 60);
    } else {
      setTimeLeft(activePreset.duration);
    }
  }, [activePreset, customMinutes]);

  // Stable completion handler using refs for fresh values
  const handleTimerCompleteRef = useRef<() => void>(() => {});
  handleTimerCompleteRef.current = () => {
    setIsRunning(false);
    clearInterval(timerRef.current);
    playCompletionChime();
    triggerConfetti();
    
    const preset = presetRef.current;
    const mins = customMinutesRef.current;
    const subjId = subjectIdRef.current;
    const duration = preset.id === 'custom' ? mins * 60 : preset.duration;
    
    setCompletedDuration(duration);
    setCompletedType(preset.type);
    setCompletedSubjectId(subjId);
    
    if (preset.type === 'focus') {
      setShowNoteModal(true);
      setSessionNotes('');
    } else {
      logSession(duration, preset.type, 'Completed break session.', subjId || undefined);
      addNotification('Break Finished!', 'Time to get back to focus!', 'info');
    }
  };

  // Timer countdown logic — uses ref-based completion to avoid stale closures
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerCompleteRef.current();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handleSaveNotes = (e: React.FormEvent) => {
    e.preventDefault();
    logSession(
      completedDuration,
      completedType,
      sessionNotes.trim() || 'Focus session completed successfully.',
      completedSubjectId || undefined
    );
    setShowNoteModal(false);
    setSessionNotes('');
  };

  const toggleStart = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (activePreset.id === 'custom') {
      setTimeLeft(customMinutes * 60);
    } else {
      setTimeLeft(activePreset.duration);
    }
  };

  const formatMinSec = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Document title updates with timer
  useEffect(() => {
    if (isRunning) {
      document.title = `${formatMinSec(timeLeft)} | study-tracker`;
    } else {
      document.title = 'study-tracker';
    }
    return () => {
      document.title = 'study-tracker';
    };
  }, [timeLeft, isRunning]);

  // Quick sound volume step
  const handleVolumeUp = () => setSoundVolume(Math.min(1, soundVolume + 0.1));
  const handleVolumeDown = () => setSoundVolume(Math.max(0, soundVolume - 0.1));

  return (
    <div className={`max-w-4xl mx-auto pb-10 ${focusMode ? 'fixed inset-0 z-50 bg-[#0c0a09] flex flex-col items-center justify-center p-6 text-white' : 'text-left space-y-7'}`}>
      
      {/* Title / Back row (Fullscreen Focus mode only) */}
      {focusMode && (
        <button
          onClick={() => setFocusMode(false)}
          className="absolute top-6 left-6 px-4 py-2 border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800/80 rounded-xl text-xs font-semibold text-neutral-400 hover:text-neutral-100 flex items-center gap-2 transition-all"
        >
          <LucideIcon name="ChevronLeft" size={14} /> Exit Focus Mode
        </button>
      )}

      {/* Title (Normal mode) */}
      {!focusMode && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 mb-1.5">
              Focus Sessions
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">
              Use Pomodoros or Custom timers, and choose ambient background white noise.
            </p>
          </div>
          
          <button
            onClick={() => setFocusMode(true)}
            className="p-3 bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 rounded-xl hover:shadow-xs text-neutral-600 dark:text-neutral-300 hover:text-brand-500 hover:border-brand-300 transition-all duration-200 flex items-center gap-2 text-xs font-semibold"
          >
            <LucideIcon name="Maximize" size={15} /> Focus Mode
          </button>
        </div>
      )}

      {/* Main Grid: Left = Timer clock & actions, Right = Sound mixer */}
      <div className={`grid grid-cols-1 ${focusMode ? 'max-w-md w-full' : 'md:grid-cols-12 gap-7'}`}>
        
        {/* Timer Card (8 Columns) */}
        <div className={`${focusMode ? '' : 'md:col-span-8'} bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 p-8 rounded-3xl shadow-xs flex flex-col items-center justify-center text-center relative`}>
          
          {/* Linked Task Tag */}
          {activeSessionTask && (
            <div className="absolute top-6 left-6 right-6 flex items-center justify-center gap-2 px-3 py-1.5 bg-brand-50 dark:bg-brand-950/20 border border-brand-100/50 dark:border-brand-800/50 rounded-full max-w-xs mx-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-ping" />
              <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 truncate">
                Focus: {activeSessionTask.title}
              </span>
              <button 
                onClick={() => setActiveSessionTask(null)}
                className="text-neutral-400 hover:text-rose-500 transition-colors"
                title="Unlink task"
              >
                <LucideIcon name="X" size={10} />
              </button>
            </div>
          )}

          {/* Preset Buttons */}
          <div className="flex bg-neutral-100 dark:bg-neutral-800/70 p-0.5 rounded-2xl mb-8 mt-4 shrink-0 max-w-full overflow-x-auto">
            {presets.map(p => (
              <button
                key={p.id}
                onClick={() => {
                  setActivePreset(p);
                }}
                className={`px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                  activePreset.id === p.id
                    ? 'bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 shadow-xs'
                    : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Custom Duration Input */}
          {activePreset.id === 'custom' && (
            <div className="mb-6 flex items-center justify-center gap-3">
              <span className="text-xs text-neutral-400 dark:text-neutral-500 font-bold">Minutes:</span>
              <input
                type="number"
                min="1"
                max="180"
                className="w-16 px-2 py-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-center text-xs font-bold rounded-lg text-neutral-800 dark:text-neutral-100 focus:outline-hidden"
                value={customMinutes}
                onChange={e => setCustomMinutes(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
          )}

          {/* Timer Circle */}
          <div className="relative w-64 h-64 flex flex-col items-center justify-center mb-8">
            {/* SVG circle track */}
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle 
                cx="128" 
                cy="128" 
                r="114" 
                className="stroke-neutral-100 dark:stroke-neutral-800" 
                strokeWidth="5" 
                fill="transparent" 
              />
              <circle 
                cx="128" 
                cy="128" 
                r="114" 
                className="stroke-brand-500 transition-all duration-300" 
                strokeWidth="5.5" 
                fill="transparent" 
                strokeDasharray={2 * Math.PI * 114}
                strokeDashoffset={
                  activePreset.id === 'custom'
                    ? 2 * Math.PI * 114 * (1 - timeLeft / (customMinutes * 60))
                    : 2 * Math.PI * 114 * (1 - timeLeft / activePreset.duration)
                }
              />
            </svg>
            <div className="z-10 flex flex-col items-center">
              <span className={`font-mono text-5xl font-bold tracking-tight ${focusMode ? 'text-white' : 'text-neutral-800 dark:text-neutral-100'}`}>
                {formatMinSec(timeLeft)}
              </span>
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase font-bold tracking-wider mt-2.5">
                {activePreset.type === 'focus' ? 'Focusing' : 'Resting'}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={resetTimer}
              className="p-3 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 rounded-2xl transition-all"
              title="Reset"
            >
              <LucideIcon name="RotateCcw" size={18} />
            </button>
            <button
              onClick={toggleStart}
              className={`px-8 py-3.5 rounded-2xl text-xs font-bold text-white shadow-md transform hover:scale-103 active:scale-97 transition-all ${
                isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-brand-500 hover:bg-brand-600'
              }`}
            >
              {isRunning ? 'Pause' : 'Start Focus'}
            </button>
            
            {/* Quick Skip button */}
            <button
              onClick={() => handleTimerCompleteRef.current()}
              className="p-3 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 rounded-2xl transition-all"
              title="Skip Session"
            >
              <LucideIcon name="FastForward" size={18} />
            </button>
          </div>

          {/* Subject tag selector for focus sessions */}
          {activePreset.type === 'focus' && !focusMode && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold">Track Subject:</span>
              <select
                className="px-2.5 py-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/85 text-[10px] font-bold rounded-lg text-neutral-700 dark:text-neutral-300 focus:outline-hidden"
                value={selectedSubjectId}
                onChange={e => setSelectedSubjectId(e.target.value)}
              >
                <option value="">None (General)</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Ambient Audio Panel (4 Columns) */}
        {!focusMode && (
          <div className="md:col-span-4 bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 p-6 rounded-3xl shadow-xs space-y-6">
            <h2 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
              <LucideIcon name="Volume2" size={16} /> Ambient Sounds
            </h2>
            <div className="space-y-3.5">
              {ambientOptions.map(opt => {
                const isActive = soundType === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSoundType(opt.id as any)}
                    className={`w-full p-3.5 rounded-2xl border text-xs font-semibold text-left flex items-center justify-between transition-all duration-200 ${
                      isActive 
                        ? 'bg-brand-50/30 border-brand-200/80 text-brand-600 dark:bg-brand-950/10 dark:border-brand-900/50 dark:text-brand-400' 
                        : 'border-neutral-100 hover:border-neutral-200 bg-neutral-50/20 hover:bg-neutral-50/50 dark:border-neutral-800/40 dark:hover:border-neutral-800 dark:bg-neutral-900/20 text-neutral-600 dark:text-neutral-300'
                    }`}
                  >
                    <span>{opt.name}</span>
                    {isActive ? (
                      <LucideIcon name="Volume2" className="animate-bounce" size={14} />
                    ) : (
                      <LucideIcon name="VolumeX" className="text-neutral-300 dark:text-neutral-700" size={14} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Volume controller */}
            {soundType !== 'none' && (
              <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <div className="flex justify-between items-center text-[10px] font-bold text-neutral-400 dark:text-neutral-500">
                  <span>VOLUME</span>
                  <span>{Math.round(soundVolume * 100)}%</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <button onClick={handleVolumeDown} className="text-neutral-400 hover:text-neutral-600">
                    <LucideIcon name="VolumeX" size={13} />
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
                    value={soundVolume}
                    onChange={e => setSoundVolume(parseFloat(e.target.value))}
                  />
                  <button onClick={handleVolumeUp} className="text-neutral-400 hover:text-neutral-600">
                    <LucideIcon name="Volume2" size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Note modal pop-up on complete */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 dark:bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 max-w-md w-full p-6 shadow-2xl animate-fade-in text-left">
            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100 mb-1">
              🎉 Session Complete!
            </h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-4">
              Add some session reflections or summary notes to log your study activity.
            </p>

            <form onSubmit={handleSaveNotes} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-1.5">
                  Reflection / Notes
                </label>
                <textarea
                  className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs rounded-xl focus:outline-hidden focus:border-brand-500 text-neutral-800 dark:text-neutral-200"
                  rows={4}
                  placeholder="e.g. Worked on coding React components. Fixed a bug in rendering lists. Feel good about context usage."
                  value={sessionNotes}
                  onChange={e => setSessionNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    logSession(completedDuration, completedType, 'Completed focus session without notes.', completedSubjectId || undefined);
                    setShowNoteModal(false);
                  }}
                  className="px-4 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-semibold rounded-xl transition-all"
                >
                  Skip Notes
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                >
                  Save & Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
