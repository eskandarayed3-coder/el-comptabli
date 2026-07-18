import { Router } from 'express';
import { streamChat } from '../ai.js';
import { SYSTEM_INSTRUCTION, profileContext } from '../persona.js';
import { agentFocus } from '../agents.js';

const router = Router();

// POST /api/chat  { messages: [{role:'user'|'model', text}], profile, agentId }
// Streams simplified SSE events: data: {"t":"chunk"} ... data: [DONE]
router.post('/', async (req, res) => {
  const { messages = [], profile = null, agentId = 'general' } = req.body || {};
  if (!messages.length) return res.status(400).json({ error: { code: 'no_messages', message: 'Message manquant.' } });

  const system = SYSTEM_INSTRUCTION + '\n\n' + agentFocus(agentId) + profileContext(profile);

  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    let started = false;
    await streamChat({
      system,
      messages,
      onText: (t) => { started = true; res.write(`data: ${JSON.stringify({ t })}\n\n`); },
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
