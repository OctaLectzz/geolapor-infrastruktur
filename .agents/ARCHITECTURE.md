# ARCHITECTURE - GeoLapor Infrastruktur

> Technical architecture and system design.

**Version:** v1.0.0  
**Status:** Draft

---

## 1. System Overview

GeoLapor Infrastruktur is a modular Next.js application backed by Supabase PostgreSQL, Supabase Auth, Supabase Storage, and Prisma ORM. It uses a feature based structure and separates presentation, application logic, data access, validation, and service calls.

```text
Browser
  -> Next.js App Router
  -> Server Components and Client Components
  -> API Routes or Server Actions
  -> Zod Validation
  -> RBAC Guard
  -> Prisma ORM
  -> Supabase PostgreSQL
  -> Supabase Storage
  -> Supabase Auth
```

---

## 2. Architecture Layers

| Layer | Technology | Responsibility |
| --- | --- | --- |
| Presentation Layer | Next.js, React, Tailwind, shadcn/ui | Pages, forms, dashboard, map, timeline, tables. |
| Client State Layer | Zustand | UI preferences, map filters, temporary form state when needed. |
| Server State Layer | TanStack React Query | Client side cache for reports, tasks, and dashboard data. |
| Application Layer | Next.js API Routes, server helpers | Route handling, status workflow, authorization, business rules. |
| Validation Layer | Zod | Request validation on client and server. |
| Data Access Layer | Prisma | Database queries, relation loading, transactions. |
| Auth Layer | Supabase Auth | Email login, Google OAuth, session lifecycle. |
| Storage Layer | Supabase Storage | Report evidence photos and field update photos. |
| Map Layer | Browser Geolocation API, map library | Location capture, marker rendering, public map. |

---

## 3. Directory Structure

```text
src/
  app/
    [locale]/
      page.tsx
      map/page.tsx
      reports/[id]/page.tsx
      dashboard/
      admin/
      officer/
    api/
      reports/
      admin/
      officer/
      upload/
      dashboard/
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
  lib/
    prisma.ts
    response.ts
    auth.ts
    supabase/
      client.ts
      server.ts
  schemas/
  services/
  hooks/
  providers/
  contexts/
  types/
  utils/
  proxy.ts
messages/
  id/
  en/
prisma/
  schema.prisma
```

---

## 4. Runtime Responsibilities

### 4.1 Server Components

Use Server Components for:

- Public landing page initial data.
- Public report detail.
- Dashboard shell.
- Admin pages with initial authenticated data.
- Officer task pages with initial authenticated data.

### 4.2 Client Components

Use Client Components for:

- Interactive map.
- Location picker.
- File upload input.
- Drag and drop upload.
- Report form.
- Filter panel.
- Data table sorting and selection.
- Toasts and modals.

---

## 5. Authentication Architecture

```text
User clicks login with Google
  -> Supabase Auth OAuth sign in
  -> Google consent screen
  -> Supabase callback
  -> App auth callback route
  -> Session is stored securely
  -> Profile sync checks user_profiles
  -> User is redirected by role
```

Profile sync behavior:

1. Read Supabase session user.
2. Find `user_profiles` by `supabaseUserId`.
3. If missing, create profile with role `USER`.
4. If existing, update basic profile information when needed.
5. Redirect based on role.

---

## 6. Authorization Architecture

Authorization must be enforced in two layers:

1. Route level protection in `src/proxy.ts`.
2. Server side authorization inside API handlers and server utilities.

Client side checks are allowed only for UI hiding. They are not security controls.

---

## 7. Report Workflow Architecture

```text
Create report
  -> Validate input
  -> Upload photos
  -> Create report
  -> Create initial status history
  -> Return report code

Admin verification
  -> Validate admin role
  -> Validate status transition
  -> Update report status
  -> Create status history
  -> Write audit log

Officer update
  -> Validate officer role
  -> Validate assignment ownership
  -> Create field update
  -> Upload progress photo
  -> Update report status when needed
  -> Create status history
```

---

## 8. Database Design Summary

Core models:

- `UserProfile`
- `Category`
- `Region`
- `Agency`
- `Report`
- `ReportPhoto`
- `ReportStatusHistory`
- `Assignment`
- `FieldUpdate`
- `Comment`
- `Notification`
- `AuditLog`

Key relationships:

- One user can create many reports.
- One category can have many reports.
- One region can have many reports.
- One report can have many photos.
- One report can have many status histories.
- One report can have many assignments, but only one active assignment should exist at a time.
- One assignment can have many field updates.

---

## 9. API Design Principles

All APIs must return:

```ts
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
}
```

API rules:

- Use Zod validation.
- Use pagination for list APIs.
- Use role guard helpers for protected endpoints.
- Avoid leaking sensitive errors.
- Use consistent HTTP codes.
- Use Prisma transactions for multi step writes.

---

## 10. Key Technical Decisions

| Decision | Reason |
| --- | --- |
| Next.js App Router | Supports server first rendering, route groups, layouts, and API routes. |
| Supabase Auth | Provides email auth, Google OAuth, and session management. |
| Supabase PostgreSQL | Managed PostgreSQL with optional PostGIS support. |
| Prisma | Strong typed database access and maintainable schema definition. |
| Supabase Storage | Integrated media storage for evidence photos. |
| TanStack React Query | Stable client side server state cache and mutation handling. |
| Zustand | Lightweight client state for UI level state. |
| next-intl | Required multilingual support without hardcoded UI strings. |
| shadcn/ui | Consistent and customizable UI primitives. |

---

## 11. Geospatial Strategy

### MVP

Store coordinates as decimal values:

- `latitude Decimal(10, 8)`
- `longitude Decimal(11, 8)`

Use bounding box and simple distance calculations for nearby report detection.

### Phase 2

Enable PostGIS for:

- Radius search.
- Nearest reports.
- Heatmap analytics.
- Region based spatial queries.
- Duplicate report detection by distance.

---

## 12. Reliability Notes

- Report creation should use a transaction after file upload metadata is ready.
- Status updates must create history records.
- Assignment creation must validate report status.
- Completed status must require evidence from officer or admin confirmation.
- Public map APIs must never return private reporter data.
