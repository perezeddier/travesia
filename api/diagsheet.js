/* Diagnóstico TEMPORAL de la hoja de Google — borrar después de usar.
   GET /api/diagsheet?d=1        → prueba el webhook y muestra qué responde.
   GET /api/diagsheet?d=1&row=…  → reenvía a la hoja una fila (JSON en base64).
   Sin datos personales en el código: la fila viaja solo en la petición. */
export default async function handler(req, res) {
  const q = req.query || {};
  if (String(q.d) !== '1') { res.status(404).end(); return; }
  const url = process.env.SHEETS_WEBHOOK_URL;
  const out = { tieneUrl: !!url, urlPathStart: url ? new URL(url).pathname.slice(0, 40) : null };
  if (url && String(q.get) === '1') {
    // GET al webhook: el código NUEVO responde {ok:true, servicio:'Travesia reservas'};
    // el viejo responde otra cosa. Así sabemos qué versión está publicada.
    try {
      const r = await fetch(url, { method: 'GET' });
      out.status = r.status;
      out.respuesta = (await r.text()).slice(0, 300);
    } catch (e) {
      out.error = String(e && e.message || e).slice(0, 300);
    }
    res.status(200).json(out);
    return;
  }
  if (url) {
    let payload = {
      estado: 'PRUEBA-DIAG', nombre: 'Fila de diagnostico (borrar)', ruta: 'diagnostico',
      orden: 'DIAG', notas: 'generada por /api/diagsheet',
    };
    if (q.row) {
      try { payload = JSON.parse(Buffer.from(String(q.row), 'base64').toString('utf8')); }
      catch (e) { res.status(400).json({ error: 'row invalido' }); return; }
    }
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      out.status = r.status;
      out.ok = r.ok;
      out.respuesta = (await r.text()).slice(0, 300);
    } catch (e) {
      out.error = String(e && e.message || e).slice(0, 300);
    }
  }
  res.status(200).json(out);
}
