import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { db } from './src/server/db';
import { parseOpportunitiesCSV, exportOpportunitiesToCSV } from './src/lib/csvEngine';
import { UserSession, DataFilterOptions } from './src/types';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

// ==============================================================================
// 1. Session Secret Validation & Ephemeral Development Secret
// ==============================================================================
let sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret || sessionSecret.length < 32) {
  sessionSecret = crypto.randomBytes(32).toString('hex');
  if (isProd) {
    console.warn('[SECURITY] No valid SESSION_SECRET provided in production environment (minimum 32 characters required). Generated secure 256-bit ephemeral secret to maintain instance availability.');
  } else {
    console.warn('[WARN] No SESSION_SECRET configured in development. Generated ephemeral per-process session secret.');
  }
}

// ==============================================================================
// 2. Body Parsers & Security Middleware
// ==============================================================================
// Enforce explicit 2MB JSON body size limit
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser(sessionSecret));

// Hardened Security Headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' ws: wss:;"
  );
  next();
});

// Extend Express Request with optional user
declare global {
  namespace Express {
    interface Request {
      user?: UserSession;
    }
  }
}

// Authentication & Session Extraction Middleware
const extractSession = (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies?.scholar_lens_sid;
  if (token) {
    const session = db.getSession(token);
    if (session) {
      req.user = session;
    }
  }
  next();
};

// Normalize routes so /api/* handlers match whether request is /api/auth/login or /auth/login (e.g. Vercel rewrites)
app.use((req, _res, next) => {
  if (req.url.startsWith('/api/')) {
    return next();
  }
  if (
    req.url.startsWith('/auth/') ||
    req.url.startsWith('/records') ||
    req.url.startsWith('/stats') ||
    req.url.startsWith('/activity') ||
    req.url.startsWith('/data-quality') ||
    req.url.startsWith('/admin/')
  ) {
    req.url = '/api' + req.url;
  }
  next();
});

app.use(extractSession);

// Role Enforcement Middlewares
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
  }
  next();
};

const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: Please sign in.' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Administrator privileges required for this action.' });
  }
  next();
};

// ==============================================================================
// 3. In-Memory Rate Limiting for Login
// ==============================================================================
interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  blockedUntil?: number;
}

const loginRateLimitMap = new Map<string, RateLimitEntry>();
const MAX_FAILED_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function getRateLimitKey(req: Request, email: string): string {
  const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
  return `${ip}:${email.toLowerCase().trim()}`;
}

function checkRateLimit(key: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const entry = loginRateLimitMap.get(key);
  if (!entry) return { allowed: true };

  if (entry.blockedUntil && entry.blockedUntil > now) {
    const retryAfterSeconds = Math.ceil((entry.blockedUntil - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  if (now - entry.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    loginRateLimitMap.delete(key);
    return { allowed: true };
  }

  if (entry.count >= MAX_FAILED_ATTEMPTS) {
    entry.blockedUntil = now + RATE_LIMIT_WINDOW_MS;
    const retryAfterSeconds = Math.ceil((entry.blockedUntil - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  return { allowed: true };
}

function recordFailedLogin(key: string): void {
  const now = Date.now();
  const entry = loginRateLimitMap.get(key);
  if (!entry || now - entry.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    loginRateLimitMap.set(key, { count: 1, firstAttempt: now });
  } else {
    entry.count += 1;
    if (entry.count >= MAX_FAILED_ATTEMPTS) {
      entry.blockedUntil = now + RATE_LIMIT_WINDOW_MS;
    }
  }
}

function clearRateLimit(key: string): void {
  loginRateLimitMap.delete(key);
}

// ==============================================================================
// 4. API ROUTES
// ==============================================================================

// 1. Auth Endpoints
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const rateKey = getRateLimitKey(req, email);
  const rateCheck = checkRateLimit(rateKey);
  if (!rateCheck.allowed) {
    return res.status(429).json({
      error: `Too many failed login attempts. Please try again in ${rateCheck.retryAfterSeconds} seconds.`,
      retryAfter: rateCheck.retryAfterSeconds,
    });
  }

  const authResult = db.authenticate(email, password);
  if (!authResult) {
    recordFailedLogin(rateKey);
    db.logActivity(email, 'viewer', 'FAILED_LOGIN', undefined, `Failed login attempt for ${email}`);
    // Uniform credential failure message to defeat email enumeration
    return res.status(401).json({ error: 'Invalid institutional credentials. Verify email and password.' });
  }

  clearRateLimit(rateKey);

  // Set httpOnly, SameSite=Lax cookie
  res.cookie('scholar_lens_sid', authResult.token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });

  return res.json({ user: authResult.user });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const token = req.cookies?.scholar_lens_sid;
  if (token) {
    db.destroySession(token);
  }
  res.clearCookie('scholar_lens_sid', { path: '/' });
  return res.json({ success: true, message: 'Logged out successfully.' });
});

app.get('/api/auth/session', (req: Request, res: Response) => {
  return res.json({ user: req.user || null });
});

// 2. Records Endpoints (Protected: reads requireAuth, writes requireAdmin)
app.get('/api/records', requireAuth, (req: Request, res: Response) => {
  try {
    const filters: DataFilterOptions = {
      search: req.query.search as string,
      host_country: req.query.host_country as string,
      funding_type: req.query.funding_type as string,
      provider_type: req.query.provider_type as string,
      degree_level: req.query.degree_level as string,
      deadline_status: req.query.deadline_status as any,
      indian_eligible: req.query.indian_eligible as any,
      is_active: req.query.is_active as any,
      popularity_tier: req.query.popularity_tier as any,
      sort_by: req.query.sort_by as any,
      sort_order: req.query.sort_order as any,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      page_size: req.query.page_size ? parseInt(req.query.page_size as string, 10) : 10,
    };

    const paginated = db.listRecords(filters);
    return res.json(paginated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error querying records' });
  }
});

app.get('/api/records/:id', requireAuth, (req: Request, res: Response) => {
  const record = db.getRecord(req.params.id);
  if (!record) {
    return res.status(404).json({ error: `Record '${req.params.id}' not found.` });
  }
  return res.json(record);
});

app.post('/api/records', requireAdmin, (req: Request, res: Response) => {
  try {
    const created = db.createRecord(req.body, req.user!);
    return res.status(201).json(created);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.put('/api/records/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const updated = db.updateRecord(req.params.id, req.body, req.user!);
    return res.json(updated);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// Soft Delete / Archive / Restore Endpoint
app.patch('/api/records/:id/archive', requireAdmin, (req: Request, res: Response) => {
  try {
    const { archive } = req.body;
    if (typeof archive !== 'boolean') {
      return res.status(400).json({ error: 'Body must include boolean "archive" flag.' });
    }
    const updated = db.toggleArchiveRecord(req.params.id, archive, req.user!);
    return res.json(updated);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// Hard Delete Endpoint
app.delete('/api/records/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const success = db.deleteRecord(req.params.id, req.user!);
    if (!success) {
      return res.status(404).json({ error: 'Record not found.' });
    }
    return res.json({ success: true, message: 'Record permanently deleted.' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// 3. Batch CSV Ingestion & Export (Enforce 2 MB server-side limit)
app.post('/api/records/import', requireAdmin, (req: Request, res: Response) => {
  try {
    const { csvContent, onDuplicate } = req.body;
    if (!csvContent || typeof csvContent !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid csvContent payload.' });
    }

    // Explicit 2 MB limit check on the server
    if (Buffer.byteLength(csvContent, 'utf8') > 2 * 1024 * 1024) {
      return res.status(413).json({ error: 'Payload Too Large: CSV batch exceeds 2 MB limit.' });
    }

    const parseResult = parseOpportunitiesCSV(csvContent);
    if (parseResult.errors.length > 0 && parseResult.validRecords.length === 0) {
      return res.status(400).json({
        error: 'CSV validation failed with critical errors.',
        errors: parseResult.errors,
        totalRows: parseResult.totalRows,
      });
    }

    const importResult = db.importRecords(parseResult.validRecords, req.user!, onDuplicate || 'skip');
    return res.json({
      success: true,
      imported: importResult.imported,
      updated: importResult.updated,
      skipped: importResult.skipped,
      validationErrors: parseResult.errors,
      totalParsed: parseResult.totalRows,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed processing CSV batch' });
  }
});

app.get('/api/records/export', requireAuth, (req: Request, res: Response) => {
  try {
    const filters: DataFilterOptions = {
      search: req.query.search as string,
      host_country: req.query.host_country as string,
      funding_type: req.query.funding_type as string,
      provider_type: req.query.provider_type as string,
      degree_level: req.query.degree_level as string,
      deadline_status: req.query.deadline_status as any,
      indian_eligible: req.query.indian_eligible as any,
      is_active: req.query.is_active as any,
      popularity_tier: req.query.popularity_tier as any,
      page: 1,
      page_size: 10000, // Export all matching
    };

    const result = db.listRecords(filters);
    const csvData = exportOpportunitiesToCSV(result.data);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="scholar_lens_opportunities_${new Date().toISOString().slice(0, 10)}.csv"`);
    return res.send(csvData);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Export failed' });
  }
});

// 4. Analytics, Quality & Activity Logs (All protected by requireAuth)
app.get('/api/stats', requireAuth, (_req: Request, res: Response) => {
  const stats = db.getStats();
  return res.json(stats);
});

app.get('/api/activity', requireAuth, (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
  const logs = db.getActivityLogs(limit);
  return res.json(logs);
});

app.get('/api/data-quality', requireAuth, (_req: Request, res: Response) => {
  const report = db.getDataQualityReport();
  return res.json(report);
});

// Database Seed Reset (Admin only, disabled in production, requires explicit { confirm: true })
app.post('/api/admin/reset-seed', requireAdmin, (req: Request, res: Response) => {
  if (isProd) {
    return res.status(403).json({ error: 'Forbidden: Database seed reset is disabled in production environment.' });
  }

  const { confirm } = req.body || {};
  if (confirm !== true) {
    return res.status(400).json({ error: 'Bad Request: Explicit confirmation body flag { confirm: true } is required to reset dataset.' });
  }

  try {
    db.resetSeed(req.user!);
    return res.json({ success: true, message: 'Database reset to default 112 seed opportunities.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 404 handler for unmatched /api/* routes
app.all('/api/*', (_req: Request, res: Response) => {
  return res.status(404).json({ error: 'Endpoint not found.' });
});

// ==============================================================================
// 5. Vite or Static Production File Mounting
// ==============================================================================
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Scholar Lens] Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

if (process.env.VERCEL !== '1') {
  startServer().catch(err => {
    console.error('Failed to start Scholar Lens server:', err);
    process.exit(1);
  });
}

export { app };
export default app;

