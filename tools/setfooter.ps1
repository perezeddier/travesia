<#
  Reemplaza el pie de pagina "de una linea" por un pie con enlaces reales
  (rutas populares, hoteles, guias, resenas, legales) en TODAS las paginas
  internas que usan /route.css, y tambien en las plantillas de tools/.

  Por que: eran ~660 paginas con un solo enlace interno hacia "/". Un pie con
  enlaces reparte autoridad interna y le da a Google caminos para descubrir e
  indexar las paginas de hotel, guias y tours.

  Es idempotente: se puede volver a correr cuando se cambien los enlaces.
#>
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

$cols = @'
<footer class="rp-footer">
  <div class="wrap">
    <div class="ft-cols">
      <div class="ft-col">
        <h3>Traves&iacute;a Costa Rica</h3>
        <p>Private shuttles, airport transfers and tours across Costa Rica. Owner-driven by Eddie, licensed and fully insured.</p>
        <p class="ft-rate">&#9733;&#9733;&#9733;&#9733;&#9733; 5.0 on Google &amp; TripAdvisor</p>
      </div>
      <div class="ft-col">
        <h3>Book a transfer</h3>
        <ul>
          <li><a href="/">Get your price &amp; book online</a></li>
          <li><a href="/shuttle">All shuttle routes</a></li>
          <li><a href="/hotel">Shuttles by hotel</a></li>
          <li><a href="/full-trip-chauffeur">Full Trip Chauffeur</a></li>
          <li><a href="/tours">Tours in La Fortuna</a></li>
          <li><a href="/reviews">Traveler reviews</a></li>
          <li><a href="/fleet">Our fleet</a></li>
          <li><a href="/about">About Eddie</a></li>
          <li><a href="/faq">FAQ</a></li>
        </ul>
      </div>
      <div class="ft-col">
        <h3>Popular transfers</h3>
        <ul>
          <li><a href="/shuttle/san-jose-airport-to-la-fortuna">SJO Airport &rarr; La Fortuna</a></li>
          <li><a href="/shuttle/san-jose-airport-to-manuel-antonio">SJO Airport &rarr; Manuel Antonio</a></li>
          <li><a href="/shuttle/san-jose-airport-to-monteverde">SJO Airport &rarr; Monteverde</a></li>
          <li><a href="/shuttle/liberia-airport-to-tamarindo">Liberia Airport &rarr; Tamarindo</a></li>
          <li><a href="/shuttle/la-fortuna-to-monteverde">La Fortuna &rarr; Monteverde</a></li>
          <li><a href="/shuttle/la-fortuna-to-manuel-antonio">La Fortuna &rarr; Manuel Antonio</a></li>
        </ul>
      </div>
      <div class="ft-col">
        <h3>Plan your trip</h3>
        <ul>
          <li><a href="/guide">Costa Rica travel guides</a></li>
          <li><a href="/guide/sjo-vs-lir-which-airport">SJO or LIR: which airport?</a></li>
          <li><a href="/guide/how-much-do-shuttles-cost-in-costa-rica">How much do shuttles cost?</a></li>
          <li><a href="/guide/costa-rica-7-day-itinerary">7-day Costa Rica itinerary</a></li>
          <li><a href="/guide/costa-rica-with-kids">Costa Rica with kids</a></li>
          <li><a href="/guide/do-you-need-a-car-in-costa-rica">Do you need a car?</a></li>
        </ul>
      </div>
      <div class="ft-col">
        <h3>Contact</h3>
        <ul>
          <li><a href="https://wa.me/50685028476" target="_blank" rel="noopener">WhatsApp +506 8502 8476</a></li>
          <li><a href="mailto:infotravesiacr@gmail.com">infotravesiacr@gmail.com</a></li>
          <li><a href="/costa-rica-airport-transfers">Airport transfers</a></li>
          <li><a href="/costa-rica-private-transportation">Private transportation</a></li>
          <li><a href="/terms">Terms &amp; conditions</a></li>
          <li><a href="/privacy">Privacy policy</a></li>
        </ul>
      </div>
    </div>
    <p class="ft-legal">&copy; {{YEAR}} Traves&iacute;a Costa Rica &middot; Private shuttles &amp; airport transfers in Costa Rica &middot; <a href="/">travesiacr.online</a></p>
  </div>
</footer>
'@

$rx = [System.Text.RegularExpressions.Regex]::new('<footer class="rp-footer">.*?</footer>',
      [System.Text.RegularExpressions.RegexOptions]::Singleline)

$dirs = @("$root/shuttle", "$root/shuttle-to", "$root/hotel", "$root/guide", "$root/tours")
$files = New-Object System.Collections.ArrayList
foreach ($d in $dirs) { if (Test-Path $d) { Get-ChildItem "$d/*.html" | ForEach-Object { [void]$files.Add($_.FullName) } } }
foreach ($f in @("costa-rica-airport-transfers.html","costa-rica-birding-transportation.html","costa-rica-private-transportation.html","full-trip-chauffeur.html","private-shuttle-costa-rica.html","terms.html","privacy.html","reviews.html","404.html")) {
  if (Test-Path "$root/$f") { [void]$files.Add("$root/$f") }
}
foreach ($f in @("route-template.html","hotel-template.html","shuttleto-template.html")) {
  if (Test-Path "$root/tools/$f") { [void]$files.Add("$root/tools/$f") }
}

$n = 0; $miss = 0
foreach ($path in $files) {
  $c = [System.IO.File]::ReadAllText($path, [Text.Encoding]::UTF8)
  if (-not $rx.IsMatch($c)) { $miss++; continue }
  $isTpl = $path -match "tools"
  $block = if ($isTpl) { $cols.Replace("{{YEAR}}", "{{YEAR}}") } else { $cols.Replace("{{YEAR}}", "2026") }
  $c2 = $rx.Replace($c, $block, 1)
  if ($c2 -ne $c) { [System.IO.File]::WriteAllText($path, $c2, $utf8NoBom); $n++ }
}
Write-Host "Pie actualizado en $n archivos ($miss sin pie rp-footer)."
