# ENVIRONMENT - Roostvasum

> Required environment variables. Do not include real secret values in this file.

---

## 1. Public Variables

These variables can be exposed to the browser because they use `NEXT_PUBLIC_`.

```bash
NEXT_PUBLIC_APP_NAME="Roostvasum"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
NEXT_PUBLIC_DEFAULT_LOCALE="id"
NEXT_PUBLIC_MAP_PROVIDER="leaflet"
```

Notes:

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe for browser use when Supabase policies and server side guards are configured correctly.
- Do not expose service role key with `NEXT_PUBLIC_` prefix.

---

## 2. Server Only Variables

These variables must never be exposed to the browser.

```bash
DATABASE_URL=""
DIRECT_URL=""
SUPABASE_SERVICE_ROLE_KEY=""
```

---

## 3. Google OAuth Variables

Google OAuth credentials are usually configured inside Supabase Dashboard.

If the app needs to reference them server side, use:

```bash
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

Rules:

- Do not prefix Google Client Secret with `NEXT_PUBLIC_`.
- Do not commit Google credentials.
- Configure redirect URLs in both Google Cloud Console and Supabase Dashboard.

---

## 4. Optional Variables

```bash
MAP_PROVIDER_API_KEY=""
SENTRY_DSN=""
EMAIL_PROVIDER_API_KEY=""
WHATSAPP_API_TOKEN=""
```

These are not required for MVP unless the project adds provider based map tiles, monitoring, email notification, or WhatsApp notification.

---

## 5. Local Setup Example

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Then fill real values locally. Never commit `.env.local`.

---

## 6. Vercel Setup

Add variables in:

```text
Vercel Project Settings -> Environment Variables
```

Required environments:

- Development.
- Preview.
- Production.

Make sure `NEXT_PUBLIC_APP_URL` differs by environment:

```text
Development: http://localhost:3000
Preview: https://preview-url.vercel.app
Production: https://your-domain.com
```

---

## 7. Supabase Redirect URL Setup

Add these redirect URLs in Supabase Auth settings:

```text
http://localhost:3000/auth/callback
https://preview-url.vercel.app/auth/callback
https://your-domain.com/auth/callback
```

Also add the Supabase OAuth callback URI in Google Cloud Console as instructed by Supabase provider settings.

---

## 8. Local MVP Seed Data

The project includes a safe Prisma seed script for initial MVP reference data:

```bash
npm run db:seed
```

Seeded data:

- Report categories.
- Public agencies.
- Safe default regions.

Safety rules:

- The seed is idempotent and can be rerun locally.
- The seed does not create real user accounts.
- The seed does not create admin credentials.
- The seed does not insert secrets.
- The seed refuses to run when `NODE_ENV=production` or `VERCEL_ENV=production` unless `ALLOW_PRODUCTION_SEED=true` is explicitly set.
