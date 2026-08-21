/* ==========================================================================
   Travesía Costa Rica — retorno de Tilopay tras el pago (GET)
   Tilopay redirige aquí al cliente con: ?code=1 (autorizado) & returnData=...
   SEGURIDAD: el pago se crea en /api/pagar con capture=0 (solo AUTORIZA, no
   cobra). Acá, antes de avisar "pago recibido", hacemos nosotros mismos una
   llamada de SERVIDOR A SERVIDOR a Tilopay para CAPTURAR el cobro real.
   Esa llamada solo funciona si existe una autorización real y válida en
   Tilopay — nadie puede fabricar la dirección web y engañar al sistema,
   porque Tilopay rechaza la captura si no hay nada real que cobrar.
   Solo si Tilopay CONFIRMA la captura enviamos los correos de "pago recibido".
   ========================================================================== */
import { sendReservation } from './_mailer.js';

const TB = 'https://app.tilopay.com/api/v1';

async function captureNow(orderNumber, amount) {
  if (!process.env.TILOPAY_KEY || !process.env.TILOPAY_USER || !process.env.TILOPAY_PASSWORD) return false;
  try {
    const loginR = await fetch(`${TB}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiuser: process.env.TILOPAY_USER, password: process.env.TILOPAY_PASSWORD }),
    });
    const login = await loginR.json().catch(() => ({}));
    if (!login.access_token) return false;

    const capR = await fetch(`${TB}/processModification`, {
      method: 'POST',
      headers: { 'Authorization': 'bearer ' + login.access_token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderNumber, type: '1', amount: String(amount), key: process.env.TILOPAY_KEY }),  // type 1 = Capturar
    });
    return capR.ok;  // Tilopay solo confirma si la autorización era real
  } catch (e) { return false; }
}

export default async function handler(req, res) {
  const q = req.query || {};
  const authorized = String(q.code) === '1';
  const order = q.order || q.orderNumber || '';

  let amount = '';
  let captured = false;

  if (authorized) {
    try {
      let booking = {};
      if (q.returnData) {
        try { booking = JSON.parse(Buffer.from(String(q.returnData), 'base64').toString('utf8')); }
        catch (e) { booking = {}; }
      }
      if (booking && booking.email && booking.summary) {
        if (!booking.orderNumber) booking.orderNumber = order;
        const m = String(booking.total || '').match(/[\d.]+/);
        if (m) amount = m[0];

        // ---- Verificación real: capturar el cobro con Tilopay (servidor a servidor) ----
        captured = amount ? await captureNow(booking.orderNumber, amount) : false;

        if (captured) {
          await sendReservation(booking, true);
        }
        // Si NO se pudo capturar, no se envía ningún correo de "pago recibido" —
        // no hubo cobro real confirmado por Tilopay.
      }
    } catch (e) { /* no bloquear el regreso del cliente si algo falla acá */ }
  }

  const finalOk = authorized && captured;
  const to = 'https://travesiacr.online/gracias?ok=' + (finalOk ? '1' : '0')
    + (order ? '&o=' + encodeURIComponent(order) : '')
    + (amount ? '&v=' + encodeURIComponent(amount) : '');
  res.writeHead(302, { Location: to });
  res.end();
}
