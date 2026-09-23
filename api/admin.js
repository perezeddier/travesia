/* ==========================================================================
   Travesía Costa Rica — PANEL PRIVADO de Eddie (/admin)
   - POST {action:'login', password}  -> si la clave es correcta, deja una
     cookie firmada (30 días, solo este sitio, invisible para JavaScript).
   - POST {action:'logout'}           -> borra la cookie.
   - GET                              -> con cookie válida, devuelve las filas
     de la hoja (vía Apps Script, acción 'list' con PANEL_KEY).
   Env vars (Vercel): ADMIN_PASSWORD (la clave de Eddie, la pone él),
   PANEL_KEY (la genera crearClavePanel() en el Apps Script), SHEETS_WEBHOOK_URL.
   La página /admin es solo la "cáscara": sin la cookie no recibe ni un dato.
   ========================================================================== */
import crypto from 'node:crypto';
import { rateLimited } from './_ratelimit.js';

const COOKIE = 'tcr_admin';
const DIAS = 30;

// Llave de firma derivada de las dos claves: si Eddie cambia su clave,
// todas las sesiones abiertas (por ejemplo un celular perdido) dejan de servir.
function llave() {
  return crypto.createHash('sha256')
    .update('tcr-admin|' + process.env.ADMIN_PASSWORD + '|' + process.env.PANEL_KEY).digest();
}
function firma(exp) {
  return crypto.createHmac('sha256', llave()).update(String(exp)).digest('base64url');
}
function igual(a, b) {
  // Compara en tiempo constante (no deja adivinar la clave letra por letra)
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}
function leerCookie(req) {
  const m = String(req.headers.cookie || '').match(new RegExp('(?:^|;\\s*)' + COOKIE + '=([^;]+)'));
  return m ? m[1] : '';
}
function sesionValida(req) {
  const [exp, sig] = leerCookie(req).split('.');
  if (!exp || !sig || !(+exp > Date.now())) return false;
  return igual(firma(exp), sig);
}
function ponerCookie(res, valor, maxAge) {
  res.setHeader('Set-Cookie',
    `${COOKIE}=${valor}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');

  const falta = ['ADMIN_PASSWORD', 'PANEL_KEY', 'SHEETS_WEBHOOK_URL'].filter(k => !process.env[k]);
  if (falta.length) { res.status(503).json({ ok: false, error: 'no-config', falta }); return; }

  try {
    if (req.method === 'POST') {
      const d = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

      if (d.action === 'logout') { ponerCookie(res, '', 0); res.status(200).json({ ok: true }); return; }

      if (d.action === 'login') {
        // Máx. 8 intentos cada 15 min por conexión, y cada error tarda un poco a propósito
        if (rateLimited(req, { max: 8, windowMs: 15 * 60 * 1000, key: 'admin-login' })) {
          res.status(429).json({ ok: false, error: 'rate' }); return;
        }
        if (!igual(d.password || '', process.env.ADMIN_PASSWORD)) {
          await new Promise(r => setTimeout(r, 800));
          res.status(401).json({ ok: false, error: 'clave' }); return;
        }
        const exp = Date.now() + DIAS * 86400000;
        ponerCookie(res, `${exp}.${firma(exp)}`, DIAS * 86400);
        res.status(200).json({ ok: true }); return;
      }
      res.status(400).json({ ok: false, error: 'action' }); return;
    }

    if (req.method !== 'GET') { res.status(405).json({ ok: false, error: 'method' }); return; }
    if (!sesionValida(req)) { res.status(401).json({ ok: false, error: 'sesion' }); return; }

    const r = await fetch(process.env.SHEETS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'list', key: process.env.PANEL_KEY }),
    });
    const j = await r.json().catch(() => ({}));
    if (!j || !j.ok) { res.status(502).json({ ok: false, error: 'hoja', detalle: (j && j.error) || 'sin respuesta' }); return; }
    res.status(200).json({ ok: true, filas: j.filas || [], ahora: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'server' });
  }
}
