# HireSense AI — Frontend

Frontend for the **AI-Powered Resume Screener & Job Portal** (final-year B.Tech CSE project).
Built with Next.js (App Router), React, TypeScript, Tailwind CSS v4, Radix-based shadcn-style UI components, Lucide, Recharts, React Hook Form, Zod, Axios and Sonner.

This folder is self-contained: it works **today with mock data** and is wired so the FastAPI backend / AI engine can be connected later **without touching any page or component**.

> The product name "HireSense AI" is a placeholder — change it in `constants/site.ts`.

## Quick start

```bash
cd frontend
npm install
cp .env.example .env.local     # already contains mock-mode defaults
npm run dev                    # http://localhost:3000
```

Other scripts: `npm run build`, `npm start`, `npm run lint`, `npx tsc --noEmit`.
Requires Node 20+ (tested on Node 22).

### Demo accounts (mock mode only)
Password for all: `Demo@1234`

| Role | Email |
|---|---|
| Candidate | candidate@demo.com |
| Recruiter | recruiter@demo.com |
| Admin | admin@demo.com |

The login page has "Fill" buttons for these. New accounts can also be registered (mock, in-memory).

## Environment variables

| Variable | Default | Meaning |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | FastAPI base URL |
| `NEXT_PUBLIC_USE_MOCK_DATA` | `true` | `true` = in-memory mock services, `false` = real API |
| `NEXT_PUBLIC_AUTH_STRATEGY` | `cookie` | `cookie` or `bearer` — **unconfirmed with backend** |
| `NEXT_PUBLIC_API_CASE` | `camel` | `camel` or `snake` — JSON key casing used by the backend (auto-converted) |

Never put secrets in `NEXT_PUBLIC_*` variables; they are visible in the browser.

## Mock data

- Data lives in `mocks/` (`mockUsers`, `mockJobs`, `mockApplicants`, `mockScreeningResults`, `store`, `mockApi`).
- Pages/components **never import mocks**; they call `services/*.service.ts`, which pick mock or real implementation using `NEXT_PUBLIC_USE_MOCK_DATA`.
- State is in memory and resets on a full page reload (the signed-in demo user is kept in `sessionStorage` — an id only, never a token).
- **AI results are fixed sample values**, flagged `isDemo: true`, and the UI shows "Demo data" labels. The frontend never calculates AI scores or match percentages.
- Mock "Run AI screening" reveals pre-written sample results for demo purposes only.

To go live: set `NEXT_PUBLIC_USE_MOCK_DATA=false`, configure the API URL and auth strategy, and follow `API_INTEGRATION.md`.

## Project structure

```
frontend/
  app/
    (public)/   landing, about, contact, jobs, jobs/[jobId]
    (auth)/     login, register(+candidate,+recruiter), forgot-password, reset-password
    candidate/  dashboard, profile, resume, jobs(+[jobId]), recommendations, applications, notifications
    recruiter/  dashboard, profile, jobs(+new, [jobId]/edit, [jobId]/applicants), applicants,
                candidates/[applicationId], screening(+[jobId])
    admin/      dashboard, users, jobs, analytics
  components/   ui/ (primitives) · common/ · layout/ · auth/ · jobs/ · candidate/ · recruiter/ · admin/ · charts/
  services/     api.ts (Axios client) + one service per module (mock/real switch)
  mocks/        demo data + in-memory mock backend
  types/        all shared TypeScript interfaces
  constants/    endpoints, status enums, navigation, job options, site info
  context/      auth-context (frontend session state)
  hooks/        useAsync, useDebounce, useCandidateJobs
  lib/          config, validation (Zod), utils, case conversion, download helper
```
(Route groups like `(public)` do not appear in URLs: `/jobs` is `app/(public)/jobs`.)

## Pages

**Public:** `/`, `/about`, `/contact`, `/jobs`, `/jobs/:id`
**Auth:** `/login`, `/register`, `/register/candidate`, `/register/recruiter`, `/forgot-password`, `/reset-password?token=…`
**Candidate:** `/candidate/dashboard|profile|resume|jobs|recommendations|applications|notifications`
**Recruiter:** `/recruiter/dashboard|profile|jobs|jobs/new|applicants|screening`, `/recruiter/jobs/:id/edit|applicants`, `/recruiter/candidates/:applicationId`, `/recruiter/screening/:jobId`
**Admin:** `/admin/dashboard|users|jobs|analytics`

## Design notes

- Central status enum: `constants/status.ts` (APPLIED, UNDER_REVIEW, SHORTLISTED, INTERVIEW, SELECTED, REJECTED) — align with backend.
- All endpoint paths: `constants/endpoints.ts` (single place to change).
- Route guards (`RoleGuard`) are UX only. **Backend authorization is the source of truth.**
- No tokens in localStorage. In `bearer` mode a token is held in memory only.
- shadcn/ui's CLI registry could not be reached while building, so the UI primitives in `components/ui` were hand-written in shadcn style on top of Radix (`radix-ui`). They can be replaced by official shadcn components later; the import paths match.

## Testing performed

`tsc --noEmit`, `eslint`, and `next build` pass (30 routes). An automated browser run (Playwright, 30 checks) covered login/validation, role guards, job search/filter/apply/bookmark, resume validation + upload, profile edit, applications, notifications, recruiter job create/toggle/delete, applicants search/sort/pagination/shortlist/reject, candidate details, AI screening filter/compare/run, company profile, admin users/jobs/analytics, logout, and mobile overflow.
