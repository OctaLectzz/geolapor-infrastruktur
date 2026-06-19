# AUTHENTICATION_RBAC - GeoLapor Infrastruktur

> Authentication, Google OAuth, session handling, and role based access control.

---

## 1. Authentication Provider

The application uses Supabase Auth.

Enabled providers:

1. Email and password.
2. Google OAuth.

Supabase Auth stores the primary identity. The application stores additional profile and role data in `user_profiles`.

---

## 2. User Profile Mapping

Each Supabase Auth user must have one `user_profiles` record.

Mapping field:

```text
supabase.auth.users.id -> user_profiles.supabase_user_id
```

Profile fields:

- `supabaseUserId`
- `email`
- `fullName`
- `phoneNumber`
- `avatarUrl`
- `role`
- `agencyId`
- `isActive`

---

## 3. Google OAuth Flow

```text
User clicks Continue with Google
  -> Supabase Auth starts OAuth flow
  -> Google consent screen opens
  -> Google redirects to Supabase callback
  -> Supabase redirects to app callback URL
  -> App exchanges code for session
  -> App syncs user profile
  -> App redirects user by role
```

Recommended callback route:

```text
/auth/callback
```

Recommended role based redirects:

| Role | Redirect |
| --- | --- |
| SUPERADMIN | `/admin` |
| ADMIN | `/admin` |
| OFFICER | `/officer/tasks` |
| USER | `/dashboard` |

---

## 4. Google OAuth Setup Checklist

### 4.1 Google Cloud Console

1. Create or open Google Cloud project.
2. Configure OAuth consent screen.
3. Create OAuth Client ID.
4. Set application type to Web Application.
5. Add authorized redirect URI from Supabase Auth provider settings.
6. Copy Client ID and Client Secret.

### 4.2 Supabase Dashboard

1. Open Authentication settings.
2. Enable Google provider.
3. Add Google Client ID.
4. Add Google Client Secret.
5. Configure Site URL.
6. Configure Redirect URLs.

### 4.3 Application Environment

Use environment variables. Never commit real values.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
DIRECT_URL=
NEXT_PUBLIC_APP_URL=
```

Google OAuth credentials are primarily configured in Supabase Dashboard. If server side provider configuration is needed, use server only variables:

```bash
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

---

## 5. Session Strategy

- Use Supabase session cookies for server side route protection.
- Use Supabase server client in Server Components and API routes.
- Use Supabase browser client in Client Components.
- Never store access tokens manually in localStorage.
- Always validate session server side before accessing protected data.

---

## 6. Profile Sync Strategy

Profile sync must run after login, register, or OAuth callback.

Pseudo flow:

```text
get current Supabase user
  -> if no user, redirect to login
  -> find user_profiles by supabaseUserId
  -> if profile does not exist, create profile with role USER
  -> if profile exists, update email, fullName, or avatarUrl if changed
  -> redirect by role
```

Default role for new users:

```text
USER
```

Admin, officer, and superadmin roles must be assigned manually by superadmin or database seed.

---

## 7. Roles and Permissions

| Permission | Public | USER | OFFICER | ADMIN | SUPERADMIN |
| --- | --- | --- | --- | --- | --- |
| View landing page | Yes | Yes | Yes | Yes | Yes |
| View public map | Yes | Yes | Yes | Yes | Yes |
| Create report | No | Yes | Optional | Optional | Yes |
| View own reports | No | Yes | Yes | Yes | Yes |
| View assigned tasks | No | No | Yes | Yes | Yes |
| Update assigned task | No | No | Yes | No | Yes |
| Verify report | No | No | No | Yes | Yes |
| Reject report | No | No | No | Yes | Yes |
| Assign report | No | No | No | Yes | Yes |
| Complete report | No | No | No | Yes | Yes |
| Manage categories | No | No | No | Yes | Yes |
| Manage regions | No | No | No | No | Yes |
| Manage users and roles | No | No | No | No | Yes |
| View audit logs | No | No | No | No | Yes |

---

## 8. Route Protection

### Public Routes

```text
/
/map
/reports/[id]
/about
/help
/login
/register
/auth/callback
/forgot-password
```

### USER Routes

```text
/dashboard
/dashboard/reports
/dashboard/reports/create
/dashboard/reports/[id]
/dashboard/profile
```

### OFFICER Routes

```text
/officer/tasks
/officer/tasks/[id]
/officer/history
```

### ADMIN Routes

```text
/admin
/admin/reports
/admin/reports/verification
/admin/reports/[id]
/admin/categories
/admin/officers
```

### SUPERADMIN Routes

```text
/admin/users
/admin/regions
/admin/agencies
/admin/audit-logs
```

---

## 9. API Guard Rules

Every protected API must call server side guard utilities.

Required guards:

- `requireAuth()`
- `requireRole(roles)`
- `requireReportOwner(reportId)`
- `requireAssignmentOwner(assignmentId)`
- `requireActiveUser()`

Never rely on client side role checks as security.

---

## 10. Account Status Rules

- If `isActive = false`, user cannot access protected dashboards.
- Disabled users should be redirected to an account inactive page.
- Superadmin cannot be disabled by regular admin.
- Role changes must be recorded in audit logs.

---

## 11. Security Notes

- Do not expose service role key to the browser.
- Do not store Google Client Secret in public variables.
- Do not allow users to submit role through registration payload.
- Do not trust email domain for admin access unless explicitly implemented as an approved rule.
- Use server side profile sync to prevent privilege escalation.
