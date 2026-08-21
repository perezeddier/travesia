/* Diagnóstico TEMPORAL — se borra después de usarlo. */
export default async function handler(req, res) {
  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) { res.status(200).json({ hasUrl: false }); return; }
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'nextOrder' }),
    });
    const text = await r.text();
    res.status(200).json({ hasUrl: true, urlHost: new URL(url).host, status: r.status, body: text.slice(0, 500) });
  } catch (e) {
    res.status(200).json({ hasUrl: true, error: String(e && e.message || e) });
  }
}
