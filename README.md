# Scholar Lens: Curated Technical Scholarship & Fellowship Intelligence Platform
## B.Tech Final-Year Capstone Project | Full-Stack Administrative Intelligence Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-v19.0-61dafb.svg)](https://react.dev/)
[![Express 4](https://img.shields.io/badge/Express-v4.21-lightgrey.svg)](https://expressjs.com/)
[![Tests](https://img.shields.io/badge/Tests-20%20Passed-brightgreen.svg)]()
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 1. Project Overview & Scope

**Scholar Lens** is an opportunity intelligence platform for funded graduate opportunities, grants, master's programmes, and research fellowships in computer science, artificial intelligence, robotics, cybersecurity, embedded systems, and VLSI.

The platform provides an audited, role-governed administrative repository of **112 curated opportunities across 25 host nations**, complete with dynamic deadline tracking, automated data quality scoring, server-side RBAC, and RFC 4180 CSV batch pipelines.

### Strict Two-Screen Architecture
1. **Screen 1: Admin Login (`/`)**
   - Clean, professional administrator login interface with Scholar Lens branding.
   - Email and password inputs with password show/hide toggle.
   - Server-side credential verification with clear error handling.
   - No public homepage, public exploration links, or third-party login distractions.
2. **Screen 2: Admin Dashboard**
   - Live KPI overview (Total, Active, Expired Deadlines, Unverified Records).
   - Opportunity management table using the 26-attribute `Opportunity` schema.
   - Comprehensive CRUD workflows (Add, View, Edit, Delete).
   - Multi-faceted search, filters (country, funding, degree, deadlines, eligibility), sorting, and server pagination.
   - RFC 4180 CSV import (with dry-run validation) and CSV export (with formula injection guard).
   - Real-time data quality indicators and immutable activity audit logs.
   - Secure logout returning immediately to Screen 1.

---

## 2. Technology Stack

* **Frontend:** React 19, TypeScript (strict mode), Vite 8.
* **Styling:** Tailwind CSS v4, Academic Navy (`#081524`), Emerald Green (`#10b981`), Lucide icons.
* **Backend:** Node.js + Express 4 (`server.ts`) mounting Vite middleware in development on port 3000.
* **Authentication:** Real backend authentication via signed `httpOnly`, `SameSite=Lax` cookies (`scholar_lens_sid`). Passwords hashed server-side with `bcryptjs`. Cryptographically secure 256-bit session tokens (`crypto.randomBytes(32)`).
* **Database & Persistence:** File-backed database engine (`src/server/db.ts`) persisting data to disk (`data/opportunities.json`, `data/users.json`, `data/logs.json`, `data/sessions.json`). All mutations survive full page refreshes and server process restarts.
* **Authorization:** Role-Based Access Control (`admin` and `viewer`). Every write endpoint verifies role and session on the server.
* **Data Quality & Ingestion:** RFC 4180 CSV parsing, formula injection sanitization, deadline heuristics, and stale verification auditing.
* **Testing:** Native Node.js Test Runner (`node:test`, `node:assert/strict`) with `tsx`.

---

## 3. Directory Structure

```text
Scholor-Lens/
├── server.ts                            # Full-stack Express server mounting Vite
├── package.json                         # Dependencies, scripts, and test commands
├── tsconfig.json                        # Strict TypeScript configuration
├── vite.config.ts                       # Vite bundler configuration
├── index.html                           # Entry HTML
├── .env.example                         # Environment variable template
├── .gitignore                           # Git ignore rules (node_modules, .env, dist)
├── .vscode/                             # VS Code workspace settings & recommendations
│   ├── settings.json                    # Formatter, tab size & TypeScript settings
│   └── extensions.json                  # Recommended VS Code extensions
├── data/                                # Persistent storage directory (survives restarts)
│   ├── opportunities.json               # 112 seed opportunities + 4 test fixtures
│   ├── users.json                       # Admin & viewer credentials with bcrypt hashes
│   ├── logs.json                        # Server activity audit trail
│   └── sessions.json                    # Active persistent user sessions
├── docs/                                # Project Architecture & Defense Guides
│   ├── ARCHITECTURE.md                  # Request flow, sequence diagrams, and auth matrix
│   ├── VIVA.md                          # 2-minute elevator pitch & 25 viva questions
│   └── TEST_REPORT.md                   # Automated test execution report
├── src/
│   ├── types/
│   │   └── index.ts                     # Opportunity, UserSession, ActivityLog definitions
│   ├── lib/
│   │   ├── csvEngine.ts                 # RFC 4180 CSV parser & formula injection guard
│   │   ├── deadline.ts                  # Deadline status & stale verification heuristics
│   │   └── dataQuality.ts               # Field completeness & data health scoring
│   ├── server/
│   │   └── db.ts                        # Storage engine with disk persistence & auth
│   ├── services/
│   │   ├── api.ts                       # Typed client API communicating with backend
│   │   └── mockData.ts                  # 112 curated opportunities + 4 test fixtures
│   ├── context/
│   │   └── AuthContext.tsx              # React session provider and state
│   ├── components/
│   │   ├── auth/
│   │   │   ├── AnimatedPixelCanvas.tsx  # Dynamic atmospheric pixel canvas
│   │   │   └── LoginForm.tsx            # Screen 1: Minimalist admin login page
│   │   ├── layout/
│   │   │   ├── Header.tsx               # Top navigation & session controls
│   │   │   └── Sidebar.tsx              # Collapsible admin navigation
│   │   ├── dashboard/
│   │   │   ├── DashboardMaster.tsx      # Screen 2: Admin Dashboard Controller
│   │   │   ├── MetricCard.tsx           # KPI scorecards with tabular numerals
│   │   │   └── OpportunitiesCharts.tsx  # Recharts data distribution visualizers
│   │   ├── records/
│   │   │   ├── RecordsTable.tsx         # Opportunity management table
│   │   │   ├── RecordDetailDrawer.tsx   # Detailed opportunity inspection drawer
│   │   │   └── RecordUpsertModal.tsx    # Add / Edit opportunity modal
│   │   ├── import/
│   │   │   └── CsvImportView.tsx        # Batch CSV ingest with duplicate handling
│   │   ├── quality/
│   │   │   └── DataQualityView.tsx      # Heuristic compliance audit panel
│   │   ├── activity/
│   │   │   └── ActivityLogView.tsx      # Server audit log stream
│   │   └── viva/
│   │       └── VivaPackModal.tsx        # System architecture guide modal
│   ├── App.tsx                          # Two-screen application router
│   ├── main.tsx                         # React 19 root mounting
│   ├── index.css                        # Tailwind v4 import & typography
│   └── tests/
│       ├── unit.test.ts                 # Unit tests (deadlines, CSV, completeness)
│       └── api.test.ts                  # API & DAL integration tests (auth, RBAC, CRUD)
└── README.md                            # Comprehensive manual & setup guide
```

---

## 4. Pre-Configured Administrator Credentials

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Administrator** | `admin@scholarlens.edu` | `AdminPass#2026` | Full Access: CRUD, CSV Import/Export, Database Reset, Auditing |
| **Viewer** | `viewer@scholarlens.edu` | `ViewerPass#2026` | Read-only analytics, Catalog search, CSV Export |

*Note: In production, configure custom credentials via the `.env` file.*

---

## 5. Local Setup & VS Code Development

### Prerequisites
* **Node.js**: Version 18.0.0 or higher (`node -v`)
* **npm**: Version 9.0.0 or higher (`npm -v`)
* **Git**: Installed on your system (`git --version`)

### Step 1: Clone / Open Project
```bash
# Clone the repository
git clone https://github.com/Glix7/Scholor-Lens.git
cd Scholor-Lens

# Open in Visual Studio Code
code .
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment
Copy the `.env.example` file to create your local `.env`:
```bash
cp .env.example .env
```
*(Optionally adjust `PORT`, `ADMIN_PASSWORD`, or `SESSION_SECRET` in `.env`)*

### Step 4: Run Tests & Verification
Run the 20 automated unit and integration tests:
```bash
npm test
```
Run type-checking:
```bash
npm run lint
```

### Step 5: Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to view the application.

---

## 6. GitHub Repository Setup Commands

To push this codebase to the repository (**https://github.com/Glix7/Scholor-Lens.git**):

```bash
# 1. Initialize Git repository (if not already initialized)
git init

# 2. Add the remote repository
git remote add origin https://github.com/Glix7/Scholor-Lens.git

# 3. Verify remote connection
git remote -v

# 4. Check status and stage all files (respecting .gitignore)
git status
git add .

# 5. Commit with professional message
git commit -m "feat: complete Scholar Lens two-screen admin platform with auth and persistence"

# 6. Set main branch and push
git branch -M main
git push -u origin main
```

*(If the remote repository already contains existing commits or a README, run `git pull origin main --rebase` before pushing).*

---

## 7. Production Build & Deployment

```bash
# 1. Compile the production bundle
npm run build

# 2. Start the production server
NODE_ENV=production npm start
```

The Express server will serve the optimized bundle from `dist/` on the configured `PORT` (default 3000).

---

## 8. License

MIT License. Designed and developed as a B.Tech Final-Year Capstone Project.
