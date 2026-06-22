# AGENTS.md - Roostvasum

> Canonical internal AI agent instructions for this repository. Keep this file in English because AI coding agents generally follow English technical instructions more accurately.

---

## 1. Canonical Documentation Location

The `.agents/` directory is the canonical location for internal AI agent documentation.

Rules:

- Do not create duplicate planning or agent documentation files in the repository root when the matching file exists in `.agents/`.
- If a root-level duplicate exists, compare it with the matching `.agents/` file before changing anything.
- Merge useful root-level changes into the `.agents/` version first.
- Delete root-level duplicates only when it is safe, after showing a diff summary, and only when the user approves deletion.
- Never remove `.agents/` documentation files without explicit user approval.

---

## 2. Project Overview

- **Name:** Roostvasum
- **Description:** A geolocation based infrastructure reporting platform for citizens, administrators, and field officers.
- **Goal:** Enable citizens to submit infrastructure damage reports with photo evidence and coordinates, then allow admins and officers to verify, assign, repair, and publish report progress transparently.
- **Target Users:** Public visitor, User or Citizen Reporter, Officer, Admin, Superadmin.
- **Version:** v1.0.0-dev
- **Status:** Active development

---

## 3. Required Tech Stack

| Area            | Technology                                          |
| --------------- | --------------------------------------------------- |
| Frontend        | React                                               |
| Framework       | Next.js App Router                                  |
| Language        | TypeScript strict mode                              |
| Styling         | Tailwind CSS                                        |
| UI Library      | shadcn/ui                                           |
| Database        | Supabase PostgreSQL                                 |
| ORM             | Prisma                                              |
| Auth            | Supabase Auth with Email Login and Google OAuth     |
| Storage         | Supabase Storage for report evidence photos         |
| Client State    | Zustand                                             |
| Server State    | TanStack React Query                                |
| Data Fetching   | Axios in `src/services/` or feature service folders |
| Validation      | Zod                                                 |
| i18n            | next-intl with Indonesian and English dictionaries  |
| Package Manager | npm                                                 |
| Deployment      | Vercel                                              |

---

## 4. Current Repository State

This section must be updated as setup work progresses.

### Confirmed present

- Next.js 16 project with App Router files in `src/app`.
- React 19 and TypeScript dependencies.
- TypeScript strict mode is enabled in `tsconfig.json`.
- Tailwind CSS v4 is configured through `src/app/globals.css` and `postcss.config.mjs`.
- shadcn/ui is configured through `components.json` and components exist in `src/components/ui`.
- Prisma and Supabase packages are installed.
- Basic Prisma config exists in `prisma.config.ts`.
- Basic Prisma schema exists in `prisma/schema.prisma`, but application models are not implemented yet.
- Basic Supabase browser, server, and proxy helpers exist under `src/lib/supabase`.

### Not yet complete

- `src/app/[locale]` routing is not implemented yet.
- `messages/id` and `messages/en` do not exist yet.
- next-intl is installed but not wired into `next.config.ts` or route layouts yet.
- TanStack React Query is installed but no `QueryClientProvider` exists yet.
- Prisma schema does not yet contain Roostvasum application models.
- RBAC route protection and API guards are not implemented yet.
- The current root `README.md` is still the default create-next-app README.
- Root `AGENTS.md` is a duplicate source and should be treated as non-canonical after this `.agents/AGENTS.md` file.

---

## 5. Commands

```bash
# Development
npm run dev
npm run build
npm run start
npm run lint

# Planned scripts, add before relying on them
npm run format
npm run db:migrate
npm run db:push
npm run db:studio
npm run db:generate
npm run test
npm run test:e2e
```

Rules:

- Use npm only.
- Do not use yarn, pnpm, or bun unless the user explicitly changes the package manager.
- Do not run database commands that modify production data without confirmation.
- Do not install packages without user confirmation.

---

## 6. Mandatory Reading Before Coding

Before writing or changing code, read the relevant files in `.agents/`:

1. `.agents/AGENTS.md`
2. `.agents/README.md`
3. `.agents/PRD.md`
4. `.agents/ARCHITECTURE.md`
5. `.agents/DATABASE_SCHEMA.md`
6. `.agents/AUTHENTICATION_RBAC.md`
7. `.agents/API_SPEC.md`
8. `.agents/SECURITY.md`
9. `.agents/DESIGN.md`
10. `.agents/TASK_INSTRUCTION.md`
11. `.agents/FLOW.md`
12. `.agents/ENVIRONMENT.md`

For Next.js-specific changes, also inspect local Next.js docs before coding:

```text
node_modules/next/dist/docs/
```

This project uses a Next.js version with breaking changes compared with older Next.js versions. Prefer local docs over memory.

---

## 7. Project Structure Rules

Architecture: feature based clean architecture with strict placement rules.

```text
[root]/
  .agents/
    AGENTS.md
    README.md
    PRD.md
    ARCHITECTURE.md
    DATABASE_SCHEMA.md
    AUTHENTICATION_RBAC.md
    API_SPEC.md
    SECURITY.md
    DESIGN.md
    TASK_INSTRUCTION.md
    FLOW.md
    ENVIRONMENT.md
  messages/
    id/
    en/
  prisma/
    schema.prisma
  src/
    app/
      [locale]/
      api/
    components/
      ui/
      shared/
    features/
      auth/
      reports/
      admin/
      officer/
      dashboard/
      map/
    layouts/
    lib/
      prisma.ts
      supabase/
        client.ts
        server.ts
      response.ts
      auth.ts
    types/
    utils/
    contexts/
    providers/
    schemas/
    hooks/
    services/
    proxy.ts
```

File placement rules:

- Never create a new root folder without user confirmation.
- shadcn/ui components must be placed in `src/components/ui`.
- Reusable application components must be placed in `src/components/shared`.
- Feature specific components must be placed in `src/features/[feature]/components`.
- TypeScript types must be placed in `src/types`.
- Zod schemas must be placed in `src/schemas`.
- External library initialization must be placed in `src/lib`.
- API service functions must be placed in `src/services` or inside a feature level `services` folder.
- Do not move or delete existing files without confirmation.

---

## 8. Naming Conventions

```text
# Files and folders
Components       : kebab-case, for example report-card.tsx
Non-components   : kebab-case, for example use-auth.ts
Folders          : kebab-case, for example report-detail
Pages            : page.tsx, layout.tsx, route.ts
Test files       : [name].test.ts

# In code
Variables        : camelCase
Constants        : UPPER_SNAKE_CASE
Functions        : camelCase
Types            : PascalCase
Interfaces       : PascalCase
Enums            : PascalCase
CSS classes      : kebab-case when custom classes are unavoidable

# Git branches
Feature          : feat/[feature-name]
Bug fix          : fix/[bug-name]
Hotfix           : hotfix/[name]
Refactor         : refactor/[name]
```

---

## 9. Code Conventions

- Apply clean code and DRY principles.
- Write all code, variables, functions, types, and comments in English.
- Use TypeScript strict mode.
- Never use the `any` type.
- Use `unknown` plus explicit narrowing when handling uncertain values.
- Always write explicit return types for functions.
- Use `interface` for object shapes.
- Use `type` for unions, intersections, and utility types.
- Use named exports for components and functions.
- Use default exports only for `page.tsx` and `layout.tsx`.
- Use try catch for async functions.
- Never expose stack traces or sensitive errors to clients.
- Never hardcode UI text. Use `next-intl` translation keys.
- Every UI label, button, title, toast, and validation message must exist in `messages/id` and `messages/en`.

Import order:

1. External libraries.
2. Absolute internal imports.
3. Relative internal imports.
4. Types and interfaces.
5. Assets and styles.

---

## 10. Component Rules

Default to Server Components.

Use Client Components only when the component needs:

- `useState`, `useEffect`, or browser only hooks.
- Event listeners.
- Browser APIs, including geolocation, localStorage, window, and file input preview.
- Interactive map components.
- Upload progress UI.

Component structure order:

1. Imports.
2. Types or interfaces.
3. Component definition.
4. Hooks.
5. Handlers and derived values.
6. JSX return.
7. Export.

---

## 11. Styling Rules

- Use Tailwind CSS.
- Use shadcn/ui for base components.
- Do not use inline styles unless values are truly dynamic.
- Do not use `!important`.
- Use `cn()` for conditional classes.
- Use mobile first layout.
- Support light and dark mode.
- Do not hardcode hex values inside components.
- Use semantic design tokens for status colors.

---

## 12. API and Data Fetching Rules

- Server fetch is used for initial page load data.
- TanStack React Query is used for client side interactive data.
- Do not use `useEffect` for data fetching.
- Keep Axios fetch functions in `src/services` or feature service folders.
- All internal API routes must return this format:

```ts
interface ApiResponse<T> {
  success: boolean
  data: T | null
  message: string
}
```

- Validate every request with Zod.
- Return appropriate HTTP status codes.
- Do not expose internal database error messages.

---

## 13. Authentication and Authorization

- Use Supabase Auth for authentication.
- Enable Email and Google OAuth providers.
- Google OAuth credentials must be stored in Supabase Dashboard and server only environment variables.
- Use `user_profiles.supabase_user_id` to map Supabase Auth users to application profiles.
- Store application roles in `user_profiles.role`.
- Enforce route protection in `src/proxy.ts` and server side helpers.
- Enforce API authorization on every protected endpoint.
- Do not trust client side role values.

Roles:

- `SUPERADMIN`
- `ADMIN`
- `OFFICER`
- `USER`

---

## 14. Performance Rules

- Use `next/image` for images.
- Define image width and height.
- Use dynamic imports for heavy map components.
- Import only needed functions from libraries.
- Use pagination for report tables.
- Use marker clustering for public map when report volume grows.
- Add database indexes for status, category, reporter, officer, created date, latitude, and longitude.

---

## 15. Git Rules

Commit message format:

```text
feat: add report creation flow
fix: resolve report status badge color
refactor: extract report service
style: improve dashboard spacing
docs: update API specification
test: add report validation tests
chore: update config
```

Rules:

- Never commit `.env`, `.env.local`, secrets, or credential files.
- Keep commits specific and logical.
- Do not bundle unrelated changes in one commit.

---

## 16. Do Not

- Do not use `any`.
- Do not hardcode UI text.
- Do not hardcode secrets.
- Do not expose API keys to the client.
- Do not bypass Zod validation.
- Do not fetch data with `useEffect`.
- Do not modify database schema without confirmation.
- Do not install packages without confirmation.
- Do not delete files without confirmation.
- Do not move files without confirmation.
- Do not write business logic only on the client.
- Do not trust client supplied role, user id, or status transition.
- Do not modify `.env` or `.env.local`.
- Do not run database-changing commands unless explicitly approved.
