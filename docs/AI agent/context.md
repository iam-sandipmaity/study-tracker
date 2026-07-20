# Context

Project context for AI agents working on this codebase.

## Project Overview

Study Tracker is a gamified study tracker web app. Students use it to:
- Track study sessions with a Pomodoro timer
- Manage tasks with a Kanban board
- Plan subjects with exam dates and target scores
- View analytics (weekly charts, heatmaps, stats)
- Track daily habits
- Write study notes with markdown
- Earn XP, levels, and achievements

## Current State

The app is functional with:
- Full CRUD for all entities (subjects, tasks, sessions, habits, notes)
- Supabase auth with Google OAuth
- Cloud database sync with RLS
- PWA with offline support
- Dark/light theme
- Command palette (Cmd+K)
- User profile page with avatar and display name editing

## Key Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Root layout, sidebar, routing |
| `src/context/AppContext.tsx` | All app state + Supabase sync |
| `src/context/AuthContext.tsx` | Auth state + methods |
| `src/components/AuthForm.tsx` | Login/signup UI |
| `src/components/Dashboard.tsx` | Home overview |
| `src/components/Timer.tsx` | Focus timer |
| `src/components/Tasks.tsx` | Kanban board |
| `src/components/SessionHistory.tsx` | Past sessions |
| `src/components/Profile.tsx` | User profile, avatar & display name editing |
| `src/lib/supabase.ts` | Supabase client |
| `src/types.ts` | TypeScript interfaces |
| `src/index.css` | Tailwind theme + animations |

## Environment Variables

```bash
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Without these, app runs in demo mode (localStorage only).

## Database

- 8 tables: subjects, tasks, sessions, habits, user_stats, achievements, notes, notifications
- RLS policies for per-user isolation
- Migrations in `supabase/migrations/`

## UI Design System

- **Primary accent:** Sky Blue (#0ea5e9) via `brand-*` tokens in `index.css`
- **Backgrounds:** Neutral-Warm-50 (light), Neutral-900 (dark)
- **Cards:** White (light), Neutral-900 (dark)
- **Borders:** Neutral-200/60 (light), Neutral-800/60 (dark)
- **Font:** Inter (Google Fonts, loaded via CSS `@import`)
- **Border radius:** 2xl/3xl for cards, xl for buttons and inputs
- **Extended neutral shades:** 150, 250, 350, 450, 550, 750, 850 (filling gaps in default scale)

## Common Tasks

See `skills.md` for step-by-step workflows.
See `memory.md` for learned patterns and decisions.
See `ROADMAP.md` for planned features.
See `DESIGN.md` for architecture rationale.
