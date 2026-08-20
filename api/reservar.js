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
function row(label, value) {
  if (!value) return '';
  return `<tr>
    <td style="padding:6px 12px 6px 0;color:#6b7280;font-size:13px;white-space:nowrap;vertical-align:top">${esc(label)}</td>
    <td style="padding:6px 0;color:#111827;font-size:14px;font-weight:600">${esc(value)}</td>
  </tr>`;
}

function shell(title, bodyHtml) {
  return `<!doctype html><html><body style="margin:0;background:#f3f4f6;font-family:Segoe UI,Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px">
    <div style="background:#0d0f12;border-radius:16px 16px 0 0;padding:22px 24px">
      <div style="color:#ff9e4d;font-weight:800;font-size:20px">Travesía <span style="color:#fff">Costa Rica</span></div>
      <div style="color:#9aa4b2;font-size:12px;letter-spacing:1px;text-transform:uppercase;margin-top:2px">Private Shuttles &amp; Transfers</div>
    </div>
    <div style="background:#fff;border-radius:0 0 16px 16px;padding:24px;border:1px solid #e5e7eb;border-top:none">
      <h1 style="font-size:19px;margin:0 0 14px;color:#111827">${title}</h1>
      ${bodyHtml}
    </div>
    <p style="text-align:center;color:#9ca3af;font-size:12px;margin:16px 0 0">
      Travesía Costa Rica · La Fortuna · WhatsApp +506 8502 8476<br>travesiacr.online
    </p>
  </div></body></html>`;
}

function clientEmail(d, lang) {
  const en = lang !== 'es';
  const t = en ? {
    subj: 'We received your booking request — Travesía Costa Rica',
    title: 'Thank you! We received your request 🚐',
    intro: `Hi ${esc(d.name || '')}, thank you for choosing Travesía. We have received your trip request and <b>our team will confirm availability and the final details shortly</b> by email or WhatsApp.`,
    details: 'Your trip', wa: 'Message us on WhatsApp', note: 'This is a request, not a final confirmation. We will contact you shortly to confirm.'
  } : {
    subj: 'Recibimos tu solicitud de reserva — Travesía Costa Rica',
    title: '¡Gracias! Recibimos tu solicitud 🚐',
    intro: `Hola ${esc(d.name || '')}, gracias por elegir Travesía. Recibimos tu solicitud de viaje y <b>nuestro equipo te confirmará disponibilidad y los detalles finales en breve</b> por correo o WhatsApp.`,
    details: 'Tu viaje', wa: 'Escríbenos por WhatsApp', note: 'Esta es una solicitud, no una confirmación final. Te contactaremos en breve para confirmar.'
  };
  const body = `
    <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 16px">${t.intro}</p>
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:14px 16px;margin:0 0 16px">
      <div style="font-size:12px;font-weight:700;color:#e07b1f;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">${t.details}</div>
      <table style="width:100%;border-collapse:collapse">
        ${row(en ? 'Route' : 'Ruta', d.summary)}
        ${row(en ? 'Date' : 'Fecha', d.date)}
        ${row(en ? 'Time' : 'Hora', d.time)}
        ${row(en ? 'Passengers' : 'Pasajeros', d.pax)}
        ${row(en ? 'Pickup' : 'Recogida', d.pickup)}
        ${row(en ? 'Flight' : 'Vuelo', d.flight)}
        ${row(en ? 'Service' : 'Servicio', d.tier)}
        ${row('Total', d.total)}
      </table>
    </div>
    <a href="https://wa.me/${WA}" style="display:inline-block;background:#25d366;color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:10px;font-size:14px">${t.wa}</a>
    <p style="color:#9ca3af;font-size:12px;line-height:1.5;margin:16px 0 0">${t.note}</p>`;
  return { subject: t.subj, html: shell(t.title, body) };
}

function ownerEmail(d) {
  const body = `
    <p style="color:#374151;font-size:14px;margin:0 0 16px">Entró una <b>nueva solicitud de reserva</b> desde el sitio web:</p>
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:14px 16px;margin:0 0 16px">
      <table style="width:100%;border-collapse:collapse">
        ${row('Cliente', d.name)}
        ${row('Email', d.email)}
        ${row('Teléfono', d.phone)}
        ${row('Ruta', d.summary)}
        ${row('Fecha', d.date)}
        ${row('Hora', d.time)}
        ${row('Pasajeros', d.pax)}
        ${row('Recogida', d.pickup)}
        ${row('Vuelo', d.flight)}
        ${row('Servicio', d.tier)}
        ${row('Total', d.total)}
        ${row('Notas', d.notes)}
      </table>
    </div>
    ${d.phone ? `<a href="https://wa.me/${esc(String(d.phone).replace(/[^0-9]/g, ''))}" style="display:inline-block;background:#25d366;color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:10px;font-size:14px">Escribir al cliente por WhatsApp</a>` : ''}`;
  return { subject: `🚐 Nueva reserva: ${d.name || 'cliente'} — ${d.summary || ''}`, html: shell('Nueva reserva entrante', body) };
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
