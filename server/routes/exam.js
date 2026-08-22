import { Router } from 'express';
import { generateTextWithImage } from '../ai.js';
import { cleanText, validateImagePayload } from '../lib/validation.js';

const router = Router();

// POST /api/exam  { system, prompt, image?: { mimeType, dataBase64 }, maxTokens }
const EXAM_SYSTEM = [
  'Tu aides à résoudre un exercice de comptabilité ou de finance.',
  'Réponds en français, texte brut, avec les hypothèses et calculs étape par étape.',
  'Pour une écriture comptable tunisienne, utilise le Système Comptable des Entreprises.',
  'Si une image est illisible, dis-le au lieu d’inventer.',
].join(' ');

router.post('/', async (req, res) => {
  const prompt = cleanText(req.body?.prompt, 12000);
  const image = req.body?.image ? validateImagePayload(req.body.image) : null;
  const maxTokens = req.body?.maxTokens;
  if (image && !image.ok) return res.status(400).json({ error: { code: 'bad_file', message: image.message } });
  if (!prompt.trim() && !image) {
    return res.status(400).json({ error: { code: 'no_prompt', message: 'Aucune question ni image fournie.' } });
  }
  try {
    const text = await generateTextWithImage({
      system: EXAM_SYSTEM,
      prompt: prompt.trim() || 'Lis l’exercice sur cette image et résous-le en détail.',
      image: image ? { mimeType: image.mimeType, dataBase64: image.dataBase64 } : null,
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
