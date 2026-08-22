$root = "C:\Users\veroc\travesia"
$outDir = Join-Path $root "hotel"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
Get-ChildItem -Path $outDir -Filter *.html -ErrorAction SilentlyContinue | Remove-Item -Force
$base = "https://travesiacr.online"
$WA = "50685028476"

# --- Leer PT_ROWS y PT_HOTELS desde routes-data.js ---
$rd = Get-Content -Raw -Encoding UTF8 (Join-Path $root "routes-data.js")
$mrx = [regex]::Match($rd, 'const PT_ROWS = (\[.*?\]);', [System.Text.RegularExpressions.RegexOptions]::Singleline)
$rows = $mrx.Groups[1].Value | ConvertFrom-Json

$hotels = New-Object System.Collections.ArrayList
$hrx = [regex]::Matches($rd, '\{\s*name:\s*"([^"]+)",\s*place:\s*(\d+)\s*\}')
foreach ($m in $hrx) {
  [void]$hotels.Add(@{ name = $m.Groups[1].Value; place = [int]$m.Groups[2].Value })
}

# --- Zonas: nombre + slug (deben coincidir EXACTO con genroutes.ps1 para que los links crucen bien) ---
$meta = @{}
$meta[0]  = @{ n = "San Jose Airport (SJO)"; slug = "san-jose-airport" }
$meta[1]  = @{ n = "Liberia Airport (LIR)"; slug = "liberia-airport" }
$meta[2]  = @{ n = "La Fortuna / Arenal"; slug = "la-fortuna" }
$meta[3]  = @{ n = "Monteverde"; slug = "monteverde" }
$meta[4]  = @{ n = "Manuel Antonio"; slug = "manuel-antonio" }
$meta[5]  = @{ n = "Tamarindo"; slug = "tamarindo" }
$meta[6]  = @{ n = "Playa Conchal"; slug = "playa-conchal" }
$meta[7]  = @{ n = "Brasilito"; slug = "brasilito" }
$meta[8]  = @{ n = "Papagayo"; slug = "papagayo" }
$meta[9]  = @{ n = "Puerto Viejo"; slug = "puerto-viejo" }
$meta[10] = @{ n = "Santa Teresa"; slug = "santa-teresa" }
$meta[11] = @{ n = "Jaco"; slug = "jaco" }
$meta[12] = @{ n = "Playas del Coco"; slug = "playas-del-coco" }
$meta[13] = @{ n = "Playa Flamingo"; slug = "playa-flamingo" }
$meta[14] = @{ n = "Playa Hermosa (Guanacaste)"; slug = "playa-hermosa" }
$meta[16] = @{ n = "Playa Potrero"; slug = "playa-potrero" }
$meta[18] = @{ n = "Ocotal"; slug = "ocotal" }
$meta[19] = @{ n = "Dominical"; slug = "dominical" }
$meta[20] = @{ n = "Uvita"; slug = "uvita" }
$meta[23] = @{ n = "Herradura / Los Suenos"; slug = "los-suenos" }
$meta[30] = @{ n = "Rincon de la Vieja"; slug = "rincon-de-la-vieja" }
$meta[38] = @{ n = "Montezuma"; slug = "montezuma" }
$meta[39] = @{ n = "Nosara"; slug = "nosara" }
$meta[40] = @{ n = "Samara"; slug = "samara" }
$meta[41] = @{ n = "Puerto Jimenez"; slug = "puerto-jimenez" }
$meta[42] = @{ n = "Rio Celeste"; slug = "rio-celeste" }
$meta[44] = @{ n = "San Jose (city)"; slug = "san-jose-city" }
$meta[45] = @{ n = "Alajuela"; slug = "alajuela" }

# Zonas que YA tienen su propia pagina /shuttle/... generada por genroutes.ps1
# (para no linkear a una pagina de ruta que no existe)
$routeCovered = @(0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,19,20,23,30,32,36,39,40,42,44,45)

# --- Precio directo entre dos zonas (Staria + duracion) ---
$LOOKUP = @{}
foreach ($row in $rows) {
  $a = [Math]::Min([int]$row[0], [int]$row[1]); $b = [Math]::Max([int]$row[0], [int]$row[1])
  $LOOKUP["$a-$b"] = @{ s = $(if ($row[2]) { [int]$row[2] } else { 0 }); dur = [string]$row[5] }
}
function PriceTo($zonePlace, $airportPlace) {
  $a = [Math]::Min($zonePlace, $airportPlace); $b = [Math]::Max($zonePlace, $airportPlace)
  if ($LOOKUP.ContainsKey("$a-$b")) { return $LOOKUP["$a-$b"] }
  return $null
}
function Slugify($text) {
  $normalized = $text.Normalize([Text.NormalizationForm]::FormD)
  $stripped = -join ($normalized.ToCharArray() | Where-Object { [Globalization.CharUnicodeInfo]::GetUnicodeCategory($_) -ne [Globalization.UnicodeCategory]::NonSpacingMark })
  $t = $stripped.ToLower()
  $t = $t -replace "[^a-z0-9]+", "-"
  return $t.Trim("-")
}

$year = "2026"
$tpl = Get-Content -Raw -Encoding UTF8 (Join-Path $PSScriptRoot "hotel-template.html")
$hotelUrls = New-Object System.Collections.ArrayList
$byZone = @{}
foreach ($h in $hotels) { if (-not $byZone.ContainsKey($h.place)) { $byZone[$h.place] = New-Object System.Collections.ArrayList }; [void]$byZone[$h.place].Add($h) }

$generated = 0
foreach ($h in $hotels) {
  if (-not $meta.ContainsKey($h.place)) { continue }
  $zone = $meta[$h.place]
  $slug = Slugify $h.name

  $routeCards = ""
  $prices = New-Object System.Collections.ArrayList
  foreach ($airport in @(0, 1)) {
    $p = PriceTo $h.place $airport
    if ($null -eq $p -or $p.s -le 0) { continue }
    $aName = $meta[$airport].n
    [void]$prices.Add(@{ airport = $airport; s = $p.s; dur = $p.dur })
    $routeCards += "<div class='rp-price'><div class='v'>To / From $aName</div><div class='p'>$($p.dur) &middot; up to 5 pax</div><div class='amt'><em>`$</em>$($p.s)</div></div>"
  }
  if ($prices.Count -eq 0) { continue }  # sin precio conocido, no generar pagina a medias
  $best = $prices | Sort-Object { $_.s } | Select-Object -First 1
  $bookHref = "/?from=$($h.place)&to=$($best.airport)"

  # Relacionados: otros hoteles de la misma zona + la ruta principal de esa zona
  $rel = ""
  $count = 0
  foreach ($h2 in $byZone[$h.place]) {
    if ($count -ge 4) { break }
    if ($h2.name -eq $h.name) { continue }
    $slug2 = Slugify $h2.name
    $rel += "<a href='/hotel/$slug2'><div class='r-route'>$($h2.name)</div><div class='r-price'>$($zone.n)</div></a>"
    $count++
  }
  if ($routeCovered -contains $h.place) {
    $routeSlug = "$($zone.slug)-to-san-jose-airport"
    $rel += "<a href='/shuttle/$routeSlug'><div class='r-route'>$($zone.n) &rarr; San Jose Airport</div><div class='r-price'>All routes</div></a>"
  }

  $waMsg = "Hi Travesia! I'd like a private transfer to/from $($h.name). Date & passengers: "
  $waHref = "https://wa.me/$WA" + "?text=" + [uri]::EscapeDataString($waMsg)
  $title = "Private Shuttle from $($h.name) - Airport Transfer from `$$($best.s) (2026) | Travesia"
  $desc = "Private door-to-door shuttle from $($h.name) in $($zone.n), Costa Rica. From `$$($best.s) per vehicle, taxes included. Bilingual driver, flight tracking, book online or on WhatsApp."
  $url = "$base/hotel/$slug"
  $jsonld = '{"@context":"https://schema.org","@type":"Service","serviceType":"Private hotel shuttle transfer","name":"Private Shuttle from ' + $h.name + '","provider":{"@type":"TravelAgency","name":"Travesia Costa Rica","telephone":"+50685028476","url":"' + $base + '/"},"areaServed":{"@type":"Country","name":"Costa Rica"},"offers":{"@type":"Offer","price":"' + $best.s + '","priceCurrency":"USD","url":"' + $url + '"}}'
  $bc = '{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"' + $base + '/"},{"@type":"ListItem","position":2,"name":"Shuttle routes","item":"' + $base + '/#routes"},{"@type":"ListItem","position":3,"name":"' + $h.name + '","item":"' + $url + '"}]}'

  $html = $tpl
  $html = $html.Replace("{{TITLE}}", $title).Replace("{{DESC}}", $desc).Replace("{{CANON}}", $url)
  $html = $html.Replace("{{JSONLD}}", $jsonld).Replace("{{BREADCRUMB}}", $bc)
  $html = $html.Replace("{{HOTEL}}", $h.name).Replace("{{ZONE}}", $zone.n)
  $html = $html.Replace("{{PRICEFROM}}", "$($best.s)").Replace("{{ROUTECARDS}}", $routeCards)
  $html = $html.Replace("{{RELATED}}", $rel).Replace("{{WAHREF}}", $waHref)
  $html = $html.Replace("{{BOOKHREF}}", $bookHref).Replace("{{YEAR}}", $year)
  [System.IO.File]::WriteAllText((Join-Path $outDir "$slug.html"), $html, (New-Object System.Text.UTF8Encoding $false))
  [void]$hotelUrls.Add($url)
  $generated++
}

# --- Agregar las URLs nuevas al sitemap existente (sin regenerar todo) ---
$smPath = Join-Path $root "sitemap.xml"
$sm = Get-Content -Raw -Encoding UTF8 $smPath
$newEntries = ""
foreach ($u in $hotelUrls) {
  $newEntries += "  <url><loc>$u</loc><lastmod>2026-08-21</lastmod><changefreq>monthly</changefreq><priority>0.75</priority></url>`n"
}
$sm = $sm.Replace("</urlset>", "$newEntries</urlset>")
$sm | Out-File -FilePath $smPath -Encoding utf8

Write-Host "Generadas $generated paginas de hotel (de $($hotels.Count) hoteles en la lista). Sitemap actualizado con $($hotelUrls.Count) URLs nuevas."
