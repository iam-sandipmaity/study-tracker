# Study Tracker

A gamified study tracker web app with focus timer, task management, subject planning, analytics, habit tracking, and study notes — all with a polished dark/light UI and offline PWA support.

## Features

- **Focus Timer** — Pomodoro (25m), short break, long break, or custom duration with ambient sounds (white noise, rainfall, ocean waves, focus hum) and fullscreen focus mode
- **Task Board** — Kanban-style board (To Do / In Progress / Completed) with subjects, priorities, due dates, and estimated vs actual durations
- **Subject Plans** — Track academic subjects with exam dates, target scores, study hours, and task completion progress
- **Analytics** — Weekly bar chart, subject pie chart, GitHub-style heatmap, and stats cards (avg session, completion rate, most active day, peak focus time)
- **Calendar** — Monthly view with task deadline dots, exam indicators, and a daily agenda sidebar
- **Habit Tracker** — 6 daily habit categories across a 7-day rolling window with toggle-based logging
- **Study Notes** — Markdown editor with split-pane preview, subject tagging, and full-text search
- **Gamification** — XP system, leveling (sqrt-based), 7 achievement badges, confetti + sound effects on unlocks
- **Command Palette** — Cmd/Ctrl+K powered quick-access to all features
- **Dark/Light Theme** — Class-based toggle with system preference detection, persisted across sessions
- **PWA** — Installable as a standalone app with service worker for offline caching
- **Persistence** — All data saved to localStorage automatically

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Bundler | Vite 8 |
| Styling | Tailwind CSS 4 (CSS-first config) |
| Charts | Recharts |
| Icons | Lucide React |
| Audio | Web Audio API (procedural ambient sounds) |

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

## Project Structure

```
src/
  App.tsx                  # Root layout, sidebar, mobile nav, routing
  main.tsx                 # Entry point
  index.css                # Tailwind config, custom theme, animations
  types.ts                 # TypeScript interfaces
  mockData.ts              # Initial seed data
  audioSynthesis.ts        # Web Audio API ambient sound manager
  utils/
    confetti.ts            # Canvas-based confetti animation
  context/
    AppContext.tsx          # Global state (React Context + localStorage)
  components/
    Dashboard.tsx          # Home overview with stats and quick-add
    Timer.tsx              # Focus timer with presets and ambient sounds
    Tasks.tsx              # Kanban task board
    Subjects.tsx           # Subject planning cards
    Analytics.tsx          # Charts and heatmap
    Calendar.tsx           # Monthly calendar with agenda
    Habits.tsx             # Daily habit tracker table
    Notes.tsx              # Markdown note editor
    Achievements.tsx       # XP, levels, and badge grid
    CommandPalette.tsx     # Cmd+K command menu
    NotificationCenter.tsx # Notification dropdown
    LucideIcon.tsx         # Dynamic icon resolver
public/
  favicon.svg              # App icon (purple lightning bolt)
  icons.svg                # Social icon sprite
  manifest.json            # PWA manifest
  sw.js                    # Service worker for offline caching
```

## License

[Unlicense](LICENSE) — Public Domain. Free to use, modify, and distribute.
