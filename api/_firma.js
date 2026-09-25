/* ==========================================================================
   Travesía Costa Rica — FIRMA de los datos de la reserva que viajan a Tilopay
   /api/pagar manda la reserva a Tilopay (returnData) y Tilopay la devuelve
   en /api/retorno. Ese viaje pasa por el navegador del cliente, así que
   alguien podría cambiarla (otra ruta, otro precio, otro nombre) y hacer que
   el tiquete de Eddie diga algo distinto a lo que de verdad se pagó.
   Solución: /api/pagar la FIRMA con una llave secreta del servidor y
   /api/retorno solo la acepta si la firma coincide.
   La firma va DENTRO del mismo JSON (campo _s), así lo que viaja a Tilopay
   sigue teniendo exactamente la forma de siempre (base64 de un JSON), que ya
   sabemos que Tilopay devuelve intacta.
   La llave sale de las claves de Tilopay (ya están en Vercel): no hace falta
   configurar nada nuevo.
   ========================================================================== */
import crypto from 'node:crypto';

function llave() {
  return crypto.createHash('sha256')
    .update('travesia-returnData|' + (process.env.TILOPAY_KEY || '') + '|' + (process.env.TILOPAY_PASSWORD || ''))
    .digest();
}
function firmar(texto) {
  return crypto.createHmac('sha256', llave()).update(String(texto)).digest('base64url');
}

// Reserva -> base64 de JSON con la firma adentro (_s)
export function empacarReserva(booking) {
  const cuerpo = JSON.stringify(booking);
  const conFirma = Object.assign({}, booking, { _s: firmar(cuerpo) });
  return Buffer.from(JSON.stringify(conFirma), 'utf8').toString('base64');
}

// base64 -> { booking, firmada } | { booking: null, alterada: true }
// Sin _s (reserva creada antes de este cambio) -> { booking, firmada: false }.
export function abrirReserva(raw) {
  let o = null;
  try {
    const s = String(raw || '').trim().replace(/ /g, '+');   // algún intermediario puede cambiar + por espacio
    o = JSON.parse(Buffer.from(s, 'base64').toString('utf8'));
  } catch (e) { return { booking: null }; }
  if (!o || typeof o !== 'object') return { booking: null };
  if (typeof o._s !== 'string') return { booking: o, firmada: false };
  const sig = o._s;
  delete o._s;
  // JSON.stringify(JSON.parse(x)) reproduce exactamente x: mismo orden de campos
  const bueno = firmar(JSON.stringify(o));
  const ok = sig.length === bueno.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(bueno));
  return ok ? { booking: o, firmada: true } : { booking: null, alterada: true };
}
