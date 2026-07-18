import { Router } from 'express';
import { generateText } from '../ai.js';
import { SYSTEM_INSTRUCTION, profileContext } from '../persona.js';

const router = Router();

// POST /api/insights  { prompt, data, profile, system, maxTokens }
// One-shot generation used by AI reports, recommendations, forecasting and the exam solver.
// `system` lets callers (e.g. the exam solver) override the base persona entirely.
router.post('/', async (req, res) => {
  const { prompt = '', data = null, profile = null, system, maxTokens } = req.body || {};
  if (!prompt) return res.status(400).json({ error: { code: 'no_prompt', message: 'Demande manquante.' } });
  try {
    const text = await generateText({
      system: system || (SYSTEM_INSTRUCTION + profileContext(profile)),
      prompt: data ? `${prompt}\n\nDonnées de l'utilisateur (JSON) :\n${JSON.stringify(data).slice(0, 20000)}` : prompt,
      maxTokens: Math.min(4000, Math.max(256, Number(maxTokens) || 1024)),
    });
    res.json({ text });
  } catch (e) {
    console.error('insights route error:', e?.message || e);
    const friendly = e.friendly || { code: 'upstream_error', message: "L'IA est momentanément indisponible." };
    res.status(e.status === 403 ? 403 : 502).json({ error: friendly });
  }
});

export default router;
