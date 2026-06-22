# SECURITY - Roostvasum

> Security protocols and implementation standards.

**Version:** v1.0.0  
**Status:** Draft

---

## 1. Security Architecture

The application uses defense in depth:

1. Supabase Auth for identity.
2. Server side session validation.
3. Role based access control.
4. Resource ownership checks.
5. Zod validation on client and server.
6. Private storage access for sensitive media.
7. Audit logs for important actions.
8. Environment variables for secrets.

---

## 2. Authentication

Provider:

- Supabase Auth.

Enabled methods:

- Email and password.
- Google OAuth.

Rules:

- Use Supabase secure session handling.
- Do not manually store tokens in localStorage.
- Do not expose service role key to the browser.
- Do not trust client supplied identity data.
- Sync Supabase users to `user_profiles` server side.

---

## 3. Authorization and RBAC

Roles:

- `SUPERADMIN`
- `ADMIN`
- `OFFICER`
- `USER`

Authorization rules:

- Route access must be guarded in `src/proxy.ts`.
- API access must be guarded in server utilities.
- Client role checks are for UI only.
- API handlers must check the actual session and database role.
- Users can only access their own private reports.
- Officers can only access assignments assigned to them.
- Admins can access all report operations but not necessarily superadmin only settings.

---

## 4. Input Validation

Use Zod for:

- Auth forms.
- Report creation.
- Report update.
- Photo metadata.
- Admin verification.
- Admin rejection.
- Officer progress update.
- Category management.
- Region management.
- Profile update.

Rules:

- Validate on client for UX.
- Validate again on server for security.
- Reject invalid coordinates.
- Reject invalid file metadata.
- Reject invalid status transitions.

---

## 5. File Upload Security

Photo upload rules:

- Allow only image MIME types.
- Restrict file size.
- Generate safe storage paths server side.
- Do not trust original file names.
- Store metadata in `report_photos` or `field_updates`.
- Prefer private buckets and signed URLs.
- Public pages must not expose private storage paths when not needed.

Recommended buckets:

```text
report-photos
field-update-photos
avatars
```

---

## 6. Data Privacy

Public pages must not expose:

- Reporter email.
- Reporter phone number.
- Internal admin notes.
- Private comments.
- Exact user identity unless explicitly approved.
- Storage paths that reveal user ids when unnecessary.

Admin pages can expose private data only to authorized roles.

---

## 7. API Security

API rules:

- Use `requireAuth()` for protected endpoints.
- Use `requireRole()` for role based endpoints.
- Use `requireReportOwner()` for user report access.
- Use `requireAssignmentOwner()` for officer access.
- Return safe error messages.
- Do not return stack traces.
- Use pagination to prevent large data scraping.
- Rate limit sensitive endpoints when possible.

Sensitive endpoints:

- Login and register.
- Upload endpoints.
- Report creation.
- Admin verification.
- Role management.

---

## 8. Environment and Secrets

Rules:

- Store secrets in `.env.local` for local development.
- Store production secrets in Vercel environment variables.
- Never commit `.env`, `.env.local`, or secret files.
- Never expose service role key to the client.
- Only variables prefixed with `NEXT_PUBLIC_` can be read by the browser.

---

## 9. Supabase RLS Notes

Because Prisma connects directly to PostgreSQL, application level authorization is mandatory. If Supabase client side database access is used later, Row Level Security must be enabled and policies must be written for each table.

Recommended approach for MVP:

- Use Prisma for application data access.
- Use Supabase Auth for identity.
- Use Supabase Storage for files.
- Enforce authorization in API routes and server utilities.

---

## 10. Audit Logging

Audit logs are required for:

- Role changes.
- Report verification.
- Report rejection.
- Report assignment.
- Report completion.
- Category changes.
- Region changes.
- User activation or deactivation.

Audit log fields:

- Actor ID.
- Action.
- Entity type.
- Entity ID.
- Metadata.
- IP address.
- User agent.
- Timestamp.

---

## 11. Status Transition Protection

Allowed transitions:

```text
PENDING_VERIFICATION -> VERIFIED
PENDING_VERIFICATION -> REJECTED
VERIFIED -> ASSIGNED
ASSIGNED -> IN_PROGRESS
IN_PROGRESS -> NEED_REVIEW
NEED_REVIEW -> COMPLETED
ASSIGNED -> CANCELLED
IN_PROGRESS -> CANCELLED
```

Rules:

- Users cannot change status directly.
- Officers cannot mark a report as completed directly.
- Admin must confirm completion.
- Rejection requires a note.
- Cancellation requires a note.

---

## 12. Security Checklist Before Production

- [ ] Supabase Google OAuth redirect URLs are configured.
- [ ] Supabase service role key is not exposed in client bundle.
- [ ] All protected APIs have auth guards.
- [ ] All role restricted APIs have role guards.
- [ ] All upload APIs validate MIME type and size.
- [ ] Public report APIs hide private reporter data.
- [ ] Audit logs are written for critical actions.
- [ ] Environment variables are configured in Vercel.
- [ ] Error messages do not expose stack traces.
- [ ] Admin and superadmin accounts are seeded safely.
