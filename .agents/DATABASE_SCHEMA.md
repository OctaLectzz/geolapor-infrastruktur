# DATABASE_SCHEMA - GeoLapor Infrastruktur

> Database entities, relationships, indexes, and Prisma draft schema.

---

## 1. Database Overview

The database uses Supabase PostgreSQL with Prisma ORM. The MVP stores coordinates as decimal latitude and longitude. PostGIS can be enabled in a later phase for spatial queries.

---

## 2. Main Entities

| Entity | Purpose |
| --- | --- |
| UserProfile | Application profile linked to Supabase Auth user. |
| Category | Infrastructure report category. |
| Region | Administrative location data. |
| Agency | Responsible government unit or service agency. |
| Report | Main report data. |
| ReportPhoto | Evidence photos for before, progress, and after repair. |
| ReportStatusHistory | Immutable status change timeline. |
| Assignment | Assignment from admin to officer. |
| FieldUpdate | Field progress update by officer. |
| Comment | Internal or visible report notes. |
| Notification | In app notification records. |
| AuditLog | Security and administrative action log. |

---

## 3. Relationship Summary

```text
UserProfile 1 -> many Report
UserProfile 1 -> many Assignment as officer
Category 1 -> many Report
Region 1 -> many Report
Agency 1 -> many UserProfile officers
Report 1 -> many ReportPhoto
Report 1 -> many ReportStatusHistory
Report 1 -> many Assignment
Assignment 1 -> many FieldUpdate
Report 1 -> many Comment
```

---

## 4. Enums

```prisma
enum UserRole {
  SUPERADMIN
  ADMIN
  OFFICER
  USER
}

enum ReportStatus {
  PENDING_VERIFICATION
  VERIFIED
  REJECTED
  ASSIGNED
  IN_PROGRESS
  NEED_REVIEW
  COMPLETED
  CANCELLED
}

enum PhotoType {
  BEFORE
  PROGRESS
  AFTER
}

enum NotificationType {
  REPORT_CREATED
  REPORT_VERIFIED
  REPORT_REJECTED
  REPORT_ASSIGNED
  REPORT_IN_PROGRESS
  REPORT_COMPLETED
}
```

---

## 5. Prisma Draft Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum UserRole {
  SUPERADMIN
  ADMIN
  OFFICER
  USER
}

enum ReportStatus {
  PENDING_VERIFICATION
  VERIFIED
  REJECTED
  ASSIGNED
  IN_PROGRESS
  NEED_REVIEW
  COMPLETED
  CANCELLED
}

enum PhotoType {
  BEFORE
  PROGRESS
  AFTER
}

enum NotificationType {
  REPORT_CREATED
  REPORT_VERIFIED
  REPORT_REJECTED
  REPORT_ASSIGNED
  REPORT_IN_PROGRESS
  REPORT_COMPLETED
}

model UserProfile {
  id             String   @id @default(cuid())
  supabaseUserId String   @unique @map("supabase_user_id")
  email          String   @unique
  fullName       String   @map("full_name")
  phoneNumber    String?  @map("phone_number")
  avatarUrl      String?  @map("avatar_url")
  role           UserRole @default(USER)
  agencyId       String?  @map("agency_id")
  isActive       Boolean  @default(true) @map("is_active")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  agency         Agency?      @relation(fields: [agencyId], references: [id])
  reports        Report[]     @relation("ReporterReports")
  assignments    Assignment[] @relation("OfficerAssignments")
  comments       Comment[]
  notifications  Notification[]

  @@map("user_profiles")
}

model Agency {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  phoneNumber String?  @map("phone_number")
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  officers    UserProfile[]

  @@map("agencies")
}

model Category {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  icon        String?
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  reports     Report[]

  @@map("categories")
}

model Region {
  id        String   @id @default(cuid())
  province  String
  city      String
  district  String?
  village   String?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  reports   Report[]

  @@index([province, city])
  @@index([district])
  @@map("regions")
}

model Report {
  id             String       @id @default(cuid())
  reportCode     String       @unique @map("report_code")
  title          String
  description    String
  address        String?
  latitude       Decimal      @db.Decimal(10, 8)
  longitude      Decimal      @db.Decimal(11, 8)
  status         ReportStatus @default(PENDING_VERIFICATION)
  rejectionNote  String?      @map("rejection_note")
  priorityLevel  Int          @default(1) @map("priority_level")
  reporterId     String       @map("reporter_id")
  categoryId     String       @map("category_id")
  regionId       String?      @map("region_id")
  createdAt      DateTime     @default(now()) @map("created_at")
  updatedAt      DateTime     @updatedAt @map("updated_at")

  reporter       UserProfile  @relation("ReporterReports", fields: [reporterId], references: [id])
  category       Category     @relation(fields: [categoryId], references: [id])
  region         Region?      @relation(fields: [regionId], references: [id])
  photos         ReportPhoto[]
  histories      ReportStatusHistory[]
  assignments    Assignment[]
  comments       Comment[]
  notifications  Notification[]

  @@index([status])
  @@index([categoryId])
  @@index([reporterId])
  @@index([regionId])
  @@index([createdAt])
  @@index([latitude, longitude])
  @@map("reports")
}

model ReportPhoto {
  id        String    @id @default(cuid())
  reportId  String    @map("report_id")
  url       String
  path      String
  type      PhotoType
  caption   String?
  createdAt DateTime  @default(now()) @map("created_at")

  report    Report    @relation(fields: [reportId], references: [id], onDelete: Cascade)

  @@index([reportId])
  @@map("report_photos")
}

model ReportStatusHistory {
  id          String       @id @default(cuid())
  reportId    String       @map("report_id")
  status      ReportStatus
  note        String?
  changedById String?      @map("changed_by_id")
  createdAt   DateTime     @default(now()) @map("created_at")

  report      Report       @relation(fields: [reportId], references: [id], onDelete: Cascade)

  @@index([reportId])
  @@index([status])
  @@index([createdAt])
  @@map("report_status_histories")
}

model Assignment {
  id          String      @id @default(cuid())
  reportId    String      @map("report_id")
  officerId   String      @map("officer_id")
  assignedBy  String      @map("assigned_by")
  note        String?
  dueDate     DateTime?   @map("due_date")
  isActive    Boolean     @default(true) @map("is_active")
  createdAt   DateTime    @default(now()) @map("created_at")
  updatedAt   DateTime    @updatedAt @map("updated_at")

  report      Report      @relation(fields: [reportId], references: [id], onDelete: Cascade)
  officer     UserProfile @relation("OfficerAssignments", fields: [officerId], references: [id])
  fieldUpdates FieldUpdate[]

  @@index([reportId])
  @@index([officerId])
  @@index([isActive])
  @@map("assignments")
}

model FieldUpdate {
  id           String     @id @default(cuid())
  assignmentId String     @map("assignment_id")
  note         String
  progress     Int        @default(0)
  photoUrl     String?    @map("photo_url")
  photoPath    String?    @map("photo_path")
  createdAt    DateTime   @default(now()) @map("created_at")

  assignment   Assignment @relation(fields: [assignmentId], references: [id], onDelete: Cascade)

  @@index([assignmentId])
  @@map("field_updates")
}

model Comment {
  id        String      @id @default(cuid())
  reportId  String      @map("report_id")
  authorId  String?     @map("author_id")
  content   String
  isPublic  Boolean     @default(false) @map("is_public")
  createdAt DateTime    @default(now()) @map("created_at")

  report    Report      @relation(fields: [reportId], references: [id], onDelete: Cascade)
  author    UserProfile? @relation(fields: [authorId], references: [id])

  @@index([reportId])
  @@index([authorId])
  @@map("comments")
}

model Notification {
  id        String           @id @default(cuid())
  userId    String           @map("user_id")
  reportId  String?          @map("report_id")
  type      NotificationType
  title     String
  message   String
  isRead    Boolean          @default(false) @map("is_read")
  createdAt DateTime         @default(now()) @map("created_at")

  user      UserProfile      @relation(fields: [userId], references: [id], onDelete: Cascade)
  report    Report?          @relation(fields: [reportId], references: [id])

  @@index([userId])
  @@index([isRead])
  @@map("notifications")
}

model AuditLog {
  id         String   @id @default(cuid())
  actorId    String?  @map("actor_id")
  action     String
  entityType String   @map("entity_type")
  entityId   String?  @map("entity_id")
  metadata   Json?
  ipAddress  String?  @map("ip_address")
  userAgent  String?  @map("user_agent")
  createdAt  DateTime @default(now()) @map("created_at")

  @@index([actorId])
  @@index([entityType, entityId])
  @@index([createdAt])
  @@map("audit_logs")
}
```

---

## 6. Data Integrity Rules

- `user_profiles.supabase_user_id` must be unique.
- Each report must have at least one `BEFORE` photo.
- Each report status change must create a `report_status_histories` record.
- Each admin verification action must create an `audit_logs` record.
- A report should have only one active assignment at a time.
- `COMPLETED` status should only be allowed after field evidence exists or after admin override with note.

---

## 7. Indexing Strategy

| Field | Reason |
| --- | --- |
| `reports.status` | Fast report filtering by workflow state. |
| `reports.category_id` | Fast category filter. |
| `reports.reporter_id` | Fast user dashboard query. |
| `reports.region_id` | Fast region filter. |
| `reports.created_at` | Fast sorting and reporting. |
| `reports.latitude, reports.longitude` | Basic geolocation filtering. |
| `assignments.officer_id` | Fast officer task query. |
| `notifications.user_id` | Fast notification retrieval. |
| `audit_logs.created_at` | Fast audit timeline query. |

---

## 8. PostGIS Upgrade Notes

For Phase 2, add a `location` column with geometry or geography type:

```sql
create extension if not exists postgis;
alter table reports add column location geography(Point, 4326);
create index reports_location_idx on reports using gist(location);
```

Use PostGIS when the platform needs accurate radius search, spatial filtering, heatmap, or duplicate detection by distance.
