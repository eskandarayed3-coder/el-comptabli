import { Router } from 'express';
import { streamChat } from '../ai.js';
import { SYSTEM_INSTRUCTION, profileContext } from '../persona.js';
import { agentFocus } from '../agents.js';
import { cleanText, validateMessages } from '../lib/validation.js';
import { buildKnowledgeContext } from '../knowledge.js';

const router = Router();

// POST /api/chat  { messages: [{role:'user'|'model', text}], profile, agentId }
// Streams simplified SSE events: data: {"t":"chunk"} ... data: [DONE]
router.post('/', async (req, res) => {
  const messages = validateMessages(req.body?.messages);
  const rawProfile = req.body?.profile || {};
  const profile = {
    name: cleanText(rawProfile.name, 80),
    userType: cleanText(rawProfile.userType, 40),
    activity: cleanText(rawProfile.activity, 120),
    city: cleanText(rawProfile.city, 80),
    regime: cleanText(rawProfile.regime, 40),
  };
  const agentId = ['general', 'fiscalite', 'comptabilite', 'finance', 'droit', 'tunisie'].includes(req.body?.agentId) ? req.body.agentId : 'general';
  if (!messages) return res.status(400).json({ error: { code: 'no_messages', message: 'Message manquant ou trop long.' } });

  const knowledge = buildKnowledgeContext(messages[messages.length - 1].text, { agentId });
  const system = SYSTEM_INSTRUCTION + '\n\n' + agentFocus(agentId) + profileContext(profile) + knowledge.prompt;

  try {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    res.write(`data: ${JSON.stringify({ meta: { sources: knowledge.sources, matches: knowledge.matches } })}\n\n`);

    await streamChat({
      system,
      messages,
      onText: (t) => { res.write(`data: ${JSON.stringify({ t })}\n\n`); },
    });

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (e) {
    console.error('chat route error:', e?.message || e);
    const friendly = e.friendly || { code: 'upstream_error', message: "L'IA est momentanément indisponible. Réessaie." };
    if (!res.headersSent) return res.status(e.status === 403 ? 403 : 502).json({ error: friendly });
    res.write(`data: ${JSON.stringify({ error: friendly })}\n\n`);
    res.end();
  }
});

export default router;
