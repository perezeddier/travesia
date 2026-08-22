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

// Pide el siguiente número de orden (1347, 1348, ...) a la hoja de Google (contador ahí).
// Si falla o tarda, devuelve null y el que llama usa un respaldo — nunca bloquea el pago.
async function nextOrderNumber() {
  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) return null;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'nextOrder' }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    const j = await r.json();
    if (j && j.ok && j.order) return 'TCR-' + j.order;
  } catch (e) { /* respaldo abajo */ }
  return null;
}
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
    let vipCount = 0;
    for (const it of cart) {
      const p = legPrice(+it.i, +it.j, it.vkey);
      if (p == null) { res.status(400).json({ ok: false, error: 'bad-leg' }); return; }
      amount += p;
      if (it.vip === true || it.vip === '1' || it.vip === 1) { amount += 80; vipCount++; }  // VIP por tramo
    }
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
    // Número de orden corto y consecutivo (TCR-1347, TCR-1348...) usando la hoja de Google
    // como contador. Si la hoja no responde, cae a un número único de respaldo (nunca bloquea el pago).
    const orderNumber = (await nextOrderNumber()) || ('TVCR-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 4).toUpperCase());
    const nameParts = String(d.name || 'Cliente').trim().split(/\s+/);
    const firstName = nameParts[0] || 'Cliente';
    const lastName = nameParts.slice(1).join(' ') || firstName;
    const phone = String(d.phone || '').replace(/[^0-9]/g, '') || '00000000';
    const tier = vipCount === 0 ? 'Travesía Standard'
      : (vipCount === cart.length ? 'Travesía VIP' : `VIP en ${vipCount} de ${cart.length}`);

    // Dirección de facturación de la tarjeta (mejora la aceptación / AVS en tarjetas extranjeras)
    const rawCountry = String(d.country || '').toUpperCase();
    const country = /^[A-Z]{2}$/.test(rawCountry) ? rawCountry : 'CR';   // "OTHER"/vacío -> CR
    const zip = String(d.zip || '').trim().slice(0, 12) || (country === 'CR' ? '21007' : '00000');
    const state = country === 'CR' ? 'CR-A' : 'NA';
    const city = country === 'CR' ? 'La Fortuna' : 'NA';
    const address = String(d.pickup || 'NA').slice(0, 60);

    // datos de la reserva que viajan (base64) y vuelven para enviar el correo al aprobar
    const booking = {
      name: d.name, email: d.email, phone: d.phone || '',
      summary: d.summary || '', date: d.date || '', time: d.time || '',
      pax: d.pax || '', pickup: d.pickup || '', dropoff: d.dropoff || '', flight: d.flight || '',
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
      capture: '0',   // autorizar SOLAMENTE aquí; el cobro real se captura en /api/retorno, con una llamada
                       // segura de servidor a servidor a Tilopay. Así nadie puede fingir un "pago recibido".
      billToFirstName: firstName,
      billToLastName: lastName,
      billToAddress: address,
      billToAddress2: 'N/A',
      billToCity: city,
      billToState: state,
      billToZipPostCode: zip,
      billToCountry: country,
      billToTelephone: phone,
      billToEmail: d.email,
      shipToFirstName: firstName,
      shipToLastName: lastName,
      shipToAddress: address,
      shipToAddress2: 'N/A',
      shipToCity: city,
      shipToState: state,
      shipToZipPostCode: zip,
      shipToCountry: country,
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
