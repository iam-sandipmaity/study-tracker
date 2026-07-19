import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LucideIcon } from './LucideIcon';
import type { Task, TaskPriority, TaskStatus } from '../types';

export const Tasks: React.FC = () => {
  const {
    tasks,
    subjects,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    setActiveSessionTask,
    setActiveTab
  } = useApp();

  const [filterSubject, setFilterSubject] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states (Add Task)
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newDueDate, setNewDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newSubjectId, setNewSubjectId] = useState(subjects[0]?.id || '');
  const [newEstDuration, setNewEstDuration] = useState(45);

  // Edit Task States
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addTask(
      newTitle,
      newPriority,
      newDueDate,
      newSubjectId || (subjects[0]?.id || 'subj-general'),
      newEstDuration
    );

    setNewTitle('');
    setShowAddForm(false);
  };

  const handleUpdateTaskDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    updateTask(editingTask.id, {
      title: editingTask.title,
      priority: editingTask.priority,
      dueDate: editingTask.dueDate,
      subjectId: editingTask.subjectId,
      estimatedDuration: editingTask.estimatedDuration
    });

    setEditingTask(null);
  };

  const getSubjectColor = (id: string) => {
    return subjects.find(s => s.id === id)?.color || '#9ca3af';
  };

  const getSubjectName = (id: string) => {
    return subjects.find(s => s.id === id)?.name || 'General';
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchSubject = !filterSubject || task.subjectId === filterSubject;
    const matchPriority = !filterPriority || task.priority === filterPriority;
    const matchSearch = !searchQuery || task.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSubject && matchPriority && matchSearch;
  });

  const getTasksByStatus = (status: TaskStatus) => {
    return filteredTasks.filter(t => t.status === status);
  };

  const columns: { id: TaskStatus; name: string; icon: string; colorClass: string }[] = [
    { id: 'todo', name: 'To Do', icon: 'ListTodo', colorClass: 'text-neutral-500 bg-neutral-100 dark:bg-neutral-800' },
    { id: 'in_progress', name: 'In Progress', icon: 'Hourglass', colorClass: 'text-orange-500 bg-orange-50 dark:bg-orange-950/20' },
    { id: 'completed', name: 'Completed', icon: 'CheckCircle2', colorClass: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' }
  ];

  const isOverdue = (task: Task) => {
    return task.status !== 'completed' && task.dueDate < todayStr;
  };

  // Move task to another column
  const moveTask = (task: Task, nextStatus: TaskStatus) => {
    if (nextStatus === 'completed') {
      completeTask(task.id);
    } else {
      updateTask(task.id, { status: nextStatus });
    }
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto pb-10">
      
      {/* Title / Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 mb-1.5">
            Tasks Board
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            Drag, prioritize, and structure study items. Set deadlines and study timers.
          </p>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 self-start sm:self-center"
        >
          <LucideIcon name="Plus" size={15} /> Create Task
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 p-4 rounded-2xl flex flex-wrap gap-3.5 items-center">
        {/* Search */}
        <div className="flex-1 min-w-[200px] flex items-center bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 px-3 py-2 rounded-xl">
          <LucideIcon name="Search" className="text-neutral-400 mr-2 shrink-0" size={15} />
          <input
            type="text"
            className="w-full bg-transparent border-0 text-xs text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-hidden"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Subject Filter */}
        <select
          className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 text-xs rounded-xl focus:outline-hidden text-neutral-600 dark:text-neutral-400"
          value={filterSubject}
          onChange={e => setFilterSubject(e.target.value)}
        >
          <option value="">All Subjects</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        {/* Priority Filter */}
        <select
          className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 text-xs rounded-xl focus:outline-hidden text-neutral-600 dark:text-neutral-400"
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value)}
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        {/* Reset filters */}
        {(filterSubject || filterPriority || searchQuery) && (
          <button
            onClick={() => {
              setFilterSubject('');
              setFilterPriority('');
              setSearchQuery('');
            }}
            className="text-[10px] font-bold text-neutral-400 hover:text-brand-500 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {columns.map(col => {
          const colTasks = getTasksByStatus(col.id);
          return (
            <div 
              key={col.id}
              className="bg-neutral-100/40 dark:bg-neutral-900/10 border border-neutral-200/50 dark:border-neutral-800/40 rounded-2xl p-4 min-h-[450px] flex flex-col"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-200/40 dark:border-neutral-800/40">
                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                  <LucideIcon name={col.icon} className="text-neutral-400" size={14} /> {col.name}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-neutral-200/50 dark:bg-neutral-800 rounded-full text-neutral-500 dark:text-neutral-400">
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[550px] pr-1">
                {colTasks.length > 0 ? (
                  colTasks.map(task => {
                    const overdue = isOverdue(task);
                    return (
                      <div
                        key={task.id}
                        className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 p-4 rounded-xl shadow-2xs hover:shadow-xs group transition-all duration-200 text-left relative"
                      >
                        {/* Tags row */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span 
                            className="text-[9px] px-2 py-0.5 font-bold rounded-full border"
                            style={{ 
                              borderColor: `${getSubjectColor(task.subjectId)}20`,
                              backgroundColor: `${getSubjectColor(task.subjectId)}10`,
                              color: getSubjectColor(task.subjectId)
                            }}
                          >
                            {getSubjectName(task.subjectId)}
                          </span>
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

                        {/* Title */}
                        <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 leading-snug mb-3">
                          {task.title}
                        </h4>

                        {/* Details */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] font-medium text-neutral-400 dark:text-neutral-500 border-t border-neutral-100 dark:border-neutral-800/60 pt-2.5">
                          <span className={`flex items-center gap-1 ${overdue ? 'text-rose-500 font-bold' : ''}`}>
                            <LucideIcon name="Calendar" size={10} /> 
                            {overdue ? 'Overdue: ' : ''}{task.dueDate === todayStr ? 'Today' : task.dueDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <LucideIcon name="Clock" size={10} /> 
                            {task.estimatedDuration}m {task.actualDuration > 0 ? `(${task.actualDuration}m act)` : ''}
                          </span>
                        </div>

                        {/* Action buttons row */}
                        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800/60">
                          {/* Column shifts */}
                          <div className="flex items-center gap-1">
                            {col.id !== 'todo' && (
                              <button
                                onClick={() => moveTask(task, col.id === 'completed' ? 'in_progress' : 'todo')}
                                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-850 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                                title="Move back"
                              >
                                <LucideIcon name="ChevronLeft" size={12} />
                              </button>
                            )}
                            {col.id !== 'completed' && (
                              <button
                                onClick={() => moveTask(task, col.id === 'todo' ? 'in_progress' : 'completed')}
                                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-850 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                                title="Move forward"
                              >
                                <LucideIcon name="ChevronRight" size={12} />
                              </button>
                            )}
                          </div>

                          {/* Quick buttons */}
                          <div className="flex items-center gap-1.5">
                            {col.id !== 'completed' && (
                              <button
                                onClick={() => {
                                  setActiveSessionTask(task);
                                  setActiveTab('timer');
                                }}
                                className="p-1 hover:bg-brand-50 dark:hover:bg-brand-950/20 rounded-md text-neutral-400 hover:text-brand-500"
                                title="Start Focus Session"
                              >
                                <LucideIcon name="Brain" size={12} />
                              </button>
                            )}
                            <button
                              onClick={() => setEditingTask(task)}
                              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-850 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                              title="Edit Task"
                            >
                              <LucideIcon name="Edit2" size={11} />
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-md text-neutral-400 hover:text-rose-500"
                              title="Delete Task"
                            >
                              <LucideIcon name="Trash2" size={11} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-16 border-2 border-dashed border-neutral-200/40 dark:border-neutral-800/40 rounded-xl">
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold">No tasks in this list</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 dark:bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 max-w-md w-full p-6 shadow-2xl animate-fade-in text-left">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100">
                Create New Task
              </h3>
              <button onClick={() => setShowAddForm(false)} className="text-neutral-400 hover:text-neutral-600">
                <LucideIcon name="X" size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-1.5">
                  Task Title
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs rounded-xl focus:outline-hidden focus:border-brand-500 text-neutral-800 dark:text-neutral-100"
                  placeholder="e.g. Solve page 12 review questions"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  required
                />
              </div>

              {/* Grid: Subject & Due Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-1.5">
                    Subject
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs rounded-xl focus:outline-hidden text-neutral-700 dark:text-neutral-300"
                    value={newSubjectId}
                    onChange={e => setNewSubjectId(e.target.value)}
                    required
                  >
                    <option value="">Select subject...</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-1.5">
                    Due Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs rounded-xl focus:outline-hidden text-neutral-700 dark:text-neutral-300"
                    value={newDueDate}
                    onChange={e => setNewDueDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Grid: Priority & Estimated duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-1.5">
                    Priority
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs rounded-xl focus:outline-hidden text-neutral-700 dark:text-neutral-300"
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as TaskPriority)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-1.5">
                    Est. Duration (mins)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="480"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs rounded-xl focus:outline-hidden text-neutral-750 dark:text-neutral-300"
                    value={newEstDuration}
                    onChange={e => setNewEstDuration(parseInt(e.target.value) || 30)}
                    required
                  />
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
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 dark:bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 max-w-md w-full p-6 shadow-2xl animate-fade-in text-left">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100">
                Edit Task Details
              </h3>
              <button onClick={() => setEditingTask(null)} className="text-neutral-400 hover:text-neutral-600">
                <LucideIcon name="X" size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdateTaskDetails} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-1.5">
                  Task Title
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs rounded-xl focus:outline-hidden focus:border-brand-500 text-neutral-800 dark:text-neutral-100"
                  value={editingTask.title}
                  onChange={e => setEditingTask({ ...editingTask, title: e.target.value })}
                  required
                />
              </div>

              {/* Grid: Subject & Due Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-1.5">
                    Subject
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs rounded-xl focus:outline-hidden text-neutral-700 dark:text-neutral-300"
                    value={editingTask.subjectId}
                    onChange={e => setEditingTask({ ...editingTask, subjectId: e.target.value })}
                    required
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-1.5">
                    Due Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs rounded-xl focus:outline-hidden text-neutral-750 dark:text-neutral-350"
                    value={editingTask.dueDate}
                    onChange={e => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Grid: Priority & Est. duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-1.5">
                    Priority
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs rounded-xl focus:outline-hidden text-neutral-700 dark:text-neutral-300"
                    value={editingTask.priority}
                    onChange={e => setEditingTask({ ...editingTask, priority: e.target.value as TaskPriority })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-1.5">
                    Est. Duration (mins)
                  </label>
                  <input
                    type="number"
                    min="5"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs rounded-xl focus:outline-hidden text-neutral-750 dark:text-neutral-350"
                    value={editingTask.estimatedDuration}
                    onChange={e => setEditingTask({ ...editingTask, estimatedDuration: parseInt(e.target.value) || 30 })}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                >
                  Apply Edits
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
