# API Integration Guide (for the backend developer)

All endpoints below are **proposals** to be confirmed. Paths live in `constants/endpoints.ts`; request/response types live in `types/`. Marked **(extra)** = not in the original brief but needed by the UI.

## 0. Decisions needed (assumptions to confirm)

1. **Auth mechanism:** httpOnly cookie session *or* bearer token? (`NEXT_PUBLIC_AUTH_STRATEGY`). Cookie mode needs CORS with `allow_credentials=True` and an explicit origin (not `*`); SameSite/CSRF handling.
2. **JSON casing:** camelCase (types are camelCase) or snake_case (set `NEXT_PUBLIC_API_CASE=snake` and the client converts keys both ways).
3. **Pagination shape** (below) and param names `page`, `pageSize` (snake: `page_size`).
4. **Error format:** FastAPI default `{"detail": "message"}` or `{"detail":[{"loc":[..,"field"],"msg":".."}]}` (field errors are mapped to forms). Use HTTP 401 for expired/missing session, 403 for forbidden, 409 for conflicts.
5. **Machine-readable error code** `RESUME_REQUIRED` when applying without a resume (UI shows an "Upload resume" action). Other codes optional.
6. Application status values (must match `constants/status.ts`): `APPLIED, UNDER_REVIEW, SHORTLISTED, INTERVIEW, SELECTED, REJECTED`.
7. "Shortlisted" totals on dashboards = statuses `SHORTLISTED + INTERVIEW + SELECTED` (computed by backend).
8. Dates are ISO-8601 strings. IDs are strings.
9. Recruiter email visibility on applicants is up to the backend (`email` may be `null`/absent).

## 1. Conventions

**Paginated list**
```json
{ "items": [ ... ], "total": 42, "page": 1, "pageSize": 8 }
```
Query params: `page`, `pageSize`. Arrays are sent as repeated keys (`skills=a&skills=b`). Empty/undefined params are omitted.

**Auth response** (`login`, `register`): `{ "user": User, "accessToken"?: string }` (`accessToken` only in bearer mode). `GET /api/auth/me` returns `User` or `{ "user": User }`; 401 when not signed in.

`User`: `{ id, name, email, role: "CANDIDATE"|"RECRUITER"|"ADMIN", avatarUrl?, isActive, createdAt }`

## 2. Endpoints

### Auth
| Method & path | Body | Response |
|---|---|---|
| POST `/api/auth/register` | `{ name, email, password, role: "CANDIDATE"\|"RECRUITER", companyName? }` | Auth response (409 if email exists) |
| POST `/api/auth/login` | `{ email, password }` | Auth response (401 invalid creds, 403 deactivated) |
| GET `/api/auth/me` | — | `User` |
| POST `/api/auth/logout` | — | 204/200 |
| POST `/api/auth/forgot-password` (extra) | `{ email }` | 200 always (don't reveal account existence) |
| POST `/api/auth/reset-password` (extra) | `{ token, password }` | 200; 400 if token invalid/expired |

### Candidate
| Method & path | Notes |
|---|---|
| GET `/api/candidates/dashboard` (extra) | `CandidateDashboardData` = `{ profileCompletion, resume: Resume\|null, totals:{applications,shortlisted,rejected,interviews}, recommendedJobs: RecommendedJob[], recentActivity: Application[] }` |
| GET/PUT `/api/candidates/profile` | `CandidateProfile` (see `types/candidate.ts`). PUT accepts a partial object (the UI sends only changed sections, e.g. `{ skills }` or `{ experience }`); returns the full profile |
| POST `/api/candidates/profile/avatar` (extra) | multipart field `file` (image ≤ 2 MB) → `{ url }` |
| GET `/api/candidates/resume` (extra) | `Resume` or `null` |
| POST `/api/candidates/resume/upload` | **multipart/form-data**, field **`file`**; PDF/DOCX, ≤ 5 MB. Returns `Resume` |
| DELETE `/api/candidates/resume` (extra) | 204 |
| GET `/api/candidates/resume/download` (extra) | binary; `Content-Disposition` filename used |
| GET `/api/candidates/applications` | `Application[]` |
| GET `/api/candidates/recommended-jobs` | `RecommendedJob[]` — Job + `matchScore` (0–100, from AI engine, may be null) |
| GET `/api/candidates/bookmarks` (extra) | `Job[]` saved jobs |
| POST `/api/candidates/bookmarks` (extra) | `{ jobId }` |
| DELETE `/api/candidates/bookmarks/{jobId}` (extra) | 204 |

`Resume`: `{ id, fileName, fileSize, mimeType, uploadedAt, downloadUrl?, parseStatus: "UPLOADED"|"PARSING"|"PARSED"|"FAILED" }`. Parsing is done by backend/AI; the UI only displays `parseStatus`.

`Application`: `{ id, jobId, jobTitle, companyName, location, appliedAt, status, history: [{ status, at, note? }] }`

### Jobs
| Method & path | Notes |
|---|---|
| GET `/api/jobs` | Query: `q, location, employmentType, experienceLevel, skills[] (match ANY), sort (newest\|oldest\|title\|salary_high), page, pageSize, isActive`. → Paginated `Job` |
| GET `/api/jobs/{id}` | `Job` (404 if missing) |
| POST `/api/jobs` | `JobFormValues` → `Job` (company comes from the recruiter's account) |
| PUT `/api/jobs/{id}` | `JobFormValues` → `Job` |
| DELETE `/api/jobs/{id}` | 204 |
| PATCH `/api/jobs/{id}/active` (extra) | `{ isActive }` → `Job` |

`Job` and `JobFormValues`: see `types/job.ts` (employmentType `FULL_TIME|PART_TIME|INTERNSHIP|CONTRACT|REMOTE`; experienceLevel `FRESHER|JUNIOR|MID|SENIOR`; salary in INR per year).

### Applications
| Method & path | Notes |
|---|---|
| POST `/api/applications` | `{ jobId }` → `Application`. 409 if already applied; 400 `{code:"RESUME_REQUIRED"}` if no resume; 400 if job closed |
| GET `/api/applications` | candidate's own (alias of candidates/applications) |
| PATCH `/api/applications/{id}/status` | `{ status, note? }` → `Applicant`. Recruiter only; must own the job |

### Recruiter
| Method & path | Notes |
|---|---|
| GET `/api/recruiter/dashboard` | `RecruiterDashboardData` (`types/recruiter.ts`): totals, recentApplications (`Applicant[]`), jobPerformance, applicationsTrend (`[{label,value}]`), screeningActivity |
| GET `/api/recruiter/jobs` | Paginated `Job` (own jobs, all statuses; `applicantsCount` included). Query as `/api/jobs` |
| GET `/api/recruiter/applicants` (extra) | all applicants across own jobs. Query below |
| GET `/api/recruiter/jobs/{id}/applicants` | applicants of one job. Same query |
| GET `/api/recruiter/applications/{applicationId}` (extra) | `CandidateDetails` = `{ applicant, profile: CandidateProfile, resume: Resume\|null, screening: ScreeningResult\|null }` |
| GET `/api/recruiter/candidates/{candidateId}/resume` (extra) | binary resume (authorised: applied to this recruiter's job) |
| GET/PUT `/api/recruiter/company` (extra) | `CompanyProfile` `{ id, name, logoUrl?, description, website?, location?, industry?, size? }` |
| POST `/api/recruiter/company/logo` (extra) | multipart `file` → `{ url }` |

Applicants query: `q, status, screeningStatus, minScore, maxScore, sort (newest|oldest|score_desc|score_asc|name), page, pageSize`.
`Applicant`: `{ applicationId, jobId, jobTitle, candidateId, candidateName, email?, avatarUrl?, appliedAt, resumeStatus: MISSING|UPLOADED|PARSING|PARSED|FAILED, screeningStatus: NOT_SCREENED|PENDING|COMPLETED|FAILED, aiScore: number|null, status }`

### AI screening
| Method & path | Notes |
|---|---|
| POST `/api/screening/{jobId}/analyze` | Starts/queues screening of unscreened applicants → `{ jobId, status: "QUEUED"\|"RUNNING"\|"COMPLETED", analyzed? }` |
| GET `/api/screening/{jobId}/results` | Query `minScore, maxScore, sort (score_desc\|score_asc\|name)` → `ScreeningResult[]` |

`ScreeningResult` (all scores 0–100, produced by the AI engine — the UI never computes them):
```json
{
  "applicationId": "…", "candidateId": "…", "candidateName": "…", "jobId": "…",
  "overallScore": 92, "skillsScore": 95, "experienceScore": 88, "educationScore": 90, "semanticScore": 91,
  "matchingSkills": ["React"], "missingSkills": ["AWS"],
  "strengths": ["…"], "verificationAreas": ["…"],
  "summary": "optional AI-generated text", "generatedAt": "2026-11-13T10:00:00Z"
}
```
Do **not** send `isDemo` (or send `false`). If analysis is asynchronous, the UI currently re-fetches results after `analyze` returns; tell the frontend developer if polling or webhooks are preferred.

### Notifications (extra)
GET `/api/notifications` → `Notification[]` `{ id, type: APPLICATION_UPDATE|SHORTLISTED|INTERVIEW|NEW_APPLICANT|SCREENING_COMPLETE|SYSTEM, title, message, createdAt, isRead, href? }`; POST `/api/notifications/{id}/read`; POST `/api/notifications/read-all`.

### Contact (extra)
POST `/api/contact` `{ name, email, subject, message }` → 200.

### Admin
| Method & path | Notes |
|---|---|
| GET `/api/admin/dashboard` | `{ totals:{users,candidates,recruiters,jobs,applications}, activity:[{label,users,applications}] }` |
| GET `/api/admin/users` | Query `q, role, isActive, page, pageSize` → Paginated `AdminUser` `{ id,name,email,role,isActive,createdAt,lastActiveAt? }` |
| PATCH `/api/admin/users/{id}/status` (extra) | `{ isActive }` → `AdminUser` |
| GET `/api/admin/jobs` | Paginated `Job` incl. `isFlagged`, `flagReason`; query as `/api/jobs` + `flaggedOnly` |
| DELETE `/api/admin/jobs/{id}` (extra) | 204 |
| POST `/api/admin/jobs/{id}/moderation` (extra) | `{ action: "dismiss" }` clears a report |
| GET `/api/admin/analytics` | `{ registrations:[{label,candidates,recruiters}], jobPostings:[{label,value}], applicationStats:[{status,count}], screeningActivity:[{label,value}] }` |

## 3. Security reminders
- The frontend guards routes for UX only. **Every endpoint must enforce role and ownership checks.**
- Return 401 for expired sessions: the client clears its session and redirects to `/login?reason=expired`.
- Resume files: validate type/size server-side (UI limit: PDF/DOCX, 5 MB).

## 4. Switching to the real API
1. Set `NEXT_PUBLIC_USE_MOCK_DATA=false`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_AUTH_STRATEGY`, `NEXT_PUBLIC_API_CASE`.
2. Adjust paths in `constants/endpoints.ts` if the final routes differ.
3. If shapes differ, adapt in `services/*.service.ts` only (components depend on `types/`).
4. Mock demo labels disappear automatically (they render only when mock mode is on).
