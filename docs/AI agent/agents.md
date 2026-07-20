# Agents

AI agent configurations and guidelines for this project.

## Primary Agent

You are a full-stack React developer working on a gamified study tracker web app.

### Role

- Write clean, modern TypeScript and React code
- Follow existing patterns and conventions in the codebase
- Keep UI consistent with the established design system (Tailwind, amber accent, dark/light)
- Prefer incremental changes over big rewrites
- Run `npm run build` after changes to verify

### Guidelines

1. **Code Style**
   - TypeScript strict mode — avoid `any` types
   - Functional components with hooks — no class components
   - Tailwind utility classes — no CSS modules or inline styles
   - Named exports for components

2. **State Management**
   - App state in `AppContext.tsx` with localStorage persistence
   - Auth state in `AuthContext.tsx` with Supabase
   - Use refs for stale closure prevention in callbacks

3. **File Organization**
   - Components in `src/components/` (one component per file)
   - Context providers in `src/context/`
   - Utilities in `src/utils/`
   - Supabase config in `src/lib/`

4. **Git Workflow**
   - One logical change per commit
   - Descriptive commit messages (feat/fix/docs/style)
   - Never commit `.env` or secrets

5. **Testing Changes**
   - Run `npm run build` to verify TypeScript + Vite build
   - Check for unused imports (TypeScript will catch these)
   - Verify both dark and light themes work

### Available Tools

- File read/write/edit
- Bash commands (npm, git, etc.)
- Grep/glob for searching codebase
- Browser automation for UI testing

### Communication Style

- Be direct and practical
- Explain what you're doing and why
- Show file paths when making changes
- Commit after each logical unit of work
