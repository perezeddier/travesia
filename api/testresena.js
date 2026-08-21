/* Prueba TEMPORAL — envía el correo de reseña una vez, se borra después. */
import { sendReviewRequest } from './_mailer.js';
export default async function handler(req, res) {
  try {
    await sendReviewRequest('Eddie', 'perezeddier@gmail.com');
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(200).json({ ok: false, error: String(e && e.message || e) });
  }
}
