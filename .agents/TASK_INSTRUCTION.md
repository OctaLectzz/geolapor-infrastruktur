# TASK_INSTRUCTION - GeoLapor Infrastruktur

> Step by step implementation guide for AI agents and developers.

**Purpose:** Keep implementation structured, safe, and aligned with the project documents.

---

## 0. Mandatory Reading Before Coding

Read these files before writing or changing code:

1. `AGENTS.md`
2. `PRD.md`
3. `ARCHITECTURE.md`
4. `DATABASE_SCHEMA.md`
5. `AUTHENTICATION_RBAC.md`
6. `API_SPEC.md`
7. `SECURITY.md`
8. `DESIGN.md`

---

## Phase 1: Project Initialization

### Task 1.1: Initialize Next.js

- [ ] Create Next.js App Router project.
- [ ] Enable TypeScript.
- [ ] Configure strict mode.
- [ ] Configure path alias `@/*`.

### Task 1.2: Configure Styling

- [ ] Install and configure Tailwind CSS.
- [ ] Install and configure shadcn/ui.
- [ ] Add theme provider.
- [ ] Add dark mode support.

### Task 1.3: Configure i18n

- [ ] Install and configure next-intl.
- [ ] Create `messages/id`.
- [ ] Create `messages/en`.
- [ ] Add common translation keys.
- [ ] Add locale middleware in `src/proxy.ts`.

### Task 1.4: Configure Supabase and Prisma

- [ ] Create Supabase project.
- [ ] Configure PostgreSQL connection string.
- [ ] Configure Prisma.
- [ ] Add `schema.prisma`.
- [ ] Generate Prisma client.
- [ ] Add `src/lib/prisma.ts`.
- [ ] Add Supabase browser and server clients.

### Task 1.5: Create Folder Structure

- [ ] Create `src/features/auth`.
- [ ] Create `src/features/reports`.
- [ ] Create `src/features/admin`.
- [ ] Create `src/features/officer`.
- [ ] Create `src/features/dashboard`.
- [ ] Create `src/features/map`.
- [ ] Create `src/schemas`.
- [ ] Create `src/services`.
- [ ] Create `src/types`.
- [ ] Create `src/utils`.

---

## Phase 2: Authentication and RBAC

### Task 2.1: Supabase Auth

- [ ] Enable email auth in Supabase.
- [ ] Enable Google OAuth in Supabase.
- [ ] Configure app callback URL.
- [ ] Create login page.
- [ ] Create register page.
- [ ] Create forgot password page.
- [ ] Create `/auth/callback` route.

### Task 2.2: Profile Sync

- [ ] Create `user_profiles` model.
- [ ] Create profile sync utility.
- [ ] Assign default role `USER` for new users.
- [ ] Add role based redirect utility.

### Task 2.3: Route Guards

- [ ] Protect `/dashboard` for authenticated users.
- [ ] Protect `/officer` for OFFICER, ADMIN, SUPERADMIN.
- [ ] Protect `/admin` for ADMIN and SUPERADMIN.
- [ ] Protect superadmin only routes.

---

## Phase 3: Report Creation MVP

### Task 3.1: Master Data

- [ ] Add category model.
- [ ] Add region model.
- [ ] Seed initial categories.
- [ ] Create public category API.

### Task 3.2: Report Form

- [ ] Create report Zod schema.
- [ ] Create report form.
- [ ] Create location picker.
- [ ] Add GPS detection.
- [ ] Add manual map pin adjustment.
- [ ] Add photo uploader.
- [ ] Submit report through API.

### Task 3.3: Report Storage

- [ ] Upload photo to Supabase Storage.
- [ ] Create report record.
- [ ] Create report photo record.
- [ ] Create initial status history.
- [ ] Return report code.

### Task 3.4: User Dashboard

- [ ] Show personal report statistics.
- [ ] Show report cards.
- [ ] Add report detail page.
- [ ] Add report timeline.

---

## Phase 4: Admin Workflow

### Task 4.1: Admin Dashboard

- [ ] Create admin layout.
- [ ] Create dashboard statistics.
- [ ] Create pending reports table.
- [ ] Add filters by status, category, region, and date.

### Task 4.2: Verification

- [ ] Create report detail for admin.
- [ ] Add verify action.
- [ ] Add reject action with required note.
- [ ] Create status history after action.
- [ ] Create audit log after action.

### Task 4.3: Assignment

- [ ] Create officer list API.
- [ ] Create assignment panel.
- [ ] Assign verified report to officer.
- [ ] Change status to `ASSIGNED`.
- [ ] Create assignment record.
- [ ] Create audit log.

---

## Phase 5: Officer Workflow

### Task 5.1: Officer Dashboard

- [ ] Create task list.
- [ ] Show assigned reports.
- [ ] Show task status.
- [ ] Show location and map link.

### Task 5.2: Field Update

- [ ] Create field update form.
- [ ] Add progress input.
- [ ] Add note input.
- [ ] Add progress photo upload.
- [ ] Create field update record.
- [ ] Change status to `IN_PROGRESS` when needed.

### Task 5.3: Submit Review

- [ ] Add submit for review action.
- [ ] Change status to `NEED_REVIEW`.
- [ ] Admin reviews final result.
- [ ] Admin changes status to `COMPLETED`.

---

## Phase 6: Public Transparency

### Task 6.1: Landing Page

- [ ] Create hero section.
- [ ] Create statistics section.
- [ ] Create how it works section.
- [ ] Create public map preview.
- [ ] Create category section.

### Task 6.2: Public Map

- [ ] Create public map page.
- [ ] Create marker API.
- [ ] Add category filter.
- [ ] Add status filter.
- [ ] Add report preview panel.
- [ ] Add public report detail page.

---

## Phase 7: Quality and Deployment

### Task 7.1: Testing

- [ ] Add unit tests for validation schemas.
- [ ] Add unit tests for status transition logic.
- [ ] Add integration tests for report APIs.
- [ ] Add Playwright tests for critical flows.

### Task 7.2: Security Review

- [ ] Check route guards.
- [ ] Check API guards.
- [ ] Check storage access.
- [ ] Check public API data exposure.
- [ ] Check audit logging.

### Task 7.3: Deployment

- [ ] Configure Vercel project.
- [ ] Add environment variables.
- [ ] Configure Supabase Auth redirect URLs.
- [ ] Run production migration.
- [ ] Test production OAuth.
- [ ] Test production report creation.

---

## Code Generation Rules Reminder

1. Use strict TypeScript.
2. Never use `any`.
3. Never hardcode UI text.
4. Use next-intl for all UI strings.
5. Use Zod for all input validation.
6. Use Prisma for database access.
7. Use Supabase Auth for identity.
8. Use Supabase Storage for media files.
9. Do not fetch data with `useEffect`.
10. Use TanStack React Query for client side data fetching.
11. Use server side authorization for protected data.
12. Create audit logs for critical admin actions.
