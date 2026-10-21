import React, { useState } from 'react';
import { X, BookOpen, Award, Database, Search, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const VIVA_QUESTIONS = [
  {
    category: 'Architecture & System Design',
    q: 'Q1: What is the core purpose of Scholar Lens and who are its primary stakeholders?',
    a: 'Scholar Lens is a curated intelligence and management platform for funded technical Master\'s and PhD scholarships, fellowships, and bursaries targeting Indian applicants in CS, AI/ML, robotics, embedded systems, VLSI, and cybersecurity. Primary stakeholders are Academic Administrators (who curate, verify, import, and audit records) and Graduate Applicants/Matching Engines (who consume verified, deadline-active funding opportunities).',
  },
  {
    category: 'Architecture & System Design',
    q: 'Q2: Explain the end-to-end request lifecycle and system architecture.',
    a: 'The application runs as a unified full-stack system. The React 19 SPA communicates over HTTP with an Express 4 backend running on port 3000. In development, Express mounts Vite middlewares directly for zero-latency HMR. In production, it serves precompiled static assets. State persistence is handled through an atomic, mutex-guarded file-backed database (data/opportunities.json, data/users.json, data/logs.json), maintaining data integrity across process restarts.',
  },
  {
    category: 'Security & Authentication',
    q: 'Q3: What is the difference between Authentication and Authorization in Scholar Lens?',
    a: 'Authentication verifies *who* the user is (validating email and password against server-stored bcrypt hashes). Authorization determines *what* an authenticated user is permitted to do. Scholar Lens enforces two roles: Admin (unrestricted CRUD, batch CSV ingestion, dataset reset) and Viewer (read-only access). Every mutating endpoint (/api/records POST/PUT/DELETE, /api/records/import, /api/admin/reset-seed) strictly verifies the Admin role on the server, returning 401 Unauthorized or 403 Forbidden.',
  },
  {
    category: 'Security & Authentication',
    q: 'Q4: Why are passwords hashed with bcrypt on the server rather than the client?',
    a: 'Hashing on the client exposes the system to replay attacks if an attacker intercepts the hash, which would act as the de-facto password. Hashing on the server ensures plaintext passwords never enter database logs or persistent storage. Bcrypt incorporates a work factor (salt rounds = 10) and salting to defeat precomputed rainbow table attacks and slow down brute-force cracking attempts.',
  },
  {
    category: 'Security & Authentication',
    q: 'Q5: Why did you choose httpOnly SameSite cookies over local-storage JWTs?',
    a: 'Storing JWTs in browser localStorage or sessionStorage leaves them vulnerable to Cross-Site Scripting (XSS) attacks; any injected malicious script can read window.localStorage. In contrast, httpOnly cookies are inaccessible to JavaScript APIs, eliminating client-side token exfiltration. Additionally, SameSite=Lax prevents Cross-Site Request Forgery (CSRF) on cross-origin requests.',
  },
  {
    category: 'Security & Authentication',
    q: 'Q6: Why are social and phone logins disabled rather than simulated with fake success?',
    a: 'In accordance with secure engineering principles, simulating a successful social login without an actual OAuth/OIDC handshake is a critical security vulnerability and misleads evaluators. Scholar Lens surfaces a visible "Not Configured" modal detailing the required OAuth client IDs and secrets instead of faking authentication.',
  },
  {
    category: 'Data Management & CSV',
    q: 'Q7: What is CSV Formula Injection (Formula Infiltration) and how does Scholar Lens prevent it?',
    a: 'When an exported CSV is opened in spreadsheet programs like Microsoft Excel, LibreOffice, or Google Sheets, cells beginning with =, +, -, @, or tab characters are executed as executable formulas (e.g., =CMD|` /C calc`!A0). Scholar Lens guards against this in src/lib/csvEngine.ts by sanitizing every cell: any string starting with formula operators is automatically prefixed with a single quote (\'), forcing the spreadsheet engine to treat it strictly as literal text.',
  },
  {
    category: 'Data Management & CSV',
    q: 'Q8: How does the CSV import pipeline handle malformed rows and partial batches?',
    a: 'The pipeline parses files according to RFC 4180 standards. It first checks for mandatory headers (id, title, provider_name, host_country, degree_level, funding_type, official_url). During row scanning, errors (invalid enums, missing titles, duplicate IDs) are isolated with precise line numbers and reasons. Admins can configure duplicate resolution (skip vs overwrite). Valid records are committed atomically to the store.',
  },
  {
    category: 'Data Management & CSV',
    q: 'Q9: Why is the Application Deadline status computed dynamically rather than stored statically?',
    a: 'Application deadlines are temporal data. Storing a static status string (such as "Open" or "Expired") guarantees that records become stale without active cron jobs modifying database records. Computing the deadline status dynamically at query time against today\'s date (open >30d, closing <=30d, expired <0d, none) ensures 100% temporal accuracy on every query without database write locks.',
  },
  {
    category: 'Data Management & CSV',
    q: 'Q10: What are the 5 known data-quality issues in the seed data and how are they addressed?',
    a: '1) All 112 official_url values are example.com placeholders; flagged in UI with an "Unverified Link" badge. 2) 11 records have application_deadline = null; categorized under "Rolling/No Deadline". 3) 3 records have expired deadlines; dynamically flagged as "Expired". 4) indian_applicants_eligible and is_active are true across all 112 seed records; 4 labeled test fixtures with false values are injected to test negative filters. 5) verified_on can go stale; audited if older than 90 days.',
  },
  {
    category: 'Backend & Database',
    q: 'Q11: Why use an atomic file-backed JSON store instead of SQLite or PostgreSQL for this prototype?',
    a: 'For institutional demonstration and portable application environments, external DBMS instances (like PostgreSQL or MySQL) introduce external runtime dependencies, container orchestration overhead, and connection credential fragility. A file-backed store with mutex write guards and JSON serialization provides 100% native portability, zero-configuration setup, instant inspection, and full ACID-like single-process atomicity.',
  },
  {
    category: 'Backend & Database',
    q: 'Q12: How is server-side pagination and sorting implemented?',
    a: 'Loading thousands of records into the browser degrades client memory and network performance. Scholar Lens implements server-side pagination in src/server/db.ts: listRecords() applies text search, multi-field filters, and sorts records before slicing the array with (page - 1) * pageSize. Only the requested page slice is serialized over the network, along with total record counts.',
  },
  {
    category: 'Backend & Database',
    q: 'Q13: How does the system prevent non-administrators from tampering with records?',
    a: 'The Express server implements a requireAdmin middleware. Every write endpoint checks req.user?.role === "admin". If an unauthenticated user attempts a write, it returns 401. If a Viewer attempts a write, it immediately halts execution and returns 403 Forbidden with a clear security rejection payload.',
  },
  {
    category: 'Backend & Database',
    q: 'Q14: Explain the role and design of the server Activity Audit Trail.',
    a: 'The activity log (src/server/db.ts) records every authentication event (LOGIN, LOGOUT, FAILED_LOGIN) and every state mutation (CREATE, UPDATE, DELETE, IMPORT, RESET). When records are updated, the exact changed field names are logged. Because logs are written exclusively by server logic and stored in data/logs.json, they cannot be forged from the client.',
  },
  {
    category: 'Frontend & UI/UX',
    q: 'Q15: How does the interface respect accessibility (WCAG AA) and motion sensitivity?',
    a: 'The animated canvas in src/components/auth/AnimatedPixelCanvas.tsx listens to the window.matchMedia("(prefers-reduced-motion: reduce)") media query. When reduced motion is preferred, continuous frame animation is disabled and a static decorative frame is rendered. All interactive elements feature visible focus rings (focus-visible), high-contrast typography, and accessible keyboard navigation.',
  },
  {
    category: 'Frontend & UI/UX',
    q: 'Q16: Why did you eliminate pill badges for static metadata in the UI?',
    a: 'Following the Universal Frontend Design Constitution, wrapping every static metadata point (tags, dates, categories) in candy-colored pill badges creates visual clutter ("AI slop") and decreases text readability. Scholar Lens renders metadata as clean, unboxed text separated by subtle typographic dividers (·), reserving pill styling strictly for functional, interactive filter controls and critical status alerts.',
  },
  {
    category: 'Frontend & UI/UX',
    q: 'Q17: How are the dashboard analytics charts populated?',
    a: 'All dashboard metrics and Recharts graphs (Timeline AreaChart, Country BarChart, Funding Type PieChart) are computed in real-time by the backend in getStats(). No chart uses static or hardcoded mockup data. Creating, editing, or importing opportunities immediately reflects across dashboard counts upon refresh.',
  },
  {
    category: 'Testing & Quality Assurance',
    q: 'Q18: What is your automated testing strategy across the application?',
    a: 'Scholar Lens employs a multi-tier test pyramid: 1) Unit Tests for critical algorithmic functions (deadline calculation, CSV formula sanitization, data completeness scoring). 2) API Integration Tests verifying HTTP response codes, authentication rejections, role enforcement (401/403), pagination limits, and duplicate handling. 3) Compile & Lint verification using strict TypeScript (tsc --noEmit) and Vite production bundling.',
  },
  {
    category: 'Testing & Quality Assurance',
    q: 'Q19: How do you verify that non-eligible and inactive filters work if all 112 seed items are true?',
    a: 'Section 0 noted that all 112 seed items have indian_applicants_eligible: true and is_active: true. To ensure filters for these attributes can be tested reliably, the system includes 4 designated test fixtures (test-fixture-001 through test-fixture-004) carrying false values for both attributes.',
  },
  {
    category: 'Testing & Quality Assurance',
    q: 'Q20: What happens if an uploaded CSV file contains duplicate record IDs?',
    a: 'The parser flags duplicate IDs within the upload batch itself and reports them in the validation summary. For IDs that match existing records in the database, the user selects a resolution policy: "Skip Duplicates" (preserves existing database records) or "Overwrite" (updates existing records with imported fields and refreshes the updated_at timestamp).',
  },
  {
    category: 'Software Engineering Best Practices',
    q: 'Q21: Why do both frontend and backend need data validation?',
    a: 'Client-side validation provides immediate, responsive feedback to users, preventing unnecessary network roundtrips for trivial mistakes like empty fields. However, client-side validation can be bypassed by directly calling API endpoints using tools like curl or Postman. Server-side validation is the true authoritative defense that guarantees database integrity.',
  },
  {
    category: 'Software Engineering Best Practices',
    q: 'Q22: How is the admin user account bootstrapped without hardcoding credentials?',
    a: 'The server initializes default user accounts from environment variables (ADMIN_EMAIL, ADMIN_PASSWORD, VIEWER_EMAIL, VIEWER_PASSWORD) defined in .env.example. If missing, sensible fallback development credentials are used, but their passwords are encrypted through bcrypt salt hashing prior to storage.',
  },
  {
    category: 'Software Engineering Best Practices',
    q: 'Q23: What are the main limitations of the current Scholar Lens platform?',
    a: '1) Single-server file-backed storage limits scale to tens of thousands of records rather than millions. 2) Email verification and password reset require external SMTP server credentials. 3) Federated OAuth (Google, Microsoft, Apple) is disabled until institutional client IDs are provided.',
  },
  {
    category: 'Software Engineering Best Practices',
    q: 'Q24: What are future architectural enhancements planned for Scholar Lens?',
    a: 'Future iterations will integrate: 1) Automated web-scraping agents to periodically crawl university portals and replace placeholder URLs with verified links. 2) Vector embeddings on fields_of_study and eligibility_summary for AI-powered applicant profile matching. 3) Migration to PostgreSQL with Prisma ORM for multi-region clustering.',
  },
  {
    category: 'Software Engineering Best Practices',
    q: 'Q25: Summarize Scholar Lens in a 2-minute elevator pitch for the examination board.',
    a: 'Scholar Lens is a specialized academic technology SaaS that bridges the information asymmetry faced by Indian STEM graduates seeking funded global education. Unlike generic scholarship portals that list unverified, expired, or domestic-only grants, Scholar Lens provides an audited, role-governed database of 112 technical Master\'s and PhD opportunities across 25 host nations. With dynamic deadline tracking, RFC 4180 CSV batch processing, server-side RBAC, and automated data-quality scoring, Scholar Lens delivers a secure, production-grade platform built to institutional standards.',
  },
];

export const VivaPackModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  if (!isOpen) return null;

  const categories = ['All', 'Architecture & System Design', 'Security & Authentication', 'Data Management & CSV', 'Backend & Database', 'Frontend & UI/UX', 'Testing & Quality Assurance', 'Software Engineering Best Practices'];

  const filtered = VIVA_QUESTIONS.filter(q => {
    const matchesCat = selectedCategory === 'All' || q.category === selectedCategory;
    const matchesSearch =
      q.q.toLowerCase().includes(search.toLowerCase()) ||
      q.a.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100 max-h-[92vh] overflow-y-auto space-y-6 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#12805c]/20 border border-[#12805c]/40 text-[#1ec992]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-serif">
                Scholar Lens Architecture & Technical Defense Pack
              </h2>
              <p className="text-xs text-slate-400">
                Technical Architecture, System Design & Model Evaluation Answers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Minute Elevator Summary */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-[#1ec992] uppercase tracking-wider block font-serif">
            2-Minute Project Pitch & Architectural Defense
          </span>
          <p className="text-xs text-slate-300 leading-relaxed">
            Scholar Lens centralizes funded technical scholarships for Indian graduate candidates across 25 nations. Powered by an Express 4 backend with atomic persistence and React 19 frontend, the platform features real session authentication, server-enforced role access control, dynamic deadline evaluation, and RFC 4180 CSV batch processing with formula-injection sanitization.
          </p>
        </div>

        {/* Search & Category Tabs */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search through 25 viva questions and model answers..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg outline-none focus:border-[#12805c]"
              />
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Showing {filtered.length} of {VIVA_QUESTIONS.length} Questions
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition text-[11px] font-medium border ${
                  selectedCategory === c
                    ? 'bg-[#12805c] text-white border-[#12805c]'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Accordion Questions */}
        <div className="space-y-2">
          {filtered.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className="border border-slate-800 rounded-lg bg-slate-950 overflow-hidden">
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-3.5 text-left text-xs font-semibold text-slate-200 hover:text-[#1ec992] flex items-center justify-between transition gap-2"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 font-mono block uppercase">{item.category}</span>
                    <span>{item.q}</span>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 shrink-0 text-slate-400" /> : <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />}
                </button>
                {isOpen && (
                  <div className="p-3.5 pt-0 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 bg-slate-900/30">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="min-h-[44px] px-5 py-2.5 bg-[#12805c] hover:bg-[#0f6b4d] text-white rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            Close Viva Defense Pack
          </button>
        </div>
      </div>
    </div>
  );
};
