/* ==========================================================================
   Travesía Costa Rica — función serverless de RESERVA (solicitud sin pago)
   Recibe los datos del formulario y envía 2 correos (cliente + Eddie) vía Brevo.
   SIN datos de tarjeta. La lógica de correo vive en ./_mailer.js
   ========================================================================== */
import { sendReservation, sendOwnerTicket } from './_mailer.js';
import { rateLimited } from './_ratelimit.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'method' }); return; }
  // Anti-spam: máx. 5 solicitudes por IP cada 15 min (cada una envía 2 correos)
  if (rateLimited(req, { max: 5, windowMs: 15 * 60 * 1000, key: 'reservar' })) {
    res.status(429).json({ ok: false, error: 'rate' }); return;
  }
  if (!process.env.BREVO_API_KEY) { res.status(500).json({ ok: false, error: 'no-key' }); return; }
  try {
    const d = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    if (!d.name || !d.email || !d.summary) { res.status(400).json({ ok: false, error: 'missing' }); return; }
    // Reenvío interno del tiquete (solo con la llave secreta del servidor):
    // manda ÚNICAMENTE el correo a Eddie, sin correo al cliente y sin agregar fila a la hoja.
    if (d.resendTicket === true) {
      if (!process.env.CRON_SECRET || (req.headers.authorization || '') !== 'Bearer ' + process.env.CRON_SECRET) {
        res.status(401).json({ ok: false, error: 'auth' }); return;
      }
      await sendOwnerTicket(d, d.paid === true);
      res.status(200).json({ ok: true, resent: true });
      return;
    }
    // Todo con largo máximo (antes se aceptaba cualquier tamaño y podía romper la hoja).
    const s = (v, n) => String(v == null ? '' : v).slice(0, n);
    const legs = (Array.isArray(d.legs) ? d.legs : []).slice(0, 10)
      .filter(l => l && typeof l === 'object')
      .map(l => ({
        from: s(l.from, 120), to: s(l.to, 120), vname: s(l.vname, 40), vip: !!l.vip,
        x4: !!l.x4, x4hotel: s(l.x4hotel, 80), price: Number(l.price) || 0,
        date: s(l.date, 20), time: s(l.time, 20), pickup: s(l.pickup, 120), dropoff: s(l.dropoff, 120), flight: s(l.flight, 60),
      }));
    const limpio = {
      name: s(d.name, 120), email: s(d.email, 160), phone: s(d.phone, 40), summary: s(d.summary, 600),
      date: s(d.date, 20), time: s(d.time, 20), pax: s(d.pax, 60), pickup: s(d.pickup, 120), dropoff: s(d.dropoff, 120),
      flight: s(d.flight, 60), tier: s(d.tier, 60), total: s(d.total, 20), notes: s(d.notes, 1000), seats: s(d.seats, 120),
      itinerary: s(d.itinerary, 3000), legs, lang: d.lang === 'es' ? 'es' : 'en', country: s(d.country, 8),
      origen: d.origen && typeof d.origen === 'object' ? d.origen : null, dispositivo: s(d.dispositivo, 20),
      paisVisita: s(req.headers['x-vercel-ip-country'], 2),   // lo dice Vercel, no el cliente
      // SIN orderNumber: una solicitud pública nunca trae número de orden (la hoja
      // actualiza la fila que tenga ese número; aceptarlo dejaría pisar reservas reales).
    };
    // soloEddie: esta es una solicitud SIN pago que cualquiera puede mandar. Si también
    // le escribiéramos al correo del formulario, alguien podría usar el sitio para mandar
    // correos con nuestro nombre a quien quisiera. El cliente ya queda en WhatsApp.
    await sendReservation(limpio, false, { soloEddie: true });
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e && e.message || e) });
  }
}
