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
const ROUTES = [
  { from: "San José (SJO)", to: "La Fortuna / Arenal", price: 190, tag: "sjo" },
  { from: "San José (SJO)", to: "Manuel Antonio",      price: 195, tag: "sjo" },
  { from: "San José (SJO)", to: "Monteverde",          price: 200, tag: "sjo" },
  { from: "Liberia (LIR)",  to: "Tamarindo",           price: 120, tag: "lir" },
  { from: "Liberia (LIR)",  to: "La Fortuna / Arenal", price: 195, tag: "lir" },
  { from: "Liberia (LIR)",  to: "Monteverde",          price: 195, tag: "lir" },
  { from: "La Fortuna / Arenal", to: "Tamarindo",      price: 280, tag: "hub" },
  { from: "La Fortuna / Arenal", to: "Manuel Antonio", price: 295, tag: "hub" },
];

const FLEET = [
  { name: "Hyundai Staria", cls: "Comfort", pax: 5,  bags: 5  },
  { name: "Toyota Hiace",   cls: "Group",   pax: 9,  bags: 9  },
  { name: "Maxus V90",      cls: "Premium", pax: 12, bags: 12 },
];

/* ---------- TRANSLATIONS ---------- */
const I18N = {
  en: {
    "nav.routes": "Routes",
    "nav.fleet": "Fleet",
    "nav.why": "Why us",
    "nav.contact": "Contact",
    "nav.book": "Book on WhatsApp",
    "hero.eyebrow": "Costa Rica · Private Transportation",
    "hero.title1": "Arrive relaxed.",
    "hero.title2": "Travel in comfort.",
    "hero.sub": "Reliable private shuttle service across Costa Rica. Airport transfers, door-to-door, with bilingual drivers and a modern GPS-monitored fleet.",
    "hero.ctaPrimary": "Get a quote on WhatsApp",
    "hero.ctaSecondary": "See routes & prices",
    "hero.trust1": "& LIR airport pickups",
    "hero.trust2": "WhatsApp support",
    "hero.trust3": "passenger vehicles",
    "routes.eyebrow": "Popular departures",
    "routes.title": "Routes & fixed prices",
    "routes.lead": "Transparent flat rates for the whole vehicle — not per person. Don't see your route? Just ask.",
    "routes.custom": "Need a different route? Request a custom quote",
    "route.book": "Book",
    "route.priceNote": "per vehicle",
    "fleet.eyebrow": "The fleet",
    "fleet.title": "Modern, comfortable vehicles",
    "fleet.lead": "Air-conditioned, well-maintained and GPS-monitored. Choose the size that fits your group and luggage.",
    "fleet.pax": "passengers",
    "fleet.bags": "bags",
    "fleet.book": "Book this vehicle",
    "why.eyebrow": "Why Travesía",
    "why.title": "More than a drive",
    "cta.title": "Ready when you are",
    "cta.sub": "Send us your route, date and number of passengers — we'll confirm price and pickup in minutes.",
    "cta.button": "Chat on WhatsApp",
    "footer.tagline": "Premium private transportation across Costa Rica. Safe, punctual, and comfortable — every trip.",
    "footer.explore": "Explore",
    "footer.contact": "Contact",
    "footer.rights": "All rights reserved.",
    "why.1.t": "Bilingual drivers",
    "why.1.d": "Professional, English & Spanish speaking drivers who know every route.",
    "why.2.t": "GPS-monitored fleet",
    "why.2.d": "Every vehicle is tracked in real time for your safety and peace of mind.",
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
    "nav.book": "Reservar por WhatsApp",
    "hero.eyebrow": "Costa Rica · Transporte Privado",
    "hero.title1": "Llega relajado.",
    "hero.title2": "Viaja con confort.",
    "hero.sub": "Servicio privado de shuttle confiable por toda Costa Rica. Traslados de aeropuerto, puerta a puerta, con choferes bilingües y una flota moderna monitoreada por GPS.",
    "hero.ctaPrimary": "Cotizar por WhatsApp",
    "hero.ctaSecondary": "Ver rutas y precios",
    "hero.trust1": "y recogidas en LIR",
    "hero.trust2": "soporte por WhatsApp",
    "hero.trust3": "vehículos de pasajeros",
    "routes.eyebrow": "Salidas populares",
    "routes.title": "Rutas y precios fijos",
    "routes.lead": "Tarifas planas y transparentes por vehículo completo — no por persona. ¿No ves tu ruta? Solo pregúntanos.",
    "routes.custom": "¿Necesitas otra ruta? Pide una cotización personalizada",
    "route.book": "Reservar",
    "route.priceNote": "por vehículo",
    "fleet.eyebrow": "La flota",
    "fleet.title": "Vehículos modernos y cómodos",
    "fleet.lead": "Con aire acondicionado, bien mantenidos y monitoreados por GPS. Elige el tamaño ideal para tu grupo y equipaje.",
    "fleet.pax": "pasajeros",
    "fleet.bags": "maletas",
    "fleet.book": "Reservar este vehículo",
    "why.eyebrow": "Por qué Travesía",
    "why.title": "Más que un traslado",
    "cta.title": "Listos cuando tú lo estés",
    "cta.sub": "Envíanos tu ruta, fecha y número de pasajeros — confirmamos precio y recogida en minutos.",
    "cta.button": "Escríbenos por WhatsApp",
    "footer.tagline": "Transporte privado premium por toda Costa Rica. Seguro, puntual y cómodo — en cada viaje.",
    "footer.explore": "Explorar",
    "footer.contact": "Contacto",
    "footer.rights": "Todos los derechos reservados.",
    "why.1.t": "Choferes bilingües",
    "why.1.d": "Choferes profesionales que hablan inglés y español y conocen cada ruta.",
    "why.2.t": "Flota con GPS",
    "why.2.d": "Cada vehículo se monitorea en tiempo real para tu seguridad y tranquilidad.",
    "why.3.t": "Puerta a puerta",
    "why.3.d": "Te recogemos en el aeropuerto o tu hotel y te llevamos justo a donde necesitas.",
    "why.4.t": "Precio claro y honesto",
    "why.4.d": "Un solo precio por vehículo. Sin cargos ocultos ni sorpresas al final del viaje.",
  },
};

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
  grid.innerHTML = ROUTES.map((r) => {
    const msg = `Hi Travesía! I'd like to book a private transfer from ${r.from} to ${r.to} ($${r.price}). Date & passengers: `;
    return `
      <article class="route-card" data-reveal>
        <span class="route-tag">${r.tag === "hub" ? "Inter-city" : r.tag.toUpperCase()}</span>
        <div class="route-path">
          <span class="route-from">${r.from}</span>
          ${ARROW}
          <span class="route-to">${r.to}</span>
        </div>
        <div class="route-meta">
          <div class="route-price">$${r.price}<small data-i18n="route.priceNote">${t("route.priceNote")}</small></div>
          <a class="route-book" href="${wa(msg)}" target="_blank" rel="noopener">
            <span data-i18n="route.book">${t("route.book")}</span>
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Z"/></svg>
          </a>
        </div>
      </article>`;
  }).join("");
}

function renderFleet() {
  const grid = document.getElementById("fleetGrid");
  grid.innerHTML = FLEET.map((f) => {
    const msg = `Hi Travesía! I'm interested in the ${f.name} (${f.pax} passengers). `;
    return `
      <article class="fleet-card" data-reveal>
        <div class="fleet-visual">${ICON_VAN}</div>
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

/* ---------- I18N APPLY ---------- */
function applyLang(lang) {
  currentLang = I18N[lang] ? lang : "en";
  document.documentElement.lang = currentLang;
  document.body.setAttribute("data-lang", currentLang);
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (I18N[currentLang][key] != null) el.innerHTML = I18N[currentLang][key];
  });
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
