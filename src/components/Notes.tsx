import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LucideIcon } from './LucideIcon';
import { renderMarkdown } from '../utils/markdown.tsx';
import type { Note } from '../types';

export const Notes: React.FC = () => {
  const {
    notes,
    subjects,
    addNote,
    updateNote,
    deleteNote
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [activeNoteId, setActiveNoteId] = useState<string | null>(notes[0]?.id || null);
  
  // Editor states (for editing or creating a note)
  const [isCreating, setIsCreating] = useState(false);
  const [editorTitle, setEditorTitle] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [editorSubjectId, setEditorSubjectId] = useState(subjects[0]?.id || '');
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview' | 'split'>('split');

  const activeNote = notes.find(n => n.id === activeNoteId);

  // Filter notes
  const filteredNotes = notes.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                        n.content.toLowerCase().includes(search.toLowerCase());
    const matchSubject = !selectedSubjectId || n.subjectId === selectedSubjectId;
    return matchSearch && matchSubject;
  });

  const getSubjectColor = (id: string) => {
    return subjects.find(s => s.id === id)?.color || '#9ca3af';
  };

  const getSubjectName = (id: string) => {
    return subjects.find(s => s.id === id)?.name || 'General';
  };

  const handleStartCreate = () => {
    setIsCreating(true);
    setEditorTitle('');
    setEditorContent('# New Note\n\nType markdown here...');
    setEditorSubjectId(subjects[0]?.id || '');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editorTitle.trim()) return;
    
    addNote(editorTitle, editorContent, editorSubjectId);
    setIsCreating(false);
    
    // Set active note to newly created
    setTimeout(() => {
      if (notes.length > 0) {
        // Since notes is prepended, the first one is the newest
        setActiveNoteId(notes[0]?.id || null);
      }
    }, 100);
  };

  const handleUpdateNote = (field: keyof Note, value: string) => {
    if (!activeNote) return;
    updateNote(activeNote.id, { [field]: value });
  };

  const handleDeleteActiveNote = () => {
    if (!activeNote) return;
    if (confirm(`Are you sure you want to delete note "${activeNote.title}"?`)) {
      deleteNote(activeNote.id);
      setActiveNoteId(notes[0]?.id || null);
    }
  };

  return (
    <div className="text-left max-w-5xl mx-auto pb-10 flex flex-col h-[calc(100vh-140px)]">
      
      {/* Search Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 mb-1.5">
            Study Notes
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            Draft summaries in Markdown, structured by subjects, fully search indexed.
          </p>
        </div>

        <button
          onClick={handleStartCreate}
          className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 self-start sm:self-center"
        >
          <LucideIcon name="Plus" size={15} /> New Note
        </button>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 border border-neutral-200/60 dark:border-neutral-800/60 rounded-3xl overflow-hidden bg-white dark:bg-neutral-900 shadow-xs flex-1 min-h-0">
        
        {/* Left column (Notes List) */}
        <div className="md:col-span-4 border-r border-neutral-200/60 dark:border-neutral-800/60 flex flex-col h-full min-h-[300px] md:min-h-0">
          {/* List Search & Filter */}
          <div className="p-4 border-b border-neutral-200/60 dark:border-neutral-850 space-y-2 shrink-0 bg-neutral-50/20">
            <div className="flex items-center bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/65 dark:border-neutral-700/65 px-2.5 py-1.5 rounded-lg text-xs">
              <LucideIcon name="Search" className="text-neutral-400 mr-2" size={14} />
              <input
                type="text"
                placeholder="Search notes..."
                className="w-full bg-transparent border-0 text-[11px] focus:outline-hidden text-neutral-800 dark:text-neutral-200"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[10px] font-bold rounded-lg text-neutral-600 dark:text-neutral-400 focus:outline-hidden"
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
            >
              <option value="">All Subjects</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* List content */}
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-850">
            {filteredNotes.length > 0 ? (
              filteredNotes.map(n => {
                const isActive = n.id === activeNoteId && !isCreating;
                return (
                  <div
                    key={n.id}
                    onClick={() => {
                      setIsCreating(false);
                      setActiveNoteId(n.id);
                    }}
                    className={`p-4 text-left cursor-pointer transition-all duration-150 relative ${
                      isActive 
                        ? 'bg-brand-50/20 dark:bg-brand-950/10' 
                        : 'hover:bg-neutral-50/50 dark:hover:bg-neutral-850/10'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span 
                        className="w-1.5 h-1.5 rounded-full shrink-0" 
                        style={{ backgroundColor: getSubjectColor(n.subjectId) }}
                      />
                      <span className="text-[9px] font-bold text-neutral-450 dark:text-neutral-500 uppercase">
                        {getSubjectName(n.subjectId)}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-neutral-850 dark:text-neutral-250 truncate mb-1">
                      {n.title}
                    </h3>
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500 line-clamp-2">
                      {n.content.replace(/[#*`>]/g, '')}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-xs text-neutral-400">
                No notes found.
              </div>
            )}
          </div>
        </div>

        {/* Right column (Editor or Preview Panel) */}
        <div className="md:col-span-8 flex flex-col h-full bg-neutral-50/20 dark:bg-neutral-900/30">
          
          {/* Creator View */}
          {isCreating ? (
            <form onSubmit={handleCreateSubmit} className="flex-1 flex flex-col min-h-0 p-5">
              <div className="flex justify-between items-center mb-4 shrink-0">
                <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-100">Draft Note</h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-3 py-1.5 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 text-[10px] font-bold rounded-lg"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-[10px] font-bold rounded-lg shadow-xs"
                  >
                    Create
                  </button>
                </div>
              </div>

              <div className="space-y-3.5 flex-1 flex flex-col min-h-0">
                <div className="grid grid-cols-2 gap-4 shrink-0">
                  <input
                    type="text"
                    className="px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-xs font-bold rounded-xl focus:outline-hidden text-neutral-800 dark:text-neutral-100"
                    placeholder="Note Title..."
                    value={editorTitle}
                    onChange={e => setEditorTitle(e.target.value)}
                    required
                  />
                  <select
                    className="px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-xs rounded-xl focus:outline-hidden text-neutral-700 dark:text-neutral-400 font-bold"
                    value={editorSubjectId}
                    onChange={e => setEditorSubjectId(e.target.value)}
                    required
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <textarea
                  className="flex-1 w-full p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-xs font-mono rounded-2xl focus:outline-hidden text-neutral-800 dark:text-neutral-200 resize-none min-h-0"
                  placeholder="# Note Content (markdown supported)..."
                  value={editorContent}
                  onChange={e => setEditorContent(e.target.value)}
                />
              </div>
            </form>
          ) : activeNote ? (
            /* Editing / Viewing View */
            <div className="flex-1 flex flex-col min-h-0">
              
              {/* Header Editor Bar */}
              <div className="p-4 bg-white dark:bg-neutral-900 border-b border-neutral-200/60 dark:border-neutral-850 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                  <input
                    type="text"
                    className="text-xs font-bold text-neutral-800 dark:text-neutral-100 bg-transparent border-0 focus:outline-hidden focus:bg-neutral-50 dark:focus:bg-neutral-800 px-2 py-1 rounded-lg w-full"
                    value={activeNote.title}
                    onChange={e => handleUpdateNote('title', e.target.value)}
                  />
                  <select
                    className="px-2 py-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[10px] font-bold rounded-lg text-neutral-700 dark:text-neutral-400 focus:outline-hidden"
                    value={activeNote.subjectId}
                    onChange={e => handleUpdateNote('subjectId', e.target.value)}
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* Preview controllers & actions */}
                <div className="flex items-center gap-3">
                  <div className="flex bg-neutral-50 dark:bg-neutral-800/80 p-0.5 rounded-lg border border-neutral-200/60 dark:border-neutral-700/60">
                    {(['edit', 'preview', 'split'] as const).map(m => (
                      <button
                        key={m}
                        onClick={() => setPreviewMode(m)}
                        className={`px-2 py-1 text-[9px] font-bold capitalize rounded-md transition-all ${
                          previewMode === m 
                            ? 'bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 shadow-2xs' 
                            : 'text-neutral-400 hover:text-neutral-600'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleDeleteActiveNote}
                    className="p-1.5 text-neutral-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20"
                    title="Delete Note"
                  >
                    <LucideIcon name="Trash2" size={13} />
                  </button>
                </div>
              </div>

              {/* Editing and Render split workspace */}
              <div className="flex-1 flex min-h-0 overflow-hidden bg-white dark:bg-neutral-900">
                {/* Editor Textarea */}
                {(previewMode === 'edit' || previewMode === 'split') && (
                  <textarea
                    className={`h-full p-5 font-mono text-xs text-neutral-800 dark:text-neutral-200 bg-transparent resize-none border-0 focus:outline-hidden flex-1 min-h-0 ${
                      previewMode === 'split' ? 'border-r border-neutral-100 dark:border-neutral-850' : ''
                    }`}
                    placeholder="Note Content (Markdown supported)..."
                    value={activeNote.content}
                    onChange={e => handleUpdateNote('content', e.target.value)}
                  />
                )}

                {/* Markdown Parser HTML Render Panel */}
                {(previewMode === 'preview' || previewMode === 'split') && (
                  <div className="h-full p-5 overflow-y-auto text-left flex-1 min-h-0 bg-neutral-50/20 dark:bg-neutral-950/5">
                    {renderMarkdown(activeNote.content)}
                  </div>
                )}
              </div>

            </div>
          ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-neutral-400">
              <LucideIcon name="PenTool" className="text-neutral-200 dark:text-neutral-800 mb-3" size={48} />
              <p className="text-xs font-semibold text-neutral-500">No note selected</p>
              <p className="text-[10px] text-neutral-400 mt-1">Select a note from the left or create a new one.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
