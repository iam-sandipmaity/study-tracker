# Roadmap

Planned features and improvements for Study Tracker.

## Phase 1 — Auth & Cloud Sync

- [x] Integrate Supabase authentication (auth + PostgreSQL DB)
- [x] User registration, login, and logout flows
- [x] Database schema with RLS policies for per-user data isolation
- [x] Data migration utility (localStorage → Supabase)
- [x] Real-time data sync to Supabase on all CRUD operations
- [x] Google OAuth sign-in
- [x] Resend confirmation email
- [x] Session history with notes
- [x] Onboarding tour for new users
- [x] Data export/import (JSON)
- [x] Modern auth form redesign (split layout, animations)
- [x] Custom logo and favicon
- [ ] User profile page with avatar and display name editing
- [ ] Test session persistence across devices
- [ ] Custom email templates in Supabase

## Phase 2 — Enhanced Study Tools

- [ ] Flashcard system with spaced repetition (SM-2 algorithm)
- [ ] Custom ambient sound uploads (user-provided audio files)
- [ ] Focus session tagging and categorization
- [ ] Daily/weekly study reports (email or in-app)
- [ ] Timer presets management (custom durations)

## Phase 3 — Social & Collaboration

- [ ] Study groups / shared subject plans
- [ ] Leaderboards for XP and streaks (within groups)
- [ ] Shared notes and collaborative editing
- [ ] Accountability partners (streak reminders)
- [ ] Export study data as PDF/CSV

## Phase 4 — Intelligence & Automation

- [ ] Smart study schedule suggestions based on exam proximity
- [ ] Adaptive Pomodoro durations based on focus patterns
- [ ] Auto-categorization of tasks using NLP
- [ ] Predictive exam readiness scoring
- [ ] Integration with Google Calendar / Notion / Obsidian

## Phase 5 — Platform

- [ ] Native mobile apps (React Native or Capacitor)
- [ ] Browser extension for quick task capture
- [ ] Desktop widget for timer and streak display
- [ ] API for third-party integrations
- [ ] Plugin system for custom study tools
