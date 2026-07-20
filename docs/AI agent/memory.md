# Memory

Persistent context and learned facts about this project.

## Project Identity

- **Name:** Study Tracker
- **Type:** Gamified study tracker web app
- **License:** Unlicense (public domain)
- **Repo:** Local git repository

## Tech Stack

- React 19 + TypeScript
- Vite 8 (bundler)
- Tailwind CSS 4 (CSS-first config, no tailwind.config.js)
- Recharts (charts)
- Lucide React (icons)
- Web Audio API (procedural ambient sounds)
- Supabase (auth + PostgreSQL database)

## Key Architecture Decisions

- React Context for state (not Redux/Zustand) — sufficient for CRUD + localStorage
- No router — flat navigation with string-based `activeTab` state
- PWA without build plugin — manual manifest.json + service worker
- Web Audio API for sounds — no audio files bundled, procedurally generated
- Supabase for auth/cloud — free tier, RLS for per-user isolation

## User Preferences

- Prefers free tier services over paid
- Wants modern, clean UI — not "AI generated" look
- Amber (#F59E0B) as primary accent color
- Dark/light theme support
- Separate commits per logical group of changes

## Development Patterns

- `npm run build` must pass clean before committing
- Components go in `src/components/`
- State in `src/context/AppContext.tsx`
- Auth in `src/context/AuthContext.tsx`
- Types in `src/types.ts`
- Supabase migrations in `supabase/migrations/`

## Known Issues / TODOs

- No test coverage yet
- Markdown parser is hand-rolled (misses links, tables, images)
- Some `any` types remain in timer ref and dynamic icon lookup
- Accessibility audit needed
