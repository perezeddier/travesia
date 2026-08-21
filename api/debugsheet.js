/* Diagnóstico TEMPORAL — se borra después de usarlo. Reenvía cualquier acción a la hoja. */
export default async function handler(req, res) {
  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) { res.status(200).json({ hasUrl: false }); return; }
  try {
    const body = req.method === 'POST'
      ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {}))
      : JSON.stringify({});
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
    const text = await r.text();
    res.status(200).json({ status: r.status, body: text.slice(0, 2000) });
  } catch (e) {
    res.status(200).json({ error: String(e && e.message || e) });
  }
}
