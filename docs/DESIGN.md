# Design Decisions & Thoughts

Architecture notes, trade-offs, and thinking behind the app's design.

## Why React Context (not Redux/Zustand)

The app's state is mostly CRUD-based with localStorage persistence. React Context with `useState` + `useEffect` sync is sufficient and avoids adding another dependency. If the app scales to cloud sync with real-time updates, migrating to Zustand or a server state library (TanStack Query) would be worthwhile.

## Why No Router

Navigation is flat — 9 top-level views with no nested routes or URL-based deep linking. A string-based `activeTab` state is simpler and avoids the bundle size of react-router. If URL routing becomes needed (e.g., shareable links to specific tasks), adding react-router would be straightforward since each view is a self-contained component.

## Tailwind CSS 4 (CSS-First Config)

Tailwind v4's `@theme` directive in CSS replaces the old `tailwind.config.js` file. This keeps all color tokens, font definitions, and custom variants in one place. Custom neutral shades (150, 250, 350, 450, 550, 750, 850) are defined in the theme to fill gaps in the default neutral scale where the UI needed finer granularity.

## Web Audio API for Ambient Sounds

Rather than bundling audio files (which would increase bundle size significantly), the ambient sounds are procedurally generated using the Web Audio API. White noise is raw random samples, rain adds brown noise + filtered crackle impulses, ocean uses oscillator-modulated volume, and focus hum is a 130Hz bandpass-filtered brown noise. This keeps the app lightweight and allows real-time volume control.

## Gamification Model

The XP/level system uses a sqrt-based formula: `level = floor(sqrt(xp / 150)) + 1`. This gives diminishing returns at higher levels — early levels are quick to earn (motivating), while later levels require sustained effort. The streak system counts consecutive days with either a focus session or the "study" habit checked.

## Achievement Detection

Achievements are checked after every XP gain (task completion, habit toggle, session log) via a 200ms timeout. This allows the state update to propagate before checking. Using refs for the latest session/task/note/stats values prevents stale closure bugs where the checker reads old values.

## PWA Without Build Plugin

Instead of using `vite-plugin-pwa` (which adds complexity), the PWA setup is manual: a static `manifest.json`, a hand-written `service worker` in `public/`, and a registration script in `index.html`. This keeps the build config simple and the service worker transparent. The SW uses a stale-while-revalidate strategy for assets and network-first for navigation.

## What I'd Change Next

1. **Replace localStorage with a proper database** — localStorage is limited (~5MB), not shared across tabs, and lost on clear. Moving to IndexedDB (via Dexie) or a cloud DB is the top priority.
2. **Add proper markdown rendering** — The current hand-rolled parser handles basics but misses links, tables, images, and inline code. A library like `react-markdown` or `marked` would be more robust.
3. **Type safety improvements** — Some components use `any` types (e.g., timer ref, dynamic icon lookup). Tightening these would catch more bugs at compile time.
4. **Accessibility audit** — Many interactive elements lack proper ARIA labels, focus management, and keyboard navigation beyond the command palette.
5. **Test coverage** — Currently zero tests. Adding Vitest + React Testing Library for critical paths (timer logic, task CRUD, achievement unlocking) would prevent regressions.
