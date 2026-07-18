import { Router } from 'express';
import { generateTextWithImage } from '../ai.js';

const router = Router();

// POST /api/exam  { system, prompt, image?: { mimeType, dataBase64 }, maxTokens }
router.post('/', async (req, res) => {
  const { system, prompt = '', image = null, maxTokens } = req.body || {};
  if (!prompt.trim() && !image) {
    return res.status(400).json({ error: { code: 'no_prompt', message: 'Aucune question ni image fournie.' } });
  }
  try {
    const text = await generateTextWithImage({
      system,
      prompt: prompt.trim() || 'Lis l’exercice sur cette image et résous-le en détail.',
      image,
      maxTokens: Math.min(4000, Math.max(256, Number(maxTokens) || 2200)),
    });
    res.json({ text });
  } catch (e) {
    console.error('exam route error:', e?.message || e);
    const friendly = e.friendly || { code: 'upstream_error', message: "L'IA est momentanément indisponible." };
    res.status(e.status === 403 ? 403 : e.status === 400 ? 400 : 502).json({ error: friendly });
  }
});

export default router;
