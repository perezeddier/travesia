/* ==========================================================================
   Travesía Costa Rica — REGLAS DE RESERVA
   Una sola fuente de verdad, usada por el NAVEGADOR y por el SERVIDOR.
   El navegador avisa temprano y con buen mensaje; el servidor vuelve a
   validar, porque la validación del navegador se puede saltar.

   ---------------------------------------------------------------------
   PARA EDDIE — esto es lo único que hay que tocar:

   1) ANTELACIÓN MÍNIMA: cambiar el número en BR_MIN_HOURS (hoy 12).

   2) BLOQUEAR FECHAS: agregar líneas a BR_BLOCKED. Cada línea es
      { from: "2026-12-20", to: "2026-12-31", why: "sin vehículos" }
      El rango incluye los dos extremos. Para un solo día, poner la
      misma fecha en from y en to. Para quitar el bloqueo, borrar
      la línea (o comentarla poniéndole // adelante).

   Las fechas van SIEMPRE en formato AAAA-MM-DD.
   ========================================================================== */

/* Antelación mínima para reservar en línea, en horas.
   Quien necesite algo más urgente se va por WhatsApp, donde Eddie
   decide caso por caso si puede. No se pierde la venta: se desvía. */
var BR_MIN_HOURS = 12;

/* Fechas en las que NO se puede reservar en línea.
   Vacío = no hay bloqueos. Ejemplo de uso en diciembre:
     { from: "2026-12-20", to: "2026-12-31", why: "temporada alta" },  */
var BR_BLOCKED = [
];

/* Costa Rica es UTC-6 todo el año (no hay horario de verano), así que la
   hora local se puede fijar con el sufijo -06:00 y el cálculo sale igual
   en el celular del cliente, en su computadora y en el servidor. */
var BR_TZ = "-06:00";

/* Convierte "2026-12-20" + "08:00" a milisegundos. Devuelve NaN si algo
   viene mal formado (el que llama decide qué hacer con eso). */
function brToMs(fecha, hora) {
  if (!fecha) return NaN;
  var f = String(fecha).trim();
  var h = String(hora || "00:00").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f)) return NaN;
  if (!/^\d{2}:\d{2}/.test(h)) h = "00:00";
  return Date.parse(f + "T" + h.slice(0, 5) + ":00" + BR_TZ);
}

/* ¿Esta fecha cae dentro de un rango bloqueado? Devuelve el rango o null.
   Compara como texto AAAA-MM-DD, que ordena igual que la fecha real. */
function brBlockedRange(fecha) {
  var f = String(fecha || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f)) return null;
  for (var i = 0; i < BR_BLOCKED.length; i++) {
    var b = BR_BLOCKED[i];
    if (f >= b.from && f <= b.to) return b;
  }
  return null;
}

/* Valida UN tramo. Devuelve { ok: true } o { ok: false, reason, ... }.
   reason: "missing" | "blocked" | "tooSoon"
   En "tooSoon" devuelve además hoursLeft para poder explicarlo bien. */
function brCheckLeg(fecha, hora, ahoraMs) {
  var now = typeof ahoraMs === "number" ? ahoraMs : Date.now();
  var ms = brToMs(fecha, hora);
  if (isNaN(ms)) return { ok: false, reason: "missing" };

  var blocked = brBlockedRange(fecha);
  if (blocked) return { ok: false, reason: "blocked", range: blocked };

  var horas = (ms - now) / 3600000;
  if (horas < BR_MIN_HOURS) {
    return { ok: false, reason: "tooSoon", hoursLeft: horas, minHours: BR_MIN_HOURS };
  }
  return { ok: true };
}

/* Valida una lista de tramos [{date, time}, ...]. Devuelve el PRIMER
   problema encontrado, con el índice del tramo, o { ok: true }. */
function brCheckLegs(legs, ahoraMs) {
  var list = Array.isArray(legs) ? legs : [];
  for (var i = 0; i < list.length; i++) {
    var r = brCheckLeg(list[i] && list[i].date, list[i] && list[i].time, ahoraMs);
    if (!r.ok) { r.leg = i; return r; }
  }
  return { ok: true };
}

/* La fecha más temprana que se puede escoger (para el min= del calendario).
   Si faltan menos de BR_MIN_HOURS para que acabe el día de hoy en Costa
   Rica, el primer día seleccionable ya es mañana. */
function brMinDate(ahoraMs) {
  var now = typeof ahoraMs === "number" ? ahoraMs : Date.now();
  var limite = new Date(now + BR_MIN_HOURS * 3600000);
  /* pasar a hora de Costa Rica para sacar el día correcto */
  var cr = new Date(limite.getTime() - 6 * 3600000);
  return cr.toISOString().slice(0, 10);
}

/* Exportar para el servidor (Node/Vercel). En el navegador "module" no
   existe y esto se ignora, igual que en routes-data.js */
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    BR_MIN_HOURS: BR_MIN_HOURS,
    BR_BLOCKED: BR_BLOCKED,
    brToMs: brToMs,
    brBlockedRange: brBlockedRange,
    brCheckLeg: brCheckLeg,
    brCheckLegs: brCheckLegs,
    brMinDate: brMinDate,
  };
}
