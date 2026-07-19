# Contributing

Guidelines for contributing to Study Tracker.

## License

This project is released into the public domain under the [Unlicense](../LICENSE). By contributing, you agree that your contributions will be released under the same license.

## Development

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:5173` with hot module replacement.

### Environment Variables

For Supabase features, create a `.env` file:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Without these, the app runs in demo mode with localStorage.

## Code Style

- TypeScript strict mode is enabled — no `any` types in new code
- Tailwind utility classes for all styling — no CSS modules or inline styles
- Components are functional with hooks — no class components
- State management through `AppContext` — avoid prop drilling more than 2 levels
- Auth state lives in `AuthContext` — use `useAuth()` hook for auth methods

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
3. Add a `useEffect` to sync to localStorage and Supabase (if authenticated)
4. Expose the state and setter through the context value
5. Update the `AppContextType` interface

## Database Changes

When modifying the database schema:

1. Create a new migration file in `supabase/migrations/`
2. Use `DROP ... IF EXISTS` before `CREATE` statements for idempotency
3. Include RLS policies for new tables
4. Update `src/types/database.ts` if needed
