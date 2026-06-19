# API_SPEC - GeoLapor Infrastruktur

> API routes, request rules, response format, and authorization requirements.

---

## 1. Standard Response Format

All internal API routes must return this structure:

```ts
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
}
```

Success example:

```json
{
  "success": true,
  "data": {
    "id": "report_id",
    "reportCode": "RPT-2026-0001"
  },
  "message": "Report created successfully."
}
```

Error example:

```json
{
  "success": false,
  "data": null,
  "message": "Invalid request payload."
}
```

---

## 2. HTTP Status Code Rules

| Code | Usage |
| --- | --- |
| 200 | Successful read or update. |
| 201 | Successful creation. |
| 400 | Invalid request payload. |
| 401 | User is not authenticated. |
| 403 | User is authenticated but not authorized. |
| 404 | Resource not found. |
| 409 | Conflict, duplicate, or invalid status transition. |
| 500 | Unexpected server error. |

---

## 3. Public APIs

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/reports/public` | Get public report markers and filtered list. | Public |
| GET | `/api/reports/public/[id]` | Get limited public report detail. | Public |
| GET | `/api/categories` | Get active report categories. | Public |
| GET | `/api/dashboard/public-stats` | Get public statistics. | Public |

### GET `/api/reports/public`

Query params:

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| `status` | string | No | Report status filter. |
| `categoryId` | string | No | Category filter. |
| `regionId` | string | No | Region filter. |
| `page` | number | No | Pagination page. |
| `limit` | number | No | Pagination limit. |

Public response must not include reporter email, phone number, or private notes.

---

## 4. Auth APIs

Most auth operations are handled by Supabase Auth client and server utilities.

| Route | Description |
| --- | --- |
| `/login` | Email login and Google OAuth login page. |
| `/register` | Email registration page. |
| `/auth/callback` | Supabase OAuth callback route. |
| `/forgot-password` | Password recovery page. |

Server behavior after OAuth callback:

1. Validate Supabase session.
2. Sync `user_profiles` record.
3. Assign default role `USER` if the profile is new.
4. Redirect by role.

---

## 5. User Report APIs

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| POST | `/api/reports` | Create a new report. | USER |
| GET | `/api/reports/my` | Get current user reports. | USER |
| GET | `/api/reports/[id]` | Get report detail for owner or authorized role. | USER, ADMIN, OFFICER |
| PATCH | `/api/reports/[id]` | Update report before verification. | USER owner only |
| POST | `/api/upload/report-photo` | Upload report evidence photo. | USER |

### POST `/api/reports`

Request body:

```json
{
  "title": "Damaged road near public market",
  "description": "There is a large pothole that can endanger motorcycle riders.",
  "categoryId": "category_id",
  "address": "Jalan Merdeka No. 10",
  "latitude": -6.20000000,
  "longitude": 106.81666600,
  "photos": [
    {
      "url": "https://storage-url/photo.jpg",
      "path": "reports/user-id/photo.jpg",
      "caption": "Initial evidence"
    }
  ]
}
```

Business rules:

- User must be authenticated.
- At least one photo is required.
- Latitude and longitude must be valid.
- Category must exist and be active.
- Status must start as `PENDING_VERIFICATION`.
- System generates `reportCode`.
- System creates initial status history.

---

## 6. Admin APIs

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/admin/reports` | Get all reports with filters. | ADMIN, SUPERADMIN |
| GET | `/api/admin/reports/[id]` | Get full report detail. | ADMIN, SUPERADMIN |
| PATCH | `/api/admin/reports/[id]/verify` | Verify pending report. | ADMIN, SUPERADMIN |
| PATCH | `/api/admin/reports/[id]/reject` | Reject pending report. | ADMIN, SUPERADMIN |
| POST | `/api/admin/reports/[id]/assign` | Assign report to officer. | ADMIN, SUPERADMIN |
| PATCH | `/api/admin/reports/[id]/complete` | Complete report after review. | ADMIN, SUPERADMIN |
| GET | `/api/admin/stats` | Get admin dashboard statistics. | ADMIN, SUPERADMIN |
| GET | `/api/admin/audit-logs` | Get audit logs. | SUPERADMIN |

### PATCH `/api/admin/reports/[id]/verify`

Request body:

```json
{
  "note": "Report is valid and location matches the evidence photo."
}
```

Allowed transition:

```text
PENDING_VERIFICATION -> VERIFIED
```

### PATCH `/api/admin/reports/[id]/reject`

Request body:

```json
{
  "rejectionNote": "The photo does not match the selected location."
}
```

Allowed transition:

```text
PENDING_VERIFICATION -> REJECTED
```

### POST `/api/admin/reports/[id]/assign`

Request body:

```json
{
  "officerId": "officer_user_profile_id",
  "dueDate": "2026-06-30T17:00:00.000Z",
  "note": "Please inspect and repair this road segment."
}
```

Allowed transition:

```text
VERIFIED -> ASSIGNED
```

---

## 7. Officer APIs

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/officer/tasks` | Get current officer active tasks. | OFFICER |
| GET | `/api/officer/tasks/[id]` | Get assigned task detail. | OFFICER owner |
| POST | `/api/officer/tasks/[id]/updates` | Create field progress update. | OFFICER owner |
| PATCH | `/api/officer/tasks/[id]/submit-review` | Submit finished task for admin review. | OFFICER owner |

### POST `/api/officer/tasks/[id]/updates`

Request body:

```json
{
  "note": "Repair work has started and the damaged section has been marked.",
  "progress": 40,
  "photoUrl": "https://storage-url/progress.jpg",
  "photoPath": "field-updates/assignment-id/progress.jpg"
}
```

Business rules:

- Officer must own the assignment.
- Progress must be between 0 and 100.
- If this is the first update, status becomes `IN_PROGRESS`.
- Each update creates field update and status history when status changes.

---

## 8. Master Data APIs

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/admin/categories` | Get categories. | ADMIN, SUPERADMIN |
| POST | `/api/admin/categories` | Create category. | ADMIN, SUPERADMIN |
| PATCH | `/api/admin/categories/[id]` | Update category. | ADMIN, SUPERADMIN |
| DELETE | `/api/admin/categories/[id]` | Soft delete category. | SUPERADMIN |
| GET | `/api/admin/regions` | Get regions. | ADMIN, SUPERADMIN |
| POST | `/api/admin/regions` | Create region. | SUPERADMIN |
| PATCH | `/api/admin/regions/[id]` | Update region. | SUPERADMIN |
| GET | `/api/admin/officers` | Get officers. | ADMIN, SUPERADMIN |

---

## 9. Validation Requirements

Use Zod for:

- Login form.
- Register form.
- Report creation.
- Report update.
- Admin verification.
- Admin rejection.
- Assignment.
- Field update.
- Category management.
- Profile update.

Do not rely on client validation only. Server validation is mandatory.

---

## 10. Pagination Format

List APIs should return:

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  },
  "message": "Reports retrieved successfully."
}
```

---

## 11. Security Rules

- Validate session on every protected route.
- Validate role on every protected API.
- Validate resource ownership for user and officer APIs.
- Never trust `userId`, `role`, or `status` from client payload.
- Do not return private reporter data in public APIs.
- Do not expose Supabase service role key to the client.
