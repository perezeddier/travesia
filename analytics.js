/* Travesía Costa Rica — analítica del sitio
   Google Analytics 4 (GA4) + Microsoft Clarity.
   Un solo archivo cargado por todas las páginas: <script defer src="/analytics.js"></script>
   NOTA: este archivo va en la RAÍZ (no en /assets) a propósito, para que NO le aplique
   el cache "immutable" de un año y podamos actualizar el ID de Clarity cuando esté listo. */
(function () {
  'use strict';

  // ---------- Google Analytics 4 ----------
  var GA_ID = 'G-443V9HBCGT';
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

  // ---------- Microsoft Clarity ----------
  // Microsoft Clarity — proyecto "Travesía" (clarity.microsoft.com)
  var CLARITY_ID = 'y5ccd6f9pa';
  if (CLARITY_ID) {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY_ID);
  }
})();
