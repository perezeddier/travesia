/* ==========================================================================
   Travesía Costa Rica — correo automático "¿cómo estuvo tu viaje?"
   Corre solo, una vez al día (Vercel Cron, ver vercel.json), a las 9am CR.

   Lógica: agrupa TODAS las reservas pagadas por correo del cliente. Si su
   viaje MÁS RECIENTE conocido ya pasó (entre 1 y 7 días atrás, o sea que no
   tiene otro viaje programado después todavía) y no se le pidió reseña en
   los últimos 30 días, le manda UN correo. Si tiene un viaje futuro, espera.

   VENTANA DE 7 DÍAS (antes era solo "ayer"): en el plan gratuito Vercel no
   garantiza la hora exacta del cron, así que si un día se salta la corrida,
   con "exactamente ayer" ese cliente se perdía PARA SIEMPRE. Con 7 días el
   sistema se recupera solo en la siguiente pasada.

   GARANTÍA DE UN SOLO CORREO: se MARCA PRIMERO y se manda después. Si la
   marca falla, no se manda nada. Preferimos no pedir la reseña antes que
   pedirla dos veces. Y la marca dura 30 días, así que dentro de la ventana
   de 7 días el cliente solo puede entrar una vez.
   ========================================================================== */
import { sendReviewRequest } from './_mailer.js';

function fechaMenosNDias(n) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

// La hoja normalmente devuelve "2026-08-31", pero filas viejas traen otros
// formatos. Se normaliza a YYYY-MM-DD para que la comparación no falle en
// silencio (que era el riesgo: sin error, sin correo, sin que nadie se entere).
function normFecha(v) {
  const s = String(v == null ? '' : v).trim();
  if (!s) return '';
  const iso = s.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return iso[0];
  const t = Date.parse(s);
  if (!isNaN(t)) return new Date(t).toISOString().slice(0, 10);
  return '';
}

// Marca al cliente como "ya se le pidió reseña". Devuelve true solo si la
// hoja confirmó el guardado — de eso depende que se mande o no el correo.
async function marcarEnviado(url, email) {
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'markReviewSent', email }),
    });
    if (!r.ok) return false;
    const j = await r.json().catch(() => ({}));
    return j && j.ok !== false;   // si la hoja no dice nada, un 200 basta
  } catch (e) { return false; }
}

export default async function handler(req, res) {
  // Solo el cron de Vercel puede disparar esto: cuando existe la env var CRON_SECRET,
  // Vercel la manda como "Authorization: Bearer <CRON_SECRET>" en cada ejecución
  // programada; cualquier otra llamada sin esa llave se rechaza. (Si la env var
  // no está configurada aún, se comporta como antes para no romper el cron.)
  if (process.env.CRON_SECRET && req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    res.status(401).json({ ok: false, error: 'unauthorized' }); return;
  }
  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) { res.status(200).json({ ok: true, sent: 0, note: 'sin hoja configurada' }); return; }

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getAllPaid' }),
    });
    const j = await r.json().catch(() => ({}));
    const reservas = (j && j.ok && Array.isArray(j.reservas)) ? j.reservas : [];

    const desde = fechaMenosNDias(7);   // el viaje no puede ser más viejo que esto
    const hasta = fechaMenosNDias(1);   // ni más nuevo que ayer (si viaja hoy o mañana, se espera)
    const hace30 = fechaMenosNDias(30);

    // Agrupar por correo: la fecha de viaje MÁS RECIENTE de cada cliente,
    // y si ya se le pidió reseña dentro de los últimos 30 días.
    const porEmail = {};
    for (const it of reservas) {
      if (!it.email) continue;
      const f = normFecha(it.fecha);
      const cur = porEmail[it.email] || { nombre: it.nombre, maxFecha: '', pedidoReciente: false };
      if (f && f > cur.maxFecha) { cur.maxFecha = f; cur.nombre = it.nombre; }
      const rev = normFecha(it.reviewEnviado);
      if (rev && rev >= hace30) cur.pedidoReciente = true;
      porEmail[it.email] = cur;
    }

    let sent = 0, candidatos = 0, sinMarcar = 0, fallidos = 0;
    for (const email in porEmail) {
      const info = porEmail[email];
      // Su ÚLTIMO viaje conocido ya pasó (1 a 7 días atrás) y no tiene uno más nuevo programado
      if (info.maxFecha && info.maxFecha <= hasta && info.maxFecha >= desde && !info.pedidoReciente) {
        candidatos++;
        // 1) MARCAR PRIMERO. Si la hoja no confirma, no se manda nada:
        //    mejor no pedir la reseña que arriesgarse a pedirla dos veces.
        if (!(await marcarEnviado(url, email))) { sinMarcar++; continue; }
        // 2) Ya con el turno reservado, mandar el correo.
        try { await sendReviewRequest(info.nombre, email); sent++; }
        catch (e) { fallidos++; }
      }
    }
    res.status(200).json({ ok: true, sent, candidatos, sinMarcar, fallidos, ventana: desde + '..' + hasta });
  } catch (e) {
    res.status(200).json({ ok: false, error: String(e && e.message || e) });
  }
}
