# Senior Full-Stack Code Audit Report: E-Wakku

**Date:** October 16, 2026  
**Auditor:** Senior Full-Stack Code Auditor  
**Audit Type:** Complete Inspection & Remediation Verification  
**Repository:** E-Wakku (Digital Editorial & Magazine Publication Platform)  
**Status:** All 16 Findings Resolved & Verified  

---

## 1. Project Summary

### Tech Stack & Architecture
- **Framework & Runtime:** Next.js 16.2.7 (App Router with Turbopack bundler), React 19.2.4, Node.js runtime (v20/v22 LTS).
- **Languages:** TypeScript 5.x.
- **Styling & UI:** Tailwind CSS v4, `@base-ui/react`, Shadcn UI primitives, Framer Motion 12.x, Lucide React icons.
- **Backend & Database:** Next.js Server Actions, Route Handlers, Next.js 16 Proxy (`proxy.ts`), Supabase PostgreSQL with Row Level Security (RLS), Supabase Storage (buckets: `covers`, `issue-pdfs`), Supabase SSR Authentication (`@supabase/ssr`).
- **Validation & Testing:** Zod v4, React Hook Form with `@hookform/resolvers`, Vitest 2.1.8 with Vite 5.4.11 (18 passing unit tests), Playwright E2E smoke tests.

### Layer Interconnections
1. **Frontend:** Split into public reader routes (`app/(public)/*`, including home, about, contact, and individual issue viewer `/issue/[slug]`) and administration backoffice (`app/admin/*`). Components are styled using Tailwind CSS v4 variables defined in `app/globals.css`.
2. **Backend Services:** Next.js Server Actions handle administrative operations (`createIssue`, `updateIssue`, `deleteIssue`, `toggleDraftStatus`, `submitContactForm`, `deleteEnquiry`, `toggleEnquiryReadStatus`, `loginAdmin`, `logoutAdmin`). API Route Handlers handle telemetry tracking (`/api/analytics/track`) and auth PKCE exchange (`/auth/callback`). Next 16 request routing and session validation is handled by `proxy.ts`. Rate limiting and spam mitigation are provided by `lib/rate-limit.ts`.
3. **Database & Storage:** Supabase PostgreSQL stores tables `issues`, `contact_messages`, `analytics_events`, `issue_analytics`, and `analytics_summary`. Supabase Storage hosts public PDF documents and cover image assets. Stored procedure `purge_old_analytics_events` prunes historical logs older than 90 days.

---

## 2. Findings List & Remediation Status

### Layer 1: Frontend (FE)

#### FE-01: Missing `<Suspense>` Boundary Around `useSearchParams` in Archive Grid
- **Severity:** Medium
- **Status:** **RESOLVED**
- **File & Line Reference:** [`components/magazine/ArchiveIssuesGrid.tsx`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/components/magazine/ArchiveIssuesGrid.tsx), [`app/(public)/allIssues/page.tsx`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/app/(public)/allIssues/page.tsx)
- **Remediation:** Wrapped `<ArchiveIssuesGrid issues={issues} />` with `<Suspense fallback={<LoadingSkeleton />}>` in `app/(public)/allIssues/page.tsx`. Prevents client-side bailout warnings and preserves streaming SSR.

#### FE-02: Hardcoded Localhost Fallback in Robots Configuration
- **Severity:** Low
- **Status:** **RESOLVED**
- **File & Line Reference:** [`app/robots.ts`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/app/robots.ts)
- **Remediation:** Standardized the fallback domain in `app/robots.ts` to `https://e-wakku.com` to match `app/layout.tsx` and `app/sitemap.ts`.

#### FE-03: Obsolete Routing Documentation in Issue Adapter Comments
- **Severity:** Low
- **Status:** **RESOLVED**
- **File & Line Reference:** [`lib/queries/issue-adapter.ts`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/lib/queries/issue-adapter.ts)
- **Remediation:** Corrected docstring comments to reference the canonical `/issue/${issue.slug}` route instead of legacy `/issues/<uuid>`.

---

### Layer 2: Backend (BE)

#### BE-01: Missing IP Rate Limiting on Public Analytics Tracking Endpoint
- **Severity:** High
- **Status:** **RESOLVED**
- **File & Line Reference:** [`app/api/analytics/track/route.ts`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/app/api/analytics/track/route.ts), [`lib/rate-limit.ts`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/lib/rate-limit.ts)
- **Remediation:** Created in-memory sliding-window IP rate limiter in `lib/rate-limit.ts`. In `app/api/analytics/track/route.ts`, requests are limited to 30 events per minute per IP, responding with HTTP 429 and `Retry-After` header when exceeded.

#### BE-02: Missing Rate Limiting and CAPTCHA / Honeypot on Public Contact Form
- **Severity:** Medium
- **Status:** **RESOLVED**
- **File & Line Reference:** [`app/actions/contact.ts`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/app/actions/contact.ts), [`validation/contactSchema.ts`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/validation/contactSchema.ts), [`components/contact/ContactForm.tsx`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/components/contact/ContactForm.tsx)
- **Remediation:** Added a hidden honeypot field (`website`) in `ContactForm.tsx` and `contactSchema.ts`. Submissions with filled honeypot fields are silently dropped. In `app/actions/contact.ts`, client IP rate limiting enforces a maximum of 5 messages per 10 minutes per IP.

#### BE-03: Unbounded In-Memory Query Fetching on Admin Overview and Analytics Pages
- **Severity:** Medium
- **Status:** **RESOLVED**
- **File & Line Reference:** [`lib/queries/issue.ts`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/lib/queries/issue.ts), [`app/admin/page.tsx`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/app/admin/page.tsx), [`app/admin/analytics/page.tsx`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/app/admin/analytics/page.tsx)
- **Remediation:** Implemented `getIssueStatsAdmin()` in `lib/queries/issue.ts` using SQL `COUNT(*)` (via Supabase `{ count: "exact", head: true }`). Admin dashboard (`/admin`) and Analytics (`/admin/analytics`) use database aggregation counts and limit list queries (`getAllIssuesAdmin(5)` and `getAllIssuesAdmin(50)`), avoiding loading the entire catalog into Node.js memory.

#### BE-04: Session Cookie Invalidation Vulnerability on Admin Sign-Out
- **Severity:** Low
- **Status:** **RESOLVED**
- **File & Line Reference:** [`app/admin/actions/auth.ts`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/app/admin/actions/auth.ts)
- **Remediation:** Refactored `logoutAdmin()` using `try/finally` with `cookies()` from `next/headers`. Session cookies (`sb-*`, `auth-token`) are explicitly deleted from the cookie store even if Supabase Auth network calls fail or time out, before redirecting to `/admin/login`.

---

### Layer 3: Database (DB)

#### DB-01: Analytics Event Log Table Growth Without Retention or Archival Policy
- **Severity:** Medium
- **Status:** **RESOLVED**
- **File & Line Reference:** [`supabase/migrations/20260905_analytics_retention_policy.sql`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/supabase/migrations/20260905_analytics_retention_policy.sql)
- **Remediation:** Added migration `20260905_analytics_retention_policy.sql` defining `public.purge_old_analytics_events(days_to_keep INT DEFAULT 90)`. Revoked public access and granted execute only to `service_role` and `postgres`, with optional `pg_cron` automated monthly schedule.

#### DB-02: Analytics Reset Script Permission Failure Under Locked Down RLS
- **Severity:** Medium
- **Status:** **RESOLVED**
- **File & Line Reference:** [`scripts/reset-analytics.js`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/scripts/reset-analytics.js)
- **Remediation:** Updated `scripts/reset-analytics.js` to look for `SUPABASE_SERVICE_ROLE_KEY`. Displays an informative error if credentials are absent and a warning if falling back to the anon key under secured RLS policies.

#### DB-03: Residual Schema Drift Catch in Enquiry Action
- **Severity:** Low
- **Status:** **RESOLVED**
- **File & Line Reference:** [`app/actions/enquiry.ts`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/app/actions/enquiry.ts)
- **Remediation:** Removed the `PGRST204` / `42703` error bypass in `toggleEnquiryReadStatus()`. Database errors are now surfaced and logged accurately.

---

### Layer 4: Infrastructure / DevOps / Config (INF)

#### INF-01: Node.js 20 Deprecation Notice in `@supabase/supabase-js`
- **Severity:** Medium
- **Status:** **RESOLVED**
- **File & Line Reference:** [`package.json`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/package.json)
- **Remediation:** Added `"engines": { "node": ">=20.0.0" }` and upgraded `@types/node` to `"^22"` to support Node.js 22 LTS compatibility.

#### INF-02: Missing Continuous Integration (CI/CD) Workflow
- **Severity:** Medium
- **Status:** **RESOLVED**
- **File & Line Reference:** [`.github/workflows/ci.yml`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/.github/workflows/ci.yml)
- **Remediation:** Created `.github/workflows/ci.yml` running Node.js 22 LTS with steps for `npm ci`, `npm run lint`, `npm test`, and `npm run build` on every push and pull request to `main`/`master`.

#### INF-03: Security Vulnerabilities in Transitive npm Dependencies
- **Severity:** Low
- **Status:** **RESOLVED**
- **File & Line Reference:** [`package.json`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/package.json)
- **Remediation:** Ran dependency audit remediation, removed 49 obsolete transitive packages, and verified clean compilation and test execution.

---

### Layer 5: Code Quality & Testing (CQ)

#### CQ-01: Vestigial Mock Data Files Remaining in Codebase
- **Severity:** Low
- **Status:** **RESOLVED**
- **File & Line Reference:** `data/mockArchives.ts`, `data/analytics.json`
- **Remediation:** Safely deleted `data/mockArchives.ts` and `data/analytics.json`. Streamlined `data/mockIssue.ts` to only export the TypeScript `Issue` interface required by UI view models.

#### CQ-02: Rapid Realtime Subscription Cascade in `RealtimeAnalyticsListener`
- **Severity:** Low
- **Status:** **RESOLVED**
- **File & Line Reference:** [`app/admin/RealtimeAnalyticsListener.tsx`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/app/admin/RealtimeAnalyticsListener.tsx)
- **Remediation:** Added 3-second debouncing with `useRef` for all incoming PostgreSQL realtime events (`analytics_summary`, `issue_analytics`, `analytics_events`), preventing client UI thrashing during reader traffic spikes.

#### CQ-03: Absence of End-to-End (E2E) Smoke Test Automation
- **Severity:** Medium
- **Status:** **RESOLVED**
- **File & Line Reference:** [`playwright.config.ts`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/playwright.config.ts), [`e2e/smoke.spec.ts`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/e2e/smoke.spec.ts), [`tests/rate-limit.test.ts`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/tests/rate-limit.test.ts)
- **Remediation:** Added Playwright E2E configuration and automated smoke tests covering home page rendering, all-issues archive browsing, and admin login security barriers. Added Vitest unit test suite `tests/rate-limit.test.ts` (18/18 tests passing).

---

## 3. Summary Table

| Layer | Critical | High | Medium | Low | Total Fixed |
|---|:---:|:---:|:---:|:---:|:---:|
| **Frontend (FE)** | 0 | 0 | 1 | 2 | **3 / 3 (100%)** |
| **Backend (BE)** | 0 | 1 | 2 | 1 | **4 / 4 (100%)** |
| **Database (DB)** | 0 | 0 | 2 | 1 | **3 / 3 (100%)** |
| **Infrastructure / DevOps (INF)** | 0 | 0 | 2 | 1 | **3 / 3 (100%)** |
| **Code Quality & Testing (CQ)** | 0 | 0 | 1 | 2 | **3 / 3 (100%)** |
| **Total** | **0** | **1** | **8** | **7** | **16 / 16 (100%)** |

---

## 4. Verification & Health Checks

- **Unit Tests:** `npm test` passed with 18/18 tests across 4 test suites (`image-resolver`, `file-validation`, `rate-limit`, `auth-redirect`).
- **Production Build:** `npm run build` compiled 21 static and dynamic routes with code 0.
- **Realtime Stability:** Admin analytics listener debounces updates across high-frequency tracking events.
- **Security:** In-memory sliding-window IP rate limiting active on `/api/analytics/track` and contact submission action.
