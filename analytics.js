/* Travesía Costa Rica — analítica del sitio + aviso de cookies
   Google Analytics 4 (GA4) + Microsoft Clarity, con banner de consentimiento simple.
   Un solo archivo cargado por todas las páginas: <script defer src="/analytics.js"></script>
   NOTA: este archivo va en la RAÍZ (no en /assets) a propósito, para que NO le aplique
   el cache "immutable" de un año y podamos actualizar el ID de Clarity cuando esté listo. */
(function () {
  'use strict';

  var GA_ID = 'G-443V9HBCGT';
  var CLARITY_ID = 'y5ccd6f9pa';
  var CONSENT_KEY = 'travesia-cookie-consent';

  function initAnalytics() {
    if (GA_ID) {
      var g = document.createElement('script');
      g.async = true;
      g.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
      document.head.appendChild(g);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', GA_ID);
    }
    if (CLARITY_ID) {
      (function (c, l, a, r, i, t, y) {
        c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
        t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
        y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
      })(window, document, 'clarity', 'script', CLARITY_ID);
    }
  }

  function getLang() {
    var saved = '';
    try { saved = localStorage.getItem('travesia-lang') || ''; } catch (e) {}
    var lang = saved || document.documentElement.lang || 'en';
    return lang.slice(0, 2) === 'es' ? 'es' : 'en';
  }

  function showBanner() {
    var es = getLang() === 'es';
    var wrap = document.createElement('div');
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-label', es ? 'Aviso de cookies' : 'Cookie notice');
    wrap.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#12151a;' +
      'border-top:1px solid rgba(255,255,255,.1);padding:16px 18px;font-family:Inter,system-ui,sans-serif;' +
      'display:flex;flex-wrap:wrap;gap:14px;align-items:center;justify-content:center;' +
      'box-shadow:0 -8px 24px rgba(0,0,0,.35)';
    var msg = document.createElement('p');
    msg.style.cssText = 'margin:0;color:#c9ced6;font-size:13.5px;line-height:1.5;max-width:640px;flex:1 1 320px';
    msg.textContent = es
      ? 'Usamos cookies de análisis (Google Analytics, Microsoft Clarity) para entender cómo usás el sitio y mejorarlo. Podés aceptarlas o rechazarlas.'
      : 'We use analytics cookies (Google Analytics, Microsoft Clarity) to understand how you use the site and improve it. You can accept or decline them.';
    var btns = document.createElement('div');
    btns.style.cssText = 'display:flex;gap:10px;flex:0 0 auto';
    var decline = document.createElement('button');
    decline.type = 'button';
    decline.textContent = es ? 'Rechazar' : 'Decline';
    decline.style.cssText = 'background:transparent;color:#c9ced6;border:1px solid rgba(255,255,255,.25);' +
      'border-radius:8px;padding:10px 16px;font-size:13.5px;font-weight:600;cursor:pointer';
    var accept = document.createElement('button');
    accept.type = 'button';
    accept.textContent = es ? 'Aceptar' : 'Accept';
    accept.style.cssText = 'background:#e07b1f;color:#241c05;border:none;border-radius:8px;' +
      'padding:10px 18px;font-size:13.5px;font-weight:700;cursor:pointer';
    btns.appendChild(decline);
    btns.appendChild(accept);
    wrap.appendChild(msg);
    wrap.appendChild(btns);

    function remove() { wrap.parentNode && wrap.parentNode.removeChild(wrap); }
    accept.addEventListener('click', function () {
      try { localStorage.setItem(CONSENT_KEY, 'accepted'); } catch (e) {}
      remove();
      initAnalytics();
    });
    decline.addEventListener('click', function () {
      try { localStorage.setItem(CONSENT_KEY, 'declined'); localStorage.removeItem('travesia-origen'); } catch (e) {}
      remove();
    });

    document.body.appendChild(wrap);
  }

  /* ---- POR DONDE LLEGO EL CLIENTE (Google, Facebook, ChatGPT...) ----
     Se guarda SOLO en el navegador del visitante y solo viaja a nosotros si
     él mismo reserva (va junto con la reserva, para saber qué canal vende).
     No usa terceros ni cookies, por eso corre aunque rechace la analítica.
     first = la primera vez que nos encontró · last = la última visita que
     vino de algún lado (las visitas "directas" no pisan un canal conocido). */
  var ORIGEN_KEY = 'travesia-origen';
  function canalDe(txt) {
    var s = String(txt || '').toLowerCase();
    if (!s) return '';
    var reglas = [
      [/chatgpt|openai/, 'ChatGPT'], [/perplexity/, 'Perplexity'], [/gemini\.google|bard\.google/, 'Gemini'],
      [/copilot/, 'Copilot'], [/claude\.ai|anthropic/, 'Claude'], [/tripadvisor/, 'TripAdvisor'],
      [/facebook|fb\.com|fb\.me|^fb$/, 'Facebook'], [/instagram|^ig$/, 'Instagram'], [/tiktok/, 'TikTok'],
      [/whatsapp|wa\.me/, 'WhatsApp'], [/youtube|youtu\.be/, 'YouTube'], [/pinterest|pin\.it/, 'Pinterest'],
      [/reddit/, 'Reddit'], [/gmail|mail\.|outlook|android\.gm/, 'Correo'], [/gbp|google.?business|maps\.google|google\.[a-z.]+\/maps/, 'Google Maps / Ficha'],
      [/google|^goo\.gl/, 'Google'], [/bing/, 'Bing'], [/duckduckgo/, 'DuckDuckGo'], [/yahoo/, 'Yahoo'],
      [/maps\.apple/, 'Apple Maps'], [/trip\.com/, 'Trip.com'],
    ];
    for (var i = 0; i < reglas.length; i++) if (reglas[i][0].test(s)) return reglas[i][1];
    return s.replace(/^www\./, '');
  }
  (function guardarOrigen() {
    try {
      // Si rechazó la analítica, respetarlo: no se guarda nada (y se borra lo que hubiera).
      if (localStorage.getItem(CONSENT_KEY) === 'declined') { localStorage.removeItem(ORIGEN_KEY); return; }
      var qs = new URLSearchParams(location.search);
      var ref = '';
      try { ref = document.referrer ? new URL(document.referrer).hostname : ''; } catch (e) {}
      // Navegación interna, y la vuelta desde la página de pago (Tilopay) tampoco es un canal
      if (ref === location.hostname || /travesiacr\.online$|travesia-phi\.vercel\.app$|tilopay\.com$/.test(ref)) ref = '';
      var utm = qs.get('utm_source') || '';
      var ua = navigator.userAgent || '';
      // Dentro de la app de Facebook/Instagram/TikTok TODAS las páginas se ven "desde la app":
      // solo cuenta la primera página de la visita, si no cada clic sería una visita nueva.
      var nuevaSesion = true;
      try { nuevaSesion = !sessionStorage.getItem('travesia-sesion'); sessionStorage.setItem('travesia-sesion', '1'); } catch (e) {}
      var app = !nuevaSesion ? '' : /FBAN|FBAV|FB_IAB|FBIOS/.test(ua) ? 'facebook' : /Instagram/.test(ua) ? 'instagram'
        : /musical_ly|BytedanceWebview|TikTok/.test(ua) ? 'tiktok' : '';
      var canal = (qs.get('gclid') ? 'Google (anuncio)' : '') || canalDe(utm) || canalDe(ref) || canalDe(app);
      var toque = {
        c: canal || 'Directo', r: ref, u: [utm, qs.get('utm_medium'), qs.get('utm_campaign')].filter(Boolean).join(' / '),
        l: location.pathname, t: new Date().toISOString().slice(0, 10),
      };
      var guardado = null;
      try { guardado = JSON.parse(localStorage.getItem(ORIGEN_KEY) || 'null'); } catch (e) {}
      if (!guardado || !guardado.first) guardado = { first: toque, last: toque, n: 1 };
      else if (canal) { guardado.last = toque; guardado.n = (guardado.n || 1) + 1; }
      else if (!ref && document.referrer === '' && performance && performance.navigation && performance.navigation.type === 0) {
        guardado.n = (guardado.n || 1) + 1;   // volvió directo (escribió la dirección o un favorito)
      } else return;
      localStorage.setItem(ORIGEN_KEY, JSON.stringify(guardado));
    } catch (e) {}
  })();

  var consent = '';
  try { consent = localStorage.getItem(CONSENT_KEY) || ''; } catch (e) {}
  if (consent === 'accepted') {
    initAnalytics();
  } else if (consent !== 'declined') {
    showBanner();
  }
})();
