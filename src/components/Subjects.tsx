import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LucideIcon } from './LucideIcon';
import type { Subject } from '../types';

export const Subjects: React.FC = () => {
  const {
    subjects,
    tasks,
    addSubject,
    updateSubject,
    deleteSubject
  } = useApp();

  const [showAddForm, setShowAddForm] = useState(false);
  
  // New Subject Form fields
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#0ea5e9'); // Default blue
  const [newIcon, setNewIcon] = useState('BookOpen');
  const [newTargetScore, setNewTargetScore] = useState(90);
  const [newExamDate, setNewExamDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });

  // Edit Subject fields
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Palettes (Designer tailored warm and cool colors)
  const colors = [
    { value: '#0ea5e9', name: 'Ocean' },
    { value: '#10b981', name: 'Emerald' },
    { value: '#f97316', name: 'Tangerine' },
    { value: '#8b5cf6', name: 'Amethyst' },
    { value: '#ec4899', name: 'Rose' },
    { value: '#f43f5e', name: 'Coral' },
    { value: '#eab308', name: 'Amber' },
    { value: '#64748b', name: 'Slate' }
  ];

  // Icons list
  const icons = [
    'BookOpen', 'Code', 'Calculator', 'FlaskConical', 'Atom', 
    'Activity', 'Globe', 'Compass', 'Palette', 'Music', 'FileText', 'Briefcase'
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    addSubject(newName, newColor, newIcon, newTargetScore, newExamDate);
    
    // Reset
    setNewName('');
    setNewColor('#0ea5e9');
    setNewIcon('BookOpen');
    setNewTargetScore(90);
    setShowAddForm(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;

    updateSubject(editingSubject.id, {
      name: editingSubject.name,
      color: editingSubject.color,
      icon: editingSubject.icon,
      targetScore: editingSubject.targetScore,
      examDate: editingSubject.examDate
    });

    setEditingSubject(null);
  };

  const calculateProgress = (subjectId: string) => {
    const subjectTasks = tasks.filter(t => t.subjectId === subjectId);
    if (subjectTasks.length === 0) return 0;
    const completedTasks = subjectTasks.filter(t => t.status === 'completed');
    return Math.round((completedTasks.length / subjectTasks.length) * 100);
  };

  const getDaysCountdown = (dateString: string) => {
    const examTime = new Date(dateString).getTime();
    const todayTime = new Date(new Date().toISOString().split('T')[0]).getTime();
    const diffMs = examTime - todayTime;
    const diffDays = Math.ceil(diffMs / 86400000);
    
    if (diffDays === 0) return 'Exam is Today! ✏️';
    if (diffDays < 0) return `Exam was ${Math.abs(diffDays)} days ago`;
    return `${diffDays} days left`;
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 mb-1.5">
            Subject Plans
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            Configure your exam dates, target grades, track focus hours, and review progress.
          </p>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 self-start sm:self-center"
        >
          <LucideIcon name="Plus" size={15} /> Add Subject
        </button>
      </div>

      {/* Grid of Subjects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map(subj => {
          const progress = calculateProgress(subj.id);
          const countdown = getDaysCountdown(subj.examDate);
          
          return (
            <div 
              key={subj.id}
              className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 rounded-2xl shadow-2xs hover:shadow-xs p-5 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2.5 rounded-xl border"
                      style={{ 
                        backgroundColor: `${subj.color}12`,
                        borderColor: `${subj.color}25`,
                        color: subj.color 
                      }}
                    >
                      <LucideIcon name={subj.icon} size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100">
                        {subj.name}
                      </h3>
                      <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold uppercase">
                        Target: {subj.targetScore}%
                      </span>
                    </div>
                  </div>

                  {/* Settings dropdown trigger */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => setEditingSubject(subj)}
                      className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                      title="Edit subject"
                    >
                      <LucideIcon name="Edit" size={12} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this subject? All related tasks and notes will be deleted.')) {
                          deleteSubject(subj.id);
                        }
                      }}
                      className="p-1 text-neutral-400 hover:text-rose-500"
                      title="Delete subject"
                    >
                      <LucideIcon name="Trash2" size={12} />
                    </button>
                  </div>
                </div>

                {/* Hours & Countdown Stats */}
                <div className="grid grid-cols-2 gap-3.5 bg-neutral-50/50 dark:bg-neutral-800/20 border border-neutral-100/50 dark:border-neutral-800/60 p-3 rounded-xl mb-4">
                  <div>
                    <span className="text-[9px] text-neutral-450 dark:text-neutral-500 font-bold block uppercase tracking-wide">
                      STUDY HOURS
                    </span>
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                      {subj.totalHours} hrs
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-neutral-450 dark:text-neutral-500 font-bold block uppercase tracking-wide">
                      EXAM COUNTDOWN
                    </span>
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                      {countdown}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold text-neutral-400 dark:text-neutral-500">
                  <span>TASK COMPLETION</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      backgroundColor: subj.color,
                      width: `${progress}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Subject Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 dark:bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 max-w-md w-full p-6 shadow-2xl animate-fade-in text-left">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100">
                Add New Subject
              </h3>
              <button onClick={() => setShowAddForm(false)} className="text-neutral-400 hover:text-neutral-600">
                <LucideIcon name="X" size={16} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-1.5">
                  Subject Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs rounded-xl focus:outline-hidden focus:border-brand-500 text-neutral-800 dark:text-neutral-100"
                  placeholder="e.g. Physics II or European History"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  required
                />
              </div>

              {/* Grid: Exam Date & Target Score */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-1.5">
                    Exam Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs rounded-xl focus:outline-hidden text-neutral-700 dark:text-neutral-300"
                    value={newExamDate}
                    onChange={e => setNewExamDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-1.5">
                    Target Score (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs rounded-xl focus:outline-hidden text-neutral-700 dark:text-neutral-350"
                    value={newTargetScore}
                    onChange={e => setNewTargetScore(parseInt(e.target.value) || 90)}
                    required
                  />
                </div>
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-2">
                  Theme Color
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {colors.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setNewColor(c.value)}
                      className={`h-7 w-7 rounded-lg border transition-all ${
                        newColor === c.value 
                          ? 'border-neutral-900 dark:border-white scale-110 shadow-xs' 
                          : 'border-transparent scale-100 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Icon selector */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-2">
                  Subject Icon
                </label>
                <div className="grid grid-cols-6 gap-2 bg-neutral-50 dark:bg-neutral-800/40 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800">
                  {icons.map(ic => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setNewIcon(ic)}
                      className={`p-2 rounded-lg border flex items-center justify-center transition-all ${
                        newIcon === ic 
                          ? 'border-brand-500 bg-brand-50/20 text-brand-500 dark:bg-brand-950/20' 
                          : 'border-transparent text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
                      }`}
                    >
                      <LucideIcon name={ic} size={16} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                >
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {editingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 dark:bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 max-w-md w-full p-6 shadow-2xl animate-fade-in text-left">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100">
                Edit Subject Details
              </h3>
              <button onClick={() => setEditingSubject(null)} className="text-neutral-400 hover:text-neutral-600">
                <LucideIcon name="X" size={16} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-1.5">
                  Subject Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs rounded-xl focus:outline-hidden focus:border-brand-500 text-neutral-800 dark:text-neutral-100"
                  value={editingSubject.name}
                  onChange={e => setEditingSubject({ ...editingSubject, name: e.target.value })}
                  required
                />
              </div>

              {/* Grid: Exam Date & Target Score */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-1.5">
                    Exam Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs rounded-xl focus:outline-hidden text-neutral-700 dark:text-neutral-300"
                    value={editingSubject.examDate}
                    onChange={e => setEditingSubject({ ...editingSubject, examDate: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-1.5">
                    Target Score (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs rounded-xl focus:outline-hidden text-neutral-700 dark:text-neutral-350"
                    value={editingSubject.targetScore}
                    onChange={e => setEditingSubject({ ...editingSubject, targetScore: parseInt(e.target.value) || 90 })}
                    required
                  />
                </div>
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-2">
                  Theme Color
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {colors.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setEditingSubject({ ...editingSubject, color: c.value })}
                      className={`h-7 w-7 rounded-lg border transition-all ${
                        editingSubject.color === c.value 
                          ? 'border-neutral-900 dark:border-white scale-110 shadow-xs' 
                          : 'border-transparent scale-100 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Icon selector */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-2">
                  Subject Icon
                </label>
                <div className="grid grid-cols-6 gap-2 bg-neutral-50 dark:bg-neutral-800/40 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800">
                  {icons.map(ic => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setEditingSubject({ ...editingSubject, icon: ic })}
                      className={`p-2 rounded-lg border flex items-center justify-center transition-all ${
                        editingSubject.icon === ic 
                          ? 'border-brand-500 bg-brand-50/20 text-brand-500 dark:bg-brand-950/20' 
                          : 'border-transparent text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
                      }`}
                    >
                      <LucideIcon name={ic} size={16} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSubject(null)}
                  className="px-4 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
