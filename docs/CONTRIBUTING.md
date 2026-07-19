# Contributing

Guidelines for contributing to Study Tracker.

## Development

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:5173` with hot module replacement.

## Code Style

- TypeScript strict mode is enabled — no `any` types in new code
- Tailwind utility classes for all styling — no CSS modules or inline styles
- Components are functional with hooks — no class components
- State management through `AppContext` — avoid prop drilling more than 2 levels

## Linting

```bash
npm run lint
```

Uses oxlint with React hooks and TypeScript rules.

## Build

```bash
npm run build
```

Runs TypeScript compilation followed by Vite production build. Output goes to `dist/`.

## Adding Components

1. Create the component in `src/components/`
2. Export it as a named export
3. Add it to the `switch` statement in `App.tsx` for routing
4. Add a nav entry in the `navItems` array in `App.tsx`
5. Add a command palette entry in `CommandPalette.tsx`

## Adding State

All shared state lives in `src/context/AppContext.tsx`. To add new state:

1. Define the type in `src/types.ts`
2. Add `useState` with localStorage initialization in `AppProvider`
3. Add a `useEffect` to sync to localStorage
4. Expose the state and setter through the context value
5. Update the `AppContextType` interface
