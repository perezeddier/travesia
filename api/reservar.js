/* ==========================================================================
   Travesía Costa Rica — función serverless de RESERVA (solicitud sin pago)
   Recibe los datos del formulario y envía 2 correos (cliente + Eddie) vía Brevo.
   SIN datos de tarjeta. La lógica de correo vive en ./_mailer.js
   ========================================================================== */
import { sendReservation } from './_mailer.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'method' }); return; }
  if (!process.env.BREVO_API_KEY) { res.status(500).json({ ok: false, error: 'no-key' }); return; }
  try {
    const d = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    if (!d.name || !d.email || !d.summary) { res.status(400).json({ ok: false, error: 'missing' }); return; }
    await sendReservation(d, false);
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e && e.message || e) });
  }
}
