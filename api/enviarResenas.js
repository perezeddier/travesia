/* ==========================================================================
   Travesía Costa Rica — correo automático "¿cómo estuvo tu viaje?"
   Corre solo, una vez al día (Vercel Cron, ver vercel.json), a las 9am CR.
   Lógica: agrupa TODAS las reservas pagadas por correo del cliente. Si su
   viaje MÁS RECIENTE conocido fue exactamente AYER (o sea, no tiene otro
   viaje programado después todavía), y no se le pidió reseña en los
   últimos 30 días, le manda UN correo. Si tiene un viaje futuro, espera.
   ========================================================================== */
import { sendReviewRequest } from './_mailer.js';

function fechaMenosNDias(n) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

export default async function handler(req, res) {
  // Solo el cron de Vercel puede disparar esto: cuando existe la env var CRON_SECRET,
  // Vercel la manda como "Authorization: Bearer <CRON_SECRET>" en cada ejecución
  // programada; cualquier otra llamada sin esa llave se rechaza. (Si la env var
  // no está configurada aún, se comporta como antes para no romper el cron.)
  if (process.env.CRON_SECRET && req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    res.status(401).json({ ok: false, error: 'unauthorized' }); return;
  }
  // DIAGNOSTICO TEMPORAL: indica solo SI existe la llave (true/false), nunca su valor
  if (req.query && req.query.diag === '1') {
    res.status(200).json({ ok: true, diag: { tieneCronSecret: !!process.env.CRON_SECRET, largo: (process.env.CRON_SECRET || '').length } });
    return;
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

    const ayer = fechaMenosNDias(1);
    const hace30 = fechaMenosNDias(30);

    // Agrupar por correo: quedarnos con la fecha de viaje MÁS RECIENTE de cada cliente,
    // y si ya se le pidió reseña dentro de los últimos 30 días.
    const porEmail = {};
    for (const it of reservas) {
      if (!it.email) continue;
      const cur = porEmail[it.email] || { nombre: it.nombre, maxFecha: '', pedidoReciente: false };
      if (it.fecha > cur.maxFecha) { cur.maxFecha = it.fecha; cur.nombre = it.nombre; }
      if (it.reviewEnviado && it.reviewEnviado >= hace30) cur.pedidoReciente = true;
      porEmail[it.email] = cur;
    }

    let sent = 0, candidatos = 0;
    for (const email in porEmail) {
      const info = porEmail[email];
      // Solo si su ÚLTIMO viaje conocido fue exactamente ayer (no tiene uno más nuevo programado)
      if (info.maxFecha === ayer && !info.pedidoReciente) {
        candidatos++;
        try {
          await sendReviewRequest(info.nombre, email);
          await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'markReviewSent', email }),
          });
          sent++;
        } catch (e) { /* seguir con el siguiente cliente aunque uno falle */ }
      }
    }
    res.status(200).json({ ok: true, sent, candidatos });
  } catch (e) {
    res.status(200).json({ ok: false, error: String(e && e.message || e) });
  }
}
