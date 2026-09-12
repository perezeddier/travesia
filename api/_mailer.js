/* ==========================================================================
   Travesía Costa Rica — módulo de correo (Brevo). SIN datos de tarjeta.
   Lo usan /api/reservar (solicitud) y /api/retorno (pago aprobado).
   Env vars: BREVO_API_KEY, OWNER_EMAIL (opcional).
   ========================================================================== */

const FROM_NAME = 'Travesía Costa Rica';
const FROM_EMAIL = 'reservas@travesiacr.online';
const OWNER = process.env.OWNER_EMAIL || 'infotravesiacr@gmail.com';
const WA = '50685028476';

// Convierte el teléfono del cliente a formato internacional para wa.me.
// El cliente escribe su número "local" (ej. 2022996558 US) — sin código de
// país WhatsApp no lo encuentra. Usamos el país de la tarjeta del checkout.
const DIAL = {
  US: '1', CA: '1', CR: '506', MX: '52', GB: '44', DE: '49', FR: '33', ES: '34',
  IT: '39', NL: '31', BE: '32', CH: '41', AT: '43', PT: '351', IE: '353',
  SE: '46', NO: '47', DK: '45', FI: '358', PL: '48', AU: '61', NZ: '64',
  BR: '55', AR: '54', CL: '56', CO: '57', PE: '51', EC: '593', PA: '507',
  GT: '502', SV: '503', HN: '504', NI: '505', DO: '1', IL: '972', JP: '81', IN: '91',
};
function waNumber(phone, country) {
  const raw = String(phone || '').trim();
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  if (raw.startsWith('+') || raw.startsWith('00')) return digits.replace(/^00/, '');
  const dial = DIAL[String(country || '').toUpperCase()] || '';
  if (dial && digits.startsWith(dial) && digits.length > 10) return digits;  // ya trae el código
  if (dial) return dial + digits;
  if (digits.length === 8) return '506' + digits;   // sin país: 8 dígitos = Costa Rica
  if (digits.length === 10) return '1' + digits;    // 10 dígitos = EE.UU./Canadá
  return digits;
}

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

// Cronograma multi-tramo (2+ servicios, cada uno con su fecha/hora/recogida propia)
function itineraryBlock(label, text) {
  if (!text) return '';
  const rows = String(text).split('\n').filter(Boolean).map(line =>
    `<div style="padding:9px 0;border-bottom:1px solid #eef1f5;color:#1a1d23;font-size:13.5px;line-height:1.5">${esc(line)}</div>`
  ).join('');
  return `<div style="margin:0 0 18px">
    <div style="font-size:11px;color:#98a1af;text-transform:uppercase;letter-spacing:.6px;font-weight:600;margin-bottom:4px">${esc(label)}</div>
    ${rows}
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
    L: { date: 'Date', time: 'Time', pax: 'Passengers', pickup: 'Pickup', dropoff: 'Drop-off', flight: 'Flight', service: 'Service', price: paid ? 'Paid' : 'Price' },
    note: paid ? 'We will track your flight and be there on time. Any change? Message us on WhatsApp.' : 'This is a request, not a final confirmation. We will contact you shortly to confirm your trip.'
  } : {
    subj: paid ? 'Pago recibido — tu reserva con Travesía está confirmada' : 'Recibimos tu solicitud de reserva — Travesía Costa Rica',
    badge: paid ? 'Pago recibido' : 'Solicitud recibida',
    hi: `¡Gracias, ${esc(d.name || '')}!`,
    intro: paid ? 'Recibimos tu pago y tu traslado privado quedó confirmado. Estos son los detalles de tu viaje:' : 'Recibimos tu solicitud de viaje. Nuestro equipo te confirmará la disponibilidad y los detalles finales en breve.',
    route: 'Tu ruta', wa: 'Escríbenos por WhatsApp',
    L: { date: 'Fecha', time: 'Hora', pax: 'Pasajeros', pickup: 'Recogida', dropoff: 'Destino', flight: 'Vuelo', service: 'Servicio', price: paid ? 'Pagado' : 'Precio' },
    note: paid ? 'Monitoreamos tu vuelo y estaremos a tiempo. ¿Algún cambio? Escríbenos por WhatsApp.' : 'Esta es una solicitud, no una confirmación final. Te contactaremos en breve para confirmar tu viaje.'
  };
  const body = `
    <div style="display:inline-block;background:#e8f9ef;color:#0f9d58;font-size:12px;font-weight:700;padding:5px 12px;border-radius:999px;margin-bottom:14px">${t.badge}</div>
    <h1 style="font-size:21px;margin:0 0 8px;color:#1a1d23">${t.hi}</h1>
    <p style="color:#4b5563;font-size:14px;line-height:1.6;margin:0 0 18px">${t.intro}</p>
    ${routeCard(t.route, d.summary)}
    ${itineraryBlock(en ? 'Itinerary' : 'Itinerario', d.itinerary)}
    <table style="width:100%;border-collapse:collapse;margin:0 0 18px">
      ${d.itinerary ? '' : irow(t.L.date, d.date)}
      ${d.itinerary ? '' : irow(t.L.time, d.time)}
      ${irow(t.L.pax, d.pax)}
      ${irow(en ? 'Child seats' : 'Sillas de niño', d.seats)}
      ${d.itinerary ? '' : irow(t.L.pickup, d.pickup)}
      ${d.itinerary ? '' : irow(t.L.dropoff, d.dropoff)}
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

/* ===== Correo para Eddie = TIQUETE oscuro (para captura y pasar al conductor) ===== */

// fila del tiquete APILADA (a prueba de Gmail móvil): etiqueta gris arriba, valor claro abajo
function trow(label, value) {
  if (!value) return '';
  return `<tr><td style="padding:9px 0;border-bottom:1px solid #2b241d">
    <div style="color:#9a8f80;font-size:10.5px;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:2px">${esc(label)}</div>
    <div style="color:#f5efe6;font-size:15px;font-weight:600;line-height:1.4">${esc(value)}</div>
  </td></tr>`;
}

const MESES_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
function fmtFecha(iso) {
  const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return iso || '';
  return `${+m[3]} de ${MESES_ES[+m[2] - 1]} de ${m[1]}`;
}
function fmtHora(hhmm) {
  const m = String(hhmm || '').match(/^(\d{1,2}):(\d{2})/);
  if (!m) return hhmm || '';
  let h = +m[1]; const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12; if (h === 0) h = 12;
  return `${h}:${m[2]} ${ap}`;
}

// Una tarjeta tipo "tiquete" por tramo — completa y autocontenida (Eddie le toma
// captura de pantalla a UNA sola tarjeta y se la manda al chofer de ese servicio).
function legCard(leg, idx, totalLegs, order, d) {
  const tramoTag = totalLegs > 1 ? `<div style="color:#9a8f80;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-top:8px">Servicio ${idx + 1} de ${totalLegs}</div>` : '';
  return `
  <div style="background:#161210;border:1px solid #33291f;border-radius:18px;overflow:hidden;${idx > 0 ? 'margin-top:16px' : ''}">
    <div style="text-align:center;padding:22px 20px 14px;border-bottom:1px solid #2b241d">
      <img src="https://travesiacr.online/assets/logo-travesia.png" alt="Travesía Costa Rica" width="56" style="width:56px;height:auto;display:inline-block">
      <div style="color:#f5efe6;font-size:19px;font-weight:800;letter-spacing:.3px;margin-top:8px;font-family:Georgia,'Times New Roman',serif">Travesía <span style="color:#ff9e4d">Costa Rica</span></div>
      <div style="color:#9a8f80;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;margin-top:3px">Costa Rica &middot; Traslados Privados</div>
      <div style="display:inline-block;margin-top:12px;border:1px solid ${order.tagBorder};background:${order.tagBg};color:${order.tagColor};font-size:10.5px;font-weight:800;letter-spacing:1.3px;padding:5px 13px;border-radius:999px">&#9679; ${order.tag}</div>
      ${tramoTag}
    </div>
    <div style="padding:16px 22px 4px;text-align:center">
      <div style="color:#9a8f80;font-size:10px;letter-spacing:2.5px;text-transform:uppercase">N&ordm; de reserva</div>
      <div style="color:#ff9e4d;font-size:25px;font-weight:800;letter-spacing:2.5px;margin-top:2px">${esc(order.orderNumber || '—')}</div>
    </div>
    <table role="presentation" width="100%" style="border-collapse:collapse;margin:14px 0 4px"><tr>
      <td style="width:42%;text-align:left;padding-left:22px;vertical-align:top">
        <div style="color:#ffffff;font-size:16px;font-weight:800;line-height:1.25">${esc(leg.from || '')}</div>
        ${leg.pickup ? `<div style="color:#9a8f80;font-size:11px;margin-top:3px">${esc(leg.pickup)}</div>` : ''}
      </td>
      <td style="width:16%;text-align:center;vertical-align:middle">
        <div style="color:#a3651f;font-size:16px;letter-spacing:2px">&#9679;&mdash;&mdash;&#9679;</div>
      </td>
      <td style="width:42%;text-align:right;padding-right:22px;vertical-align:top">
        <div style="color:#ffffff;font-size:16px;font-weight:800;line-height:1.25">${esc(leg.to || '')}</div>
        ${leg.dropoff ? `<div style="color:#9a8f80;font-size:11px;margin-top:3px">${esc(leg.dropoff)}</div>` : ''}
      </td>
    </tr></table>
    <div style="padding:8px 22px 6px">
      <table role="presentation" width="100%" style="border-collapse:collapse">
        ${trow('Servicio', leg.vip ? 'Travesía VIP' : 'Travesía Standard')}
        ${trow('Cliente', d.name)}
        ${trow('Fecha', fmtFecha(leg.date))}
        ${trow('Hora de recogida', fmtHora(leg.time))}
        ${/aeropuerto|airport/i.test(`${leg.from} ${leg.to}`) ? trow('Vuelo', d.flight || 'NA') : ''}
        ${trow('Vehículo', leg.vname)}
        ${trow('Pasajeros', d.pax)}
        ${trow('Sillas de niño', d.seats)}
        ${trow('Teléfono', d.phone)}
      </table>
    </div>
    <div style="margin:8px 18px 18px;border:1px solid #a3651f;background:rgba(224,123,31,.10);border-radius:12px;padding:12px 18px">
      <table role="presentation" width="100%" style="border-collapse:collapse"><tr>
        <td style="color:#9a8f80;font-size:10.5px;letter-spacing:2px;text-transform:uppercase">Precio</td>
        <td style="text-align:right;color:#ff9e4d;font-size:24px;font-weight:800">$${leg.price}</td>
      </tr></table>
    </div>
    <div style="border-top:1px solid #2b241d;padding:12px 18px;text-align:center;color:#9a8f80;font-size:10.5px;line-height:1.85">
      &#9679; Asegurado y con permisos &nbsp;&#9679; Soporte 24/7<br>
      <span style="color:#f5efe6;font-weight:700">WhatsApp +506 8502 8476</span> &middot; travesiacr.online
    </div>
  </div>`;
}

function ownerEmail(d, paid) {
  const order = {
    tag: paid ? 'RESERVA PAGADA' : 'SOLICITUD (SIN PAGO)',
    tagBg: paid ? 'rgba(37,211,102,.14)' : 'rgba(224,123,31,.16)',
    tagColor: paid ? '#4ade80' : '#ff9e4d',
    tagBorder: paid ? '#2e7d4f' : '#a3651f',
    orderNumber: d.orderNumber,
  };

  // d.legs = datos estructurados por tramo (precio verificado en el servidor cuando hay pago).
  // Si por alguna razon no vienen (reserva vieja antes de este cambio), arma 1 sola tarjeta con lo que haya.
  const legsData = Array.isArray(d.legs) && d.legs.length ? d.legs : [{
    from: (d.summary || '').split(/\s*(?:→|->)\s*/)[0] || d.summary || '',
    to: (d.summary || '').split(/\s*(?:→|->)\s*/)[1] || '',
    vname: '', vip: /vip/i.test(d.tier || ''), price: (d.total || '').replace(/[^0-9.]/g, ''),
    date: d.date, time: d.time, pickup: d.pickup, dropoff: d.dropoff,
  }];

  const cardsHtml = legsData.map((leg, idx) => legCard(leg, idx, legsData.length, order, d)).join('');

  const grandTotal = legsData.length > 1 ? `
    <div style="margin-top:16px;background:#161210;border:1px solid #33291f;border-radius:18px;padding:16px 22px">
      <table role="presentation" width="100%" style="border-collapse:collapse"><tr>
        <td style="color:#9a8f80;font-size:11px;letter-spacing:2px;text-transform:uppercase">Total de la reserva (${legsData.length} servicios)</td>
        <td style="text-align:right;color:#ff9e4d;font-size:24px;font-weight:800">${esc(d.total || '')}</td>
      </tr></table>
    </div>` : '';

  const card = cardsHtml + grandTotal;

  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#0e0c0a;font-family:'Segoe UI',Arial,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#0e0c0a"><tr><td align="center" style="padding:16px 10px">
  <table role="presentation" width="430" cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:430px;max-width:430px"><tr><td>
    ${card}
    <div style="margin-top:14px;background:#1c1710;border:1px solid #2b241d;border-radius:14px;padding:15px 18px">
      <div style="color:#9a8f80;font-size:10.5px;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px">Solo para vos (la captura de arriba no incluye esto)</div>
      <div style="color:#d9d0c3;font-size:13px;line-height:1.8">
        Email: <a href="mailto:${esc(d.email)}" style="color:#ff9e4d;text-decoration:none">${esc(d.email)}</a><br>
        ${d.notes ? 'Notas: ' + esc(d.notes) + '<br>' : ''}
        ${paid ? 'El cliente pagó en línea — verificá el cobro en tu panel de Tilopay.' : 'Solicitud desde el sitio, aún sin pago.'}
      </div>
      <div style="margin-top:12px">${waBtn(waNumber(d.phone, d.country), 'Escribir al cliente por WhatsApp', d.lang !== 'es'
        ? `Hi ${d.name || ''}, thank you for booking with Travesía Costa Rica! About your trip ${d.summary || ''}${d.date ? ' on ' + d.date : ''} — I'd love to confirm the details with you.`
        : `Hola ${d.name || ''}, ¡gracias por reservar con Travesía Costa Rica! Sobre tu viaje ${d.summary || ''}${d.date ? ' el ' + d.date : ''}, me encantaría confirmar los detalles con vos.`)}</div>
    </div>
  </td></tr></table>
  </td></tr></table></body></html>`;

  const subjTag = paid ? 'Reserva PAGADA' : 'Nueva reserva';
  return { subject: `${subjTag} ${d.orderNumber || ''}: ${d.name || 'cliente'} - ${d.summary || ''}`, html };
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

// Google Sheets interpreta como FORMULA cualquier celda que empiece con = + - @
// (un telefono "+1 555..." acababa en #ERROR! y se perdia el dato), y ademas alguien
// podria escribir "=IMPORTXML(...)" en el formulario y ejecutarlo dentro de la hoja.
// El apostrofo inicial le dice a Sheets "esto es texto"; no se ve en la celda.
function sheetText(v) {
  const s = String(v == null ? '' : v);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
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
        nombre: sheetText(d.name), email: sheetText(d.email), telefono: sheetText(d.phone),
        ruta: sheetText(d.summary), fecha: sheetText(d.date), hora: sheetText(d.time), pax: sheetText(d.pax),
        recogida: sheetText(d.pickup), destino: sheetText(d.dropoff), itinerario: sheetText(d.itinerary), vuelo: sheetText(d.flight), servicio: sheetText(d.tier),
        total: sheetText(d.total), orden: sheetText(d.orderNumber),
        notas: sheetText((d.seats ? 'Sillas: ' + d.seats + ' · ' : '') + (d.notes || '')),
      }),
    });
  } catch (e) { /* la hoja es un extra: si falla, no afecta correo ni pago */ }
}

// Reenvía SOLO el tiquete a Eddie (sin correo al cliente y sin tocar la hoja).
// Se usa para regenerar el tiquete de una reserva existente y pasarlo al conductor.
export async function sendOwnerTicket(d, paid) {
  if (!process.env.BREVO_API_KEY) throw new Error('no-brevo-key');
  const o = ownerEmail(d, !!paid);
  await sendEmail(OWNER, '[Tiquete] ' + o.subject, o.html, d.email);
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
