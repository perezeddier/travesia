/* ==========================================================================
   Travesía Costa Rica — módulo de correo (Brevo). SIN datos de tarjeta.
   Lo usan /api/reservar (solicitud) y /api/retorno (pago aprobado).
   Env vars: BREVO_API_KEY, OWNER_EMAIL (opcional).
   ========================================================================== */

const FROM_NAME = 'Travesía Costa Rica';
const FROM_EMAIL = 'reservas@travesiacr.online';
const OWNER = process.env.OWNER_EMAIL || 'infotravesiacr@gmail.com';
const WA = '50685028476';

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// fila apilada (mobile-safe, SIN emojis): etiqueta gris arriba, valor abajo
function irow(label, value) {
  if (!value) return '';
  return `<tr><td style="padding:10px 0;border-bottom:1px solid #eef1f5">
    <div style="color:#98a1af;font-size:11px;text-transform:uppercase;letter-spacing:.6px;font-weight:600;margin-bottom:3px">${esc(label)}</div>
    <div style="color:#1a1d23;font-size:15px;font-weight:600;line-height:1.35;word-break:break-word">${esc(value)}</div>
  </td></tr>`;
}

function routeCard(label, route) {
  const clean = String(route || '').replace(/\s*(→|->|›|»|⟶|—|–|=>)\s*/g, ' - ');
  return `<div style="background:#fff8f1;border:1px solid #f6d9b8;border-radius:12px;padding:15px 16px;margin:0 0 16px;text-align:center">
    <div style="font-size:11px;color:#b06a1a;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:4px">${esc(label)}</div>
    <div style="font-size:17px;font-weight:800;color:#1a1d23;line-height:1.3">${esc(clean)}</div>
  </div>`;
}

function waBtn(phone, text, msg) {
  const num = String(phone || '').replace(/[^0-9]/g, '');
  if (!num) return '';
  const q = msg ? '?text=' + encodeURIComponent(msg) : '';
  return `<table role="presentation" width="100%" style="border-collapse:collapse;margin:2px 0 4px"><tr><td style="border-radius:10px;background:#25d366;text-align:center">
    <a href="https://wa.me/${num}${q}" style="display:block;color:#fff;text-decoration:none;font-weight:700;padding:14px 18px;font-size:15px;border-radius:10px">${esc(text)}</a>
  </td></tr></table>`;
}

function linkBtn(url, text, bg, fg) {
  return `<table role="presentation" width="100%" style="border-collapse:collapse;margin:2px 0 10px"><tr><td style="border-radius:10px;background:${bg}"><a href="${url}" style="display:block;color:${fg};text-decoration:none;font-weight:700;padding:13px 18px;font-size:14px;border-radius:10px;text-align:center">${esc(text)}</a></td></tr></table>`;
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
        5.0 en Google · TripAdvisor Travelers' Choice 2025
      </div>
    </div>
  </div></body></html>`;
}

// paid=true → correo de "pago recibido"; paid=false → "solicitud recibida"
function clientEmail(d, lang, paid) {
  const en = lang !== 'es';
  const t = en ? {
    subj: paid ? 'Payment received — your Travesía booking is confirmed' : 'We received your booking request — Travesía Costa Rica',
    badge: paid ? 'Payment received' : 'Request received',
    hi: `Thank you, ${esc(d.name || '')}!`,
    intro: paid ? 'Your payment was received and your private transfer is confirmed. Here are your trip details:' : 'We received your trip request. Our team will confirm availability and the final details with you shortly.',
    route: 'Your route', wa: 'Message us on WhatsApp',
    L: { date: 'Date', time: 'Time', pax: 'Passengers', pickup: 'Pickup', flight: 'Flight', service: 'Service', price: paid ? 'Paid' : 'Price' },
    note: paid ? 'We will track your flight and be there on time. Any change? Message us on WhatsApp.' : 'This is a request, not a final confirmation. We will contact you shortly to confirm your trip.'
  } : {
    subj: paid ? 'Pago recibido — tu reserva con Travesía está confirmada' : 'Recibimos tu solicitud de reserva — Travesía Costa Rica',
    badge: paid ? 'Pago recibido' : 'Solicitud recibida',
    hi: `¡Gracias, ${esc(d.name || '')}!`,
    intro: paid ? 'Recibimos tu pago y tu traslado privado quedó confirmado. Estos son los detalles de tu viaje:' : 'Recibimos tu solicitud de viaje. Nuestro equipo te confirmará la disponibilidad y los detalles finales en breve.',
    route: 'Tu ruta', wa: 'Escríbenos por WhatsApp',
    L: { date: 'Fecha', time: 'Hora', pax: 'Pasajeros', pickup: 'Recogida', flight: 'Vuelo', service: 'Servicio', price: paid ? 'Pagado' : 'Precio' },
    note: paid ? 'Monitoreamos tu vuelo y estaremos a tiempo. ¿Algún cambio? Escríbenos por WhatsApp.' : 'Esta es una solicitud, no una confirmación final. Te contactaremos en breve para confirmar tu viaje.'
  };
  const body = `
    <div style="display:inline-block;background:#e8f9ef;color:#0f9d58;font-size:12px;font-weight:700;padding:5px 12px;border-radius:999px;margin-bottom:14px">${t.badge}</div>
    <h1 style="font-size:21px;margin:0 0 8px;color:#1a1d23">${t.hi}</h1>
    <p style="color:#4b5563;font-size:14px;line-height:1.6;margin:0 0 18px">${t.intro}</p>
    ${routeCard(t.route, d.summary)}
    <table style="width:100%;border-collapse:collapse;margin:0 0 18px">
      ${irow(t.L.date, d.date)}
      ${irow(t.L.time, d.time)}
      ${irow(t.L.pax, d.pax)}
      ${irow(t.L.pickup, d.pickup)}
      ${irow(t.L.flight, d.flight)}
      ${irow(t.L.service, d.tier)}
      ${irow(t.L.price, d.total)}
    </table>
    ${waBtn(WA, t.wa, en
      ? `Hi Travesía, I'm ${d.name || ''}. About my booking: ${d.summary || ''}${d.date ? ' on ' + d.date : ''}.`
      : `Hola Travesía, soy ${d.name || ''}. Sobre mi reserva: ${d.summary || ''}${d.date ? ' el ' + d.date : ''}.`)}
    <p style="color:#9ca3af;font-size:12px;line-height:1.5;margin:14px 0 0">${t.note}</p>`;
  return { subject: t.subj, html: shell(body, t.intro) };
}

function ownerEmail(d, paid) {
  const tag = paid ? 'Reserva PAGADA' : 'Nueva reserva';
  const tagBg = paid ? '#e8f9ef' : '#fff1e3';
  const tagColor = paid ? '#0f9d58' : '#c9721c';
  const body = `
    <div style="display:inline-block;background:${tagBg};color:${tagColor};font-size:12px;font-weight:700;padding:5px 12px;border-radius:999px;margin-bottom:12px">${tag}</div>
    <h1 style="font-size:21px;margin:0 0 4px;color:#1a1d23">${esc(d.name || 'Cliente')}</h1>
    <p style="color:#8a94a3;font-size:13px;margin:0 0 16px">${paid ? 'El cliente pagó en línea. Confirmá el pago en tu panel de Tilopay.' : 'Entró una nueva solicitud desde el sitio web.'}</p>
    ${routeCard('Ruta', d.summary)}
    <table style="width:100%;border-collapse:collapse;margin:0 0 18px">
      ${irow('Teléfono', d.phone)}
      ${irow('Email', d.email)}
      ${irow('Fecha', d.date)}
      ${irow('Hora', d.time)}
      ${irow('Pasajeros', d.pax)}
      ${irow('Recogida', d.pickup)}
      ${irow('Vuelo', d.flight)}
      ${irow('Servicio', d.tier)}
      ${irow(paid ? 'Pagado' : 'Total', d.total)}
      ${irow('Orden', d.orderNumber)}
      ${irow('Notas', d.notes)}
    </table>
    ${waBtn(d.phone, 'Escribir al cliente por WhatsApp', d.lang !== 'es'
      ? `Hi ${d.name || ''}, thank you for booking with Travesía Costa Rica! About your trip ${d.summary || ''}${d.date ? ' on ' + d.date : ''} — I'd love to confirm the details with you.`
      : `Hola ${d.name || ''}, ¡gracias por reservar con Travesía Costa Rica! Sobre tu viaje ${d.summary || ''}${d.date ? ' el ' + d.date : ''}, me encantaría confirmar los detalles con vos.`)}`;
  return { subject: `${tag}: ${d.name || 'cliente'} - ${d.summary || ''}`, html: shell(body, `${d.name || ''} - ${d.summary || ''}`) };
}

// Correo "¿cómo estuvo tu viaje?" pidiendo reseña — bilingüe (no sabemos el idioma
// del cliente en este punto), con Google como link principal y TripAdvisor como extra.
const GOOGLE_REVIEW_URL = 'https://g.page/r/CXQCAbYUe76nEBM/review';
const TRIPADVISOR_REVIEW_URL = 'https://www.tripadvisor.es/Attraction_Review-g309226-d26527142-Reviews-Travesia_Costa_Rica-La_Fortuna_de_San_Carlos_Arenal_Volcano_National_Park_Provin.html';

function reviewEmail(nombre) {
  const body = `
    <h1 style="font-size:20px;margin:0 0 8px;color:#1a1d23">Thank you, ${esc(nombre || '')}!</h1>
    <p style="color:#4b5563;font-size:14px;line-height:1.6;margin:0 0 16px">We hope you had a great time in Costa Rica! If you enjoyed your ride with us, a quick review helps other travelers find Travesía — it only takes a minute.</p>
    ${linkBtn(GOOGLE_REVIEW_URL, 'Leave a Google review', '#e07b1f', '#241c05')}
    <p style="color:#9ca3af;font-size:12px;margin:0 0 26px">Also on TripAdvisor? <a href="${TRIPADVISOR_REVIEW_URL}" style="color:#e07b1f">Leave a review there too</a>.</p>
    <hr style="border:none;border-top:1px solid #eef1f5;margin:0 0 22px">
    <h1 style="font-size:20px;margin:0 0 8px;color:#1a1d23">¡Gracias, ${esc(nombre || '')}!</h1>
    <p style="color:#4b5563;font-size:14px;line-height:1.6;margin:0 0 16px">¡Esperamos que hayas disfrutado tu viaje por Costa Rica! Si te gustó tu traslado con nosotros, una reseña rapidita ayuda a que más viajeros nos encuentren — toma solo un minuto.</p>
    ${linkBtn(GOOGLE_REVIEW_URL, 'Dejar una reseña en Google', '#e07b1f', '#241c05')}
    <p style="color:#9ca3af;font-size:12px;margin:0">¿También usás TripAdvisor? <a href="${TRIPADVISOR_REVIEW_URL}" style="color:#e07b1f">Dejanos una reseña ahí también</a>.</p>`;
  return { subject: 'How was your trip? / ¿Cómo estuvo tu viaje? — Travesía Costa Rica', html: shell(body, 'Gracias por viajar con Travesía') };
}

export async function sendReviewRequest(nombre, email) {
  if (!process.env.BREVO_API_KEY) throw new Error('no-brevo-key');
  const r = reviewEmail(nombre);
  await sendEmail(email, r.subject, r.html);
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

// Guarda la reserva en la hoja de Google (si está configurada). No rompe si falla.
async function logToSheet(d, paid) {
  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        estado: paid ? 'Pagado' : 'Solicitud',
        nombre: d.name || '', email: d.email || '', telefono: d.phone || '',
        ruta: d.summary || '', fecha: d.date || '', hora: d.time || '', pax: d.pax || '',
        recogida: d.pickup || '', vuelo: d.flight || '', servicio: d.tier || '',
        total: d.total || '', orden: d.orderNumber || '', notas: d.notes || '',
      }),
    });
  } catch (e) { /* la hoja es un extra: si falla, no afecta correo ni pago */ }
}

// Envía los 2 correos (cliente + Eddie) y guarda en la hoja. paid=true = pago confirmado.
export async function sendReservation(d, paid) {
  if (!process.env.BREVO_API_KEY) throw new Error('no-brevo-key');
  const lang = d.lang === 'es' ? 'es' : 'en';
  const c = clientEmail(d, lang, !!paid);
  await sendEmail(d.email, c.subject, c.html, OWNER);
  const o = ownerEmail(d, !!paid);
  await sendEmail(OWNER, o.subject, o.html, d.email);
  await logToSheet(d, !!paid);
}
