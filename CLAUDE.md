# YAYA Attendance — Project Context for Claude Code

This file is the single source of truth for project decisions.
Read it fully before writing any code or making any architectural decisions.

---

## What we are building

A QR-code-based attendance tracking system for **RCCG GPA YAYA** (Grace Point Assembly — Young Adults & Youths). Members scan a QR code to mark attendance. First-time scanners register with basic info; returning members are auto-recognised via a device token stored in localStorage. Admins create sessions, generate QR codes, and view/filter attendance records.

The full PRD is at `docs/PRD.md`. Read it before touching any feature.

---

## Monorepo structure

```
yaya-attendance/
├── apps/
│   ├── web/        ← Next.js 14 frontend (App Router)
│   └── api/        ← Node.js + Express backend
├── docs/
│   ├── PRD.md
│   ├── tokens.css
│   ├── tailwind.tokens.js
│   └── TOKEN-REFERENCE.md
└── CLAUDE.md       ← you are here
```

---

## Tech stack — do not deviate from this

### Frontend (`apps/web`)

- **Framework:** Next.js 14, App Router, TypeScript
- **Styling:** Tailwind CSS v3 — theme extended via `docs/tailwind.tokens.js`
- **Design tokens:** `docs/tokens.css` imported in `globals.css` — use CSS variables or Tailwind token classes, never hardcode colours or spacing
- **Fonts:** Fraunces (display, 300/400 weights + italic) + Manrope (body/UI, 400/500/600) via Google Fonts
- **QR scanning:** Not built in-app. Members scan the projected/printed QR using their phone's native camera app, which opens the `/checkin/[qr_token]` URL directly — no in-app scanner needed. A manual code-entry fallback exists for phones whose camera doesn't auto-detect QR codes (decided in Phase 6, see below).
- **State:** React state + Context only — no Redux, no Zustand for v1
- **HTTP client:** `fetch` with a typed wrapper — no axios
- **Deployment:** Vercel

### Backend (`apps/api`)

- **Runtime:** Node.js 20+
- **Framework:** Express 5, TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL via Neon (serverless Postgres)
- **Auth:** JWT (jsonwebtoken) + bcrypt for admin password hashing
- **Image uploads:** Cloudinary — member profile photos only
- **QR generation:** `qrcode` npm package — server-side, per session
- **Deployment:** Render (free tier)
- **Environment:** all secrets via `.env` (never committed)

---

## Design system — read `docs/TOKEN-REFERENCE.md` for full details

**Palette: Gold & Noir**

| Role                 | Token            | Hex       |
| -------------------- | ---------------- | --------- |
| Primary / brand      | `--bg-brand`     | `#0D1B2A` |
| Crown gold accent    | `--bg-accent`    | `#C9A84C` |
| Page background      | `--bg-page`      | `#F8F4EE` |
| Success (present)    | `--text-success` | `#2D6A4F` |
| Error (absent/alert) | `--text-error`   | `#C0392B` |

- Display font: **Fraunces** — use only for emotional moments (welcome screen hero text, confirmation name). Nowhere else.
- Body/UI font: **Manrope** — everything else.
- Never use font-weight 700 or above. Max is 600 (semibold).
- Never hardcode a hex value in a component — always use a CSS variable from `tokens.css`.

---

## Data model summary

Full Prisma schema to be generated in Phase 1. Core tables:

- **members** — id, full_name, phone_number (unique), gender, date_of_birth, department (String[]), profile_photo_url (nullable), device_token (unique), created_at
- **admins** — id, name, email (unique), password_hash, created_at
- **event_types** — id, name, is_recurring, recurrence_pattern (nullable), created_at
- **sessions** — id, event_type_id (FK), date, qr_token (unique), expires_at, closed_at (nullable), created_by (FK → admins), created_at
- **attendance** — id, member_id (FK), session_id (FK), marked_at — unique on (member_id, session_id)

---

## API design — base URL prefix `/api/v1`

### Public (no auth required)

- `GET  /checkin/:qr_token` — fetch session details for check-in page
- `POST /checkin/:qr_token/register` — new member registration + mark attendance
- `POST /checkin/:qr_token/mark` — returning member mark attendance (device token in header)
- `GET  /members/lookup?phone=` — find existing member by phone (recovery flow)
- `POST /members/:id/link-device` — relink member to new device token

### Admin (JWT required — `Authorization: Bearer <token>`)

- `POST /admin/login`
- `GET  /admin/event-types`
- `POST /admin/event-types`
- `GET  /admin/sessions`
- `POST /admin/sessions`
- `GET  /admin/sessions/:id/qr`
- `PUT  /admin/sessions/:id/close`
- `GET  /admin/attendance` — query params: event_type_id, date_from, date_to, session_id, department
- `GET  /admin/attendance/export` — returns CSV
- `GET  /admin/members`

---

## Key product behaviours — do not forget these

1. **Device token flow:** on first registration, generate a UUID, store it in the `members.device_token` column, and return it to the frontend to store in `localStorage`. On every subsequent check-in request, the frontend sends this token in a custom header `X-Device-Token`. The backend looks up the member by this token.

2. **Session expiry:** a session's QR code is only valid while `NOW() < expires_at` AND `closed_at IS NULL`. The `expires_at` defaults to 23:59:59 on the session's `date`. If either condition fails, return a `410 Gone` with a message like "This session has ended."

3. **Duplicate attendance:** the `attendance` table has a unique constraint on `(member_id, session_id)`. If a member scans again, do not error — return the existing attendance record with a `200 OK` and a message "You're already marked present."

4. **Profile photo:** optional at registration. If provided, upload to Cloudinary before saving the member record. Store only the Cloudinary URL, never a binary blob.

5. **Departments:** fixed list — Choir, Drama, Ushering, Protocol, Prayer, Bible Study, Evangelism, Welfare, Follow-up, Media & Publicity, Sports. Stored as a `String[]` on the member record. Member can belong to one or more.

6. **"Not you? Tap here":** on the returning-member confirmation screen, this link clears the device token from localStorage and reloads the check-in page, prompting registration.

7. **CSV export:** admin export returns `Content-Type: text/csv` with columns: Member Name, Phone, Gender, Department(s), Event, Date, Time Marked.

---

## Coding conventions

- **TypeScript strict mode** everywhere — no `any` unless absolutely unavoidable and commented.
- **Folder structure for Next.js:** `app/` for routes, `components/` for UI, `lib/` for utilities and API client, `types/` for shared type definitions.
- **Folder structure for Express:** `src/routes/`, `src/controllers/`, `src/middleware/`, `src/services/`, `src/lib/`, `src/types/`.
- **Error handling:** all Express routes wrapped in an async error handler. Never let unhandled promise rejections reach the client.
- **Environment variables:** use a `src/lib/env.ts` (backend) and `lib/env.ts` (frontend) that validates and exports all env vars at startup — fail fast if any required var is missing.
- **No `console.log` in production paths** — use a lightweight logger (pino or similar).
- **Prisma:** always use the singleton pattern for the Prisma client in Next.js to avoid connection exhaustion in dev.

---

## Build phases

We build in phases. Complete each phase fully before moving to the next.

| Phase | Scope                                                                                                                                       |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | Project scaffold — monorepo setup, Prisma schema, env config, base Express app, Next.js app with tokens wired                               |
| 2     | Backend — all public check-in API routes + member registration logic                                                                        |
| 3     | Backend — admin auth + all admin API routes                                                                                                 |
| 4     | Frontend — member check-in flow (registration form + returning member confirmation)                                                         |
| 5     | Frontend — admin dashboard (login, sessions, QR display, attendance table + filters)                                                        |
| 6     | QR display polish (admin) + manual code-entry fallback (member) — no in-app camera scanning                                                 |
| 7     | Profile photo upload (Cloudinary) — CSV export already shipped in Phase 5, not repeated here                                                |
| 8     | Vitest setup + admin change-password endpoint + date-of-birth picker upgrade + loading/error/empty-state audit + mobile responsiveness pass |

**Current phase: 1**

---

## Environment variables needed

### Backend (`apps/api/.env`)

```
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
TZ=Africa/Lagos
```

`TZ=Africa/Lagos` must be set on the Render service before the first production deploy (there is no `render.yaml` in this repo — set it manually in the Render dashboard's environment variables). This is defense-in-depth, not the primary fix for session-expiry correctness: `expiresAt` is computed host-timezone-independently via `endOfDayLagos()` (`apps/api/src/lib/datetime.ts`), so it's correct even without this var. `TZ` only protects any other code path, log timestamp, or future cron-adjacent behavior that might naively rely on local time.

### Frontend (`apps/web/.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

---

## What the YAYA logo looks like

The YAYA crest is a heraldic emblem with:

- A royal crown at the top
- Gold laurel wreath frame
- Central shield in cobalt blue with four quadrants (dove, praying hands, open bible, sword)
- Red concentric ring border
- "Young Adults & Youths" text around the ring
- "R.C.C.G" on a ribbon banner below

When placing the logo in the UI, always give it a white or `--bg-page` (#F8F4EE) background — never place it on a coloured surface where the transparent background areas will clash. Size it at 40px height in the header.

---

## Reminder

- Read `docs/PRD.md` for full feature requirements.
- Read `docs/TOKEN-REFERENCE.md` before building any component.
- Never introduce a dependency not listed in this file without flagging it first.
- Ask before making any architectural decision not covered here.
