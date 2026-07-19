import React, { useRef, useState } from 'react';
import { Download, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface DataExportImportProps {
  onClose: () => void;
}

export const DataExportImport: React.FC<DataExportImportProps> = ({ onClose }) => {
  const {
    subjects,
    tasks,
    sessions,
    habits,
    stats,
    achievements,
    notes,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');

  const exportData = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      data: {
        subjects,
        tasks,
        sessions,
        habits,
        stats,
        achievements,
        notes,
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (!parsed.data || !parsed.version) {
        throw new Error('Invalid backup file format');
      }

      const { data } = parsed;

      // Validate required fields
      if (!Array.isArray(data.subjects) || !Array.isArray(data.tasks)) {
        throw new Error('Backup file is missing required data fields');
      }

      // Store imported data to localStorage — AppContext will pick it up on reload
      if (data.subjects) localStorage.setItem('study_subjects', JSON.stringify(data.subjects));
      if (data.tasks) localStorage.setItem('study_tasks', JSON.stringify(data.tasks));
      if (data.sessions) localStorage.setItem('study_sessions', JSON.stringify(data.sessions));
      if (data.habits) localStorage.setItem('study_habits', JSON.stringify(data.habits));
      if (data.stats) localStorage.setItem('study_stats', JSON.stringify(data.stats));
      if (data.achievements) localStorage.setItem('study_achievements', JSON.stringify(data.achievements));
      if (data.notes) localStorage.setItem('study_notes', JSON.stringify(data.notes));

      setImportStatus('success');
      setImportMessage(`Imported ${data.subjects.length} subjects, ${data.tasks.length} tasks, ${data.sessions.length} sessions`);

      // Reload to apply imported data
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setImportStatus('error');
      setImportMessage(err instanceof Error ? err.message : 'Failed to import data');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Backup & Restore</h3>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded-lg transition-colors text-lg"
            >
              ×
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Export */}
          <button
            onClick={exportData}
            className="w-full flex items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl border border-neutral-200/50 dark:border-neutral-700/50 transition-all group"
          >
            <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
              <Download size={18} />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">Export Data</p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Download all data as JSON</p>
            </div>
          </button>

          {/* Import */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl border border-neutral-200/50 dark:border-neutral-700/50 transition-all group"
          >
            <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
              <Upload size={18} />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">Import Data</p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Restore from a JSON backup</p>
            </div>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importData(file);
              e.target.value = '';
            }}
          />

          {/* Status message */}
          {importStatus !== 'idle' && (
            <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
              importStatus === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
            }`}>
              {importStatus === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              <span>{importMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
