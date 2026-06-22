# FLOW - Roostvasum

> Main system flow for citizen reporters, administrators, field officers, and public visitors.

---

## 1. Actor Overview

| Actor | Main Flow |
| --- | --- |
| Public Visitor | View public map and public report status. |
| User | Create and track infrastructure reports. |
| Admin | Verify, reject, assign, and complete reports. |
| Officer | Receive assignments and submit field progress. |
| Superadmin | Manage system configuration and users. |

---

## 2. Public Visitor Flow

```text
Open landing page
  -> View platform statistics
  -> Open public map
  -> Filter reports by category or status
  -> Click report marker
  -> View limited report detail
```

Public visitors must not see reporter private data.

---

## 3. Authentication Flow

### 3.1 Email Login

```text
Open login page
  -> Enter email and password
  -> Supabase validates credentials
  -> App syncs user profile
  -> App redirects by role
```

### 3.2 Google OAuth Login

```text
Open login page
  -> Click Continue with Google
  -> Google consent screen
  -> Supabase receives OAuth callback
  -> App receives auth callback
  -> App exchanges code for session
  -> App syncs user profile
  -> App redirects by role
```

---

## 4. Citizen Report Flow

```text
User logs in
  -> Open dashboard
  -> Click Create Report
  -> Fill title and description
  -> Select category
  -> Allow GPS access or set marker manually
  -> Upload evidence photo
  -> Submit report
  -> System creates report code
  -> Report status becomes PENDING_VERIFICATION
  -> User sees report in personal history
```

Validation rules:

- Title is required.
- Description is required.
- Category is required.
- Latitude and longitude are required.
- At least one evidence photo is required.

---

## 5. Admin Verification Flow

```text
Admin logs in
  -> Open verification dashboard
  -> Select pending report
  -> Review photo, coordinates, category, and description
  -> Check duplicate possibility
  -> If valid, verify report
  -> If invalid, reject report with note
```

Valid report flow:

```text
PENDING_VERIFICATION -> VERIFIED
```

Invalid report flow:

```text
PENDING_VERIFICATION -> REJECTED
```

Admin actions must create status history and audit log records.

---

## 6. Assignment Flow

```text
Admin opens verified report
  -> Select officer or agency
  -> Add assignment note and optional due date
  -> Submit assignment
  -> System creates assignment record
  -> Report status becomes ASSIGNED
  -> Officer can see task in dashboard
```

Status flow:

```text
VERIFIED -> ASSIGNED
```

Rules:

- Only verified reports can be assigned.
- Officer must have role `OFFICER` and active account.
- A report should have only one active assignment.

---

## 7. Officer Field Flow

```text
Officer logs in
  -> Open task dashboard
  -> Select assigned task
  -> View location and report evidence
  -> Start field work
  -> Submit progress note and photo
  -> System changes status to IN_PROGRESS when needed
  -> Officer submits task for admin review
```

Status flow:

```text
ASSIGNED -> IN_PROGRESS -> NEED_REVIEW
```

Rules:

- Officer can only update assigned tasks.
- Progress value must be 0 to 100.
- Evidence photo is recommended for progress and required for final review.

---

## 8. Completion Flow

```text
Officer submits task for review
  -> Admin opens need review report
  -> Admin reviews progress and photo evidence
  -> If acceptable, admin completes report
  -> If not acceptable, admin adds note and keeps report in progress
```

Status flow:

```text
NEED_REVIEW -> COMPLETED
```

Completion requires:

- Field update exists.
- Photo evidence exists or admin override note exists.
- Status history is created.
- Audit log is created.

---

## 9. Report Status Lifecycle

```text
PENDING_VERIFICATION
  -> VERIFIED
    -> ASSIGNED
      -> IN_PROGRESS
        -> NEED_REVIEW
          -> COMPLETED

PENDING_VERIFICATION
  -> REJECTED

ASSIGNED or IN_PROGRESS
  -> CANCELLED
```

---

## 10. Notification Flow

MVP can use in app notifications.

Notification triggers:

| Trigger | Recipient |
| --- | --- |
| Report created | User |
| Report verified | User |
| Report rejected | User |
| Report assigned | Officer |
| Progress updated | Admin |
| Report completed | User |

Future notification channels:

- Email.
- WhatsApp.
- Push notification.

---

## 11. Public Transparency Flow

```text
Report is created
  -> Public map may show limited marker after verification
  -> Public sees status and category
  -> Public opens report detail
  -> Public sees status timeline without private data
```

Recommended public visibility rule:

- `PENDING_VERIFICATION` reports are hidden from public map.
- `REJECTED` reports are hidden from public map.
- `VERIFIED`, `ASSIGNED`, `IN_PROGRESS`, `NEED_REVIEW`, and `COMPLETED` reports can be shown publicly.

---

## 12. Duplicate Report Handling Flow

MVP manual flow:

```text
Admin opens pending report
  -> System shows nearby reports based on coordinates
  -> Admin compares photo, category, and address
  -> Admin verifies as new report or rejects as duplicate
```

Future automated flow:

```text
System calculates nearby reports
  -> System checks same category within distance threshold
  -> System suggests duplicate candidates
  -> Admin confirms decision
```
