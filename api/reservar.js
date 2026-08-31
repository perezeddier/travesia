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
    await sendReservation(d, false);
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e && e.message || e) });
  }
}
