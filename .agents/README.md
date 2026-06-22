# Roostvasum

Roostvasum is a geolocation based infrastructure reporting platform. The platform allows citizens to report damaged public infrastructure, administrators to verify and assign reports, and field officers to update repair progress with evidence.

## Core Goals

1. Help citizens submit infrastructure damage reports with accurate location data.
2. Help administrators verify report validity and assign cases to the right officer or agency.
3. Help field officers access report details, navigate to the location, and submit progress evidence.
4. Provide public transparency through status tracking and a public map.

## Main Actors

| Actor | Description |
| --- | --- |
| Public Visitor | Can view public map, public report detail, and platform statistics. |
| User | Can create reports, upload evidence photos, and track personal reports. |
| Officer | Can view assigned tasks, update progress, and upload repair evidence. |
| Admin | Can verify, reject, assign, and monitor reports. |
| Superadmin | Can manage users, roles, categories, regions, agencies, and audit logs. |

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js App Router |
| Language | TypeScript with strict mode |
| Styling | Tailwind CSS |
| UI Library | shadcn/ui |
| Database | Supabase PostgreSQL |
| ORM | Prisma |
| Authentication | Supabase Auth with Email and Google OAuth |
| Storage | Supabase Storage |
| Client State | Zustand |
| Server State | TanStack React Query |
| HTTP Client | Axios |
| i18n | next-intl |
| Deployment | Vercel |
| Package Manager | npm |

## Document Index

| File | Purpose |
| --- | --- |
| `AGENTS.md` | Permanent AI agent rules for Cursor, Claude, Copilot, and similar tools. |
| `PRD.md` | Product requirement document. |
| `ARCHITECTURE.md` | System architecture and technical design. |
| `DATABASE_SCHEMA.md` | Database entities and Prisma draft schema. |
| `API_SPEC.md` | API route design and response format. |
| `AUTHENTICATION_RBAC.md` | Authentication, Google OAuth, session, and role based access control. |
| `DESIGN.md` | UI and design system guideline. |
| `SECURITY.md` | Security strategy and implementation rules. |
| `DEPLOYMENT.md` | Environment and deployment guide. |
| `TESTING.md` | Testing strategy and coverage priorities. |
| `TASK_INSTRUCTION.md` | Step by step development checklist. |
| `FLOW.md` | System flow for users, admins, officers, and public viewers. |
| `ENVIRONMENT.md` | Required environment variables without secret values. |

## MVP Scope

The first MVP must include authentication, user roles, report creation with GPS coordinates, photo upload, admin verification, officer assignment, officer progress update, report timeline, and public map.

## Out of Scope for MVP

The following features should be postponed until the core workflow is stable:

- AI duplicate detection.
- WhatsApp notification.
- Native mobile app.
- Advanced heatmap analytics.
- PDF export.
- SLA automation.
