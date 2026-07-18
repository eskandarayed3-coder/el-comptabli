import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import chatRouter from './routes/chat.js';
import scanRouter from './routes/scan.js';
import insightsRouter from './routes/insights.js';
import examRouter from './routes/exam.js';
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

if (process.env.NODE_ENV === 'production') {
  const dist = path.join(__dirname, '..', 'dist');
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

// Locally, PORT=5173 is reserved for the Vite dev server, so the API listens on
// API_PORT instead. In production (Render, etc.) there's no Vite process — the
// host injects PORT and expects the app to bind to it, so that takes priority.
const port = process.env.PORT || process.env.API_PORT || 3001;
app.listen(port, () => {
  const info = providerInfo();
  console.log(`El Comptabli server on http://localhost:${port} — IA: ${info.provider} (${info.model || 'n/a'})`);
  if (!info.keyPresent) {
    console.warn(`⚠️  Aucune clé pour le fournisseur "${info.provider}" dans .env — les fonctions IA renverront une erreur.`);
    console.warn('   → Ajoute GROQ_API_KEY=... (gratuit, sans carte) pour activer l\'IA immédiatement.');
  }
});
