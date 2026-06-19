# DESIGN - GeoLapor Infrastruktur

> UI and UX guideline for the infrastructure reporting platform.

**Version:** v1.0.0  
**Status:** Draft

---

## 1. Design Philosophy

The interface must be clean, administrative, map centered, and mobile first. The system should help users submit reports quickly and help admins scan large amounts of report data without visual clutter.

Design principles:

1. Clarity over decoration.
2. Fast report submission.
3. Visible status and progress.
4. Strong map readability.
5. Accessible color contrast.
6. Full light and dark mode support.

---

## 2. Visual Direction

| Area | Direction |
| --- | --- |
| Layout | Spacious, card based, dashboard friendly. |
| Shape | Medium rounded corners. |
| Tone | Civic technology, reliable, modern. |
| Density | Public pages can be spacious. Admin pages can be denser but readable. |
| Icons | Use simple line icons for categories and actions. |
| Map | Markers must use status colors and clustering when needed. |

---

## 3. Color System

Use CSS variables and Tailwind tokens. Do not hardcode hex colors inside components.

### 3.1 Brand Tokens

| Token | Purpose |
| --- | --- |
| `primary` | Main action, CTA, active navigation. |
| `secondary` | Supporting backgrounds and less prominent actions. |
| `accent` | Highlighted map or dashboard elements. |
| `background` | Page background. |
| `foreground` | Main text. |
| `muted` | Secondary text and subtle panels. |
| `border` | Card and input border. |

### 3.2 Status Colors

| Status | Semantic Token |
| --- | --- |
| PENDING_VERIFICATION | `warning` |
| VERIFIED | `info` |
| REJECTED | `destructive` |
| ASSIGNED | `secondary` |
| IN_PROGRESS | `warning` |
| NEED_REVIEW | `info` |
| COMPLETED | `success` |
| CANCELLED | `muted` |

---

## 4. Typography

Recommended font:

- Primary: Inter or Geist Sans.
- Fallback: system sans serif.

| Element | Size | Weight | Usage |
| --- | --- | --- | --- |
| H1 | 36 to 48 px | 700 | Landing page hero. |
| H2 | 28 to 32 px | 700 | Section title. |
| H3 | 20 to 24 px | 600 | Card and dashboard section title. |
| Body | 14 to 16 px | 400 | Default content. |
| Caption | 12 to 13 px | 400 | Metadata, helper text. |
| Badge | 12 px | 500 | Status label. |

---

## 5. Layout System

Breakpoints:

| Breakpoint | Width | Usage |
| --- | --- | --- |
| Mobile | < 640 px | Single column layout. |
| Tablet | 640 to 1023 px | Two column where needed. |
| Desktop | >= 1024 px | Sidebar and content layout. |
| Wide | >= 1280 px | Data table and map split view. |

### 5.1 Public Layout

```text
Header
Hero
Statistics
How it works
Public map preview
Categories
Footer
```

### 5.2 Dashboard Layout

```text
Sidebar
  Navigation
Main content
  Header
  Filter or action bar
  Cards, tables, maps, forms
```

### 5.3 Report Form Layout

Mobile:

```text
Title
Category
Photo upload
Location button
Map
Description
Submit
```

Desktop:

```text
Left panel: form fields and upload
Right panel: map and coordinate detail
```

---

## 6. Component Standards

### 6.1 Buttons

- Primary button for main action.
- Secondary button for alternate action.
- Destructive button for reject, delete, or cancel.
- Button text must use translation keys.
- Loading state must disable the button.

### 6.2 Cards

Use cards for:

- Report summary.
- Dashboard statistics.
- Category preview.
- Officer tasks.

Card content order:

1. Title.
2. Category and status badge.
3. Short description.
4. Location or date metadata.
5. Action button.

### 6.3 Forms

Form rules:

- Every input must have a label.
- Every error must be visible near its input.
- Required fields must be clear.
- Long forms must be split into sections.
- Submit button must show loading state.

### 6.4 Tables

Admin tables must support:

- Search.
- Status filter.
- Category filter.
- Region filter.
- Date filter.
- Pagination.
- Row action menu.

### 6.5 Status Badge

Badge content must be short and consistent:

| Status | Label |
| --- | --- |
| PENDING_VERIFICATION | Pending |
| VERIFIED | Verified |
| REJECTED | Rejected |
| ASSIGNED | Assigned |
| IN_PROGRESS | In Progress |
| NEED_REVIEW | Need Review |
| COMPLETED | Completed |
| CANCELLED | Cancelled |

Indonesian labels must be stored in `messages/id`.

---

## 7. Map UX

Public map:

- Use marker color based on status.
- Use clustering for many markers.
- Add filter drawer on mobile.
- Add side panel on desktop.
- Marker click opens report preview.

Report form map:

- Show current location button.
- Show manual pin adjustment.
- Show latitude and longitude values.
- Show permission denied fallback.

Admin map:

- Show duplicate candidates nearby.
- Show report density by status.
- Allow opening detail from marker.

---

## 8. Loading and Empty States

Use skeletons for:

- Report cards.
- Admin report tables.
- Dashboard statistics.
- Map side panel.

Use empty states for:

- No reports.
- No assigned tasks.
- No search results.
- No public reports in selected filter.

---

## 9. Accessibility Requirements

- Use semantic HTML.
- Use accessible labels for forms.
- Use keyboard navigable dialogs and dropdowns.
- Do not rely only on color to communicate status.
- Provide visible focus states.
- Use readable text contrast in light and dark mode.

---

## 10. Core Components

| Component | Location | Purpose |
| --- | --- | --- |
| `status-badge.tsx` | `src/components/shared` | Display report status. |
| `report-card.tsx` | `src/features/reports/components` | Display report summary. |
| `report-form.tsx` | `src/features/reports/components` | Create or update report form. |
| `location-picker.tsx` | `src/features/reports/components` | GPS and manual map pin. |
| `photo-uploader.tsx` | `src/features/reports/components` | Upload evidence photo. |
| `report-timeline.tsx` | `src/features/reports/components` | Status history timeline. |
| `admin-report-table.tsx` | `src/features/admin/components` | Admin report list. |
| `assignment-panel.tsx` | `src/features/admin/components` | Assign report to officer. |
| `progress-update-form.tsx` | `src/features/officer/components` | Officer field update form. |
