import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import chatRouter from './routes/chat.js';
import scanRouter from './routes/scan.js';
import insightsRouter from './routes/insights.js';
import examRouter from './routes/exam.js';
import activateRouter from './routes/activate.js';
import { providerInfo } from './ai.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: '25mb' }));

app.get('/api/health', (_req, res) => {
  const info = providerInfo();
  res.json({ ok: true, ...info });
});
app.use('/api/chat', chatRouter);
app.use('/api/scan', scanRouter);
app.use('/api/insights', insightsRouter);
app.use('/api/exam', examRouter);
app.use('/api/activate', activateRouter);

// Small standalone admin page (not part of the React app / Vite proxy) to
// hand out fresh activation codes — works the same in dev and prod.
app.use('/admin', express.static(path.join(__dirname, 'public')));

if (process.env.NODE_ENV === 'production') {
  const dist = path.join(__dirname, '..', 'dist');
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

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
