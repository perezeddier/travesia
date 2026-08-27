/* ==========================================================================
   Travesía Costa Rica — límite de velocidad simple por IP (anti-spam)
   En memoria por instancia serverless: frena ráfagas de un mismo origen
   (bots/spam). Se reinicia con cada instancia nueva — suficiente para
   proteger los correos y la API de pago sin servicios externos.
   ========================================================================== */
const buckets = new Map();

export function rateLimited(req, { max = 5, windowMs = 15 * 60 * 1000, key = 'rl' } = {}) {
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || (req.socket && req.socket.remoteAddress) || '?';
  const now = Date.now();
  const k = `${key}:${ip}`;
  const hits = (buckets.get(k) || []).filter((t) => now - t < windowMs);
  if (hits.length >= max) { buckets.set(k, hits); return true; }
  hits.push(now);
  buckets.set(k, hits);
  if (buckets.size > 5000) buckets.clear(); // nunca crecer sin límite
  return false;
}
