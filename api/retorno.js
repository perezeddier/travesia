/* ==========================================================================
   Travesía Costa Rica — retorno de Tilopay tras el pago (GET)
   Tilopay redirige aquí al cliente con: ?code=1 (autorizado) & returnData=...
   SEGURIDAD:
   1) El pago se crea en /api/pagar con capture=0 (solo AUTORIZA, no cobra).
      Acá, antes de avisar "pago recibido", hacemos nosotros mismos una llamada
      de SERVIDOR A SERVIDOR a Tilopay para CAPTURAR el cobro real. Esa llamada
      solo funciona si existe una autorización real en Tilopay.
   2) returnData viene FIRMADO por /api/pagar (ver _firma.js). Si alguien lo
      cambia (otra ruta, otro monto, otro nombre), la firma no coincide y NO se
      captura ni se manda nada: se le avisa a Eddie.
   3) Si Tilopay autorizó pero la captura falla, el cliente puede tener un
      monto RETENIDO en su tarjeta: se le avisa a Eddie por correo y se marca
      la fila de la hoja, y al cliente se le dice que no repita el pago.
   ========================================================================== */
import { sendReservation, avisarEddie, logRevision } from './_mailer.js';
import { abrirReserva } from './_firma.js';
import { rateLimited } from './_ratelimit.js';

const TB = 'https://app.tilopay.com/api/v1';

// Reservas creadas ANTES de que existiera la firma (formato viejo, sin firma):
// se aceptan solo unas horas después del cambio, para no dejar colgado a un
// cliente que estaba pagando justo en ese momento. Después, sin firma = rechazo.
const SIN_FIRMA_HASTA = Date.parse('2026-09-25T15:00:00Z');

async function captureNow(orderNumber, amount) {
  if (!process.env.TILOPAY_KEY || !process.env.TILOPAY_USER || !process.env.TILOPAY_PASSWORD) return false;
  try {
    const loginR = await fetch(`${TB}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiuser: process.env.TILOPAY_USER, password: process.env.TILOPAY_PASSWORD }),
    });
    const login = await loginR.json().catch(() => ({}));
    if (!login.access_token) return false;

    const capR = await fetch(`${TB}/processModification`, {
      method: 'POST',
      headers: { 'Authorization': 'bearer ' + login.access_token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderNumber, type: '1', amount: String(amount), key: process.env.TILOPAY_KEY }),  // type 1 = Capturar
    });
    return capR.ok;  // Tilopay solo confirma si la autorización era real
  } catch (e) { return false; }
}

const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export default async function handler(req, res) {
  const q = req.query || {};
  const authorized = String(q.code) === '1';
  const order = String(q.order || q.orderNumber || '').slice(0, 40);

  let amount = '';
  let captured = false;
  let revisar = false;   // autorizado pero no capturado: el cliente no debe reintentar

  if (authorized) {
    try {
      const { booking, firmada, alterada } = abrirReserva(q.returnData);
      const valida = booking && booking.email && booking.summary && booking.orderNumber
        && (firmada || Date.now() < SIN_FIRMA_HASTA)
        && (!order || order === booking.orderNumber);

      if (valida) {
        const m = String(booking.total || '').match(/[\d.]+/);
        if (m) amount = m[0];

        // ---- Verificación real: capturar el cobro con Tilopay (servidor a servidor) ----
        captured = amount ? await captureNow(booking.orderNumber, amount) : false;

        if (captured) {
          await sendReservation(booking, true);
        } else {
          // Tilopay dijo "autorizado" pero no pudimos cobrarlo: puede haber dinero
          // retenido en la tarjeta del cliente. Eddie tiene que revisarlo en Tilopay.
          revisar = true;
          await Promise.allSettled([
            logRevision(booking),
            avisarEddie(`Revisar pago en Tilopay: ${booking.orderNumber} (${booking.name})`,
              `<p>Tilopay <b>autorizó</b> el pago de <b>${esc(booking.name)}</b> (${esc(booking.email)}, ${esc(booking.phone)}) por <b>${esc(booking.total)}</b>, orden <b>${esc(booking.orderNumber)}</b>, pero <b>no se pudo capturar</b> el cobro automáticamente.</p>
               <p>Entrá a Tilopay y buscá esa orden: si está autorizada, capturala a mano; si ya está cobrada, todo bien. El cliente puede tener el monto retenido en su tarjeta.</p>
               <p>Ruta: ${esc(booking.summary)}</p>`),
          ]);
        }
      } else if (alterada || (booking && !firmada) || (booking && order && order !== booking.orderNumber)) {
        // Datos cambiados o sin firma: no se cobra ni se confirma nada. Se avisa a Eddie
        // por si es un intento de engaño (o un cliente real al que hay que ayudar).
        revisar = true;
        if (!rateLimited(req, { max: 3, windowMs: 15 * 60 * 1000, key: 'retorno-alerta' })) await avisarEddie(`Alerta: regreso de pago con datos alterados (orden ${order || '?'})`,
          `<p>Alguien volvió de la página de pago con datos que <b>no coinciden con la firma</b> del sitio (orden ${esc(order || 'desconocida')}). No se capturó ningún cobro ni se mandó confirmación.</p>
           <p>Si esa orden aparece autorizada en Tilopay y es un cliente real, capturala a mano y escribile. Si no la reconocés, puede ser un intento de engaño: no hay que hacer nada.</p>`).catch(() => {});
      } else if (order) {
        // Autorizado pero sin datos de la reserva (se perdieron en el camino)
        revisar = true;
        if (!rateLimited(req, { max: 3, windowMs: 15 * 60 * 1000, key: 'retorno-alerta' })) await avisarEddie(`Revisar pago en Tilopay: ${order}`,
          `<p>Tilopay autorizó la orden <b>${esc(order)}</b>, pero volvió sin los datos de la reserva, así que no se capturó automáticamente. Revisala en Tilopay y en la hoja (fila "Intento de pago" con ese número).</p>`).catch(() => {});
      }
    } catch (e) { /* no bloquear el regreso del cliente si algo falla acá */ }
  }

  const finalOk = authorized && captured;
  const estado = finalOk ? '1' : (revisar ? '2' : '0');   // 2 = "estamos verificando, no repitas el pago"
  const to = 'https://travesiacr.online/gracias?ok=' + estado
    + (order ? '&o=' + encodeURIComponent(order) : '')
    + (finalOk && amount ? '&v=' + encodeURIComponent(amount) : '');
  res.writeHead(302, { Location: to, 'Cache-Control': 'no-store' });
  res.end();
}
