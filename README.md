# Study Tracker

A gamified study tracker web app with focus timer, task management, subject planning, analytics, habit tracking, session history, and study notes — with Supabase auth, cloud sync, and offline PWA support.

## Features

- **Focus Timer** — Pomodoro (25m), short break, long break, or custom duration with ambient sounds (white noise, rainfall, ocean waves, focus hum) and fullscreen focus mode
- **Task Board** — Kanban-style board (To Do / In Progress / Completed) with subjects, priorities, due dates, and estimated vs actual durations
- **Subject Plans** — Track academic subjects with exam dates, target scores, study hours, and task completion progress
- **Analytics** — Weekly bar chart, subject pie chart, GitHub-style heatmap, and stats cards (avg session, completion rate, most active day, peak focus time)
- **Calendar** — Monthly view with task deadline dots, exam indicators, and a daily agenda sidebar
- **Habit Tracker** — 6 daily habit categories across a 7-day rolling window with toggle-based logging
- **Study Notes** — Markdown editor with split-pane preview, subject tagging, and full-text search
- **Session History** — Review past study sessions with notes, duration, subject, and XP earned
- **Gamification** — XP system, leveling (sqrt-based), 7 achievement badges, confetti + sound effects on unlocks
- **Command Palette** — Cmd/Ctrl+K powered quick-access to all features
- **Dark/Light Theme** — Class-based toggle with system preference detection, persisted across sessions
- **Auth & Cloud Sync** — Supabase authentication with Google OAuth, per-user cloud database, RLS security
- **Data Export/Import** — JSON export/import for backup and migration
- **Onboarding Tour** — First-time user guide for new signups
- **PWA** — Installable as a standalone app with service worker for offline caching

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Bundler | Vite 8 |
| Styling | Tailwind CSS 4 (CSS-first config) |
| Charts | Recharts |
| Icons | Lucide React |
| Audio | Web Audio API (procedural ambient sounds) |
| Auth & DB | Supabase (PostgreSQL + Auth) |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

Create a `.env` file for Supabase integration (optional — app works in demo mode without it):

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Project Structure

```
src/
  App.tsx                  # Root layout, sidebar, mobile nav, routing
  main.tsx                 # Entry point
  index.css                # Tailwind config, custom theme, animations
  types.ts                 # TypeScript interfaces
  mockData.ts              # Initial seed data (empty for new users)
  audioSynthesis.ts        # Web Audio API ambient sound manager
  lib/
    supabase.ts            # Supabase client configuration
  utils/
    confetti.ts            # Canvas-based confetti animation
    migration.ts           # localStorage → Supabase migration utilities
  context/
    AppContext.tsx          # Global state (React Context + Supabase sync)
    AuthContext.tsx         # Supabase auth state and methods
  components/
    Logo.tsx               # Reusable logo component
    AuthForm.tsx           # Login/signup with Google OAuth
    ProtectedRoute.tsx     # Auth gate for protected content
    OnboardingTour.tsx     # First-time user tour
    DataExportImport.tsx   # JSON export/import modal
    Dashboard.tsx          # Home overview with stats and quick-add
    Timer.tsx              # Focus timer with presets and ambient sounds
    Tasks.tsx              # Kanban task board
    Subjects.tsx           # Subject planning cards
    Analytics.tsx          # Charts and heatmap
    Calendar.tsx           # Monthly calendar with agenda
    Habits.tsx             # Daily habit tracker table
    Notes.tsx              # Markdown note editor
    Achievements.tsx       # XP, levels, and badge grid
    SessionHistory.tsx     # Past sessions with notes
    CommandPalette.tsx     # Cmd+K command menu
    NotificationCenter.tsx # Notification dropdown
    LucideIcon.tsx         # Dynamic icon resolver
supabase/
  migrations/
    reset_and_setup.sql    # Full database schema
public/
  favicon.svg              # App icon (amber book + clock)
  manifest.json            # PWA manifest
  sw.js                    # Service worker for offline caching
```

## License

[Unlicense](LICENSE) — Public Domain. Free to use, modify, and distribute.
