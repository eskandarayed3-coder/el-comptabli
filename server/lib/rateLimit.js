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
