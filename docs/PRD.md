# Church Attendance Tracker — Product Requirements Document

**Version:** 1.1
**Status:** Draft for review
**Owner:** Stephentony

---

## 1. Overview

A QR-code-based attendance system for use across the various meetings of the youth church community (Sunday School, General Meeting, Wednesday Fellowship, and other events). Members scan a QR code displayed at the venue, are recognized automatically if they've registered before, and have their attendance recorded against that specific session. Admins can create sessions, generate QR codes, and view/filter attendance records by event type, date, and other criteria.

### 1.1 Problem statement

Attendance is currently tracked manually (paper registers or verbal roll calls), which is slow, error-prone, and produces data that's hard to analyze across weeks or event types. There's no single, queryable record of who attended what, and when.

### 1.2 Goals

- Reduce attendance marking to a single QR scan for returning members.
- Capture basic member info once, on first contact, and never ask again.
- Support multiple event types (Sunday School, General Meeting, Wednesday Fellowship, special events) without needing separate systems.
- Give admins a simple way to generate a session + QR code, and to view/filter attendance afterward.
- Double as a lightweight member directory for the youth fellowship — name, contact details, department(s), and photo, built up naturally as people register.

### 1.3 Non-goals (for v1)

- No native mobile app — everything runs in the phone's browser via a scanned link.
- No facial recognition, NFC, or hardware scanners — QR + camera only.
- No payment, giving, or donation tracking.
- No multi-church/multi-branch tenancy (design should not actively block it later, but it's not a v1 requirement).

---

## 2. Users

### 2.1 Member (attendee)

A youth church member who scans the QR code at a meeting. May be a first-time user (needs to register) or a returning user (auto-recognized).

### 2.2 Admin / Leader

Someone responsible for a unit (e.g. Sunday School coordinator, General Secretary) who creates sessions, displays QR codes, and reviews attendance. Likely a small group of people — leadership roles within the youth fellowship.

---

## 3. Core user flows

### 3.1 First-time scan (registration)

1. Member scans the QR code displayed for the session.
2. Their phone opens a check-in page in the browser.
3. The page checks for a saved device token (localStorage) — none found.
4. A short registration form is shown: full name, phone number, gender, date of birth, department/unit(s), and an optional profile photo (camera capture or upload).
5. On submit, a member record is created, a unique device token is generated and stored in the browser, and attendance is marked for that session.
6. Confirmation screen: "Welcome, [Name] — you're marked present for [Event name], [Date]."

### 3.2 Returning scan

1. Member scans the QR code for any session (same or different event type, any day).
2. The page finds the saved device token.
3. The matching member record is looked up automatically.
4. Attendance is marked for that session — no form shown.
5. Confirmation screen: "Welcome back, [Name] — you're marked present for [Event name], [Date]."

### 3.3 Returning member, new/cleared device

1. No device token found, but the person has registered before.
2. Registration form includes a link/button: "Already registered? Find my record."
3. Member enters their phone number; if a match is found, their existing record is linked to this device (new token saved against the existing member), and attendance is marked.
4. If no match, they proceed with normal registration.

### 3.4 Admin: create a session and generate QR

1. Admin logs into the dashboard.
2. Selects (or creates) an event type — e.g. "Sunday School," "General Meeting," "Wednesday Fellowship," or a one-off "Special Event."
3. Creates a session for a specific date (defaults to today).
4. System generates a unique QR code/link for that session, displayed full-screen for projection or printing.
5. Optionally, recurring event types can auto-generate a new session each week so this step isn't repeated manually.

### 3.5 Admin: view and filter attendance

1. Admin opens the attendance dashboard.
2. Default view: most recent session's attendance list.
3. Filters available: event type, date range, specific session, department/unit.
4. Each row shows member name, phone, and time marked.
5. Export to CSV for record-keeping or reporting.

---

## 4. Data model

### `members`

| Field             | Type      | Notes                                                                                                                                       |
| ----------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| id                | UUID      | Primary key                                                                                                                                 |
| full_name         | text      | Required                                                                                                                                    |
| phone_number      | text      | Required, unique — used for record recovery                                                                                                 |
| gender            | enum      | Required                                                                                                                                    |
| date_of_birth     | date      | Required                                                                                                                                    |
| department        | text[]    | Required — one or more of: Choir, Drama, Ushering, Protocol, Prayer, Bible Study, Evangelism, Welfare, Follow-up, Media & Publicity, Sports |
| profile_photo_url | text      | Optional — captured/uploaded at registration                                                                                                |
| device_token      | text      | Unique, generated on first registration                                                                                                     |
| created_at        | timestamp |                                                                                                                                             |

### `admins`

| Field         | Type      | Notes       |
| ------------- | --------- | ----------- |
| id            | UUID      | Primary key |
| name          | text      |             |
| email         | text      | Unique      |
| password_hash | text      | bcrypt      |
| created_at    | timestamp |             |

Each admin has their own account so that sessions can be attributed to the leader who created them (`sessions.created_by`). For v1, all admin accounts have equal access — no scoped permissions yet — separate accounts exist purely for accountability/tracking.

### `event_types`

| Field              | Type      | Notes                                                           |
| ------------------ | --------- | --------------------------------------------------------------- |
| id                 | UUID      | Primary key                                                     |
| name               | text      | e.g. "Sunday School", "Wednesday Fellowship"                    |
| is_recurring       | boolean   |                                                                 |
| recurrence_pattern | text      | e.g. `weekly:sunday`, `weekly:wednesday`, nullable for one-offs |
| created_at         | timestamp |                                                                 |

### `sessions`

| Field         | Type      | Notes                                                        |
| ------------- | --------- | ------------------------------------------------------------ |
| id            | UUID      | Primary key                                                  |
| event_type_id | UUID      | FK → event_types                                             |
| date          | date      |                                                              |
| qr_token      | text      | Unique, random, used in the scan URL                         |
| expires_at    | timestamp | Defaults to end of day on `date`                             |
| closed_at     | timestamp | Nullable — set if an admin manually closes the session early |
| created_by    | UUID      | FK → admins                                                  |
| created_at    | timestamp |                                                              |

### `attendance`

| Field      | Type      | Notes                                                                |
| ---------- | --------- | -------------------------------------------------------------------- |
| id         | UUID      | Primary key                                                          |
| member_id  | UUID      | FK → members                                                         |
| session_id | UUID      | FK → sessions                                                        |
| marked_at  | timestamp |                                                                      |
|            |           | Unique constraint on `(member_id, session_id)` to prevent duplicates |

---

## 5. API design (high level)

### Public (check-in flow)

- `GET /checkin/:qr_token` — returns session details (event name, date) for the landing page.
- `POST /checkin/:qr_token/register` — creates a new member, marks attendance, returns a device token.
- `POST /checkin/:qr_token/mark` — marks attendance for an existing member, identified by device token.
- `GET /members/lookup?phone=...` — used in the "find my record" recovery flow.
- `POST /members/:id/link-device` — relinks an existing member to a new device token.

### Admin (authenticated)

- `POST /admin/login`
- `GET/POST /admin/event-types`
- `GET/POST /admin/sessions`
- `GET /admin/sessions/:id/qr` — returns QR image/SVG for a session
- `GET /admin/attendance` — supports query params: `event_type_id`, `date_from`, `date_to`, `session_id`, `department`
- `GET /admin/attendance/export` — CSV export
- `GET /admin/members`

---

## 6. Tech stack

- **Frontend:** Next.js (App Router), Tailwind CSS, deployed on Vercel (free tier).
- **Backend:** Node.js + Express, deployed on Render (free tier).
- **Database:** PostgreSQL via Neon (free tier, serverless Postgres).
- **ORM:** Prisma.
- **QR generation:** `qrcode` npm package, generated server-side per session.
- **Profile photo storage:** Cloudinary (free tier) — handles upload, resizing, and serving member photos without storing binary blobs in Postgres.
- **Admin auth:** JWT-based sessions, bcrypt password hashing.
- **Device identification:** UUID stored in `localStorage`, sent as a header/cookie on subsequent check-ins.

---

## 7. Non-functional requirements

- **Mobile-first:** the check-in page is the primary surface and must load fast on average Android phones over typical Nigerian mobile data.
- **No app install:** scanning opens a normal browser page.
- **Idempotency:** scanning the same QR code multiple times in one session should not create duplicate attendance rows.
- **Data privacy:** phone numbers are the only sensitive PII collected; stored securely, not exposed in any public-facing response.
- **Resilience:** if a member's device token is lost (cleared cache, new phone), they should be able to recover their record without creating a duplicate.

---

## 8. Edge cases & open considerations

- **Duplicate scans:** handled via the unique `(member_id, session_id)` constraint — a second scan for the same session just shows the existing confirmation, doesn't insert a new row.
- **QR validity window:** a session's QR code is valid until end of day by default (auto-expires), but admins can manually close a session earlier if needed. This covers both planned closure and the case where an admin forgets to close it.
- **Shared devices:** if two people share a phone (e.g. siblings), the second person scanning would be auto-marked as the first person unless they explicitly use "find my record" or clear the device token. Worth a visible "Not you? Tap here" option on the confirmation screen.
- **Profile photo capture:** on mobile, this should use the device camera directly where possible (rather than a file picker) to keep registration quick — but allow upload as a fallback.

---

## 9. Phased rollout

### Phase 1 — MVP

- Member registration + returning-member auto check-in flow.
- Admin login, event type + session creation, QR generation.
- Basic attendance list view (unfiltered).

### Phase 2

- Filtering and search in the admin dashboard (event type, date range, department).
- CSV export.
- Recurring session auto-generation.
- "Find my record" recovery flow.

### Phase 3

- Attendance trends/analytics (per member, per department, over time).
- Multiple admin roles with scoped access.
- Possible multi-branch support if the system is adopted beyond this youth fellowship.

---

## 10. Resolved decisions (was: open questions)

1. **Departments/units:** Choir, Drama, Ushering, Protocol, Prayer, Bible Study, Evangelism, Welfare, Follow-up, Media & Publicity, Sports. A member can belong to one or more. The full final list will be confirmed before registration form build, but these are the working set.
2. **Admin accounts:** each admin gets their own login (for attribution of who created which session), but all admins share the same access level in v1 — no scoped permissions yet.
3. **QR/session validity:** sessions auto-expire at end of day; admins can also close a session manually before then.
4. **Data retention:** attendance and member records are kept long-term — no automatic deletion. This data also serves as the church's member directory, so it should persist indefinitely.
