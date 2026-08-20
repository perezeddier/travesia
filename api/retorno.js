/* ==========================================================================
   Travesía Costa Rica — retorno de Tilopay tras el pago (GET)
   Tilopay redirige aquí al cliente con: ?code=1 (aprobado) & returnData=... etc.
   Si aprobado -> envía los correos (cliente + Eddie) y lleva a /gracias?ok=1.
   Si no       -> /gracias?ok=0.
   NOTA seguridad: los parámetros del redirect son manipulables por el usuario;
   por eso el correo a Eddie dice "confirmá el pago en tu panel de Tilopay".
   Endurecer luego con OrderHash (instrucciones de sac@tilopay.com).
   ========================================================================== */
import { sendReservation } from './_mailer.js';

export default async function handler(req, res) {
  const q = req.query || {};
  const approved = String(q.code) === '1';
  const order = q.order || q.orderNumber || '';

  if (approved) {
    try {
      let booking = {};
      if (q.returnData) {
        try { booking = JSON.parse(Buffer.from(String(q.returnData), 'base64').toString('utf8')); }
        catch (e) { booking = {}; }
      }
      if (booking && booking.email && booking.summary) {
        if (q.auth) booking.orderNumber = booking.orderNumber || order;
        await sendReservation(booking, true);
      }
    } catch (e) { /* no bloquear el regreso del cliente si el correo falla */ }
  }

  const to = 'https://travesiacr.online/gracias?ok=' + (approved ? '1' : '0') + (order ? '&o=' + encodeURIComponent(order) : '');
  res.writeHead(302, { Location: to });
  res.end();
}
