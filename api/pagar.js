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
import { rateLimited } from './_ratelimit.js';
import bookingRules from '../booking-rules.js';
import { logAttempt } from './_mailer.js';
import { empacarReserva } from './_firma.js';

// "Por dónde llegó" viene del navegador: se recorta a lo esencial (texto corto).
function origenCompacto(o) {
  if (!o || typeof o !== 'object' || !o.first) return null;
  const s = (v, n) => String(v == null ? '' : v).slice(0, n);
  const t = tq => (tq && typeof tq === 'object') ? { c: s(tq.c, 30), r: s(tq.r, 50), u: s(tq.u, 60), l: s(tq.l, 90), t: s(tq.t, 10) } : null;
  return { first: t(o.first), last: t(o.last), n: Math.min(+o.n || 1, 9999) };
}

const { PT_ROWS, PT_PLACES, PT_DISPLAY, PT_HOTELS } = routesData;
const { brCheckLegs, BR_MIN_HOURS } = bookingRules;
const X4_FEE = 40;   // recargo por hoteles que solo se alcanzan en 4x4 (transbordo)
const VEHICULOS = { staria: 'Hyundai Staria', hiace: 'Toyota Hiace', maxus: 'Maxus V90' };

/* ---- El SERVIDOR decide el nombre de la ruta y el 4x4 (no el navegador) ----
   Antes el nombre de la ruta y el recargo 4x4 los mandaba el navegador: alguien
   que manipulara la página podía pagar una ruta barata con el tiquete de una
   cara, o saltarse los $40 del 4x4. Ahora la zona sale de lo que se COBRÓ (i, j)
   y el 4x4 se detecta aquí con la lista de hoteles. */
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
function zona(i) { const raw = (PT_PLACES || [])[i]; return (PT_DISPLAY && PT_DISPLAY[raw]) || raw || ''; }
// El navegador manda "Zona" o "Hotel (Zona)". Si la zona no es la cobrada, se usa la zona cobrada.
function etiquetaSegura(label, i) {
  const z = zona(i), l = String(label || '').trim().slice(0, 120);
  if (!l || l === z) return z;
  if (l.endsWith(' (' + z + ')') && l.length > z.length + 3) return l;
  return z;
}
// ¿La etiqueta es EXACTAMENTE un hotel 4x4 de esa zona ("Hotel (Zona)")? Mismo criterio
// que usa el sitio para mostrar el recargo en el total.
function hotel4x4(place, label) {
  const l = norm(label), z = zona(place);
  const h = (PT_HOTELS || []).find(x => x.req4x4 === true && x.place === place && l === norm(x.name + ' (' + z + ')'));
  return h ? h.name : '';
}

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
      body: JSON.stringify({ action: 'nextOrder', key: process.env.PANEL_KEY }),   // la hoja v12 exige la clave
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
  // Anti-spam: máx. 10 intentos de pago por IP cada 15 min (deja margen para reintentos reales)
  if (rateLimited(req, { max: 10, windowMs: 15 * 60 * 1000, key: 'pagar' })) {
    res.status(429).json({ ok: false, error: 'rate' }); return;
  }
  if (!process.env.TILOPAY_KEY || !process.env.TILOPAY_USER || !process.env.TILOPAY_PASSWORD) {
    res.status(500).json({ ok: false, error: 'no-keys' }); return;
  }
  try {
    const d = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const cart = Array.isArray(d.cart) ? d.cart : [];
    if (!cart.length) { res.status(400).json({ ok: false, error: 'empty-cart' }); return; }
    // Más de 10 servicios en una sola reserva no es real y haría crecer sin límite
    // los datos que viajan a Tilopay (returnData).
    if (cart.length > 10) { res.status(400).json({ ok: false, error: 'too-many-legs' }); return; }
    if (!d.name || !d.email) { res.status(400).json({ ok: false, error: 'missing' }); return; }

    // ---- RECALCULAR el precio en el servidor (tambien por tramo, para el tiquete) ----
    const clientLegs = Array.isArray(d.legs) ? d.legs : [];

    // ---- REGLAS DE RESERVA (antelacion minima y fechas bloqueadas) ----
    // Se valida en el SERVIDOR aparte del navegador: la validacion del
    // navegador se puede saltar, esta no. Ver booking-rules.js
    // Se valida UN tramo por cada item del CARRITO, no por cada "leg" que
    // mando el cliente: si alguien manda 3 tramos en el carrito pero un solo
    // leg, los otros dos quedarian sin fecha y se colarian. Un leg ausente
    // cuenta como fecha faltante y se rechaza.
    const legsToCheck = cart.map((_, i) => clientLegs[i] || (i === 0 ? { date: d.date, time: d.time } : {}));
    const chk = brCheckLegs(legsToCheck);
    if (!chk.ok) {
      res.status(400).json({
        ok: false, error: 'booking-rule', reason: chk.reason, leg: chk.leg,
        minHours: BR_MIN_HOURS, range: chk.range || null,
      });
      return;
    }
    let amount = 0;
    let vipCount = 0;
    const legs = [];
    for (let idx = 0; idx < cart.length; idx++) {
      const it = cart[idx];
      const p = legPrice(+it.i, +it.j, it.vkey);
      if (p == null) { res.status(400).json({ ok: false, error: 'bad-leg' }); return; }
      const isVip = it.vip === true || it.vip === '1' || it.vip === 1;
      const cl = clientLegs[idx] || {};
      // Nombres de la ruta: la ZONA siempre es la que se cobró (i, j)
      const from = etiquetaSegura(cl.from, +it.i), to = etiquetaSegura(cl.to, +it.j);
      // 4x4: hoteles de camino de montaña que exigen transbordo (+$40). Lo detecta el
      // servidor; si el navegador además lo marcó, se respeta (nunca cobra de menos).
      // Solo mira el hotel ESCOGIDO en el buscador (igual que el sitio al mostrar el total),
      // no el texto libre de recogida/destino: así nunca aparece un cargo que el cliente no vio.
      const h4 = hotel4x4(+it.j, to) || hotel4x4(+it.i, from);
      const isX4 = !!h4 || it.x4 === true || it.x4 === '1' || it.x4 === 1;
      amount += p;
      if (isVip) { amount += 80; vipCount++; }  // VIP por tramo
      if (isX4) { amount += X4_FEE; }           // recargo 4x4 por tramo
      legs.push({
        from, to,
        vname: VEHICULOS[it.vkey] || '', vip: isVip,
        x4: isX4, x4hotel: (h4 || String(it.x4hotel || cl.x4hotel || '')).slice(0, 80),
        price: p + (isVip ? 80 : 0) + (isX4 ? X4_FEE : 0),   // precio del tramo verificado en el servidor, no el que mando el cliente
        date: String(cl.date || '').slice(0, 20), time: String(cl.time || '').slice(0, 20),
        pickup: String(cl.pickup || '').slice(0, 120), dropoff: String(cl.dropoff || '').slice(0, 120),
        flight: String(cl.flight || '').slice(0, 60),   // vuelo propio del tramo (ida y regreso son distintos)
      });
    }
    if (!(amount > 0)) { res.status(400).json({ ok: false, error: 'bad-amount' }); return; }

    // ---- 1) Login en Tilopay ----
    const loginR = await fetch(`${TB}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiuser: process.env.TILOPAY_USER, password: process.env.TILOPAY_PASSWORD }),
    });
    const login = await loginR.json().catch(() => ({}));
    if (!login.access_token) { console.error('tilopay login-failed'); res.status(502).json({ ok: false, error: 'login-failed' }); return; }

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
      // Todo con largo máximo: este objeto viaja a Tilopay y vuelve (returnData); si
      // creciera sin límite podría cortarse y el cobro no se capturaría.
      name: String(d.name).slice(0, 120), email: String(d.email).slice(0, 160), phone: String(d.phone || '').slice(0, 40),
      summary: legs.map(l => `${l.from} → ${l.to} (${l.vname}${l.vip ? ' · VIP' : ''})`).join('  +  ').slice(0, 600),   // armado aquí con la ruta cobrada
      // Fecha, hora y lugares del servicio 1 salen del tramo YA VALIDADO por las reglas
      // de reserva (no de los campos sueltos, que nadie revisó).
      date: legs[0].date, time: legs[0].time,
      pax: String(d.pax || '').slice(0, 60), pickup: legs[0].pickup, dropoff: legs[0].dropoff, flight: legs[0].flight,
      itinerary: '', legs,   // el itinerario se rearma de legs (ya no se manda el texto)
      seats: String(d.seats || '').slice(0, 120),
      tier, total: '$' + amount.toFixed(2), notes: String(d.notes || '').slice(0, 1000),
      lang: d.lang === 'es' ? 'es' : 'en', orderNumber, country,
      // Por dónde llegó + desde qué país navega (lo dice Vercel, no el cliente) + celular/compu.
      // Compacto a propósito: todo esto viaja a Tilopay y vuelve en returnData.
      origen: origenCompacto(d.origen),
      paisVisita: String(req.headers['x-vercel-ip-country'] || '').slice(0, 2),
      dispositivo: d.dispositivo === 'Celular' ? 'Celular' : (d.dispositivo ? 'Compu' : ''),
    };
    // Anotar el "Intento de pago" en la hoja MIENTRAS se crea el cobro (en paralelo,
    // para no demorar al cliente). Si luego paga, la misma fila pasa a "Pagado".
    // Número de respaldo (TVCR-...) = la hoja no respondió: no insistir con ella y demorar al cliente.
    const intento = orderNumber.startsWith('TCR-') ? logAttempt(booking).catch(() => {}) : Promise.resolve();
    // FIRMADO: /api/retorno rechaza cualquier returnData que alguien haya cambiado (ver _firma.js)
    const returnData = empacarReserva(booking);

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
    // Esperar la hoja como máximo 2.5 s más: en Vercel lo que no terminó antes de
    // responder se puede cortar, pero el pago del cliente no espera por la hoja.
    await Promise.race([intento, new Promise(r => setTimeout(r, 2500))]);
    // Sin "detail": la respuesta de Tilopay no se le muestra al público (va a los logs de Vercel)
    if (!pay.url) { console.error('tilopay no-url', JSON.stringify(pay).slice(0, 500)); res.status(502).json({ ok: false, error: 'no-url' }); return; }

    res.status(200).json({ ok: true, url: pay.url, orderNumber, amount: amount.toFixed(2) });
  } catch (e) {
    console.error('pagar', e && e.message);
    res.status(500).json({ ok: false, error: 'server' });
  }
}
