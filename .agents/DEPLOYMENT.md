# DEPLOYMENT - GeoLapor Infrastruktur

> Infrastructure guide and release steps.

**Version:** v1.0.0  
**Status:** Draft

---

## 1. Deployment Architecture

| Layer | Platform |
| --- | --- |
| Web Application | Vercel |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| ORM | Prisma |
| Domain | Custom domain through Vercel |

```text
User Browser
  -> Vercel Edge and Next.js app
  -> API Routes or Server Actions
  -> Prisma Client
  -> Supabase PostgreSQL
  -> Supabase Auth
  -> Supabase Storage
```

---

## 2. Environment Setup

Required variables are listed in `ENVIRONMENT.md`. Do not commit real values.

Important production variables:

```bash
NEXT_PUBLIC_APP_NAME=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
DIRECT_URL=
```

Optional variables:

```bash
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MAP_PROVIDER_API_KEY=
```

Google OAuth provider credentials are usually configured in Supabase Dashboard, but server only variables can be kept for documentation or future provider specific logic.

---

## 3. Supabase Setup

### 3.1 Database

1. Create Supabase project.
2. Copy database connection string.
3. Add `DATABASE_URL` and `DIRECT_URL` to local and Vercel environments.
4. Run Prisma migration for initial schema.
5. Seed initial roles, categories, and superadmin profile.

### 3.2 Auth

1. Enable Email provider.
2. Enable Google provider.
3. Configure Site URL.
4. Configure Redirect URLs:

```text
http://localhost:3000/auth/callback
https://your-domain.com/auth/callback
```

5. Add Google OAuth Client ID and Client Secret in Supabase Dashboard.

### 3.3 Storage

Create buckets:

```text
report-photos
field-update-photos
avatars
```

Recommended MVP policy:

- Keep buckets private.
- Use signed URLs for protected image access.
- Use public display only for approved public evidence if needed.

---

## 4. Local Deployment Check

Run:

```bash
npm install
npm run db:generate
npm run lint
npm run test
npm run build
```

Do not deploy if build, lint, or core tests fail.

---

## 5. Vercel Deployment Steps

1. Push repository to GitHub.
2. Import project into Vercel.
3. Set framework preset to Next.js.
4. Add environment variables.
5. Set production branch.
6. Deploy preview.
7. Test auth callback, report creation, upload, admin verification, and public map.
8. Promote to production.

---

## 6. Database Migration Procedure

Development:

```bash
npm run db:migrate
```

Production:

```bash
npx prisma migrate deploy
```

Rules:

- Never run destructive migrations without backup.
- Never modify production schema manually unless it is an emergency and documented.
- Always test migration on staging first.
- Use `prisma migrate deploy` in production, not `prisma db push`.

---

## 7. CI/CD Pipeline

Recommended GitHub Actions pipeline:

```text
Pull Request
  -> install dependencies
  -> lint
  -> typecheck
  -> unit tests
  -> build
  -> Vercel preview deployment

Main branch merge
  -> install dependencies
  -> lint
  -> typecheck
  -> tests
  -> build
  -> production migration
  -> Vercel production deployment
```

---

## 8. Release Checklist

- [ ] Environment variables configured.
- [ ] Supabase Auth providers configured.
- [ ] Google OAuth redirect URL configured.
- [ ] Supabase Storage buckets created.
- [ ] Prisma migrations applied.
- [ ] Initial categories seeded.
- [ ] Superadmin account created.
- [ ] Public map tested.
- [ ] Report form tested on mobile browser.
- [ ] File upload tested.
- [ ] Admin verification tested.
- [ ] Officer task update tested.
- [ ] Public APIs hide private reporter data.

---

## 9. Rollback Procedure

Application rollback:

1. Open Vercel deployments.
2. Select previous stable deployment.
3. Promote it to production.
4. Monitor logs and user reports.

Database rollback:

1. Confirm impact.
2. Use database backup if migration is destructive.
3. Apply rollback migration only after review.
4. Record incident in release notes.

---

## 10. Monitoring

Minimum monitoring:

- Vercel runtime logs.
- Supabase database logs.
- Supabase Auth logs.
- Supabase Storage usage.
- Error rate on API routes.
- Upload failure rate.
- Report creation success rate.

Recommended future monitoring:

- Sentry for frontend and backend errors.
- Analytics for report submission funnel.
- Uptime monitoring for public pages.
