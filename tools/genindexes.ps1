<#
  Genera /shuttle/index.html y /hotel/index.html: paginas "hub" que enlazan
  (con <a href> reales) a TODAS las paginas de ruta y de hotel, para que
  Google pueda descubrirlas navegando desde /  ->  /shuttle o /hotel  ->  cada pagina.
  Antes de este script, esas ~480 paginas solo existian en el sitemap.xml,
  sin ningun enlace interno real apuntando hacia ellas (paginas "huerfanas").

  Volver a correr este script cada vez que se agreguen rutas u hoteles nuevos
  (via genroutes.ps1 / genhotels.ps1 / genshuttleto.ps1).
#>
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$base = "https://travesiacr.online"

function HtmlEnc([string]$s) { $s }  # el texto ya viene escapado desde el H1 de cada pagina

# ---------- 1) Rutas punto-a-punto: /shuttle/origen-to-destino.html ----------
$routes = New-Object System.Collections.ArrayList
Get-ChildItem "$root/shuttle/*.html" | Where-Object { $_.Name -ne "index.html" } | ForEach-Object {
  $c = Get-Content $_.FullName -Raw -Encoding UTF8
  if ($c -match '<h1>Private Shuttle from (.*?) to <span class="to">(.*?)</span></h1>') {
    [void]$routes.Add([PSCustomObject]@{ Origin = $matches[1]; Dest = $matches[2]; Slug = $_.BaseName })
  }
}
Write-Host "Rutas encontradas: $($routes.Count)"

# ---------- 2) Shuttle-to: /shuttle-to/destino.html (cualquier origen) ----------
$shuttleTo = New-Object System.Collections.ArrayList
if (Test-Path "$root/shuttle-to") {
  Get-ChildItem "$root/shuttle-to/*.html" | ForEach-Object {
    $c = Get-Content $_.FullName -Raw -Encoding UTF8
    if ($c -match '<h1>Private Shuttle to <span class="to">(.*?)</span></h1>') {
      [void]$shuttleTo.Add([PSCustomObject]@{ Dest = $matches[1]; Slug = $_.BaseName })
    }
  }
}
Write-Host "Shuttle-to encontrados: $($shuttleTo.Count)"

# ---------- 3) Hoteles: /hotel/nombre-hotel.html ----------
$hotels = New-Object System.Collections.ArrayList
Get-ChildItem "$root/hotel/*.html" | Where-Object { $_.Name -ne "index.html" } | ForEach-Object {
  $c = Get-Content $_.FullName -Raw -Encoding UTF8
  $name = $null; $zone = $null
  if ($c -match '<h1>Private Shuttle from <span class="to">(.*?)</span></h1>') { $name = $matches[1] }
  if ($c -match '<span class="rp-chip">([^<]+), Costa Rica</span>') { $zone = $matches[1] }
  if ($name) {
    if (-not $zone) { $zone = "Costa Rica" }
    [void]$hotels.Add([PSCustomObject]@{ Name = $name; Zone = $zone; Slug = $_.BaseName })
  }
}
Write-Host "Hoteles encontrados: $($hotels.Count)"

# ================= construir /shuttle/index.html =================
$sb = New-Object System.Text.StringBuilder

[void]$sb.AppendLine('<!doctype html>')
[void]$sb.AppendLine('<html lang="en">')
[void]$sb.AppendLine('<head>')
[void]$sb.AppendLine('<meta charset="utf-8">')
[void]$sb.AppendLine('<meta name="viewport" content="width=device-width, initial-scale=1">')
[void]$sb.AppendLine('<title>All Private Shuttle Routes in Costa Rica | Travesia</title>')
[void]$sb.AppendLine('<meta name="description" content="Browse every private shuttle route we run across Costa Rica: airports, beach towns, volcanoes and national parks. Flat rate per vehicle, taxes included.">')
[void]$sb.AppendLine('<link rel="canonical" href="https://travesiacr.online/shuttle">')
[void]$sb.AppendLine('<meta name="theme-color" content="#0d0f12">')
[void]$sb.AppendLine('<meta property="og:type" content="website">')
[void]$sb.AppendLine('<meta property="og:title" content="All Private Shuttle Routes in Costa Rica | Travesia">')
[void]$sb.AppendLine('<meta property="og:description" content="Browse every private shuttle route across Costa Rica. Flat rate per vehicle, taxes included.">')
[void]$sb.AppendLine('<meta property="og:url" content="https://travesiacr.online/shuttle">')
[void]$sb.AppendLine('<meta property="og:image" content="https://travesiacr.online/assets/hero.jpg">')
[void]$sb.AppendLine('<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">')
[void]$sb.AppendLine('<link rel="preconnect" href="https://fonts.googleapis.com">')
[void]$sb.AppendLine('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>')
[void]$sb.AppendLine('<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">')
[void]$sb.AppendLine('<link rel="stylesheet" href="/route.css">')
[void]$sb.AppendLine('  <script defer src="/analytics.js"></script>')
[void]$sb.AppendLine('</head>')
[void]$sb.AppendLine('<body>')
[void]$sb.AppendLine('<header class="rp-header">')
[void]$sb.AppendLine('  <div class="wrap">')
[void]$sb.AppendLine('    <a class="rp-brand" href="/"><img src="/assets/logo-travesia.webp" alt="Travesia Costa Rica"></a>')
[void]$sb.AppendLine('    <a class="rp-cta" href="/#routes">Get an instant price</a>')
[void]$sb.AppendLine('  </div>')
[void]$sb.AppendLine('</header>')
[void]$sb.AppendLine('')
[void]$sb.AppendLine('<section class="rp-hero">')
[void]$sb.AppendLine('  <div class="wrap">')
[void]$sb.AppendLine('    <nav class="rp-crumbs"><a href="/">Home</a> &rsaquo; All routes</nav>')
[void]$sb.AppendLine('    <h1>All Private Shuttle <span class="to">Routes</span></h1>')
[void]$sb.AppendLine("    <p class=`"rp-lead`" style=`"margin-top:16px`">Every route we run across Costa Rica, door to door in a private vehicle - taxes included, one flat price per van. Don't see your exact route? <a href=`"/#routes`">get an instant price here</a> or ask us on WhatsApp.</p>")
[void]$sb.AppendLine('  </div>')
[void]$sb.AppendLine('</section>')

if ($shuttleTo.Count -gt 0) {
  [void]$sb.AppendLine('<section class="rp-sec">')
  [void]$sb.AppendLine('  <div class="wrap">')
  [void]$sb.AppendLine('    <h2>Shuttle to a destination (from any airport or town)</h2>')
  [void]$sb.AppendLine('    <div class="guide-list">')
  foreach ($d in ($shuttleTo | Sort-Object Dest)) {
    [void]$sb.AppendLine("      <a href=`"/shuttle-to/$($d.Slug)`"><h3>Shuttle to $($d.Dest)</h3></a>")
  }
  [void]$sb.AppendLine('    </div>')
  [void]$sb.AppendLine('  </div>')
  [void]$sb.AppendLine('</section>')
}

[void]$sb.AppendLine('<section class="rp-sec">')
[void]$sb.AppendLine('  <div class="wrap">')
[void]$sb.AppendLine('    <h2>All routes by origin</h2>')
$byOrigin = $routes | Group-Object Origin | Sort-Object Name
foreach ($g in $byOrigin) {
  [void]$sb.AppendLine("    <h3 style=`"margin:26px 0 10px;font-family:var(--font-head)`">From $($g.Name)</h3>")
  [void]$sb.AppendLine('    <div class="guide-list">')
  foreach ($r in ($g.Group | Sort-Object Dest)) {
    [void]$sb.AppendLine("      <a href=`"/shuttle/$($r.Slug)`"><h3>$($r.Origin) &rarr; $($r.Dest)</h3></a>")
  }
  [void]$sb.AppendLine('    </div>')
}
[void]$sb.AppendLine('  </div>')
[void]$sb.AppendLine('</section>')

[void]$sb.AppendLine('<section class="rp-cta-band">')
[void]$sb.AppendLine('  <div class="wrap">')
[void]$sb.AppendLine('    <h2>Ready to book your transfer?</h2>')
[void]$sb.AppendLine('    <p>Compare routes and get an instant price across Costa Rica.</p>')
[void]$sb.AppendLine('    <div class="rp-btns">')
[void]$sb.AppendLine('      <a class="btn btn-primary" href="/#routes">Find your route</a>')
[void]$sb.AppendLine('      <a class="btn btn-wa" href="https://wa.me/50685028476?text=Hi%20Traves%C3%ADa!" target="_blank" rel="noopener">')
[void]$sb.AppendLine('        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Z"/></svg>')
[void]$sb.AppendLine('        WhatsApp')
[void]$sb.AppendLine('      </a>')
[void]$sb.AppendLine('    </div>')
[void]$sb.AppendLine('  </div>')
[void]$sb.AppendLine('</section>')

[void]$sb.AppendLine('<footer class="rp-footer">')
[void]$sb.AppendLine('  <div class="wrap">')
[void]$sb.AppendLine('    <p>&copy; 2026 Travesia Costa Rica &middot; Private shuttles &amp; airport transfers<br>')
[void]$sb.AppendLine('    <a href="/">travesiacr.online</a> &middot; WhatsApp +506 8502 8476 &middot; <a href="mailto:infotravesiacr@gmail.com">infotravesiacr@gmail.com</a></p>')
[void]$sb.AppendLine('  </div>')
[void]$sb.AppendLine('</footer>')
[void]$sb.AppendLine('</body>')
[void]$sb.AppendLine('</html>')

[System.IO.File]::WriteAllText("$root/shuttle/index.html", $sb.ToString())
Write-Host "Escrito shuttle/index.html"

# ================= construir /hotel/index.html =================
$sb2 = New-Object System.Text.StringBuilder

[void]$sb2.AppendLine('<!doctype html>')
[void]$sb2.AppendLine('<html lang="en">')
[void]$sb2.AppendLine('<head>')
[void]$sb2.AppendLine('<meta charset="utf-8">')
[void]$sb2.AppendLine('<meta name="viewport" content="width=device-width, initial-scale=1">')
[void]$sb2.AppendLine('<title>Private Shuttles to Costa Rica Hotels & Resorts | Travesia</title>')
[void]$sb2.AppendLine('<meta name="description" content="Private door-to-door shuttle transfers to and from popular Costa Rica hotels and resorts. Flat rate per vehicle, taxes included, flight tracking.">')
[void]$sb2.AppendLine('<link rel="canonical" href="https://travesiacr.online/hotel">')
[void]$sb2.AppendLine('<meta name="theme-color" content="#0d0f12">')
[void]$sb2.AppendLine('<meta property="og:type" content="website">')
[void]$sb2.AppendLine('<meta property="og:title" content="Private Shuttles to Costa Rica Hotels & Resorts | Travesia">')
[void]$sb2.AppendLine('<meta property="og:description" content="Private door-to-door shuttle transfers to and from popular Costa Rica hotels and resorts.">')
[void]$sb2.AppendLine('<meta property="og:url" content="https://travesiacr.online/hotel">')
[void]$sb2.AppendLine('<meta property="og:image" content="https://travesiacr.online/assets/hero.jpg">')
[void]$sb2.AppendLine('<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">')
[void]$sb2.AppendLine('<link rel="preconnect" href="https://fonts.googleapis.com">')
[void]$sb2.AppendLine('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>')
[void]$sb2.AppendLine('<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">')
[void]$sb2.AppendLine('<link rel="stylesheet" href="/route.css">')
[void]$sb2.AppendLine('  <script defer src="/analytics.js"></script>')
[void]$sb2.AppendLine('</head>')
[void]$sb2.AppendLine('<body>')
[void]$sb2.AppendLine('<header class="rp-header">')
[void]$sb2.AppendLine('  <div class="wrap">')
[void]$sb2.AppendLine('    <a class="rp-brand" href="/"><img src="/assets/logo-travesia.webp" alt="Travesia Costa Rica"></a>')
[void]$sb2.AppendLine('    <a class="rp-cta" href="/#routes">Get an instant price</a>')
[void]$sb2.AppendLine('  </div>')
[void]$sb2.AppendLine('</header>')
[void]$sb2.AppendLine('')
[void]$sb2.AppendLine('<section class="rp-hero">')
[void]$sb2.AppendLine('  <div class="wrap">')
[void]$sb2.AppendLine('    <nav class="rp-crumbs"><a href="/">Home</a> &rsaquo; Hotels</nav>')
[void]$sb2.AppendLine('    <h1>Shuttles to Costa Rica <span class="to">Hotels &amp; Resorts</span></h1>')
[void]$sb2.AppendLine("    <p class=`"rp-lead`" style=`"margin-top:16px`">Private, door-to-door transfers to and from the hotels and resorts below. Not on the list? <a href=`"/#routes`">get an instant price here</a> with your hotel name.</p>")
[void]$sb2.AppendLine('  </div>')
[void]$sb2.AppendLine('</section>')

[void]$sb2.AppendLine('<section class="rp-sec">')
[void]$sb2.AppendLine('  <div class="wrap">')
$byZone = $hotels | Group-Object Zone | Sort-Object Name
foreach ($g in $byZone) {
  [void]$sb2.AppendLine("    <h2 style=`"margin:26px 0 10px`">$($g.Name)</h2>")
  [void]$sb2.AppendLine('    <div class="guide-list">')
  foreach ($h in ($g.Group | Sort-Object Name)) {
    [void]$sb2.AppendLine("      <a href=`"/hotel/$($h.Slug)`"><h3>$($h.Name)</h3></a>")
  }
  [void]$sb2.AppendLine('    </div>')
}
[void]$sb2.AppendLine('  </div>')
[void]$sb2.AppendLine('</section>')

[void]$sb2.AppendLine('<section class="rp-cta-band">')
[void]$sb2.AppendLine('  <div class="wrap">')
[void]$sb2.AppendLine('    <h2>Ready to book your transfer?</h2>')
[void]$sb2.AppendLine('    <p>Get an instant price to or from your hotel.</p>')
[void]$sb2.AppendLine('    <div class="rp-btns">')
[void]$sb2.AppendLine('      <a class="btn btn-primary" href="/#routes">Find your route</a>')
[void]$sb2.AppendLine('      <a class="btn btn-wa" href="https://wa.me/50685028476?text=Hi%20Traves%C3%ADa!" target="_blank" rel="noopener">')
[void]$sb2.AppendLine('        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Z"/></svg>')
[void]$sb2.AppendLine('        WhatsApp')
[void]$sb2.AppendLine('      </a>')
[void]$sb2.AppendLine('    </div>')
[void]$sb2.AppendLine('  </div>')
[void]$sb2.AppendLine('</section>')

[void]$sb2.AppendLine('<footer class="rp-footer">')
[void]$sb2.AppendLine('  <div class="wrap">')
[void]$sb2.AppendLine('    <p>&copy; 2026 Travesia Costa Rica &middot; Private shuttles &amp; airport transfers<br>')
[void]$sb2.AppendLine('    <a href="/">travesiacr.online</a> &middot; WhatsApp +506 8502 8476 &middot; <a href="mailto:infotravesiacr@gmail.com">infotravesiacr@gmail.com</a></p>')
[void]$sb2.AppendLine('  </div>')
[void]$sb2.AppendLine('</footer>')
[void]$sb2.AppendLine('</body>')
[void]$sb2.AppendLine('</html>')

[System.IO.File]::WriteAllText("$root/hotel/index.html", $sb2.ToString())
Write-Host "Escrito hotel/index.html"
