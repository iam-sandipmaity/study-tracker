import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { LucideIcon } from './LucideIcon';
import { SyncStatus } from './SyncStatus';

export const Profile: React.FC = () => {
  const { user, updateProfile, isConfigured, signOut } = useAuth();
  const { stats, sessions, subjects } = useApp();

  const userMetadata = (user?.user_metadata ?? {}) as Record<string, string>;
  const currentDisplayName = userMetadata.display_name || user?.email?.split('@')[0] || 'Scholar';
  const currentAvatarUrl = userMetadata.avatar_url || '';

  // --- Display name ---
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(currentDisplayName);
  const [nameStatus, setNameStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const [nameErr, setNameErr] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  // --- Avatar ---
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [avatarDraft, setAvatarDraft] = useState(currentAvatarUrl);
  const [avatarStatus, setAvatarStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const [avatarErr, setAvatarErr] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const totalFocusMins = Math.round(
    sessions.filter(s => s.type === 'focus').reduce((a, s) => a + s.duration, 0) / 60
  );

  const memberSince = user?.created_at
    ? new Date(user?.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null;

  // --- Name save ---
  const saveName = async () => {
    const trimmed = nameDraft.trim();
    if (!trimmed || trimmed === currentDisplayName) { setEditingName(false); return; }
    setNameStatus('saving');
    const { error } = await updateProfile({ display_name: trimmed });
    if (error) { setNameStatus('error'); setNameErr(error.message || 'Failed'); return; }
    setNameStatus('idle');
    setEditingName(false);
  };

  // --- Avatar save ---
  const saveAvatar = async () => {
    setAvatarStatus('saving');
    const { error } = await updateProfile({ avatar_url: avatarDraft });
    if (error) { setAvatarStatus('error'); setAvatarErr(error.message || 'Failed'); return; }
    setAvatarStatus('idle');
    setEditingAvatar(false);
  };

  const removeAvatar = async () => {
    setAvatarStatus('saving');
    const { error } = await updateProfile({ avatar_url: '' });
    if (error) { setAvatarStatus('error'); setAvatarErr(error.message || 'Failed'); return; }
    setAvatarDraft('');
    setAvatarStatus('idle');
    setEditingAvatar(false);
  };

  const onFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setAvatarErr('Pick an image file'); return; }
    if (file.size > 2 * 1024 * 1024) { setAvatarErr('Max 2 MB'); return; }
    const reader = new FileReader();
    reader.onload = () => { setAvatarDraft(reader.result as string); setAvatarErr(''); };
    reader.readAsDataURL(file);
  };

  // --- Avatar display ---
  const AvatarBlock = ({ size }: { size: 'lg' | 'sm' }) => {
    const cls = size === 'lg' ? 'h-20 w-20 text-2xl' : 'h-9 w-9 text-xs';
    const displayUrl = editingAvatar ? avatarDraft : currentAvatarUrl;

    if (displayUrl) {
      return <img src={displayUrl} alt="" className={`${cls} rounded-full object-cover ring-2 ring-white dark:ring-neutral-800`} />;
    }
    return (
      <div className={`${cls} rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center font-bold ring-2 ring-white dark:ring-neutral-800 shrink-0`}>
        {currentDisplayName.charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <div className="space-y-5 text-left max-w-3xl mx-auto pb-10">

      {/* Header — same pattern as every other page */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 mb-1.5">
          Profile
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
          Your study identity and account info.
        </p>
      </div>

      {/* Main profile card — avatar, name, email, all in one */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 rounded-3xl shadow-xs overflow-hidden">
        <div className="p-6 flex flex-col sm:flex-row gap-5">

          {/* Avatar column */}
          <div className="shrink-0 flex flex-col items-center sm:items-start gap-2.5">
            <div
              className="relative group cursor-pointer"
              onClick={() => { setEditingAvatar(true); setAvatarDraft(currentAvatarUrl); setAvatarErr(''); }}
            >
              <AvatarBlock size="lg" />
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <LucideIcon name="Pencil" size={16} className="text-white" />
              </div>
            </div>
            {isConfigured && (
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold">
                Click to change
              </span>
            )}
          </div>

          {/* Info column */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Name row */}
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  ref={nameRef}
                  type="text"
                  value={nameDraft}
                  onChange={e => setNameDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
                  maxLength={40}
                  autoFocus
                  className="flex-1 px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 text-sm rounded-xl focus:outline-hidden focus:border-brand-500 text-neutral-800 dark:text-neutral-100"
                />
                <button onClick={saveName} disabled={nameStatus === 'saving'} className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-xs">
                  {nameStatus === 'saving' ? '...' : 'Save'}
                </button>
                <button onClick={() => setEditingName(false)} className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded-lg transition-colors">
                  <LucideIcon name="X" size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 truncate">
                  {currentDisplayName}
                </h2>
                <button
                  onClick={() => { setEditingName(true); setNameDraft(currentDisplayName); setNameErr(''); }}
                  className="p-1 text-neutral-300 hover:text-brand-500 dark:hover:text-brand-400 rounded-md transition-colors"
                >
                  <LucideIcon name="Pencil" size={13} />
                </button>
              </div>
            )}
            {nameStatus === 'error' && <p className="text-[11px] text-red-500">{nameErr}</p>}

            {/* Email + meta — plain inline, no card */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-neutral-400 dark:text-neutral-500">
              <span className="flex items-center gap-1.5">
                <LucideIcon name="Mail" size={12} />
                {user?.email || 'demo@study.local'}
              </span>
              {memberSince && (
                <span className="flex items-center gap-1.5">
                  <LucideIcon name="Calendar" size={12} />
                  Joined {memberSince}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <LucideIcon name="Shield" size={12} />
                {user?.app_metadata?.provider === 'google' ? 'Google' : isConfigured ? 'Email' : 'Demo'}
              </span>
            </div>

            {/* Quick stats strip — compact, no card */}
            <div className="flex flex-wrap gap-x-5 gap-y-1 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                <span className="font-bold text-neutral-700 dark:text-neutral-250">{stats.level}</span> level
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                <span className="font-bold text-neutral-700 dark:text-neutral-250">{stats.xp}</span> XP
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                <span className="font-bold text-neutral-700 dark:text-neutral-250">{(totalFocusMins / 60).toFixed(1)}h</span> focused
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                <span className="font-bold text-neutral-700 dark:text-neutral-250">{subjects.length}</span> subject{subjects.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Account info — single compact row, not a full card with header */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 p-5 rounded-3xl shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div>
            <span className="text-[10px] font-bold text-neutral-350 dark:text-neutral-550 uppercase tracking-wider block mb-1">User ID</span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono" title={user?.id || ''}>
              {user?.id ? `${user.id.slice(0, 8)}...` : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-neutral-350 dark:text-neutral-550 uppercase tracking-wider block mb-1">Provider</span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 capitalize">
              {user?.app_metadata?.provider || (isConfigured ? 'Email' : 'Demo')}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-neutral-350 dark:text-neutral-550 uppercase tracking-wider block mb-1">Email Verified</span>
            <span className={`text-[11px] font-semibold ${user?.email_confirmed_at ? 'text-emerald-500' : 'text-neutral-400 dark:text-neutral-500'}`}>
              {user?.email_confirmed_at ? 'Yes' : 'No'}
            </span>
          </div>
        </div>

        {isConfigured && (
          <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <button
              onClick={() => signOut()}
              className="text-[11px] text-neutral-400 hover:text-red-500 dark:hover:text-red-400 font-semibold transition-colors"
            >
              Sign out of this account
            </button>
          </div>
        )}
      </div>

      {/* Cloud Sync Status */}
      <SyncStatus />

      {/* Avatar edit panel — slides in below when editing */}
      {editingAvatar && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 p-5 rounded-3xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">Change Avatar</h3>
            <button
              onClick={() => setEditingAvatar(false)}
              className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded-lg transition-colors"
            >
              <LucideIcon name="X" size={14} />
            </button>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0">
              {avatarDraft ? (
                <img src={avatarDraft} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center text-xl font-bold">
                  {currentDisplayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Paste an image URL or upload from your device. JPG, PNG, GIF, or WebP up to 2 MB.
              </p>
            </div>
          </div>

          {/* URL input */}
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={avatarDraft.startsWith('data:') ? '' : avatarDraft}
              onChange={e => { setAvatarDraft(e.target.value); setAvatarErr(''); }}
              placeholder="https://example.com/avatar.jpg"
              className="flex-1 px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 text-xs rounded-xl focus:outline-hidden focus:border-brand-500 text-neutral-800 dark:text-neutral-100 placeholder-neutral-350 dark:placeholder-neutral-600"
            />
            <input ref={fileRef} type="file" accept="image/*" onChange={onFilePick} className="hidden" />
            <button
              onClick={() => fileRef.current?.click()}
              className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 text-xs text-neutral-500 dark:text-neutral-400 rounded-xl hover:border-brand-400 hover:text-brand-500 transition-all shrink-0 flex items-center gap-1.5"
            >
              <LucideIcon name="Upload" size={12} />
              Upload
            </button>
          </div>

          {avatarErr && <p className="text-[11px] text-red-500">{avatarErr}</p>}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={saveAvatar}
              disabled={avatarStatus === 'saving'}
              className="px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              {avatarStatus === 'saving' ? 'Saving...' : 'Save'}
            </button>
            {avatarDraft && (
              <button
                onClick={removeAvatar}
                disabled={avatarStatus === 'saving'}
                className="px-3 py-2 text-[11px] text-red-500 hover:text-red-600 font-semibold transition-colors"
              >
                Remove
              </button>
            )}
            <button
              onClick={() => setEditingAvatar(false)}
              className="px-3 py-2 text-[11px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
