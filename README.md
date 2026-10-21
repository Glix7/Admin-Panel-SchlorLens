# Scholar Lens: Curated Technical Scholarship & Fellowship Intelligence Platform
## Full-Stack Administrative Intelligence Panel (`Admin-Panel-SchlorLens`)

[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-v19.0-61dafb.svg)](https://react.dev/)
[![Express 4](https://img.shields.io/badge/Express-v4.21-lightgrey.svg)](https://expressjs.com/)
[![Tests](https://img.shields.io/badge/Tests-23%20Passed-brightgreen.svg)]()
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 1. Project Overview & Scope

**Scholar Lens Admin Panel** is the dedicated administrative intelligence platform for curated, funded graduate opportunities, grants, master's programmes, and research fellowships in computer science, artificial intelligence, robotics, cybersecurity, embedded systems, and VLSI.

The platform provides an audited, role-governed repository of **112 curated opportunities across 25 host nations**, complete with dynamic deadline tracking, automated data quality scoring, server-side RBAC, soft-delete archiving, and RFC 4180 CSV batch pipelines.

### Two-Screen Architecture
1. **Screen 1: Admin Login (`/`)**
   - Clean administrator authentication interface with custom Scholar Lens vector branding.
   - Email and password inputs with password show/hide toggle.
   - Server-side bcrypt credential verification, uniform credential error response, and IP/email brute-force rate limiting.
   - Strict admin boundary: no public homepage or extraneous third-party login options.
2. **Screen 2: Admin Dashboard**
   - Live KPI overview (Total, Active, Inactive/Archived, Deadlines, Quality Indicators).
   - Opportunity management table supporting the complete 25-attribute schema.
   - Full lifecycle CRUD workflows: Add, View, Edit, Soft-Delete Archive/Restore, and Permanent Delete.
   - Multi-faceted search, filters (country, funding, degree with PhD, provider with NGO, deadlines, active status, eligibility), sorting, and server-side pagination.
   - RFC 4180 CSV batch import (with row-level validation and 2 MB limit) and CSV export (with formula injection guard).
   - Real-time data quality indicators with direct table filter links and server audit logs.
   - Secure logout invalidating the `httpOnly` session cookie and returning to Screen 1.

---

## 2. Technology Stack

* **Frontend:** React 19, TypeScript (strict mode), Vite 8, `react-is`.
* **Styling:** Tailwind CSS v4, Academic Navy (`#081524`), Emerald Green (`#10b981`), Lucide icons.
* **Code Splitting:** Dynamic `React.lazy` and `Suspense` for analytical charts and administrative views.
* **Backend:** Node.js + Express 4 (`server.ts`) mounting Vite middleware in development on port 3000.
* **Authentication & Hardening:** Real backend authentication via signed `httpOnly`, `SameSite=Lax` cookies (`scholar_lens_sid`). Passwords hashed server-side with `bcryptjs`. Cryptographically secure 256-bit session tokens. In-memory brute-force rate limiting (5 attempts / 15 minutes).
* **Security Headers & Limits:** `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-XSS-Protection`, `Referrer-Policy: strict-origin-when-cross-origin`, `Content-Security-Policy`, and explicit 2 MB payload enforcement.
* **Database & Persistence:** File-backed database engine (`src/server/db.ts`) writing to disk (`data/opportunities.json`, `data/users.json`, `data/logs.json`, `data/sessions.json`). All mutations survive full page refreshes and server process restarts.
* **Authorization:** Role-Based Access Control (`admin` and `viewer`). Every read endpoint requires authentication; write/archive/import/reset endpoints enforce admin authority on the server.
* **Testing:** Native Node.js Test Runner (`node:test`, `node:assert/strict`) executed with `tsx`.

---

## 3. Directory Structure

```text
Admin-Panel-SchlorLens/
├── server.ts                            # Full-stack Express server with auth & rate limiting
├── package.json                         # Dependencies (react-is, recharts, express, etc.)
├── tsconfig.json                        # Strict TypeScript configuration
├── vite.config.ts                       # Vite bundler configuration
├── index.html                           # Entry HTML with vector favicon
├── .env.example                         # Environment variable template
├── .gitignore                           # Git ignore rules (node_modules, .env, dist, *.zip, data/users.json)
├── data/
│   ├── opportunities.json               # 112 seed opportunities + 4 test fixtures
│   ├── users.example.json               # Template for user accounts schema
│   ├── users.json                       # Runtime user accounts generated from .env (ignored by Git)
│   ├── logs.json                        # Runtime audit log (ignored by Git)
│   └── sessions.json                    # Active persistent sessions (ignored by Git)
├── docs/
│   ├── ARCHITECTURE.md                  # Request flow, sequence diagrams, and auth matrix
│   ├── VIVA.md                          # Defense pitch & 25 viva questions
│   └── TEST_REPORT.md                   # Automated test execution report
├── public/
│   ├── scholar-lens-logo.svg            # Master vector brand logo
│   └── favicon.svg                      # Browser favicon
├── src/
│   ├── types/
│   │   └── index.ts                     # Schema (including 'ngo' provider and 'phd' degree)
│   ├── lib/
│   │   ├── csvEngine.ts                 # RFC 4180 CSV parser & formula injection guard
│   │   ├── deadline.ts                  # Deadline status & stale verification heuristics
│   │   └── dataQuality.ts               # Field completeness & data health scoring
│   ├── server/
│   │   └── db.ts                        # Storage engine with disk persistence, archive & auth
│   ├── services/
│   │   ├── api.ts                       # Typed client API with archive & confirm payload
│   │   └── mockData.ts                  # 112 curated opportunities + 4 test fixtures
│   ├── context/
│   │   └── AuthContext.tsx              # React session provider and state
│   ├── components/
│   │   ├── common/
│   │   │   └── ScholarLensLogo.tsx      # Vector logo emblem component
│   │   ├── auth/
│   │   │   ├── AnimatedPixelCanvas.tsx  # Dynamic atmospheric canvas
│   │   │   └── LoginForm.tsx            # Screen 1: Minimalist admin login page
│   │   ├── layout/
│   │   │   ├── Header.tsx               # Top navigation & session controls
│   │   │   └── Sidebar.tsx              # Collapsible admin navigation
│   │   ├── dashboard/
│   │   │   ├── DashboardMaster.tsx      # Screen 2: Admin Dashboard Controller with code-splitting
│   │   │   ├── MetricCard.tsx           # KPI scorecards with tabular numerals
│   │   │   └── OpportunitiesCharts.tsx  # Recharts data visualizers (lazy-loaded)
│   │   ├── records/
│   │   │   ├── RecordsTable.tsx         # Opportunity management table with Archive & Delete
│   │   │   ├── RecordDetailDrawer.tsx   # Detailed inspection drawer with Archive action
│   │   │   └── RecordUpsertModal.tsx    # Add / Edit opportunity modal (with NGO & PhD)
│   │   ├── import/
│   │   │   └── CsvImportView.tsx        # Batch CSV ingest with duplicate handling
│   │   ├── quality/
│   │   │   └── DataQualityView.tsx      # Heuristic compliance panel with direct table links
│   │   ├── activity/
│   │   │   └── ActivityLogView.tsx      # Server audit log stream
│   │   ├── settings/
│   │   │   └── AdminSettingsView.tsx    # Admin governance & logo showcase
│   │   └── viva/
│   │       └── VivaPackModal.tsx        # System architecture guide modal
│   ├── App.tsx                          # Two-screen application router
│   ├── main.tsx                         # React 19 root mounting
│   ├── index.css                        # Tailwind v4 import & typography
│   └── tests/
│       ├── unit.test.ts                 # Unit tests (deadlines, CSV, enums, completeness)
│       └── api.test.ts                  # API & DAL integration tests (auth, RBAC, CRUD, archive)
└── README.md                            # Comprehensive manual & setup guide
```

---

## 4. Credentials & Environment Configuration

Credentials and encryption secrets are loaded from environment variables defined in `.env`.

> **SECURITY NOTICE — DEMO ONLY:**  
> The seed credentials below are intended strictly for local development and academic evaluation. **Never** reuse these values in a publicly deployed production environment. In production, provide cryptographically strong credentials and a 32+ character `SESSION_SECRET`.

| Role | Environment Variables | Default Seed Value (Demo Only) | Permissions |
|---|---|---|---|
| **Administrator** | `ADMIN_EMAIL` / `ADMIN_PASSWORD` | `admin@scholarlens.edu` / `AdminPass#2026` | Full Access: CRUD, Archive, CSV Ingest, Seed Reset |
| **Viewer** | `VIEWER_EMAIL` / `VIEWER_PASSWORD` | `viewer@scholarlens.edu` / `ViewerPass#2026` | Read-only analytics, Catalog search, CSV Export |

*Note: On first startup, `data/users.json` is automatically populated from environment variables with salted bcrypt password hashes. `data/users.json` is excluded from version control via `.gitignore`.*

---

## 5. Local Setup & VS Code Development

### Prerequisites
* **Node.js**: Version 18.0.0 or higher (`node -v`)
* **npm**: Version 9.0.0 or higher (`npm -v`)
* **Git**: Installed on your system (`git --version`)

### Step 1: Clone / Open Project
```bash
# Clone the repository
git clone https://github.com/Glix7/Admin-Panel-SchlorLens.git
cd Admin-Panel-SchlorLens

# Open in Visual Studio Code
code .
```

### Step 2: Install Dependencies (Clean Install without `--legacy-peer-deps`)
```bash
npm install
```

### Step 3: Configure Environment
Copy `.env.example` to create your local `.env`:
```bash
cp .env.example .env
```
Ensure `SESSION_SECRET` is set to a secure string (at least 32 characters in production).

### Step 4: Verification Suite
```bash
# 1. TypeScript Strict Type-Check
npx tsc --noEmit

# 2. Automated Test Suite (23 Tests across 4 suites)
npm test

# 3. Production Bundle Build (Vite 8)
npx vite build
```

### Step 5: Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 6. Production Build & Deployment

```bash
# 1. Compile client production bundle
npm run build

# 2. Start production server (Strictly requires SESSION_SECRET >= 32 chars)
NODE_ENV=production SESSION_SECRET="your_secure_32_character_minimum_secret_key_here" npm start
```

If `SESSION_SECRET` is missing or shorter than 32 characters when `NODE_ENV=production`, the server will refuse to start and terminate with exit code 1.

---

## 7. License

MIT License. Designed and developed as a B.Tech Final-Year Capstone Project.
