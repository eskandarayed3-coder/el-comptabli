// Lightweight in-memory limiter. It intentionally limits by IP before auth so
// unauthenticated callers cannot burn through AI capacity. Use a shared store
// (Redis/Upstash) before scaling to multiple server instances.
export function rateLimit({ windowMs, max, keyPrefix = 'api' }) {
  const hits = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const key = `${keyPrefix}:${req.ip || req.socket.remoteAddress || 'unknown'}`;
    const entry = hits.get(key);
    if (!entry || now - entry.startedAt >= windowMs) {
      hits.set(key, { startedAt: now, count: 1 });
      return next();
    }
    entry.count += 1;
    if (entry.count > max) {
      const retryAfter = Math.ceil((windowMs - (now - entry.startedAt)) / 1000);
      res.setHeader('Retry-After', String(retryAfter));
      return res.status(429).json({ error: { code: 'rate_limited', message: 'Trop de demandes. Réessaie dans un instant.' } });
    }
    return next();
  };
}

function rateKey(req, preferUser) {
  const raw = preferUser && req.user?.id
    ? `user:${req.user.id}`
    : `ip:${req.ip || req.socket?.remoteAddress || 'unknown'}`;
  return crypto.createHash('sha256').update(raw).digest('hex');
}

// Shared atomic limiter for Vercel Functions. PostgreSQL is already required
// by these routes, so this avoids per-instance counters and an extra service.
export function sharedRateLimit({ scope, windowSeconds, max, preferUser = true }) {
  return async (req, res, next) => {
    try {
      const { data, error } = await getServiceClient().rpc('consume_rate_limit', {
        p_scope: scope,
        p_key_hash: rateKey(req, preferUser),
        p_window_seconds: windowSeconds,
        p_max_hits: max,
      });
      if (error) throw error;
      const result = Array.isArray(data) ? data[0] : data;
      if (!result?.allowed) {
        const retryAfter = Math.max(1, Number(result?.retry_after) || windowSeconds);
        res.setHeader('Retry-After', String(retryAfter));
        return res.status(429).json({
          error: { code: 'rate_limited', message: `Trop de demandes. Réessaie dans ${retryAfter} s.` },
        });
      }
      return next();
    } catch {
      return res.status(503).json({
        error: { code: 'rate_limit_unavailable', message: 'Protection temporairement indisponible. Réessaie dans un instant.' },
      });
    }
  };
}
import crypto from 'node:crypto';
import { getServiceClient } from './supabase.js';
