/* ============================================================
   Travesía Costa Rica — front-end logic
   - Bilingual EN/ES (persisted in localStorage)
   - Data-driven routes / fleet / features
   - Mobile menu, sticky header, scroll reveal
   ============================================================ */

const WA = "50685028476"; // WhatsApp number, no + or spaces

/* ---------- WhatsApp helper ---------- */
function wa(text) {
  return `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
}

/* ---------- DATA ---------- */
/* Rutas populares mostradas como tarjetas: [indiceOrigen, indiceDestino] en PT_PLACES */
const POPULAR = [
  [0, 2],   // SJO → La Fortuna
  [0, 4],   // SJO → Manuel Antonio
  [0, 3],   // SJO → Monteverde
  [0, 11],  // SJO → Jacó
  [1, 5],   // LIR → Tamarindo
  [1, 2],   // LIR → La Fortuna
  [1, 12],  // LIR → Playas del Coco
  [2, 3],   // La Fortuna → Monteverde
  [2, 5],   // La Fortuna → Tamarindo
  [2, 4],   // La Fortuna → Manuel Antonio
];

/* ---------- Índice de precios (rutas sin dirección) ----------
   Clave "min-max" -> { staria, hiace, maxus, dur } */
const PT_LOOKUP = {};
if (typeof PT_ROWS !== "undefined") {
  for (const r of PT_ROWS) {
    const a = Math.min(r[0], r[1]), b = Math.max(r[0], r[1]);
    PT_LOOKUP[`${a}-${b}`] = { staria: r[2], hiace: r[3], maxus: r[4], dur: r[5] };
  }
}
function ptName(i) {
  const raw = PT_PLACES[i];
  return (typeof PT_DISPLAY !== "undefined" && PT_DISPLAY[raw]) || raw;
}
function ptPrice(i, j) {
  return PT_LOOKUP[`${Math.min(i, j)}-${Math.max(i, j)}`] || null;
}
/* Oculta duraciones claramente erróneas en los datos de origen (p.ej. "45h") */
function ptDuration(dur) {
  if (!dur) return "";
  const m = dur.match(/^(\d+)h$/);
  if (m && Number(m[1]) > 12) return "";  // "30h", "40h", "45h", "55h" = error de datos
  return dur;
}

const FLEET = [
  { name: "Hyundai Staria", cls: "Comfort", pax: 5,  bags: 5,  img: "staria.jpg", pos: "center 84%" },
  { name: "Toyota Hiace",   cls: "Group",   pax: 9,  bags: 9,  img: "hiace.jpg",  pos: "center 62%" },
  { name: "Maxus V90",      cls: "Premium", pax: 12, bags: 12, img: "maxus.jpg",  pos: "center 60%" },
];

/* ---------- TRANSLATIONS ---------- */
const I18N = {
  en: {
    "nav.routes": "Routes",
    "nav.fleet": "Fleet",
    "nav.why": "Why us",
    "nav.contact": "Contact",
    "nav.faq": "FAQ",
    "nav.guides": "Travel guides",
    "nav.book": "Book on WhatsApp",
    "faq.eyebrow": "Good to know",
    "faq.title": "Frequently asked questions",
    "faq.lead": "Everything you need to know before booking your private transfer in Costa Rica.",
    "faq.more": "Have another question? Ask us on WhatsApp",
    "hero.eyebrow": "Arrive relaxed · Travel in comfort",
    "hero.title1": "Costa Rica Private Shuttles",
    "hero.title2": "& Airport Transfers",
    "hero.sub": "Door-to-door private transfers from SJO and Liberia (LIR) airports to La Fortuna, Monteverde, Tamarindo, Manuel Antonio and beyond. Flat rate per vehicle, professional drivers, licensed & insured.",
    "hero.ctaPrimary": "Get a quote on WhatsApp",
    "hero.ctaSecondary": "See routes & prices",
    "reviews.on": "on Google Reviews",
    "reviews.leave": "★ Leave us a review on Google",
    "rev.eyebrow": "Reviews",
    "rev.title": "What our guests say",
    "rev.count": "95 reviews on Google",
    "rev.all": "Read all on Google",
    "hero.trust1": "& LIR airport pickups",
    "hero.trust2": "WhatsApp support",
    "hero.trust3": "passenger vehicles",
    "routes.eyebrow": "Shuttle routes & fares",
    "routes.title": "Find your route & price",
    "routes.lead": "Pick where you're coming from and where you're going — see the price instantly. Flat rate for the whole vehicle, not per person.",
    "routes.popular": "Most popular routes",
    "routes.custom": "Need a different route? Request a custom quote",
    "route.book": "Book",
    "route.view": "View route",
    "route.priceNote": "per vehicle",
    "finder.from": "From",
    "finder.to": "To",
    "finder.ph": "Destination or hotel…",
    "finder.pick": "Choose your pickup and destination to see the price.",
    "finder.same": "Pickup and destination can't be the same. Choose a different place.",
    "finder.notfound": "We don't have a set price for that pair yet — send it to us on WhatsApp and we'll quote it in minutes.",
    "finder.notfoundBtn": "Quote this route on WhatsApp",
    "finder.taxes": "Final price per vehicle · taxes included",
    "finder.upto": "up to",
    "finder.pax": "passengers",
    "finder.book": "Book",
    "finder.ask": "Ask",
    "finder.add": "Add",
    "finder.continue": "Continue from",
    "cart.open": "Cart",
    "cart.title": "Your trip",
    "cart.empty": "Your trip is empty. Add routes from the finder above — you can chain several stops and pay once.",
    "cart.remove": "Remove",
    "cart.total": "Total",
    "cart.note": "Final price per vehicle · taxes included.",
    "cart.checkout": "Reserve & pay",
    "cart.clear": "Empty trip",
    "cart.added": "Added to your trip ✓",
    "cart.wa": "Special route or question? Message us on WhatsApp",
    "co.title": "Complete your booking",
    "co.trip": "Your trip",
    "co.date": "Travel date",
    "co.time": "Pickup time",
    "co.adults": "Adults",
    "co.children": "Children (for free child seats)",
    "co.pickup": "Pickup — hotel or address",
    "co.dropoff": "Drop-off — hotel or address",
    "co.flight": "Flight number (optional)",
    "co.name": "Full name",
    "co.email": "Email",
    "co.phone": "WhatsApp / phone",
    "co.notes": "Notes (optional)",
    "co.pay": "Reserve & pay",
    "co.choose": "Choose your service",
    "co.stdName": "Travesía Standard",
    "co.stdPrice": "Included",
    "co.std1": "Bottled water & free WiFi",
    "co.std2": "Door-to-door service",
    "co.std3": "Direct transfer",
    "co.vipName": "Travesía VIP",
    "co.vip1": "Everything in Standard",
    "co.vip2": "Guaranteed bilingual driver-guide",
    "co.vip3": "1–2h of tourist stops",
    "co.vip4": "Welcome kit: snacks & drinks",
    "co.addon": "Travesía VIP",
    "co.secure": "Secure card payment · taxes included",
    "co.back": "Back to trip",
    "co.empty": "Add at least one route to your trip first.",
    "fleet.eyebrow": "The fleet",
    "fleet.title": "Modern, comfortable vehicles",
    "fleet.lead": "Air-conditioned, well-maintained and fully insured. Choose the size that fits your group and luggage.",
    "fleet.pax": "passengers",
    "fleet.bags": "bags",
    "fleet.book": "Book this vehicle",
    "gallery.eyebrow": "Real photos",
    "gallery.title": "Our fleet across Costa Rica",
    "gallery.lead": "Real vehicles, real trips — from the airport to the volcano and the coast.",
    "why.eyebrow": "Why Travesía",
    "why.title": "More than a drive",
    "cta.title": "Ready when you are",
    "cta.sub": "Send us your route, date and number of passengers — we'll confirm price and pickup in minutes.",
    "cta.button": "Chat on WhatsApp",
    "footer.tagline": "Premium private transportation across Costa Rica. Safe, punctual, and comfortable — every trip.",
    "footer.explore": "Explore",
    "footer.contact": "Contact",
    "footer.rights": "All rights reserved.",
    "why.1.t": "Professional drivers",
    "why.1.d": "Professional local drivers who know every route — English-speaking drivers available on request, guaranteed with Travesía VIP.",
    "why.2.t": "Licensed & insured",
    "why.2.d": "Modern, well-maintained vehicles with full insurance and up-to-date permits — total peace of mind.",
    "why.3.t": "Door-to-door",
    "why.3.d": "We pick you up at the airport or your hotel and take you exactly where you need to go.",
    "why.4.t": "Flat, honest pricing",
    "why.4.d": "One clear price per vehicle. No hidden fees, no surprises at the end of the ride.",
  },
  es: {
    "nav.routes": "Rutas",
    "nav.fleet": "Flota",
    "nav.why": "Por qué",
    "nav.contact": "Contacto",
    "nav.faq": "Preguntas",
    "nav.guides": "Guías de viaje",
    "nav.book": "Reservar por WhatsApp",
    "faq.eyebrow": "Bueno saberlo",
    "faq.title": "Preguntas frecuentes",
    "faq.lead": "Todo lo que necesitas saber antes de reservar tu traslado privado en Costa Rica.",
    "faq.more": "¿Tienes otra pregunta? Escríbenos por WhatsApp",
    "hero.eyebrow": "Llega relajado · Viaja con confort",
    "hero.title1": "Transporte Privado y Traslados",
    "hero.title2": "de Aeropuerto en Costa Rica",
    "hero.sub": "Traslados privados puerta a puerta desde los aeropuertos de San José (SJO) y Liberia (LIR) a La Fortuna, Monteverde, Tamarindo, Manuel Antonio y más. Tarifa plana por vehículo, choferes profesionales, con seguro y permisos.",
    "hero.ctaPrimary": "Cotizar por WhatsApp",
    "hero.ctaSecondary": "Ver rutas y precios",
    "reviews.on": "en reseñas de Google",
    "reviews.leave": "★ Déjanos una reseña en Google",
    "rev.eyebrow": "Reseñas",
    "rev.title": "Lo que dicen nuestros clientes",
    "rev.count": "95 reseñas en Google",
    "rev.all": "Ver todas en Google",
    "hero.trust1": "y recogidas en LIR",
    "hero.trust2": "soporte por WhatsApp",
    "hero.trust3": "vehículos de pasajeros",
    "routes.eyebrow": "Rutas y tarifas de shuttle",
    "routes.title": "Encuentra tu ruta y precio",
    "routes.lead": "Elige de dónde sales y a dónde vas — mira el precio al instante. Tarifa plana por vehículo completo, no por persona.",
    "routes.popular": "Rutas más populares",
    "routes.custom": "¿Necesitas otra ruta? Pide una cotización personalizada",
    "route.book": "Reservar",
    "route.view": "Ver ruta",
    "route.priceNote": "por vehículo",
    "finder.from": "Desde",
    "finder.to": "Hasta",
    "finder.ph": "Destino u hotel…",
    "finder.pick": "Elige tu punto de recogida y destino para ver el precio.",
    "finder.same": "El origen y el destino no pueden ser iguales. Elige otro lugar.",
    "finder.notfound": "Aún no tenemos precio fijo para ese par — mándanoslo por WhatsApp y te cotizamos en minutos.",
    "finder.notfoundBtn": "Cotizar esta ruta por WhatsApp",
    "finder.taxes": "Precio final por vehículo · impuestos incluidos",
    "finder.upto": "hasta",
    "finder.pax": "pasajeros",
    "finder.book": "Reservar",
    "finder.ask": "Consultar",
    "finder.add": "Agregar",
    "finder.continue": "Continuar desde",
    "cart.open": "Carrito",
    "cart.title": "Tu viaje",
    "cart.empty": "Tu viaje está vacío. Agrega rutas desde el buscador de arriba — puedes encadenar varios tramos y pagar una sola vez.",
    "cart.remove": "Quitar",
    "cart.total": "Total",
    "cart.note": "Precio final por vehículo · impuestos incluidos.",
    "cart.checkout": "Reservar y pagar",
    "cart.clear": "Vaciar viaje",
    "cart.added": "Agregado a tu viaje ✓",
    "cart.wa": "¿Ruta especial o duda? Escríbenos por WhatsApp",
    "co.title": "Completa tu reserva",
    "co.trip": "Tu viaje",
    "co.date": "Fecha del viaje",
    "co.time": "Hora de recogida",
    "co.adults": "Adultos",
    "co.children": "Niños (para sillas gratis)",
    "co.pickup": "Recogida — hotel o dirección",
    "co.dropoff": "Destino — hotel o dirección",
    "co.flight": "Número de vuelo (opcional)",
    "co.name": "Nombre completo",
    "co.email": "Correo electrónico",
    "co.phone": "WhatsApp / teléfono",
    "co.notes": "Notas (opcional)",
    "co.pay": "Reservar y pagar",
    "co.choose": "Elige tu servicio",
    "co.stdName": "Travesía Standard",
    "co.stdPrice": "Incluido",
    "co.std1": "Agua embotellada y WiFi gratis",
    "co.std2": "Servicio puerta a puerta",
    "co.std3": "Traslado directo",
    "co.vipName": "Travesía VIP",
    "co.vip1": "Todo lo del Standard",
    "co.vip2": "Chofer-guía bilingüe garantizado",
    "co.vip3": "1–2 h de paradas turísticas",
    "co.vip4": "Kit de bienvenida: snacks y bebidas",
    "co.addon": "Travesía VIP",
    "co.secure": "Pago seguro con tarjeta · impuestos incluidos",
    "co.back": "Volver al viaje",
    "co.empty": "Agrega al menos una ruta a tu viaje primero.",
    "fleet.eyebrow": "La flota",
    "fleet.title": "Vehículos modernos y cómodos",
    "fleet.lead": "Con aire acondicionado, bien mantenidos y con seguro completo. Elige el tamaño ideal para tu grupo y equipaje.",
    "fleet.pax": "pasajeros",
    "fleet.bags": "maletas",
    "fleet.book": "Reservar este vehículo",
    "gallery.eyebrow": "Fotos reales",
    "gallery.title": "Nuestra flota por Costa Rica",
    "gallery.lead": "Vehículos reales, viajes reales — del aeropuerto al volcán y a la costa.",
    "why.eyebrow": "Por qué Travesía",
    "why.title": "Más que un traslado",
    "cta.title": "Listos cuando tú lo estés",
    "cta.sub": "Envíanos tu ruta, fecha y número de pasajeros — confirmamos precio y recogida en minutos.",
    "cta.button": "Escríbenos por WhatsApp",
    "footer.tagline": "Transporte privado premium por toda Costa Rica. Seguro, puntual y cómodo — en cada viaje.",
    "footer.explore": "Explorar",
    "footer.contact": "Contacto",
    "footer.rights": "Todos los derechos reservados.",
    "why.1.t": "Choferes profesionales",
    "why.1.d": "Choferes profesionales que conocen cada ruta — con chofer que habla inglés a solicitud, garantizado con Travesía VIP.",
    "why.2.t": "Con seguro y permisos",
    "why.2.d": "Vehículos modernos y bien mantenidos, con seguro completo y permisos al día — total tranquilidad.",
    "why.3.t": "Puerta a puerta",
    "why.3.d": "Te recogemos en el aeropuerto o tu hotel y te llevamos justo a donde necesitas.",
    "why.4.t": "Precio claro y honesto",
    "why.4.d": "Un solo precio por vehículo. Sin cargos ocultos ni sorpresas al final del viaje.",
  },
};

/* ---------- GALERÍA ---------- */
const GALLERY = [
  { img: "g-van-sunset.jpg",       cap: { es: "Nuestra flota al atardecer",        en: "Our fleet at sunset" } },
  { img: "g-clients-van.jpg",      cap: { es: "Clientes felices con nuestro equipo",en: "Happy clients with our team" } },
  { img: "g-arenal.jpg",           cap: { es: "Volcán Arenal",                     en: "Arenal Volcano" } },
  { img: "g-family-waterfall.jpg", cap: { es: "Familias en La Fortuna",            en: "Families at La Fortuna" } },
  { img: "g-fortuna-waterfall.jpg",cap: { es: "Catarata La Fortuna",               en: "La Fortuna Waterfall" } },
  { img: "g-morpho.jpg",           cap: { es: "Mariposa morfo azul",               en: "Blue morpho butterfly" } },
  { img: "g-group-waterfall.jpg",  cap: { es: "Aventuras compartidas",             en: "Shared adventures" } },
  { img: "gallery-hotel.jpg",      cap: { es: "Gran Hotel Costa Rica, San José",   en: "Gran Hotel Costa Rica, San José" } },
  { img: "g-monkey.jpg",           cap: { es: "Fauna costarricense",               en: "Costa Rican wildlife" } },
  { img: "g-flag.jpg",             cap: { es: "¡Pura vida!",                       en: "Pura vida!" } },
  { img: "g-van-garden.jpg",       cap: { es: "Lista para tu viaje",               en: "Ready for your trip" } },
  { img: "g-arenal-lagoon.jpg",    cap: { es: "Arenal y su laguna",                en: "Arenal & its lagoon" } },
  { img: "g-group-ballena.jpg",    cap: { es: "Parque Marino Ballena",             en: "Marino Ballena National Park" } },
  { img: "g-cloudforest.jpg",      cap: { es: "Bosque nuboso",                     en: "Cloud-forest trails" } },
  { img: "g-llanos-cortes.jpg",    cap: { es: "Catarata Llanos de Cortés",         en: "Llanos de Cortés Waterfall" } },
];

function renderGallery() {
  const grid = document.getElementById("galleryGrid");
  if (!grid) return;
  grid.innerHTML = GALLERY.map((g) => {
    const cap = g.cap[currentLang] || g.cap.en;
    return `
      <button class="gallery-item" type="button" data-full="assets/${g.img}" data-cap="${cap}">
        <img src="assets/${g.img}" alt="${cap} — Travesía Costa Rica" loading="lazy" />
        <span class="gallery-cap">${cap}</span>
      </button>`;
  }).join("");
}

function openLightbox(src, cap) {
  const lb = document.getElementById("lightbox");
  if (!lb) return;
  lb.querySelector("img").src = src;
  lb.querySelector(".lightbox-cap").textContent = cap || "";
  lb.classList.add("open");
  document.body.classList.add("no-scroll");
}
function closeLightbox() {
  document.getElementById("lightbox")?.classList.remove("open");
  document.body.classList.remove("no-scroll");
}

/* ---------- RESEÑAS reales de Google ---------- */
const REVIEWS = [
  { name: "Judith Berenstein", when: { es: "hace 4 meses", en: "4 months ago" },
    text: "Excelente día pasamos entre amigas con Roy y Fabián! Roy nos guió de maravilla y conocimos lugares mágicos!! Súper recomendable! Destacamos el lugar del almuerzo, una experiencia inolvidable! Gracias" },
  { name: "Odaly Castillo", when: { es: "hace 2 meses", en: "2 months ago" },
    text: "Don Eddie y su equipo de conductores son los mejores, hacen de cada trayecto una experiencia única!" },
  { name: "Carmen López", when: { es: "hace un año", en: "a year ago" },
    text: "La experiencia con Carlos ha sido de 10, súper agradable, servicial y atento con todos nosotros. Sin duda, si volvemos a Costa Rica, volveremos a coincidir con él ☺️" },
];

function renderReviews() {
  const grid = document.getElementById("reviewsGrid");
  if (!grid) return;
  grid.innerHTML = REVIEWS.map((r) => `
    <figure class="review-card" data-reveal>
      <div class="review-stars" aria-hidden="true">★★★★★</div>
      <blockquote>${r.text}</blockquote>
      <figcaption>
        <strong>${r.name}</strong>
        <span>${(r.when[currentLang] || r.when.en)} · Google</span>
      </figcaption>
    </figure>`).join("");
}

/* ---------- FAQ (bilingüe) ---------- */
const FAQ = [
  {
    q: { en: "Is the price per person or per vehicle?",
         es: "¿El precio es por persona o por vehículo?" },
    a: { en: "The price is per vehicle, not per person — you travel privately with just your group. One flat rate covers the whole car, with taxes and tolls already included.",
         es: "El precio es por vehículo, no por persona — viajas en privado solo con tu grupo. Una sola tarifa plana cubre todo el vehículo, con impuestos y peajes ya incluidos." }
  },
  {
    q: { en: "Do you pick up from both SJO and Liberia (LIR) airports?",
         es: "¿Recogen en ambos aeropuertos, SJO y Liberia (LIR)?" },
    a: { en: "Yes. We offer door-to-door private transfers from both Juan Santamaría (SJO) in San José and Daniel Oduber (LIR) in Liberia, to any major destination in Costa Rica.",
         es: "Sí. Ofrecemos traslados privados puerta a puerta desde ambos aeropuertos — Juan Santamaría (SJO) en San José y Daniel Oduber (LIR) en Liberia — hacia cualquier destino importante de Costa Rica." }
  },
  {
    q: { en: "What happens if my flight is delayed?",
         es: "¿Qué pasa si mi vuelo se retrasa?" },
    a: { en: "No problem. When you book, just share your flight number — we track it and adjust your pickup time so your driver is waiting when you land, at no extra cost.",
         es: "No hay problema. Al reservar, compártenos tu número de vuelo — lo monitoreamos y ajustamos la hora de recogida para que tu chofer esté esperando cuando aterrices, sin costo extra." }
  },
  {
    q: { en: "Is the service private or shared?",
         es: "¿El servicio es privado o compartido?" },
    a: { en: "100% private. The vehicle is exclusively for you and your group — no strangers and no extra stops to pick up other passengers.",
         es: "100% privado. El vehículo es exclusivo para ti y tu grupo — sin desconocidos ni paradas para recoger a otros pasajeros." }
  },
  {
    q: { en: "How can I pay?",
         es: "¿Cómo puedo pagar?" },
    a: { en: "You can pay by secure online payment link (credit or debit card) or in cash — US dollars or Costa Rican colones. We send you the details when we confirm your trip on WhatsApp.",
         es: "Puedes pagar mediante un enlace de pago seguro en línea (tarjeta de crédito o débito) o en efectivo — dólares o colones. Te enviamos los detalles al confirmar tu viaje por WhatsApp." }
  },
  {
    q: { en: "How do I book my transfer?",
         es: "¿Cómo reservo mi traslado?" },
    a: { en: "Send us your route, date and number of passengers on WhatsApp. We confirm availability and price in minutes and send you a secure payment link to lock in your reservation.",
         es: "Envíanos tu ruta, fecha y número de pasajeros por WhatsApp. Confirmamos disponibilidad y precio en minutos y te enviamos un enlace de pago seguro para apartar tu reserva." }
  },
  {
    q: { en: "Can I cancel my reservation?",
         es: "¿Puedo cancelar mi reserva?" },
    a: { en: "Yes — we offer free cancellation up to 48 hours before your trip. Just message us on WhatsApp and we'll take care of it.",
         es: "Sí — ofrecemos cancelación gratuita hasta 48 horas antes de tu viaje. Solo escríbenos por WhatsApp y nos encargamos." }
  },
  {
    q: { en: "Do you provide child seats?",
         es: "¿Ofrecen sillas para niños?" },
    a: { en: "Yes, free of charge on request. Tell us your children's ages when booking and we'll have the right seats ready in the vehicle.",
         es: "Sí, gratis a solicitud. Indícanos las edades de los niños al reservar y tendremos las sillas adecuadas listas en el vehículo." }
  },
  {
    q: { en: "How much luggage can I bring?",
         es: "¿Cuánto equipaje puedo llevar?" },
    a: { en: "Luggage is included — each passenger can bring a suitcase and a carry-on. Traveling with surfboards, golf clubs or extra bags? Just tell us and we'll assign the right vehicle.",
         es: "El equipaje está incluido — cada pasajero puede llevar una maleta y un equipaje de mano. ¿Viajas con tablas de surf, palos de golf o maletas extra? Avísanos y asignamos el vehículo adecuado." }
  },
  {
    q: { en: "Can we make stops along the way?",
         es: "¿Podemos hacer paradas en el camino?" },
    a: { en: "Of course. Quick stops for the restroom, coffee or photos are included. Want to add a longer sightseeing stop? Let us know and we'll build it into your trip.",
         es: "Por supuesto. Las paradas rápidas para el baño, un café o fotos están incluidas. ¿Quieres agregar una parada turística más larga? Avísanos y la incluimos en tu viaje." }
  },
  {
    q: { en: "Do your drivers speak English?",
         es: "¿Sus choferes hablan inglés?" },
    a: { en: "Many of our drivers speak English, and we do our best to assign an English-speaking driver for your trip. If you'd like a guaranteed bilingual driver-guide, just choose Travesía VIP at checkout.",
         es: "Muchos de nuestros choferes hablan inglés y hacemos lo posible por asignarte uno que lo hable. Si quieres un chofer-guía bilingüe garantizado, elige Travesía VIP al reservar." }
  },
  {
    q: { en: "How far in advance should I book?",
         es: "¿Con cuánta anticipación debo reservar?" },
    a: { en: "We recommend booking at least 24 hours ahead to guarantee availability, especially in high season (December–April). Last minute? Message us and we'll do our best.",
         es: "Recomendamos reservar con al menos 24 horas de anticipación para garantizar disponibilidad, sobre todo en temporada alta (diciembre–abril). ¿A última hora? Escríbenos y hacemos lo posible." }
  },
];

const WHY = [
  { key: "1", icon: '<path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5 0-9 2.5-9 6v2h18v-2c0-3.5-4-6-9-6Z"/>' },
  { key: "2", icon: '<path d="M12 2 4 5v6c0 5 3.4 9.1 8 11 4.6-1.9 8-6 8-11V5l-8-3Zm-1 14-4-4 1.4-1.4L11 13.2l4.6-4.6L17 10l-6 6Z"/>' },
  { key: "3", icon: '<path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"/>' },
  { key: "4", icon: '<path d="M12 1 3 5v6c0 5.6 3.8 10.7 9 12 5.2-1.3 9-6.4 9-12V5l-9-4Zm1.5 15h-3v-2h3v2Zm0-4h-3V7h3v5Z"/>' },
];

/* ---------- SVG bits ---------- */
const ICON_PAX  = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4 0-7 2-7 5v1h14v-1c0-3-3-5-7-5Z"/></svg>';
const ICON_BAG  = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M9 4V2h6v2h3a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1h-1v1h-2v-1H9v1H7v-1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3Zm2 0h2V3h-2v1Z"/></svg>';
const ICON_VAN  = '<svg viewBox="0 0 24 24" width="78" height="78" fill="currentColor"><path d="M3 13V7a2 2 0 0 1 2-2h9l5 5h1a2 2 0 0 1 2 2v3h-2a3 3 0 0 0-6 0H9a3 3 0 0 0-6 0H1v-2h2Zm5-6v3h4.5L10 7H8Zm-2 0v3H5V7h1Z"/><circle cx="6" cy="17" r="2"/><circle cx="18" cy="17" r="2"/></svg>';
const ARROW = '<svg class="arrow" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

/* ---------- RENDER ---------- */
function t(key) { return I18N[currentLang][key] ?? I18N.en[key] ?? key; }
let currentLang = "en";

function renderRoutes() {
  const grid = document.getElementById("routesGrid");
  grid.innerHTML = POPULAR.map(([i, j]) => {
    const p = ptPrice(i, j);
    if (!p) return "";
    const from = ptName(i), to = ptName(j);
    const tag = i === 0 ? "SJO" : i === 1 ? "LIR" : "Costa Rica";
    const slug = (typeof PT_SLUG !== "undefined" && PT_SLUG[i] && PT_SLUG[j])
      ? `/shuttle/${PT_SLUG[i]}-to-${PT_SLUG[j]}` : null;
    const msg = `Hi Travesía! I'd like to book a private transfer from ${from} to ${to} (from $${p.staria}). Date & passengers: `;
    const href = slug || wa(msg);
    const ext = slug ? "" : ` target="_blank" rel="noopener"`;
    return `
      <a class="route-card" href="${href}"${ext} data-reveal>
        <span class="route-tag">${tag}</span>
        <div class="route-path">
          <span class="route-from">${from}</span>
          ${ARROW}
          <span class="route-to">${to}</span>
        </div>
        <div class="route-meta">
          <div class="route-price"><em>$</em>${p.staria}<small data-i18n="route.priceNote">${t("route.priceNote")}</small></div>
          <span class="route-book"><span data-i18n="route.view">${t("route.view")}</span> &rarr;</span>
        </div>
      </a>`;
  }).join("");
}

/* ---------- ROUTE FINDER ---------- */
const VEHICLES = [
  { key: "staria", name: "Hyundai Staria", pax: 5 },
  { key: "hiace",  name: "Toyota Hiace",   pax: 9 },
  { key: "maxus",  name: "Maxus V90",      pax: 12 },
];

/* ---------- Buscador con autocompletado (destinos + hoteles) ---------- */
const normTxt = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
let COMBO_OPTS = [];
function buildComboOptions() {
  COMBO_OPTS = [];
  PT_PLACES.forEach((_, i) =>
    COMBO_OPTS.push({ label: ptName(i), place: i, hotel: false, search: normTxt(ptName(i)) }));
  if (typeof PT_HOTELS !== "undefined") {
    PT_HOTELS.forEach((h) =>
      COMBO_OPTS.push({ label: h.name, place: h.place, hotel: true, zone: ptName(h.place), search: normTxt(h.name) }));
  }
}

function comboState(inputId) {
  const input = document.getElementById(inputId);
  const v = input && input.dataset.place;
  return v != null && v !== "" ? Number(v) : null;
}
function setComboValue(inputId, placeIdx, label) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.value = label != null ? label : ptName(placeIdx);
  input.dataset.place = String(placeIdx);
}

function filterCombo(query) {
  const q = normTxt(query.trim());
  if (!q) {
    const pinned = [0, 1, 44]; // SJO, LIR, San José centro
    const dests = COMBO_OPTS.filter((o) => !o.hotel);
    return [
      ...pinned.map((i) => dests.find((o) => o.place === i)).filter(Boolean),
      ...dests.filter((o) => !pinned.includes(o.place)).sort((a, b) => a.label.localeCompare(b.label, "es")),
    ].slice(0, 8);
  }
  return COMBO_OPTS
    .filter((o) => o.search.includes(q))
    .sort((a, b) => (b.search.startsWith(q) - a.search.startsWith(q)) || a.label.localeCompare(b.label, "es"))
    .slice(0, 8);
}

function renderComboList(inputId, listId) {
  const input = document.getElementById(inputId), list = document.getElementById(listId);
  if (!input || !list) return;
  const opts = filterCombo(input.value);
  if (!opts.length) { list.innerHTML = ""; list.classList.remove("open"); input.setAttribute("aria-expanded", "false"); return; }
  list.innerHTML = opts.map((o) => `
    <li class="combo-item" role="option" data-place="${o.place}" data-label="${o.label.replace(/"/g, "&quot;")}">
      <span class="combo-label">${o.label}</span>
      ${o.hotel ? `<span class="combo-zone">${o.zone}</span>` : ""}
    </li>`).join("");
  list.classList.add("open");
  input.setAttribute("aria-expanded", "true");
}

function chooseCombo(inputId, listId, placeIdx, label) {
  setComboValue(inputId, placeIdx, label);
  document.getElementById(listId)?.classList.remove("open");
  document.getElementById(inputId)?.setAttribute("aria-expanded", "false");
  renderFinder();
}

function setupCombo(inputId, listId) {
  const input = document.getElementById(inputId), list = document.getElementById(listId);
  if (!input || !list) return;
  input.addEventListener("focus", () => renderComboList(inputId, listId));
  input.addEventListener("input", () => { input.dataset.place = ""; renderComboList(inputId, listId); });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { list.classList.remove("open"); input.setAttribute("aria-expanded", "false"); }
    else if (e.key === "Enter") {
      const first = list.querySelector(".combo-item");
      if (first) { e.preventDefault(); chooseCombo(inputId, listId, Number(first.dataset.place), first.getAttribute("data-label")); }
    }
  });
  list.addEventListener("mousedown", (e) => {
    const item = e.target.closest(".combo-item");
    if (item) { e.preventDefault(); chooseCombo(inputId, listId, Number(item.dataset.place), item.getAttribute("data-label")); }
  });
  input.addEventListener("blur", () => setTimeout(() => {
    list.classList.remove("open");
    input.setAttribute("aria-expanded", "false");
  }, 120));
}

function renderFinder() {
  const box = document.getElementById("finderResult");
  if (!box) return;
  const i = comboState("fromInput"), j = comboState("toInput");

  if (i == null || j == null) {
    box.className = "finder-result state-msg";
    box.innerHTML = `<p>${t("finder.pick")}</p>`;
    return;
  }
  if (i === j) {
    box.className = "finder-result state-msg";
    box.innerHTML = `<p>${t("finder.same")}</p>`;
    return;
  }
  const p = ptPrice(i, j);
  if (!p) {
    const msg = `Hi Travesía! I'd like a quote from ${ptName(i)} to ${ptName(j)}. Date & passengers: `;
    box.className = "finder-result state-msg";
    box.innerHTML = `
      <p>${t("finder.notfound")}</p>
      <a class="btn btn-wa" href="${wa(msg)}" target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Z"/></svg>
        <span>${t("finder.notfoundBtn")}</span>
      </a>`;
    return;
  }

  const dur = ptDuration(p.dur);
  const rows = VEHICLES.map((v) => {
    const price = p[v.key];
    const has = price != null;
    const msg = `Hi Travesía! I'd like a quote for the ${v.name} from ${ptName(i)} to ${ptName(j)}. Date & passengers: `;
    return `
      <div class="veh-row${has ? "" : " veh-na"}">
        <div class="veh-info">
          <span class="veh-name">${v.name}</span>
          <span class="veh-pax">${t("finder.upto")} ${v.pax} ${t("finder.pax")}</span>
        </div>
        <div class="veh-buy">
          <span class="veh-price">${has ? `<em>$</em>${price}` : "—"}</span>
          ${has
            ? `<button class="veh-add" type="button" data-add="${i}-${j}-${v.key}"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg><span>${t("finder.add")}</span></button>`
            : `<a class="veh-book" href="${wa(msg)}" target="_blank" rel="noopener">${t("finder.ask")}</a>`}
        </div>
      </div>`;
  }).join("");

  box.className = "finder-result state-price";
  box.innerHTML = `
    <div class="finder-route">
      <span>${ptName(i)}</span>${ARROW}<span>${ptName(j)}</span>
      ${dur ? `<span class="finder-dur"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2" stroke-linecap="round"/></svg>${dur}</span>` : ""}
    </div>
    <div class="veh-list">${rows}</div>
    <p class="finder-note">${t("finder.taxes")}</p>
    <button class="finder-continue" type="button" data-continue="${j}">
      <span>${t("finder.continue")} ${ptName(j)}</span>
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
    </button>`;
}

/* ---------- CART (multi-tramo, 1 solo pago) ---------- */
let CART = [];
try { CART = JSON.parse(localStorage.getItem("travesia-cart") || "[]"); } catch (e) { CART = []; }
function saveCart() { try { localStorage.setItem("travesia-cart", JSON.stringify(CART)); } catch (e) {} }
function cartTotal() { return CART.reduce((s, it) => s + it.price, 0); }

function updateCartCount() {
  const n = CART.length;
  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    el.textContent = String(n);
    el.classList.toggle("has-items", n > 0);
  });
}

function addToCart(i, j, vkey) {
  const p = ptPrice(i, j);
  if (!p || p[vkey] == null) return;
  const v = VEHICLES.find((x) => x.key === vkey);
  CART.push({ i, j, from: ptName(i), to: ptName(j), vkey, vname: v.name, price: p[vkey] });
  saveCart(); updateCartCount(); renderCart();
  toast(t("cart.added"));
  const badge = document.querySelector(".cart-btn");
  if (badge) { badge.classList.remove("pulse"); void badge.offsetWidth; badge.classList.add("pulse"); }
}

function removeFromCart(idx) { CART.splice(idx, 1); saveCart(); updateCartCount(); renderCart(); }
function clearCart() { CART = []; saveCart(); updateCartCount(); renderCart(); }

function cartCheckoutHref() {
  if (!CART.length) return wa("Hi Travesía!");
  const lines = CART.map((it, n) => `${n + 1}) ${it.from}  ->  ${it.to} · ${it.vname} · $${it.price}`).join("\n");
  const msg = `Hi Travesía! I'd like to book this trip:\n${lines}\n\nTotal: $${cartTotal()}\nDate(s) & passengers: `;
  return wa(msg);
}

function renderCart() {
  const list = document.getElementById("cartItems");
  if (!list) return;
  if (!CART.length) {
    list.innerHTML = `<p class="cart-empty">${t("cart.empty")}</p>`;
  } else {
    list.innerHTML = CART.map((it, idx) => `
      <div class="cart-item">
        <div class="cart-item-main">
          <div class="cart-route"><span>${it.from}</span> ${ARROW} <span>${it.to}</span></div>
          <div class="cart-veh">${it.vname}</div>
        </div>
        <div class="cart-item-price">$${it.price}</div>
        <button class="cart-remove" type="button" data-remove="${idx}" aria-label="${t("cart.remove")}" title="${t("cart.remove")}">&times;</button>
      </div>`).join("");
  }
  const totalEl = document.getElementById("cartTotal");
  if (totalEl) totalEl.textContent = "$" + cartTotal();
  const checkout = document.getElementById("cartCheckout");
  if (checkout) { checkout.disabled = !CART.length; checkout.classList.toggle("is-disabled", !CART.length); }
}

/* ---------- CHECKOUT (reserva + pago) ---------- */
function checkoutHasExperience() {
  return document.querySelector('#coForm [name="experience"]:checked')?.value === "1";
}
function checkoutTotal() {
  return cartTotal() + (checkoutHasExperience() ? 80 : 0);
}
function renderCheckoutSummary() {
  const box = document.getElementById("coSummary");
  if (!box) return;
  const exp = checkoutHasExperience();
  box.innerHTML = `
    <div class="co-sum-head"><span>${t("co.trip")}</span><strong>$${checkoutTotal()}</strong></div>
    ${CART.map((it) => `<div class="co-sum-row"><span>${it.from} → ${it.to}</span><span>${it.vname} · $${it.price}</span></div>`).join("")}
    ${exp ? `<div class="co-sum-row co-sum-addon"><span>+ ${t("co.addon")}</span><span>$80</span></div>` : ""}`;
}
function openCheckout() {
  if (!CART.length) { toast(t("co.empty")); return; }
  renderCheckoutSummary();
  document.getElementById("checkout")?.classList.add("open");
  document.getElementById("checkoutOverlay")?.classList.add("show");
  document.body.classList.add("no-scroll");
}
function closeCheckout() {
  document.getElementById("checkout")?.classList.remove("open");
  document.getElementById("checkoutOverlay")?.classList.remove("show");
  document.body.classList.remove("no-scroll");
}
/* Mensaje de reserva completo (interino por WhatsApp; luego lo cobra Tilopay) */
function checkoutOrderMessage(d) {
  const legs = CART.map((it, n) => `${n + 1}) ${it.from} -> ${it.to} · ${it.vname} · $${it.price}`).join("\n");
  const exp = d.experience === "1" ? "\n+ Travesía VIP (guaranteed bilingual guide + 1-2h tourist stops + welcome kit w/ snacks & drinks): $80" : "";
  const total = cartTotal() + (d.experience === "1" ? 80 : 0);
  return `Hi Travesía! New booking:\n${legs}${exp}\nTotal: $${total}\n\n` +
    `Date/time: ${d.date} ${d.time}\nPassengers: ${d.adults} adults, ${d.children || 0} children\n` +
    `Pickup: ${d.pickup}\nFlight: ${d.flight || "-"}\nName: ${d.name}\nEmail: ${d.email}\nPhone: ${d.phone}\nNotes: ${d.notes || "-"}`;
}

function openCart() {
  document.getElementById("cartDrawer")?.classList.add("open");
  document.getElementById("cartOverlay")?.classList.add("show");
  document.body.classList.add("no-scroll");
}
function closeCart() {
  document.getElementById("cartDrawer")?.classList.remove("open");
  document.getElementById("cartOverlay")?.classList.remove("show");
  document.body.classList.remove("no-scroll");
}

/* Encadenar: el destino al que viajaste pasa a ser el nuevo origen */
function continueFrom(j) {
  setComboValue("fromInput", j);
  const toInput = document.getElementById("toInput");
  if (toInput) { toInput.value = ""; toInput.dataset.place = ""; }  // elige el siguiente destino
  renderFinder();
  document.getElementById("finder").scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => toInput && toInput.focus(), 350);
}

/* Aviso breve */
function toast(msg) {
  let el = document.getElementById("toast");
  if (!el) { el = document.createElement("div"); el.id = "toast"; el.className = "toast"; document.body.appendChild(el); }
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 1800);
}

function renderFleet() {
  const grid = document.getElementById("fleetGrid");
  grid.innerHTML = FLEET.map((f) => {
    const msg = `Hi Travesía! I'm interested in the ${f.name} (${f.pax} passengers). `;
    return `
      <article class="fleet-card" data-reveal>
        <div class="fleet-visual">
          <img class="fleet-photo" src="assets/${f.img}" alt="${f.name} — Travesía Costa Rica private shuttle" loading="lazy" style="object-position:${f.pos || "center"}" onerror="this.remove(); this.parentNode.classList.add('no-photo');" />
          <span class="fleet-visual-icon">${ICON_VAN}</span>
        </div>
        <div class="fleet-body">
          <div class="fleet-name">${f.name}</div>
          <div class="fleet-class">${f.cls}</div>
          <div class="fleet-specs">
            <span class="fleet-spec">${ICON_PAX}<strong>${f.pax}</strong> <span data-i18n="fleet.pax">${t("fleet.pax")}</span></span>
            <span class="fleet-spec">${ICON_BAG}<strong>${f.bags}</strong> <span data-i18n="fleet.bags">${t("fleet.bags")}</span></span>
          </div>
          <a class="btn btn-outline" style="margin-top:18px" href="${wa(msg)}" target="_blank" rel="noopener" data-i18n="fleet.book">${t("fleet.book")}</a>
        </div>
      </article>`;
  }).join("");
}

function renderWhy() {
  const grid = document.getElementById("whyGrid");
  grid.innerHTML = WHY.map((w) => `
    <article class="why-card" data-reveal>
      <div class="why-icon"><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">${w.icon}</svg></div>
      <h3 data-i18n="why.${w.key}.t">${t(`why.${w.key}.t`)}</h3>
      <p data-i18n="why.${w.key}.d">${t(`why.${w.key}.d`)}</p>
    </article>`).join("");
}

function renderFAQ() {
  const list = document.getElementById("faqList");
  if (!list) return;
  list.innerHTML = FAQ.map((f) => `
    <details class="faq-item" data-reveal>
      <summary>
        <span>${f.q[currentLang] || f.q.en}</span>
        <svg class="faq-chevron" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </summary>
      <div class="faq-answer"><p>${f.a[currentLang] || f.a.en}</p></div>
    </details>`).join("");
}

/* ---------- I18N APPLY ---------- */
function applyLang(lang) {
  currentLang = I18N[lang] ? lang : "en";
  document.documentElement.lang = currentLang;
  document.body.setAttribute("data-lang", currentLang);
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (I18N[currentLang][key] != null) el.innerHTML = I18N[currentLang][key];
  });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
    const key = el.getAttribute("data-i18n-ph");
    if (I18N[currentLang][key] != null) el.placeholder = I18N[currentLang][key];
  });
  if (document.getElementById("finderResult")) renderFinder(); // el buscador usa texto dinámico
  if (document.getElementById("faqList")) renderFAQ();          // las FAQ usan texto dinámico
  if (document.getElementById("galleryGrid")) renderGallery();  // la galería usa texto dinámico
  if (document.getElementById("reviewsGrid")) renderReviews();  // las reseñas usan fecha dinámica
  if (document.getElementById("cartItems")) renderCart();       // el carrito usa texto dinámico
  if (document.getElementById("checkout")?.classList.contains("open")) renderCheckoutSummary();
  try { localStorage.setItem("travesia-lang", currentLang); } catch (e) {}
}

/* ---------- INIT ---------- */
document.addEventListener("DOMContentLoaded", () => {
  let saved = "en";
  try { saved = localStorage.getItem("travesia-lang") || (navigator.language || "en").slice(0, 2); } catch (e) {}
  currentLang = I18N[saved] ? saved : "en";

  renderRoutes();
  renderFleet();
  renderWhy();
  renderGallery();
  renderReviews();
  renderFAQ();

  // Galería: abrir lightbox al hacer clic
  const galleryGrid = document.getElementById("galleryGrid");
  if (galleryGrid) galleryGrid.addEventListener("click", (e) => {
    const item = e.target.closest("[data-full]");
    if (item) openLightbox(item.getAttribute("data-full"), item.getAttribute("data-cap"));
  });
  document.getElementById("lightboxClose")?.addEventListener("click", closeLightbox);
  document.getElementById("lightbox")?.addEventListener("click", (e) => {
    if (e.target.id === "lightbox") closeLightbox();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });

  // Buscador de rutas (autocompletado destinos + hoteles)
  const fromInput = document.getElementById("fromInput");
  const toInput = document.getElementById("toInput");
  const swapBtn = document.getElementById("swapBtn");
  if (fromInput && toInput) {
    buildComboOptions();
    setupCombo("fromInput", "fromList");
    setupCombo("toInput", "toList");
    setComboValue("fromInput", 0);   // SJO por defecto
    setComboValue("toInput", 2);     // La Fortuna por defecto
    // Pre-llenado desde una página de ruta (?from=&to=)
    const qp = new URLSearchParams(location.search);
    const qf = qp.get("from"), qt = qp.get("to");
    if (qf != null && qt != null && PT_PLACES[+qf] != null && PT_PLACES[+qt] != null) {
      setComboValue("fromInput", +qf);
      setComboValue("toInput", +qt);
      setTimeout(() => document.getElementById("finder")?.scrollIntoView({ behavior: "smooth", block: "center" }), 400);
    }
    if (swapBtn) swapBtn.addEventListener("click", () => {
      const v = fromInput.value, p = fromInput.dataset.place;
      fromInput.value = toInput.value; fromInput.dataset.place = toInput.dataset.place;
      toInput.value = v; toInput.dataset.place = p;
      renderFinder();
    });
  }

  // Delegación de clics del buscador: agregar al carrito / encadenar
  const finderEl = document.getElementById("finder");
  if (finderEl) finderEl.addEventListener("click", (e) => {
    const addBtn = e.target.closest("[data-add]");
    if (addBtn) {
      const [i, j, vkey] = addBtn.getAttribute("data-add").split("-");
      addToCart(Number(i), Number(j), vkey);
      return;
    }
    const contBtn = e.target.closest("[data-continue]");
    if (contBtn) continueFrom(Number(contBtn.getAttribute("data-continue")));
  });

  // Carrito
  renderCart();
  updateCartCount();
  document.getElementById("cartBtn")?.addEventListener("click", openCart);
  document.getElementById("cartClose")?.addEventListener("click", closeCart);
  document.getElementById("cartOverlay")?.addEventListener("click", closeCart);
  document.getElementById("cartClear")?.addEventListener("click", clearCart);
  document.getElementById("cartItems")?.addEventListener("click", (e) => {
    const rm = e.target.closest("[data-remove]");
    if (rm) removeFromCart(Number(rm.getAttribute("data-remove")));
  });

  // Checkout
  document.getElementById("cartCheckout")?.addEventListener("click", () => { closeCart(); openCheckout(); });
  document.getElementById("checkoutClose")?.addEventListener("click", closeCheckout);
  document.getElementById("checkoutBack")?.addEventListener("click", () => { closeCheckout(); openCart(); });
  document.getElementById("checkoutOverlay")?.addEventListener("click", closeCheckout);
  document.getElementById("coForm")?.addEventListener("change", (e) => { if (e.target.name === "experience") renderCheckoutSummary(); });
  const coForm = document.getElementById("coForm");
  if (coForm) coForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!coForm.reportValidity()) return;
    const data = Object.fromEntries(new FormData(coForm).entries());
    // TODO Tilopay: aquí se creará el cobro con tarjeta (función serverless en Vercel).
    // Interino: enviar la reserva completa por WhatsApp para confirmar y cobrar.
    window.open(wa(checkoutOrderMessage(data)), "_blank");
  });

  applyLang(currentLang);

  document.getElementById("year").textContent = "2026";

  // Language toggle
  document.getElementById("langToggle").addEventListener("click", () => {
    applyLang(currentLang === "en" ? "es" : "en");
  });

  // Mobile menu
  const menuBtn = document.getElementById("menuBtn");
  const nav = document.getElementById("nav");
  menuBtn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); })
  );

  // Sticky header shadow
  const header = document.getElementById("header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Scroll reveal
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
});
