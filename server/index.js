import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import chatRouter from './routes/chat.js';
import scanRouter from './routes/scan.js';
import insightsRouter from './routes/insights.js';
import examRouter from './routes/exam.js';
import activateRouter from './routes/activate.js';
import authRouter from './routes/auth.js';
import stateRouter from './routes/state.js';
import adminRouter from './routes/admin.js';
import exportsRouter from './routes/exports.js';
import documentsRouter from './routes/documents.js';
import v1Router from './routes/v1.js';
import { providerInfo } from './ai.js';
import { sendApiError } from './lib/api.js';
import { assertProductionConfig } from './lib/env.js';
import { getServiceClient, requireUser, supabaseConfigured } from './lib/supabase.js';
import { rateLimit, sharedRateLimit } from './lib/rateLimit.js';
import { logEvent, requestContext, userHash } from './lib/observability.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
assertProductionConfig();
const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(requestContext);
const supabaseOrigin = process.env.SUPABASE_URL ? (() => {
  try { return new URL(process.env.SUPABASE_URL).origin; } catch { return 'https://*.supabase.co'; }
})() : 'https://*.supabase.co';
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', `default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: ${supabaseOrigin}; font-src 'self'; connect-src 'self' ${supabaseOrigin}`);
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Permissions-Policy', 'camera=(self), microphone=(), geolocation=()');
  next();
});
app.use(express.json({ limit: '12mb' }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 300, keyPrefix: 'api' }));

app.get('/api/health', async (_req, res) => {
  const info = providerInfo();
  let database = false;
  if (supabaseConfigured()) {
    const { error } = await getServiceClient().from('profiles').select('id', { head: true }).limit(1);
    database = !error;
  }
  const ok = database && info.keyPresent;
  res.status(ok ? 200 : 503).json({ ok, database, aiConfigured: info.keyPresent });
});
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20, keyPrefix: 'auth' }), sharedRateLimit({ scope: 'auth', windowSeconds: 900, max: 20, preferUser: false }), authRouter);
app.use('/api/state', stateRouter);
app.use('/api/admin', adminRouter);
app.use('/api/exports', exportsRouter);
app.use('/api/documents', rateLimit({ windowMs: 60 * 1000, max: 30, keyPrefix: 'documents' }), documentsRouter);
app.use('/api/v1', rateLimit({ windowMs: 60 * 1000, max: 120, keyPrefix: 'v1' }), v1Router);
app.use('/api/chat', rateLimit({ windowMs: 60 * 1000, max: 20, keyPrefix: 'chat' }), requireUser, chatRouter);
app.use('/api/scan', rateLimit({ windowMs: 60 * 1000, max: 10, keyPrefix: 'scan' }), requireUser, sharedRateLimit({ scope: 'ocr', windowSeconds: 60, max: 6 }), scanRouter);
app.use('/api/insights', rateLimit({ windowMs: 60 * 1000, max: 12, keyPrefix: 'insights' }), requireUser, insightsRouter);
app.use('/api/exam', rateLimit({ windowMs: 60 * 1000, max: 8, keyPrefix: 'exam' }), requireUser, examRouter);
app.use('/api/activate', activateRouter);

app.use('/api', (error, req, res, _next) => {
  logEvent('error', 'unhandled_api_error', {
    requestId: req.requestId,
    route: req.path,
    userHash: userHash(req.user?.id),
    category: error?.name || 'Error',
  });
  if (res.headersSent) return res.end();
  return sendApiError(error, req, res);
});

if (process.env.NODE_ENV === 'production') {
  const dist = path.join(__dirname, '..', 'dist');
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

// Vercel invokes the exported Express application as a Node.js Function. Other
// hosts keep the existing long-lived HTTP server behaviour.
export default app;

if (!process.env.VERCEL) {
  // Port selection differs by environment:
  //  - Production (Render, etc.): the host injects PORT and the single Node process
  //    serves both the built client and the API, so bind to PORT.
  //  - Local dev: the dev harness injects PORT=5173 for the Vite client, so the API
  //    must avoid it and use API_PORT (Vite proxies /api → this port) instead.
  const isProd = process.env.NODE_ENV === 'production';
  const port = (isProd ? process.env.PORT : process.env.API_PORT) || process.env.API_PORT || 3001;
  app.listen(port, () => {
    const info = providerInfo();
    console.log(`El Comptabli server on http://localhost:${port} — IA: ${info.provider} (${info.model || 'n/a'})`);
    if (!info.keyPresent) {
      console.warn(`⚠️  Aucune clé pour le fournisseur "${info.provider}" dans .env — les fonctions IA renverront une erreur.`);
      console.warn('   → Ajoute GROQ_API_KEY=... (gratuit, sans carte) pour activer l\'IA immédiatement.');
    }
  });
}
