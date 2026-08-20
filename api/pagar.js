/* ==========================================================================
   Travesía Costa Rica — crear cobro con tarjeta (Tilopay, flujo HOSTED)
   1) RECALCULA el precio en el servidor desde routes-data (regla de oro:
      nunca confiar en el monto que manda el cliente).
   2) Login en Tilopay -> access_token.
   3) processPayment -> URL de pago hospedada (secure.tilopay.com).
   4) Devuelve { ok, url, orderNumber } para redirigir al cliente.
   La TARJETA se digita en la página de Tilopay: nunca toca nuestro sitio.
   Env vars (Vercel): TILOPAY_KEY, TILOPAY_USER, TILOPAY_PASSWORD.
   ========================================================================== */
import routesData from '../routes-data.js';

const { PT_ROWS } = routesData;

// índice de precios por ruta (i-j) -> {staria, hiace, maxus}
const LOOKUP = {};
for (const r of (PT_ROWS || [])) {
  const a = Math.min(r[0], r[1]), b = Math.max(r[0], r[1]);
  LOOKUP[`${a}-${b}`] = { staria: r[2], hiace: r[3], maxus: r[4] };
}
function legPrice(i, j, vkey) {
  const row = LOOKUP[`${Math.min(i, j)}-${Math.max(i, j)}`];
  if (!row) return null;
  const p = row[vkey];
  return (p == null) ? null : Number(p);
}

const TB = 'https://app.tilopay.com/api/v1';
const REDIRECT = 'https://travesiacr.online/api/retorno';

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'method' }); return; }
  if (!process.env.TILOPAY_KEY || !process.env.TILOPAY_USER || !process.env.TILOPAY_PASSWORD) {
    res.status(500).json({ ok: false, error: 'no-keys' }); return;
  }
  try {
    const d = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const cart = Array.isArray(d.cart) ? d.cart : [];
    if (!cart.length) { res.status(400).json({ ok: false, error: 'empty-cart' }); return; }
    if (!d.name || !d.email) { res.status(400).json({ ok: false, error: 'missing' }); return; }

    // ---- RECALCULAR el precio en el servidor ----
    let amount = 0;
    for (const it of cart) {
      const p = legPrice(+it.i, +it.j, it.vkey);
      if (p == null) { res.status(400).json({ ok: false, error: 'bad-leg' }); return; }
      amount += p;
    }
    const vip = d.vip === true || d.vip === '1' || d.vip === 1;
    if (vip) amount += 80;
    if (!(amount > 0)) { res.status(400).json({ ok: false, error: 'bad-amount' }); return; }

    // ---- 1) Login en Tilopay ----
    const loginR = await fetch(`${TB}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiuser: process.env.TILOPAY_USER, password: process.env.TILOPAY_PASSWORD }),
    });
    const login = await loginR.json().catch(() => ({}));
    if (!login.access_token) { res.status(502).json({ ok: false, error: 'login-failed', detail: login }); return; }

    // ---- Datos para el cobro ----
    const orderNumber = 'TVCR-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    const nameParts = String(d.name || 'Cliente').trim().split(/\s+/);
    const firstName = nameParts[0] || 'Cliente';
    const lastName = nameParts.slice(1).join(' ') || firstName;
    const phone = String(d.phone || '').replace(/[^0-9]/g, '') || '00000000';
    const tier = vip ? 'Travesía VIP' : 'Travesía Standard';

    // datos de la reserva que viajan (base64) y vuelven para enviar el correo al aprobar
    const booking = {
      name: d.name, email: d.email, phone: d.phone || '',
      summary: d.summary || '', date: d.date || '', time: d.time || '',
      pax: d.pax || '', pickup: d.pickup || '', flight: d.flight || '',
      tier, total: '$' + amount.toFixed(2), notes: d.notes || '',
      lang: d.lang === 'es' ? 'es' : 'en', orderNumber,
    };
    const returnData = Buffer.from(JSON.stringify(booking), 'utf8').toString('base64');

    // ---- 2) processPayment -> URL de pago ----
    const payload = {
      redirect: REDIRECT,
      key: process.env.TILOPAY_KEY,
      amount: amount.toFixed(2),
      currency: 'USD',
      orderNumber,
      capture: '1',
      billToFirstName: firstName,
      billToLastName: lastName,
      billToAddress: d.pickup || 'La Fortuna',
      billToAddress2: 'N/A',
      billToCity: 'La Fortuna',
      billToState: 'CR-A',
      billToZipPostCode: '21007',
      billToCountry: 'CR',
      billToTelephone: phone,
      billToEmail: d.email,
      shipToFirstName: firstName,
      shipToLastName: lastName,
      shipToAddress: d.pickup || 'La Fortuna',
      shipToAddress2: 'N/A',
      shipToCity: 'La Fortuna',
      shipToState: 'CR-A',
      shipToZipPostCode: '21007',
      shipToCountry: 'CR',
      shipToTelephone: phone,
      subscription: '0',
      platform: 'travesiacr-web',
      returnData,
      token_version: 'v2',
    };
    const payR = await fetch(`${TB}/processPayment`, {
      method: 'POST',
      headers: {
        'Authorization': 'bearer ' + login.access_token,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const pay = await payR.json().catch(() => ({}));
    if (!pay.url) { res.status(502).json({ ok: false, error: 'no-url', detail: pay }); return; }

    res.status(200).json({ ok: true, url: pay.url, orderNumber, amount: amount.toFixed(2) });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e && e.message || e) });
  }
}
