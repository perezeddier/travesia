/* Diagnóstico TEMPORAL de la hoja de Google — borrar después de usar.
   GET /api/diagsheet?d=1  → prueba el webhook de Sheets y muestra qué responde. */
export default async function handler(req, res) {
  if (String((req.query || {}).d) !== '1') { res.status(404).end(); return; }
  const url = process.env.SHEETS_WEBHOOK_URL;
  const out = { tieneUrl: !!url, urlPathStart: url ? new URL(url).pathname.slice(0, 26) : null };
  if (url) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado: 'PRUEBA-DIAG', nombre: 'Fila de diagnostico (borrar)', email: '', telefono: '',
          ruta: 'diagnostico', fecha: '', hora: '', pax: '', recogida: '', destino: '',
          itinerario: '', vuelo: '', servicio: '', total: '', orden: 'DIAG', notas: 'generada por /api/diagsheet',
        }),
      });
      out.status = r.status;
      out.ok = r.ok;
      const txt = await r.text();
      out.respuesta = txt.slice(0, 400);
    } catch (e) {
      out.error = String(e && e.message || e).slice(0, 300);
    }
  }
  res.status(200).json(out);
}
