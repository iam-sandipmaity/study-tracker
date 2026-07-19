import React, { useState } from 'react';
import { BookOpen, Clock, CheckSquare, BarChart2, PenTool, ArrowRight, X } from 'lucide-react';

interface OnboardingTourProps {
  onComplete: () => void;
}

const steps = [
  {
    icon: 'BookOpen',
    title: 'Welcome to Study Tracker!',
    description: 'Your personal study companion. Track subjects, manage tasks, log study sessions, and watch your progress grow.',
    color: 'from-indigo-500 to-purple-600',
  },
  {
    icon: 'Clock',
    title: 'Focus Timer',
    description: 'Use the Pomodoro-style focus timer to stay on track. Earn XP for every minute you study!',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: 'CheckSquare',
    title: 'Task Board',
    description: 'Create and organize tasks by priority. Mark them complete to earn bonus XP.',
    color: 'from-orange-500 to-red-600',
  },
  {
    icon: 'BarChart2',
    title: 'Track Progress',
    description: 'View your analytics, maintain study streaks, and unlock achievements as you level up.',
    color: 'from-pink-500 to-rose-600',
  },
  {
    icon: 'PenTool',
    title: 'Study Notes',
    description: 'Jot down key concepts, formulas, and summaries. Your notes are always synced to the cloud.',
    color: 'from-cyan-500 to-blue-600',
  },
];

const iconMap: Record<string, React.FC<{ size?: number; className?: string }>> = {
  BookOpen, Clock, CheckSquare, BarChart2, PenTool,
};

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const current = steps[step];
  const isLast = step === steps.length - 1;
  const Icon = iconMap[current.icon] || BookOpen;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Skip button */}
        <div className="flex justify-end p-4 pb-0">
          <button
            onClick={onComplete}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded-lg transition-colors"
            title="Skip tour"
          >
            <X size={18} />
          </button>
        </div>

        {/* Icon + Content */}
        <div className="px-8 pb-6 text-center">
          <div className={`w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br ${current.color} flex items-center justify-center shadow-lg`}>
            <Icon size={28} className="text-white" />
          </div>

          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
            {current.title}
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {current.description}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step
                  ? 'w-6 bg-brand-500'
                  : i < step
                    ? 'w-1.5 bg-brand-300 dark:bg-brand-700'
                    : 'w-1.5 bg-neutral-200 dark:bg-neutral-700'
              }`}
            />
          ))}
        </div>

        {/* Action button */}
        <div className="px-8 pb-8">
          <button
            onClick={() => {
              if (isLast) {
                onComplete();
              } else {
                setStep(step + 1);
              }
            }}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            {isLast ? "Let's Get Started!" : 'Next'}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
