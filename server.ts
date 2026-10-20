import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { db } from './src/server/db';
import { parseOpportunitiesCSV, exportOpportunitiesToCSV } from './src/lib/csvEngine';
import { UserSession, DataFilterOptions } from './src/types';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(process.env.SESSION_SECRET || 'scholar_lens_secret_key_2026'));

// Safe Security Headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
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
    return res.status(403).json({ error: 'Forbidden: Administrator privileges required for write operations.' });
  }
  next();
};

// ==========================================
// API ROUTES
// ==========================================

// 1. Auth Endpoints
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const authResult = db.authenticate(email, password);
  if (!authResult) {
    return res.status(401).json({ error: 'Invalid email or passphrase. Verify institutional credentials.' });
  }

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

// 2. Records Endpoints (Public read for landing page, admin-only for writes)
app.get('/api/records', (req: Request, res: Response) => {
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

app.get('/api/records/:id', (req: Request, res: Response) => {
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

app.delete('/api/records/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const success = db.deleteRecord(req.params.id, req.user!);
    if (!success) {
      return res.status(404).json({ error: 'Record not found.' });
    }
    return res.json({ success: true, message: 'Record deleted.' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// 3. Batch CSV Ingestion & Export
app.post('/api/records/import', requireAdmin, (req: Request, res: Response) => {
  try {
    const { csvContent, onDuplicate } = req.body;
    if (!csvContent || typeof csvContent !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid csvContent payload.' });
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

// 4. Analytics, Quality & Activity Logs (Public stats, protected quality & logs)
app.get('/api/stats', (_req: Request, res: Response) => {
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

app.post('/api/admin/reset-seed', requireAdmin, (req: Request, res: Response) => {
  try {
    db.resetSeed(req.user!);
    return res.json({ success: true, message: 'Database reset to default 112 seed opportunities.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 5. Project Source Code ZIP Download
app.get('/api/download-project-zip', (_req: Request, res: Response) => {
  const zipPath = path.resolve(process.cwd(), 'scholar-lens-project.zip');
  if (fs.existsSync(zipPath)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="scholar-lens-project.zip"');
    return res.sendFile(zipPath);
  }
  return res.status(404).json({ error: 'Source code zip archive not found.' });
});

// ==========================================
// VITE OR STATIC MOUNTING
// ==========================================
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

startServer().catch(err => {
  console.error('Failed to start Scholar Lens server:', err);
  process.exit(1);
});
