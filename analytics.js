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
      try { localStorage.setItem(CONSENT_KEY, 'declined'); } catch (e) {}
      remove();
    });

    document.body.appendChild(wrap);
  }

  var consent = '';
  try { consent = localStorage.getItem(CONSENT_KEY) || ''; } catch (e) {}
  if (consent === 'accepted') {
    initAnalytics();
  } else if (consent !== 'declined') {
    showBanner();
  }
})();
