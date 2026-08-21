/* ==========================================================================
   Travesía Costa Rica — correo automático "¿cómo estuvo tu viaje?"
   Corre solo, una vez al día (Vercel Cron, ver vercel.json), a las 9am CR.
   1) Le pregunta a la hoja de Google quién viajó AYER y ya pagó, y a quién
      no se le pidió reseña en los últimos 30 días.
   2) Le manda UN correo por cliente (si tiene varias reservas, solo uno).
   3) Avisa a la hoja que ya se le pidió, para no repetir.
   ========================================================================== */
import { sendReviewRequest } from './_mailer.js';

export default async function handler(req, res) {
  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) { res.status(200).json({ ok: true, sent: 0, note: 'sin hoja configurada' }); return; }

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getPendingReviews' }),
    });
    const j = await r.json().catch(() => ({}));
    const candidatos = (j && j.ok && Array.isArray(j.candidatos)) ? j.candidatos : [];

    let sent = 0;
    for (const c of candidatos) {
      if (!c.email) continue;
      try {
        await sendReviewRequest(c.nombre, c.email);
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'markReviewSent', email: c.email }),
        });
        sent++;
      } catch (e) { /* seguir con el siguiente cliente aunque uno falle */ }
    }
    res.status(200).json({ ok: true, sent, candidatos: candidatos.length });
  } catch (e) {
    res.status(200).json({ ok: false, error: String(e && e.message || e) });
  }
}
