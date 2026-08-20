/* ==========================================================================
   Travesía Costa Rica — función serverless de RESERVA
   Recibe los datos del formulario de reserva y envía 2 correos vía Resend:
     1) Confirmación al CLIENTE (su reserva)
     2) Aviso a EDDIE (nueva reserva entrante)
   Corre en Vercel (Node). Envía por el API de Brevo (funciona con DNS de Wix,
   solo necesita registros TXT). Las llaves van en Variables de Entorno de
   Vercel, NUNCA en el código:
     - BREVO_API_KEY    → llave del API de Brevo
     - OWNER_EMAIL      → correo donde Eddie recibe los avisos (opcional)
   ========================================================================== */

const FROM_NAME = 'Travesía Costa Rica';
const FROM_EMAIL = 'reservas@travesiacr.online';
const OWNER = process.env.OWNER_EMAIL || 'infotravesiacr@gmail.com';
const WA = '50685028476';

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

/* --------- plantillas de correo --------- */
// fila con icono: 📅 | etiqueta | valor
function irow(icon, label, value) {
  if (!value) return '';
  return `<tr>
    <td style="padding:9px 0;border-bottom:1px solid #eef1f5;width:24px;font-size:15px;vertical-align:top">${icon}</td>
    <td style="padding:9px 10px;border-bottom:1px solid #eef1f5;color:#8a94a3;font-size:13px;vertical-align:top;white-space:nowrap">${esc(label)}</td>
    <td style="padding:9px 0;border-bottom:1px solid #eef1f5;color:#1a1d23;font-size:14px;font-weight:600;text-align:right">${esc(value)}</td>
  </tr>`;
}

function routeCard(label, route) {
  return `<div style="background:#fff8f1;border:1px solid #f6d9b8;border-radius:12px;padding:15px 16px;margin:0 0 16px;text-align:center">
    <div style="font-size:11px;color:#b06a1a;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:4px">${esc(label)}</div>
    <div style="font-size:17px;font-weight:800;color:#1a1d23;line-height:1.3">${esc(route || '')}</div>
  </div>`;
}

function waBtn(phone, text) {
  const num = String(phone || '').replace(/[^0-9]/g, '');
  if (!num) return '';
  return `<table role="presentation" style="border-collapse:collapse;margin:2px 0 4px"><tr><td style="border-radius:10px;background:#25d366">
    <a href="https://wa.me/${num}" style="display:inline-block;color:#fff;text-decoration:none;font-weight:700;padding:13px 22px;font-size:14px;border-radius:10px">💬 ${esc(text)}</a>
  </td></tr></table>`;
}

function shell(bodyHtml, preheader) {
  return `<!doctype html><html><body style="margin:0;background:#eef1f5;font-family:'Segoe UI',Arial,sans-serif;color:#1a1d23">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader || '')}</div>
  <div style="max-width:560px;margin:0 auto;padding:20px 14px">
    <div style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e6e9ee">
      <div style="text-align:center;padding:26px 24px 12px">
        <img src="https://travesiacr.online/assets/logo-travesia.png" alt="Travesía Costa Rica" width="118" style="width:118px;max-width:60%;height:auto;display:inline-block">
        <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#e07b1f;font-weight:700;margin-top:8px">Private Shuttles &amp; Transfers</div>
      </div>
      <div style="height:4px;background:linear-gradient(90deg,#e07b1f,#ff9e4d)"></div>
      <div style="padding:24px">${bodyHtml}</div>
      <div style="background:#f6f8fa;border-top:1px solid #e6e9ee;padding:18px 24px;text-align:center;color:#8a94a3;font-size:12px;line-height:1.7">
        <b style="color:#5a6472">Travesía Costa Rica</b> · La Fortuna, Arenal<br>
        WhatsApp +506 8502 8476 · <a href="https://travesiacr.online" style="color:#e07b1f;text-decoration:none">travesiacr.online</a><br>
        ★ 5.0 Google · TripAdvisor Travelers' Choice 2025
      </div>
    </div>
  </div></body></html>`;
}

function clientEmail(d, lang) {
  const en = lang !== 'es';
  const t = en ? {
    subj: 'We received your booking request — Travesía Costa Rica',
    badge: '✓ Request received', hi: `Thank you, ${esc(d.name || '')}!`,
    intro: 'We received your trip request. Our team will confirm availability and the final details with you shortly.',
    route: 'Your route', wa: 'Message us on WhatsApp',
    L: { date: 'Date', time: 'Time', pax: 'Passengers', pickup: 'Pickup', flight: 'Flight', service: 'Service', price: 'Price' },
    note: 'This is a request, not a final confirmation. We will contact you shortly to confirm your trip.'
  } : {
    subj: 'Recibimos tu solicitud de reserva — Travesía Costa Rica',
    badge: '✓ Solicitud recibida', hi: `¡Gracias, ${esc(d.name || '')}!`,
    intro: 'Recibimos tu solicitud de viaje. Nuestro equipo te confirmará la disponibilidad y los detalles finales en breve.',
    route: 'Tu ruta', wa: 'Escríbenos por WhatsApp',
    L: { date: 'Fecha', time: 'Hora', pax: 'Pasajeros', pickup: 'Recogida', flight: 'Vuelo', service: 'Servicio', price: 'Precio' },
    note: 'Esta es una solicitud, no una confirmación final. Te contactaremos en breve para confirmar tu viaje.'
  };
  const body = `
    <div style="display:inline-block;background:#e8f9ef;color:#0f9d58;font-size:12px;font-weight:700;padding:5px 12px;border-radius:999px;margin-bottom:14px">${t.badge}</div>
    <h1 style="font-size:21px;margin:0 0 8px;color:#1a1d23">${t.hi}</h1>
    <p style="color:#4b5563;font-size:14px;line-height:1.6;margin:0 0 18px">${t.intro}</p>
    ${routeCard(t.route, d.summary)}
    <table style="width:100%;border-collapse:collapse;margin:0 0 18px">
      ${irow('📅', t.L.date, d.date)}
      ${irow('🕐', t.L.time, d.time)}
      ${irow('👥', t.L.pax, d.pax)}
      ${irow('📍', t.L.pickup, d.pickup)}
      ${irow('✈️', t.L.flight, d.flight)}
      ${irow('🚐', t.L.service, d.tier)}
      ${irow('💵', t.L.price, d.total)}
    </table>
    ${waBtn(WA, t.wa)}
    <p style="color:#9ca3af;font-size:12px;line-height:1.5;margin:14px 0 0">${t.note}</p>`;
  return { subject: t.subj, html: shell(body, t.intro) };
}

function ownerEmail(d) {
  const body = `
    <div style="display:inline-block;background:#fff1e3;color:#c9721c;font-size:12px;font-weight:700;padding:5px 12px;border-radius:999px;margin-bottom:12px">🚐 Nueva reserva</div>
    <h1 style="font-size:21px;margin:0 0 4px;color:#1a1d23">${esc(d.name || 'Cliente')}</h1>
    <p style="color:#8a94a3;font-size:13px;margin:0 0 16px">Entró una nueva solicitud desde el sitio web.</p>
    ${routeCard('Ruta', d.summary)}
    <table style="width:100%;border-collapse:collapse;margin:0 0 18px">
      ${irow('📞', 'Teléfono', d.phone)}
      ${irow('✉️', 'Email', d.email)}
      ${irow('📅', 'Fecha', d.date)}
      ${irow('🕐', 'Hora', d.time)}
      ${irow('👥', 'Pasajeros', d.pax)}
      ${irow('📍', 'Recogida', d.pickup)}
      ${irow('✈️', 'Vuelo', d.flight)}
      ${irow('🚐', 'Servicio', d.tier)}
      ${irow('💵', 'Total', d.total)}
      ${irow('📝', 'Notas', d.notes)}
    </table>
    ${waBtn(d.phone, 'Escribir al cliente por WhatsApp')}`;
  return { subject: `🚐 Nueva reserva: ${d.name || 'cliente'} — ${d.summary || ''}`, html: shell(body, `${d.name || ''} · ${d.summary || ''}`) };
}

async function sendEmail(to, subject, html, replyTo) {
  const payload = {
    sender: { name: FROM_NAME, email: FROM_EMAIL },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  };
  if (replyTo) payload.replyTo = { email: replyTo };
  const r = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
      'accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error('Brevo ' + r.status + ' ' + (await r.text()));
  return r.json();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'method' }); return; }
  if (!process.env.BREVO_API_KEY) { res.status(500).json({ ok: false, error: 'no-key' }); return; }
  try {
    const d = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    // validación mínima
    if (!d.name || !d.email || !d.summary) { res.status(400).json({ ok: false, error: 'missing' }); return; }
    const lang = d.lang === 'es' ? 'es' : 'en';

    // 1) correo al cliente
    const c = clientEmail(d, lang);
    await sendEmail(d.email, c.subject, c.html, OWNER);
    // 2) aviso a Eddie (responder va directo al cliente)
    const o = ownerEmail(d);
    await sendEmail(OWNER, o.subject, o.html, d.email);

    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e && e.message || e) });
  }
}
