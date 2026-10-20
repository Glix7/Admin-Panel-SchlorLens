# Scholar Lens: B.Tech Final-Year Viva Voce Examination Guide

---

## 1. Two-Minute Elevator Pitch
"Good morning, respected examiners. Our capstone project is **Scholar Lens**, a full-stack, role-governed intelligence and asset management platform for funded technical Master’s and Master’s-or-PhD opportunities targeting **Indian STEM graduates**.

Indian students seeking funded international education in computer science, AI/ML, robotics, VLSI, and cybersecurity face immense information asymmetry: existing portals are cluttered with unverified links, expired deadlines, and domestic-only awards. 

Scholar Lens solves this through a curated, audited repository of **112 opportunities across 25 host nations**. Built with React 19, TypeScript, and an Express 4 application gateway, it implements **server-side Role-Based Access Control (RBAC)**, real **bcrypt password hashing**, **httpOnly SameSite cookie sessions**, dynamic **temporal deadline evaluation**, and an **RFC 4180 CSV pipeline** equipped with protection against formula injection attacks. 

Scholar Lens is not a visual mock-up; it is a tested, production-grade admin platform built to institutional software engineering standards."

---

## 2. Technical Architecture Walkthrough (For Presentation Slide / Whiteboard)

```
[React 19 SPA + Tailwind CSS v4 + Lucide + Recharts]
                        │
                        ▼ (HTTP + httpOnly Cookie)
[Express 4 Gateway on Port 3000 (server.ts)]
   ├── CORS & Security Headers (nosniff, SAMEORIGIN)
   ├── Cookie Parser (Signed 'scholar_lens_sid')
   ├── Auth & Session Middleware
   ├── RBAC Route Guard: Admin vs Viewer Enforcement
   ├── Zod Schema Validator
   └── RFC 4180 CSV Streaming Engine with Formula Sanitizer
                        │
                        ▼ (Atomic File-Backed Persistence)
[Data Persistence Engine: data/]
   ├── opportunities.json (112 Curated Seeds + 4 Test Fixtures)
   ├── users.json (Bcrypt Salted Hashes for Admin & Viewer)
   └── logs.json (Immutable Activity Audit Log)
```

---

## 3. Top 25 Viva Voce Questions & Model Answers

### Category 1: Architecture & System Design
#### Q1: What problem does Scholar Lens solve, and who are its primary users?
**Answer:** Scholar Lens solves the fragmentation, staleness, and verification gaps in funded graduate scholarships for Indian technical students. Its primary users are Academic Curators/Admins (who curate, import, verify, and audit records) and prospective Graduate Applicants (who search, filter, and track verified opportunities).

#### Q2: How does the server handle dev and production runtime environments?
**Answer:** In development, `server.ts` mounts Vite in middleware mode (`vite.middlewares`), providing zero-latency Hot Module Replacement (HMR) and serving `/api/*` endpoints on a single port (3000). In production, it serves precompiled static assets from `dist/` with fallback to `index.html`.

#### Q3: Why is the Data Access Layer decoupled from presentation components?
**Answer:** Decoupling ensures that UI components remain agnostic of storage mechanisms. The client API layer (`src/services/api.ts`) interacts with REST endpoints, while the backend engine (`src/server/db.ts`) abstracts disk operations. This enables swapping the storage engine (e.g., from file-backed JSON to PostgreSQL or SQLite) without modifying UI components.

### Category 2: Security & Authentication
#### Q4: What is the technical difference between Authentication and Authorization?
**Answer:** Authentication validates user identity (who you are) using email and salted bcrypt password comparison. Authorization determines permissions (what you are allowed to do) based on assigned roles (`admin` vs `viewer`). All write operations in Scholar Lens enforce the `admin` role on the server.

#### Q5: Why are passwords hashed with bcrypt on the server rather than on the client?
**Answer:** Hashing on the client means the hash itself becomes the effective password, leaving the system vulnerable to replay attacks. Performing salted bcrypt hashing on the server ensures plaintext passwords never enter the database or network logs, while bcrypt's salt rounds (work factor = 10) mitigate brute-force and dictionary attacks.

#### Q6: Why did you use httpOnly SameSite cookies instead of localStorage JWTs?
**Answer:** Tokens in `localStorage` can be read by any JavaScript running in the same origin, making them vulnerable to Cross-Site Scripting (XSS). `httpOnly` cookies cannot be accessed via JavaScript APIs, preventing token theft. Furthermore, `SameSite=Lax` mitigates Cross-Site Request Forgery (CSRF).

#### Q7: Why are third-party social logins (Google, Microsoft, Apple) disabled rather than mocked with fake success?
**Answer:** Mocking social login success without real cryptographic token exchange is insecure and misleads evaluators. Scholar Lens displays an explicit "Provider Not Configured" dialog explaining the required OAuth client credentials.

### Category 3: Data Quality & Temporal Heuristics
#### Q8: Why is the application deadline status calculated dynamically rather than stored as a static field?
**Answer:** Deadlines are temporal. If stored as a static string ("Open"), records will silently expire without background worker jobs constantly mutating records. Scholar Lens computes the status at query time (`open`, `closing` within 30 days, `expired`, `none`), guaranteeing 100% accuracy on every read without database overhead.

#### Q9: What are the 5 known data-quality issues identified in the seed dataset?
**Answer:**
1. All 112 `official_url` entries are `example.com` placeholders; surfaced with an "Unverified Link" badge.
2. 11 records have `application_deadline = null`; categorized under "Rolling/No Deadline".
3. 3 records have expired deadlines; dynamically categorized as "Expired".
4. `indian_applicants_eligible` and `is_active` are true in all 112 seeds; 4 labeled test fixtures (`test-fixture-001` to `004`) with false values were added to test negative filters.
5. `verified_on` goes stale after 90 days; audited in the Data Quality panel.

#### Q10: How does the system calculate the Field Completeness score?
**Answer:** In `src/lib/dataQuality.ts`, the completeness score checks for the presence and non-emptiness of 21 key attributes (title, provider, country, funding type, fields of study, deadline, official URL, etc.) and returns a percentage score (0–100%).

### Category 4: Data Management & CSV Processing
#### Q11: What is CSV Formula Injection (Formula Infiltration) and how do you prevent it?
**Answer:** When spreadsheet software (Excel, Google Sheets) opens a CSV, cells beginning with `=`, `+`, `-`, or `@` are interpreted as executable formulas (e.g., `=DDE("cmd";"/C calc";"__dummy__")`). Scholar Lens sanitizes every exported cell in `src/lib/csvEngine.ts` by prefixing dangerous characters with a single quote (`'`), ensuring spreadsheet software parses them as literal text.

#### Q12: How does the CSV import pipeline validate rows?
**Answer:** The parser verifies mandatory headers (`id`, `title`, `provider_name`, `host_country`, `degree_level`, `funding_type`, `official_url`). It enforces enum constraints, detects duplicate IDs, and isolates invalid rows with line numbers and reasons, reporting partial or total import summaries.

#### Q13: What happens when an uploaded record ID already exists in the database?
**Answer:** The user selects a duplicate handling policy: `skip` (preserves the existing database record) or `overwrite` (replaces existing attributes with imported values and refreshes the `updated_at` timestamp).

### Category 5: Backend & Testing
#### Q14: How is server-side pagination and filtering implemented?
**Answer:** In `src/server/db.ts`, `listRecords()` filters records by search text, country, funding, degree, deadline status, eligibility, and active state, applies the requested sort order, and slices the array based on `(page - 1) * pageSize`. Only the paginated slice and total record count are sent over the network.

#### Q15: How does the server enforce authorization on write endpoints?
**Answer:** An Express middleware (`requireAdmin`) inspects `req.user?.role`. If the user is unauthenticated, it returns `401 Unauthorized`. If the user has the `viewer` role, it halts execution and returns `403 Forbidden`.

#### Q16: How are activity logs managed and protected from tampering?
**Answer:** Logs are written exclusively by server logic to `data/logs.json` upon successful authentication or mutation events. Clients have read-only access via `/api/activity` and cannot forge log entries.

#### Q17: What automated tests were implemented and run?
**Answer:** 20 automated tests across 4 test suites:
* 6 unit tests for deadline status and stale verification heuristics.
* 5 unit tests for RFC 4180 CSV parsing, exporting, and formula injection sanitization.
* 1 unit test for completeness score calculation.
* 8 integration tests for authentication, role enforcement (401/403), CRUD lifecycle, pagination, and negative filter fixtures.

#### Q18: What were the exact test results?
**Answer:** All 20 tests passed with 0 failures, verified via `node --import tsx --test src/tests/unit.test.ts src/tests/api.test.ts`.

### Category 6: Software Engineering & Best Practices
#### Q19: Why validate data on both frontend and backend?
**Answer:** Client-side validation gives immediate feedback to users and prevents wasted network requests. Server-side validation is mandatory because API endpoints can be accessed directly (via curl, Postman, or custom scripts), bypassing client forms.

#### Q20: How is the admin account bootstrapped without hardcoded secrets?
**Answer:** The server reads initial credentials from environment variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) with development defaults. Passwords are encrypted with salted bcrypt hashing prior to disk storage.

#### Q21: What is the difference between SQL and NoSQL for this use case?
**Answer:** SQL enforces relational constraints and ACID transactions, which is ideal for complex institutional joins. Document-based or JSON stores provide flexible schema evolution for varied opportunity attributes. Scholar Lens uses an atomic file-backed JSON store with typed TypeScript interfaces, balancing structure with zero-config deployment.

#### Q22: How does the UI comply with accessibility (WCAG AA) standards?
**Answer:** It ensures color contrast ratios exceeding 4.5:1, visible keyboard focus indicators (`focus-visible`), touch targets of at least 40px, and reduced-motion detection (`prefers-reduced-motion`) to disable canvas animations.

#### Q23: Why did you eliminate pill badges for static metadata?
**Answer:** Wrapping every static label (tags, dates, counts) in rounded colored pill badges creates visual clutter ("AI slop"). Metadata is rendered as clean unboxed text with typographic separators (`·`), reserving badge styling strictly for interactive controls and critical status alerts.

#### Q24: What are the primary technical limitations of the current implementation?
**Answer:** Single-node file-backed persistence limits write concurrency under heavy distributed traffic, and email delivery requires an external SMTP gateway.

#### Q25: What future enhancements would you propose?
**Answer:** 1) Automated web scraping with headless browsers to refresh placeholder URLs. 2) Vector embeddings for semantic applicant-scholarship profile matching. 3) Migration to PostgreSQL with Prisma ORM for distributed production deployments.
