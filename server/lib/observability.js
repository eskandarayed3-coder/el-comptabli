import crypto from 'node:crypto';

const SAFE_ID = /^[A-Za-z0-9._:-]{8,100}$/;

export function userHash(userId) {
  if (!userId) return null;
  return crypto.createHash('sha256').update(String(userId)).digest('hex').slice(0, 16);
}

export function logEvent(level, event, metadata = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...metadata,
  };
  const output = JSON.stringify(entry);
  if (level === 'error') console.error(output);
  else if (level === 'warn') console.warn(output);
  else console.log(output);
}

export function requestContext(req, res, next) {
  const incoming = String(req.headers['x-request-id'] || '');
  req.requestId = SAFE_ID.test(incoming) ? incoming : crypto.randomUUID();
  req.startedAt = Date.now();
  res.setHeader('X-Request-ID', req.requestId);
  res.on('finish', () => {
    if (!req.path.startsWith('/api') || (res.statusCode < 400 && !/^\/api\/(scan|documents)/.test(req.path))) return;
    logEvent(res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info', 'http_request', {
      requestId: req.requestId,
      method: req.method,
      route: req.path,
      status: res.statusCode,
      durationMs: Date.now() - req.startedAt,
      userHash: userHash(req.user?.id),
    });
  });
  next();
}
