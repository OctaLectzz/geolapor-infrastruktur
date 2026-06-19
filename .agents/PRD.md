# PRD - GeoLapor Infrastruktur

> Product Requirement Document

**Version:** v1.0.0-dev  
**Status:** Draft  
**Product:** GeoLapor Infrastruktur

---

## 1. Executive Summary

GeoLapor Infrastruktur is a web based reporting platform that allows citizens to report damaged infrastructure using photo evidence and geolocation. The system supports report verification, officer assignment, progress updates, and public transparency through a map based interface.

The platform serves three operational goals:

1. Make infrastructure reporting easier and more accurate.
2. Help administrators manage report verification and field assignment.
3. Help citizens track report status from submission to completion.

---

## 2. Vision Statement

To build a transparent, accountable, and location aware infrastructure reporting platform that connects citizens, administrators, and field officers in one measurable workflow.

---

## 3. Business Objectives

| Objective | Success Metric |
| --- | --- |
| Increase reporting accessibility | Users can submit a report in under 3 minutes. |
| Improve report accuracy | Each valid report contains photo evidence and coordinates. |
| Improve administrative response | Admin can verify and assign reports from one dashboard. |
| Improve operational accountability | Every status change is recorded in report history. |
| Improve public transparency | Public users can view report distribution and status on a map. |

---

## 4. Target Users and Personas

### 4.1 Public Visitor

**Goal:** View public reports and understand infrastructure issue distribution.  
**Access:** Landing page, public map, limited report detail, public statistics.

### 4.2 Citizen Reporter

**Goal:** Submit reports and track progress.  
**Access:** Register, login, create report, upload photo, view own report history, view timeline.

### 4.3 Field Officer

**Goal:** Receive assigned reports and submit field progress.  
**Access:** View assigned tasks, view location, submit progress notes, upload progress and after repair photos.

### 4.4 Admin

**Goal:** Verify incoming reports and assign them to responsible officers.  
**Access:** View all reports, verify, reject, assign, review field updates, complete reports.

### 4.5 Superadmin

**Goal:** Manage platform configuration and system governance.  
**Access:** All admin access plus user management, role management, categories, regions, agencies, and audit logs.

---

## 5. Feature Specifications

### 5.1 Authentication

**Description:** Users can sign in using email and password or Google OAuth through Supabase Auth.

| ID | User Story | Priority |
| --- | --- | --- |
| AUTH-01 | As a user, I can register using email and password. | High |
| AUTH-02 | As a user, I can sign in using Google OAuth. | High |
| AUTH-03 | As a user, I can reset my password. | Medium |
| AUTH-04 | As an admin, I can access dashboard only when my role is valid. | High |
| AUTH-05 | As a system, I create or sync a profile after first OAuth login. | High |

### 5.2 Report Creation

**Description:** Citizen reporters can submit infrastructure damage reports with category, title, description, location, and photo evidence.

| ID | User Story | Priority |
| --- | --- | --- |
| REP-01 | As a user, I can create a report with GPS coordinates. | High |
| REP-02 | As a user, I can manually adjust the report pin on a map. | High |
| REP-03 | As a user, I can upload at least one evidence photo. | High |
| REP-04 | As a user, I can choose a report category. | High |
| REP-05 | As a user, I can save a report and receive a report code. | High |

### 5.3 Report Tracking

**Description:** Users can view their submitted reports and track the status timeline.

| ID | User Story | Priority |
| --- | --- | --- |
| TRACK-01 | As a user, I can see all reports I submitted. | High |
| TRACK-02 | As a user, I can view status history for each report. | High |
| TRACK-03 | As a user, I can view rejection notes when a report is rejected. | High |
| TRACK-04 | As a user, I can view completion evidence when the report is completed. | Medium |

### 5.4 Admin Verification

**Description:** Admin reviews incoming reports and determines whether each report is valid.

| ID | User Story | Priority |
| --- | --- | --- |
| ADM-01 | As an admin, I can view pending reports. | High |
| ADM-02 | As an admin, I can verify valid reports. | High |
| ADM-03 | As an admin, I can reject invalid reports with notes. | High |
| ADM-04 | As an admin, I can detect nearby or duplicate reports. | Medium |
| ADM-05 | As an admin, I can filter reports by status, category, region, and date. | High |

### 5.5 Officer Assignment

**Description:** Admin can assign verified reports to field officers.

| ID | User Story | Priority |
| --- | --- | --- |
| ASN-01 | As an admin, I can assign a verified report to an officer. | High |
| ASN-02 | As an officer, I can see reports assigned to me. | High |
| ASN-03 | As an officer, I can open the report location on a map. | High |
| ASN-04 | As an officer, I can update progress with notes and photos. | High |

### 5.6 Public Map

**Description:** Public visitors can view report distribution on a map.

| ID | User Story | Priority |
| --- | --- | --- |
| MAP-01 | As a public visitor, I can view report markers on a map. | High |
| MAP-02 | As a public visitor, I can filter reports by category and status. | Medium |
| MAP-03 | As a public visitor, I can view a limited report detail page. | High |
| MAP-04 | As a public visitor, I cannot see reporter private data. | High |

---

## 6. Report Status Lifecycle

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
  -> CANCELLED, only by admin or superadmin
```

---

## 7. Functional Requirements

1. The system must support account registration and login.
2. The system must support Google OAuth through Supabase Auth.
3. The system must support role based access control.
4. The system must allow users to create infrastructure reports.
5. The system must store report coordinates.
6. The system must store evidence photos in Supabase Storage.
7. The system must allow admin verification.
8. The system must allow officer assignment.
9. The system must allow officer progress updates.
10. The system must show public map markers.
11. The system must record every report status change.
12. The system must record critical admin actions in audit logs.

---

## 8. Non Functional Requirements

| Area | Requirement |
| --- | --- |
| Performance | Public pages should load under 3 seconds on normal network. |
| Security | All protected routes must validate session and role server side. |
| Reliability | Report creation must be transaction safe where possible. |
| Privacy | Public pages must not expose reporter email, phone, or exact personal identity. |
| Scalability | Report list APIs must use pagination and filtering. |
| Maintainability | Code must follow strict TypeScript, feature folder structure, and clean service separation. |
| Accessibility | Forms must use labels, keyboard navigation, and readable contrast. |
| Localization | UI must support Indonesian and English using next-intl. |

---

## 9. MVP Scope

### Included

- Email authentication.
- Google OAuth authentication.
- User profile sync.
- RBAC for USER, OFFICER, ADMIN, SUPERADMIN.
- Report creation with geolocation.
- Photo upload.
- Report list and detail for users.
- Admin verification and rejection.
- Officer assignment.
- Officer progress update.
- Public map.
- Report status history.

### Excluded

- Native mobile app.
- WhatsApp notification.
- AI duplicate detection.
- Advanced geospatial heatmap.
- SLA automation.
- PDF export.

---

## 10. Assumptions and Constraints

### Assumptions

- Users allow browser location access or manually select a location.
- Supabase project has Email and Google OAuth providers enabled.
- Report photos can be stored in Supabase Storage.
- Admins are responsible for validating false or duplicate reports.

### Constraints

- Initial release is web only.
- Google OAuth requires correct redirect URL configuration in Supabase and Google Cloud Console.
- PostGIS may be added after MVP if radius search and spatial analysis become important.
- No secret values can be stored in repository files.
