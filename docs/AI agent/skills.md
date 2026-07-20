# Skills

Reusable knowledge and workflows for this project.

## Skill: Add New Feature

1. Define types in `src/types.ts`
2. Create component in `src/components/`
3. Add state in `AppContext.tsx` with localStorage init
4. Add `useEffect` for localStorage sync
5. Add to `switch` in `App.tsx` for routing
6. Add nav item in `navItems` array
7. Add command palette entry in `CommandPalette.tsx`
8. Run `npm run build` to verify

## Skill: Add Supabase Table

1. Create migration in `supabase/migrations/`
2. Use `DROP ... IF EXISTS` before `CREATE` for idempotency
3. Include RLS policies (SELECT, INSERT, UPDATE, DELETE)
4. Add indexes for `user_id` and frequently queried columns
5. Update `src/types/database.ts` if needed
6. Add CRUD methods in `AppContext.tsx`
7. Sync to Supabase in each CRUD operation

## Skill: Fix TypeScript Error

1. Read the error message carefully
2. Check for unused imports (remove them)
3. Check for type mismatches (fix the types)
4. Check for missing required props (add them)
5. Run `npm run build` to verify

## Skill: Update Auth Form

1. Auth form is in `src/components/AuthForm.tsx`
2. Auth methods in `src/context/AuthContext.tsx`
3. Split layout: left panel (branding) + right panel (form)
4. Use `Logo` component for branding
5. Mobile shows only form, desktop shows split
6. Test both login and signup modes

## Skill: Database Migration

1. Always create new migration file (never edit old ones)
2. Name format: `描述.sql` or `001_initial_schema.sql`
3. Use transactions for complex changes
4. Include `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
5. Test on fresh database first
6. Update `reset_and_setup.sql` if needed

## Skill: UI Component Pattern

```tsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LucideIcon } from './LucideIcon';

export const ComponentName: React.FC = () => {
  const { state1, state2 } = useApp();
  
  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto pb-10">
      {/* Content */}
    </div>
  );
};
```

Key patterns:
- `text-left` on containers for consistent alignment
- `max-w-4xl mx-auto` for content width
- `space-y-6` for vertical spacing
- `pb-10` for bottom padding
- Use existing Tailwind classes from `index.css` theme
