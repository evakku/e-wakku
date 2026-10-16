# Senior Full-Stack Code Audit Report: E-Wakku

**Date:** October 13, 2026  
**Auditor:** Senior Full-Stack Code Auditor  
**Audit Type:** Complete, Read-Only Repository Inspection  
**Repository:** E-Wakku (Digital Editorial & Magazine Publication Platform)  

---

## 1. Project Summary

### Tech Stack & Architecture
- **Framework & Runtime:** Next.js 16.2.7 (App Router with Turbopack), React 19.2.4, Node.js runtime.
- **Languages:** TypeScript 5.x.
- **Styling & UI:** Tailwind CSS v4, `@base-ui/react`, Shadcn UI primitives, Framer Motion 12.x, Lucide React icons.
- **Backend & Database:** Next.js Server Actions & Route Handlers, Supabase PostgreSQL with Row Level Security (RLS), Supabase Storage (buckets: `covers`, `issue-pdfs`), Supabase SSR Authentication (`@supabase/ssr`).
- **Secondary/Legacy CMS:** `@sanity/client`, `@sanity/image-url`, `next-sanity` (present in dependencies with hardcoded mock fallback layer, unconfigured in production).
- **Validation:** Zod v4, React Hook Form with `@hookform/resolvers`.

### Layer Interconnections
1. **Frontend:** Split between public facing reader routes (`app/(public)/*` and `app/issues/*`) and administration backoffice (`app/admin/*`). Components are styled using Tailwind v4 theme variables defined in `globals.css`.
2. **Backend Services:** Next.js Server Actions handle core business logic (`createIssue`, `updateIssue`, `deleteIssue`, `toggleDraftStatus`, `submitContactForm`, `deleteEnquiry`, `loginAdmin`, `logoutAdmin`). API Route Handlers exist for analytics tracking (`/api/analytics/track`) and auth exchange (`/auth/callback`).
3. **Database & Storage:** Supabase PostgreSQL stores tables `issues`, `contact_messages`, `analytics_events`, `issue_analytics`, and `analytics_summary`. Supabase Storage hosts public PDF documents and cover image assets.

---

## 2. Findings List

### Layer 1: Frontend (FE)

#### FE-01: Dual Duplicate Dynamic Route Directories for Magazine Issues
- **Severity:** High
- **File & Line Reference:** [`app/(public)/issue/[slug]/page.tsx:1-52`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/app/(public)/issue/[slug]/page.tsx) and [`app/issues/[slug]/page.tsx:1-57`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/app/issues/[slug]/page.tsx)
- **What's wrong:** The application defines two parallel dynamic route trees for viewing individual magazine issues: `/issue/[slug]` (under `app/(public)`) and `/issues/[slug]` (at the root of `app/`). Both pages fetch identical data and render the exact same `IssueDetailsView` component, but `app/issues/[slug]` manually wraps the page in `<PublicLayout>`. Furthermore, public components link to `/issue/${slug}` while admin components link to `/issues/${id}`.
- **Why it matters:** Generates duplicate content penalty in SEO, bifurcates user routing, confuses caching strategies, and increases maintenance overhead.
- **Suggested fix:** Consolidate onto a single canonical route (e.g., `/issues/[slug]` or `/issue/[slug]`) and establish a 301 permanent redirect from the obsolete path.

#### FE-02: Analytics View Over-Counting via Unshielded Client Effect
- **Severity:** Medium
- **File & Line Reference:** [`app/issues/[slug]/IssueDetailsView.tsx:26-34`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/app/issues/[slug]/IssueDetailsView.tsx#L26-L34)
- **What's wrong:** View tracking is executed inside a client-side `useEffect` that fires an unauthenticated POST request to `/api/analytics/track` on every mount. In React 18/19 StrictMode and fast re-renders, this effect fires twice, immediately doubling recorded views.
- **Why it matters:** Metrics displayed on the Editorial Dashboard become heavily inflated and inaccurate.
- **Suggested fix:** Move view tracking server-side inside the Server Component page execution, or use an `AbortController` / `useRef` guard to ensure the tracking call executes exactly once per reader session.

#### FE-03: Full PDF In-Memory Blob Buffering & Memory Leak on Download
- **Severity:** Medium
- **File & Line Reference:** [`app/issues/[slug]/IssueInformation.tsx:50-60`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/app/issues/[slug]/IssueInformation.tsx#L50-L60)
- **What's wrong:** When a user clicks "Download", the entire PDF (up to 50MB) is fetched via `fetch(issue.pdfUrl)` into browser memory as a JavaScript `Blob`, converted to an object URL, and triggered via a synthetic link click. Crucially, `URL.revokeObjectURL(blobUrl)` is never invoked.
- **Why it matters:** On low-memory mobile browsers (iOS Safari, Android Chrome), loading a 30–50MB file into JS memory causes tab crashes. In addition, object URLs remain in memory, causing client-side memory leaks. If Supabase Storage lacks CORS headers for the reader's domain, downloads fail entirely.
- **Suggested fix:** Use a direct anchor link with `download` attribute or serve downloads via a streaming Next.js route with `Content-Disposition: attachment`. Always revoke object URLs in a `finally` block if blobs are retained.

#### FE-04: Next.js Image Optimization Bypassed for All Supabase Storage Assets
- **Severity:** Medium
- **File & Line Reference:** [`lib/supabase-image.ts:1-5`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/lib/supabase-image.ts#L1-L5), [`app/issues/[slug]/IssueCover.tsx:48`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/app/issues/[slug]/IssueCover.tsx#L48)
- **What's wrong:** The helper `isSupabaseStorageUrl` forces `unoptimized={true}` on Next.js `<Image>` components whenever the source URL contains `.supabase.co/storage/`.
- **Why it matters:** Cover images (which can be 5–10MB PNGs) are downloaded in full original resolution by mobile and desktop clients without WebP/AVIF compression or responsive downscaling, damaging Core Web Vitals (LCP), increasing bandwidth costs, and causing slow page loads.
- **Suggested fix:** Configure remote patterns properly in `next.config.ts` (which is already present) and allow Next.js image optimization to convert and resize covers appropriately.

#### FE-05: Missing `metadataBase` in Root Layout
- **Severity:** Low
- **File & Line Reference:** [`app/layout.tsx:33-43`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/app/layout.tsx#L33-L43)
- **What's wrong:** `metadataBase` is omitted from the root layout metadata export.
- **Why it matters:** Next.js throws build warnings and defaults to `http://localhost:3000` for resolving Open Graph, Twitter preview cards, and social share image URLs, breaking social media previews when deployed.
- **Suggested fix:** Add `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://e-wakku.com')` to the metadata object in `app/layout.tsx`.

#### FE-06: Sitemap Includes Deprecated Redirect Paths & Omits Dynamic Articles
- **Severity:** Low
- **File & Line Reference:** [`app/sitemap.ts:15-19`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/app/sitemap.ts#L15-L19)
- **What's wrong:** `sitemap.ts` includes `/archive` (which immediately redirects to `/allIssues`), but does not include `/allIssues`. Furthermore, individual published issues (`/issue/[slug]`) are completely absent from the sitemap.
- **Why it matters:** Search engine crawlers waste crawl budget following redirects and fail to index individual magazine issue pages.
- **Suggested fix:** Query `getAllPublishedIssues()` inside `sitemap.ts` to dynamically generate URLs for all published editions, and replace `/archive` with `/allIssues`.

---

### Layer 2: Backend (BE)

#### BE-01: Public Tracking Route Exposes Complete Internal Analytics Summary
- **Severity:** High
- **File & Line Reference:** [`app/api/analytics/track/route.ts:13-14`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/app/api/analytics/track/route.ts#L13-L14)
- **What's wrong:** When any unauthenticated client POSTs to `/api/analytics/track`, the handler invokes `trackAnalyticsEvent()` and returns `{ success: true, data: updated }`. `updated` contains the complete `AnalyticsData` structure: global total views, active readers, total downloads, and the full breakdown of views/downloads for every single issue in the publication database.
- **Why it matters:** Leaks confidential editorial readership figures, engagement ratios, and unpublished or draft performance metrics to anonymous visitors inspecting network requests.
- **Suggested fix:** Return a minimal acknowledgement (e.g. `{ success: true }`) from `/api/analytics/track` instead of serializing the internal analytics state.

#### BE-02: Missing Role-Based Authorization in `requireAdminAuth`
- **Severity:** High
- **File & Line Reference:** [`lib/supabase/auth.ts:15-35`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/lib/supabase/auth.ts#L15-L35)
- **What's wrong:** `requireAdminAuth()` checks only `if (error || !user)` from `supabase.auth.getUser()`. If Supabase public sign-up is enabled or if any non-admin authenticated user token exists (e.g., standard reader/subscriber), they are granted `authorized: true`.
- **Why it matters:** Any registered user can execute admin Server Actions—creating, editing, and deleting magazine issues, and reading/deleting user enquiries.
- **Suggested fix:** Validate role claims (e.g. `user.app_metadata?.role === 'admin'`) or verify user identity against a dedicated `admin_users` table before granting authorization.

#### BE-03: Open Redirect & Host Header Injection in Auth Callback Handler
- **Severity:** High
- **File & Line Reference:** [`app/auth/callback/route.ts:17`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/app/auth/callback/route.ts#L17), [`app/auth/callback/route.ts:37-41`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/app/auth/callback/route.ts#L37-L41)
- **What's wrong:** The callback route handler extracts `next` directly from search parameters without sanitization (`searchParams.get("next") ?? "/admin/reset-password"`). It also relies on `request.headers.get("x-forwarded-host")` to construct the redirect URL.
- **Why it matters:** Attackers can craft malicious phishing links (`/auth/callback?code=xyz&next=https://malicious.com` or `?next=//attacker.com`) or manipulate the `X-Forwarded-Host` header to redirect authenticated administrators to an external credential-harvesting page right after password reset or login.
- **Suggested fix:** Restrict `next` to relative paths starting with a single `/` (rejecting `//`) and validate against an explicit whitelist of allowed internal paths (e.g., `["/admin", "/admin/reset-password"]`). Avoid redirecting to unverified `x-forwarded-host` headers.

#### BE-04: Unrestricted File Upload File Size and Type Validation
- **Severity:** Medium
- **File & Line Reference:** [`app/admin/issues/new/action.ts:52-71`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/app/admin/issues/new/action.ts#L52-L71), [`app/admin/issues/manage/actions.ts:243-274`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/app/admin/issues/manage/actions.ts#L243-L274)
- **What's wrong:**
  1. No server-side file size caps are enforced on `coverImage` or `pdfFile` in Server Actions (relying solely on Next.js `bodySizeLimit: 50mb`).
  2. File type validation is based entirely on client-supplied `coverImage.type` and filename extension (`.endsWith(".png")`).
- **Why it matters:** Attackers or buggy uploads can exhaust Supabase Storage quotas or upload disguised executables or HTML files masquerading as images/PDFs.
- **Suggested fix:** Validate byte limits explicitly (e.g. 5MB for covers, 40MB for PDFs) and verify magic byte headers (e.g. `%PDF-` for PDFs, `\x89PNG` for PNG) before uploading to Supabase Storage.

#### BE-05: Unbounded Query Fetching Without Pagination
- **Severity:** Medium
- **File & Line Reference:** [`lib/queries/issue.ts:68-84`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/lib/queries/issue.ts#L68-L84), [`lib/queries/enquiries.ts:19-23`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/lib/queries/enquiries.ts#L19-L23)
- **What's wrong:** `getAllPublishedIssues()` and `getEnquiries()` perform unbounded `select("*")` queries without limit/offset or cursor-based pagination.
- **Why it matters:** As the number of enquiries and publication issues grows, queries consume increasing server memory, slow down page response times, and can lead to server memory exhaustion.
- **Suggested fix:** Implement pagination (`limit` and `range`) across all list endpoints and database query functions.

---

### Layer 3: Database (DB)

#### DB-01: Insecure Supabase RLS Policies Granting Public Update Access
- **Severity:** Critical
- **File & Line Reference:** [`supabase/migrations/20260901_create_analytics_tables.sql:63-69`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/supabase/migrations/20260901_create_analytics_tables.sql#L63-L69), [`supabase/migrations/20260901_create_analytics_tables.sql:96-102`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/supabase/migrations/20260901_create_analytics_tables.sql#L96-L102)
- **What's wrong:** The migration scripts for `issue_analytics` and `analytics_summary` define Row Level Security policies with `FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true)`.
- **Why it matters:** Because `NEXT_PUBLIC_SUPABASE_ANON_KEY` is public by design in the client browser, **any anonymous person on the internet** can send a direct REST `PATCH` request to Supabase and tamper with, corrupt, or zero out readership statistics across all publications.
- **Suggested fix:** Revoke `UPDATE` and `INSERT` privileges for the `anon` role on `issue_analytics` and `analytics_summary`. Only allow updates from authenticated service roles or via security-definer database functions (RPCs).

#### DB-02: Missing Database Migrations for Core Tables (`issues`)
- **Severity:** High
- **File & Line Reference:** [`supabase/migrations/`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/supabase/migrations)
- **What's wrong:** There are migrations for `analytics_tables` and `contact_messages`, but **no migration file exists** for the primary application entity: `public.issues`.
- **Why it matters:** New developer environments, staging pipelines, and disaster recovery setups cannot reproduce the database schema automatically from source control.
- **Suggested fix:** Export the current `issues` schema from Supabase and commit a baseline migration `20260900_create_issues_table.sql` including constraints, defaults, indexes, and RLS policies.

#### DB-03: Lack of Database Transactions on Multi-Table Mutations
- **Severity:** Medium
- **File & Line Reference:** [`lib/analytics.ts:124-208`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/lib/analytics.ts#L124-L208)
- **What's wrong:** `trackAnalyticsEvent` performs 3 separate, uncoordinated database operations: inserting into `analytics_events`, upserting into `issue_analytics`, and upserting into `analytics_summary`.
- **Why it matters:** If the server fails or network blips between step 1 and step 3, aggregated counts become desynchronized from the event log, leading to permanent data inconsistency.
- **Suggested fix:** Encapsulate the event logging and counter increments into a single atomic PostgreSQL stored procedure (RPC) executed within a single transaction.

#### DB-04: Schema Drift Fallbacks in Application Queries
- **Severity:** Low
- **File & Line Reference:** [`app/actions/contact.ts:42-50`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/app/actions/contact.ts#L42-L50), [`lib/queries/enquiries.ts:24-40`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/lib/queries/enquiries.ts#L24-L40)
- **What's wrong:** Code actively catches database error codes `PGRST204` / `42703` ("is_read column not found") and executes fallback retry queries without `is_read`.
- **Why it matters:** Hides database migration debt behind application runtime hacks, increasing cognitive load and executing redundant SQL roundtrips on error.
- **Suggested fix:** Ensure database migration `20260903_add_is_read_to_contact_messages.sql` is applied across all environments, and remove the fallback retry code.

---

### Layer 4: Infrastructure / DevOps / Config (INF)

#### INF-01: Nested Untracked Git Repository in Project Tree
- **Severity:** High
- **File & Line Reference:** [`e-wakku/`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/e-wakku) (`e-wakku/e-wakku/.git`)
- **What's wrong:** An accidental nested clone directory `e-wakku/e-wakku` containing its own `.git`, `.gitignore`, and `README.md` exists within the project directory.
- **Why it matters:** Blocks normal `git add` workflows, risks being tracked as an unintended submodule, confuses git index tracking, and causes file-watcher overhead.
- **Suggested fix:** Remove the nested directory `c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/e-wakku/` after verifying no unique files exist inside it.

#### INF-02: Deprecated Next.js Middleware Convention in Next 16
- **Severity:** Medium
- **File & Line Reference:** [`middleware.ts:16-80`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/middleware.ts#L16-L80)
- **What's wrong:** Next.js 16 emits a deprecation warning: `⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.`
- **Why it matters:** Next.js plans to remove or alter the `middleware` file convention in future major releases, which could break route protection upon upgrade.
- **Suggested fix:** Follow the Next.js migration guide to transition the middleware logic to the recommended routing architecture or proxy convention when stabilizing for production.

#### INF-03: Heavyweight Unused CMS Dependencies in `package.json`
- **Severity:** Medium
- **File & Line Reference:** [`package.json:15-16`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/package.json#L15-L16), [`package.json:24`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/package.json#L24)
- **What's wrong:** `@sanity/client`, `@sanity/image-url`, and `next-sanity` are installed as production dependencies. While `lib/sanity/client.ts` instantiates a client with a fallback dummy project ID, the production data pipeline is powered entirely by Supabase.
- **Why it matters:** Adds over 500 packages and dozens of megabytes to `node_modules`, increases install/CI build times, and expands the attack surface for dependency supply-chain vulnerabilities.
- **Suggested fix:** Migrate the remaining static About Page data from the mock Sanity file into Supabase or local structured JSON, and uninstall the `@sanity/*` and `next-sanity` packages.

#### INF-04: Stray Git Patch File in Project Root
- **Severity:** Low
- **File & Line Reference:** [`tore package-lock.json:1-93`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/tore%20package-lock.json#L1-L93)
- **What's wrong:** A 93-line raw git diff output file named `tore package-lock.json` is sitting uncommitted in the root directory.
- **Why it matters:** Repository clutter that can cause confusion during code reviews or deployment scripts.
- **Suggested fix:** Delete the stray file `tore package-lock.json`.

---

### Layer 5: Code Quality & Testing (CQ)

#### CQ-01: Zero Test Coverage Across Entire Codebase
- **Severity:** High
- **File & Line Reference:** Repository Root (`package.json`)
- **What's wrong:** There are zero unit tests, integration tests, or end-to-end tests in the project (no Jest, Vitest, Playwright, or Cypress configuration).
- **Why it matters:** Critical functionality (such as authentication guards, payment/subscription logic, file deletion, and database transactions) cannot be verified automatically during CI/CD, leading to regressions when updating dependencies or refactoring.
- **Suggested fix:** Introduce Vitest for unit tests (testing Zod schemas, auth helpers, analytics reducers) and Playwright for critical end-to-end flows (admin login, issue publishing, contact form submission).

#### CQ-02: Monolithic "God Component" in `ManageIssuesTable.tsx`
- **Severity:** Medium
- **File & Line Reference:** [`components/magazine/ManageIssuesTable.tsx:1-850`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/components/magazine/ManageIssuesTable.tsx#L1-L850)
- **What's wrong:** A single 850-line file contains the table view, pagination controls, search bar state, edit issue modal, file upload drag-and-drop state, delete confirmation dialog, and draft toggle actions.
- **Why it matters:** Makes bug fixing and code review difficult, causes unnecessary re-renders across unaffected UI sections, and violates single-responsibility principles.
- **Suggested fix:** Break down into modular subcomponents: `<IssuesFilterBar>`, `<IssuesPagination>`, `<EditIssueModal>`, `<DeleteConfirmDialog>`, and `<IssueTableRow>`.

#### CQ-03: Silent Production Fallbacks to Mock Data on DB Errors
- **Severity:** Medium
- **File & Line Reference:** [`lib/queries/issue.ts:43-55`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/lib/queries/issue.ts#L43-L55), [`lib/queries/issue.ts:92-114`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/lib/queries/issue.ts#L92-L114)
- **What's wrong:** If a Supabase database call fails or errors in production, queries in `issue.ts` catch the error, log a console error, and silently return mock placeholder data with fake IDs.
- **Why it matters:** Masking infrastructure failures prevents proper error monitoring (Sentry/Datadog), misleads users into interacting with non-existent data, and breaks analytics when visitors interact with mock items.
- **Suggested fix:** Allow database errors to bubble up to Next.js `error.tsx` boundary or return explicit error states so the UI can display an appropriate degraded state instead of spoofed data.

#### CQ-04: Duplicate Component Implementations (`IssueArchiveGrid` vs `ArchiveIssuesGrid`)
- **Severity:** Low
- **File & Line Reference:** [`components/magazine/IssueArchiveGrid.tsx:1-125`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/components/magazine/IssueArchiveGrid.tsx) and [`components/magazine/ArchiveIssuesGrid.tsx:1-226`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/components/magazine/ArchiveIssuesGrid.tsx)
- **What's wrong:** Two distinct grid components exist with near-identical responsibilities for rendering collections of magazine issues.
- **Why it matters:** Code duplication leads to inconsistent styling and behavioral divergence when features are added to one component but omitted from the other.
- **Suggested fix:** Unify into a single `<IssueGrid>` component that accepts optional filter and pagination configuration props.

#### CQ-05: Dead Unreferenced Components in Codebase
- **Severity:** Low
- **File & Line Reference:** [`components/magazine/FeaturedArchive.tsx`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/components/magazine/FeaturedArchive.tsx), [`components/magazine/ArchiveCard.tsx`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/components/magazine/ArchiveCard.tsx)
- **What's wrong:** `FeaturedArchive.tsx` and `ArchiveCard.tsx` are never imported by any file in the application.
- **Why it matters:** Dead code pollutes the repository, increases cognitive burden for maintainers, and inflates codebase audit size.
- **Suggested fix:** Safely delete `FeaturedArchive.tsx` and `ArchiveCard.tsx`.

---

## 3. Summary Table

| Layer | Critical | High | Medium | Low | Total |
|---|:---:|:---:|:---:|:---:|:---:|
| **Frontend (FE)** | 0 | 1 | 3 | 2 | **6** |
| **Backend (BE)** | 0 | 3 | 2 | 0 | **5** |
| **Database (DB)** | 1 | 1 | 1 | 1 | **4** |
| **Infrastructure / DevOps (INF)** | 0 | 1 | 2 | 1 | **4** |
| **Code Quality & Testing (CQ)** | 0 | 1 | 2 | 2 | **5** |
| **Total** | **1** | **7** | **10** | **6** | **24** |

---

## 4. Top 10 Priority Fixes

1. **[DB-01] Revoke Public Update/Insert Access on Analytics Tables in Supabase RLS**: Anyone with the public anon key can alter global readership numbers. Restrict mutation to service role or database RPC functions.
2. **[BE-02] Implement Role-Based Access Control in `requireAdminAuth`**: Stop treating any authenticated user as an admin. Verify `user.app_metadata.role === 'admin'`.
3. **[BE-03] Fix Open Redirect & Host Header Injection in `/auth/callback`**: Sanitize `next` redirect target to relative whitelist URLs and remove unvalidated `x-forwarded-host` redirection.
4. **[BE-01] Stop Serializing Complete Analytics Summary in `/api/analytics/track`**: Prevent public leaks of private readership analytics to anonymous page visitors.
5. **[INF-01] Remove Nested Untracked `.git` Folder (`e-wakku/e-wakku`)**: Clean up the nested git repository to restore clean git operations.
6. **[DB-02] Commit Baseline Migration for `issues` Table**: Add the core database schema for publications to version control under `supabase/migrations/`.
7. **[CQ-01] Setup Automated Test Harness (Vitest / Playwright)**: Introduce automated testing for Server Actions, authentication verification, and Zod form schemas.
8. **[FE-01] Consolidate Parallel Issue Routes (`/issue/[slug]` vs `/issues/[slug]`)**: Eliminate route bifurcation, unify linking, and prevent SEO duplicate content penalties.
9. **[FE-03] Replace Full PDF Memory Blob Fetch with Direct Streaming**: Prevent mobile browser crashes caused by loading 50MB blobs into JavaScript memory without revoking URLs.
10. **[INF-03] Remove Dead CMS Dependencies (`@sanity/*`)**: Clean up unused dependencies to reduce `node_modules` weight and dependency vulnerability risks.

---

## 5. What's Done Well

- **Strong Zod Validation on Server Actions:** Server Actions (`contact.ts`, `auth.ts`, `new/action.ts`, `manage/actions.ts`) consistently validate inputs server-side with strict Zod schemas rather than trusting client payloads.
- **Robust Supabase Storage Rollback Logic:** In `createIssue` ([`app/admin/issues/new/action.ts:86-107`](file:///c:/Users/Prajosh_prajo/Desktop/e-wakku/e-wakku/app/admin/issues/new/action.ts#L86-L107)), if uploading the PDF or inserting the database row fails, the action proactively rolls back and deletes previously uploaded files from storage to prevent orphaned assets.
- **Design Token Discipline:** Modern Tailwind CSS v4 setup with CSS variables and consistent typography components (`@/src/components/ui/typography`) ensures a unified editorial design system.
- **Comprehensive Server-Side Authentication Verification:** Middleware and server action guards consistently invoke `supabase.auth.getUser()` rather than trusting client-side `getSession()` tokens.
- **Clean Cache Revalidation Strategy:** Mutations consistently trigger `revalidatePath` across affected reader routes (`/`, `/allIssues`, `/admin/issues/manage`), keeping static caches fresh.
