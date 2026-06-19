# TESTING - GeoLapor Infrastruktur

> Testing strategy and quality assurance guideline.

**Version:** v1.0.0  
**Status:** Draft

---

## 1. Testing Strategy

The testing strategy prioritizes business logic, API reliability, authorization, and critical user flows.

Recommended tools:

| Test Type | Tool |
| --- | --- |
| Unit Test | Vitest |
| Component Test | React Testing Library |
| API Integration Test | Vitest with mocked auth and database layer |
| E2E Test | Playwright |

---

## 2. Coverage Priority

| Priority | Area |
| --- | --- |
| High | Report status transition logic. |
| High | RBAC and authorization guards. |
| High | Zod validation schemas. |
| High | Report creation API. |
| High | Admin verification and assignment APIs. |
| High | Officer task ownership checks. |
| Medium | UI components with conditional states. |
| Medium | Map filter logic. |
| Low | Simple presentational components. |

---

## 3. Unit Tests

Test files should use this naming pattern:

```text
[name].test.ts
[name].test.tsx
```

Unit test targets:

- `generateReportCode()`
- `calculateDistance()`
- `formatDate()`
- `canTransitionReportStatus()`
- `getRedirectPathByRole()`
- Zod schemas.
- API response helpers.

Example status transition cases:

```text
PENDING_VERIFICATION -> VERIFIED should be allowed for ADMIN.
PENDING_VERIFICATION -> REJECTED should be allowed for ADMIN with note.
USER should not update report status.
OFFICER should not complete report directly.
IN_PROGRESS -> NEED_REVIEW should be allowed for assigned OFFICER.
```

---

## 4. Integration Tests

Integration tests should cover API route behavior with mocked or test database access.

### 4.1 Report Creation API

Cases:

- Creates report with valid payload.
- Rejects missing title.
- Rejects invalid coordinates.
- Rejects missing photo.
- Rejects inactive category.
- Creates status history after report creation.

### 4.2 Admin Verification API

Cases:

- Allows admin to verify pending report.
- Rejects verification by regular user.
- Rejects invalid transition.
- Creates status history.
- Creates audit log.

### 4.3 Officer Update API

Cases:

- Allows assigned officer to update progress.
- Rejects different officer.
- Rejects progress below 0 or above 100.
- Changes status to `IN_PROGRESS` on first update.

---

## 5. E2E Tests

Use Playwright for critical flows.

### 5.1 User Report Flow

```text
Register or login
  -> create report
  -> allow location or manually select location
  -> upload photo
  -> submit report
  -> view report detail
  -> see PENDING_VERIFICATION status
```

### 5.2 Google OAuth Smoke Test

Manual or automated where possible:

```text
Open login page
  -> click Continue with Google
  -> complete Google consent
  -> return to /auth/callback
  -> profile is synced
  -> redirected to dashboard
```

### 5.3 Admin Flow

```text
Login as admin
  -> open pending reports
  -> verify report
  -> assign report to officer
  -> status becomes ASSIGNED
```

### 5.4 Officer Flow

```text
Login as officer
  -> open task list
  -> open task detail
  -> submit progress update
  -> submit task for review
```

### 5.5 Public Map Flow

```text
Open /map
  -> markers are visible
  -> filter by category
  -> click marker
  -> open public report detail
```

---

## 6. Mocking Strategy

Mock:

- Supabase Auth session.
- Prisma database calls.
- Supabase Storage upload result.
- Browser geolocation.
- Map provider component.

Do not mock:

- Core validation logic.
- Status transition logic.
- Role guard decision logic.

---

## 7. Test Data

Use stable test data:

```text
user@example.com       role USER
officer@example.com    role OFFICER
admin@example.com      role ADMIN
superadmin@example.com role SUPERADMIN
```

Example report categories:

- Road.
- Street Lighting.
- Drainage.
- Bridge.
- Sidewalk.
- Public Facility.

---

## 8. Pre Release QA Checklist

- [ ] Email login works.
- [ ] Google OAuth works.
- [ ] Role based redirect works.
- [ ] Public route access works without login.
- [ ] Protected routes redirect unauthenticated users.
- [ ] User can create report.
- [ ] Photo upload works.
- [ ] Admin can verify and reject reports.
- [ ] Admin can assign officer.
- [ ] Officer can update assigned task.
- [ ] Public map hides private reporter data.
- [ ] Dark mode does not break core screens.
- [ ] Mobile report form is usable.
