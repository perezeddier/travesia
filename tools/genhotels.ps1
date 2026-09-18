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
# El [^}]* final es importante: hay hoteles con campos extra (req4x4) y con el
# patron viejo se quedaban FUERA, sin pagina y con la URL huerfana en el sitemap.
$hrx = [regex]::Matches($rd, '\{\s*name:\s*"([^"]+)",\s*place:\s*(\d+)([^}]*)\}')
foreach ($m in $hrx) {
  $extra = $m.Groups[3].Value
  $nota = ""
  $nm = [regex]::Match($extra, 'note:\s*"([^"]*)"')
  if ($nm.Success) { $nota = $nm.Groups[1].Value }
  [void]$hotels.Add(@{ name = $m.Groups[1].Value; place = [int]$m.Groups[2].Value; x4 = ($extra -match 'req4x4'); note = $nota })
}

. (Join-Path $PSScriptRoot "contenido-rutas.ps1")

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
$meta[22] = @{ n = "Esterillos"; slug = "esterillos" }
$meta[23] = @{ n = "Herradura / Los Suenos"; slug = "los-suenos" }
$meta[29] = @{ n = "Punta Leona"; slug = "punta-leona" }
$meta[49] = @{ n = "Rio Perdido (Bagaces)"; slug = "rio-perdido" }
$meta[30] = @{ n = "Rincon de la Vieja"; slug = "rincon-de-la-vieja" }
$meta[27] = @{ n = "Las Catalinas"; slug = "las-catalinas" }
$meta[38] = @{ n = "Montezuma"; slug = "montezuma" }
$meta[39] = @{ n = "Nosara"; slug = "nosara" }
$meta[40] = @{ n = "Samara"; slug = "samara" }
$meta[41] = @{ n = "Puerto Jimenez"; slug = "puerto-jimenez" }
$meta[42] = @{ n = "Rio Celeste"; slug = "rio-celeste" }
$meta[44] = @{ n = "San Jose (city)"; slug = "san-jose-city" }
$meta[45] = @{ n = "Alajuela"; slug = "alajuela" }

# Zonas que YA tienen su propia pagina /shuttle/... generada por genroutes.ps1
# (para no linkear a una pagina de ruta que no existe)
$routeCovered = @(0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,19,20,23,30,32,36,39,40,42,44)
# Nota: 45 (Alajuela) se excluye a proposito: no existe /shuttle/alajuela-to-san-jose-airport
# (el aeropuerto SJO esta en Alajuela, esa "ruta" nunca se genero) - antes generaba un enlace roto.

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
  $aName = $meta[$best.airport].n
  # Texto propio del hotel (campo note en PT_HOTELS). Es lo que hace que la
  # pagina no sea igual a la de los otros hoteles de la misma zona.
  $HOTELNOTE = ""
  if ($h.note) {
    $HOTELNOTE = "<section class=''rp-sec''><div class=''wrap''><h2>Getting to $($h.name)</h2><p class=''rp-lead''>$($h.note)</p></div></section>"
  }

  # Variantes de la entradilla: misma informacion, distinta redaccion, elegida
  # de forma fija por el nombre del hotel (no cambia entre regeneraciones).
  $vsum = 0
  foreach ($ch in $h.name.ToCharArray()) { $vsum += [int]$ch }
  $vari = $vsum % 4
  $intros = @(
    "Traves&iacute;a Costa Rica runs private, door-to-door transfers to and from $($h.name) in $($zone.n). Your driver meets you with a name sign, tracks your flight for delays, and takes you straight to the hotel &mdash; no other passengers and no extra stops unless you ask for one. One flat price per vehicle, taxes included.",
    "Need a ride to or from $($h.name)? We drive it privately, door to door. One driver, one vehicle, just your group: he waits for you with a name sign, follows your flight if it is delayed, and drops you at the hotel entrance. The price is per vehicle and taxes are already in it.",
    "$($h.name) sits in $($zone.n), and we drive there every week. The transfer is private from door to door &mdash; your own vehicle, a local driver who knows the road, your flight tracked in case it lands late, and one flat price per vehicle with taxes included.",
    "A private transfer to $($h.name) means the vehicle is yours alone: no shared van, no waiting for strangers, no detours. Your driver is at the airport with a name sign, keeps an eye on your flight, and takes you straight to $($zone.n). Flat price per vehicle, taxes included."
  )
  $intro = $intros[$vari]

  $x4Note = ""
  if ($h.x4) {
    $x4Note = "<p class='rp-note'><strong>Getting up to $($h.name):</strong> the last stretch is a steep unpaved mountain road that only a 4x4 can drive. We bring you in your own vehicle up to where the road changes, and there you switch to a 4x4 for the final climb. That leg carries a `$40 surcharge on top of the transfer price below, and it is worked into your total when you book online.</p>"
  }
  $rkey = "$([Math]::Min([int]$h.place,[int]$best.airport))-$([Math]::Max([int]$h.place,[int]$best.airport))"

  # --- Que se ve en el camino: el corredor real entre el hotel y su aeropuerto ---
  $seenHtml = ""
  $ga = $ZGROUP[[int]$h.place]; $gb = $ZGROUP[[int]$best.airport]
  if ($ga -and $gb) {
    $ckey = if ($ga -le $gb) { "$ga-$gb" } else { "$gb-$ga" }
    if ($CORRIDORS.ContainsKey($ckey)) {
      $cor = $CORRIDORS[$ckey]
      $bullets = ""
      foreach ($s in $cor.see) { $bullets += "<li>$s</li>" }
      $seenHtml = "<section class='rp-sec'><div class='wrap'><h2>What you&rsquo;ll see between $aName and $($h.name)</h2><p class='rp-lead'>$($cor.intro)</p><ul class='rp-see'>$bullets</ul><div class='rp-facts'><div><h3>Road conditions</h3><p>$($cor.road)</p></div><div><h3>From your driver</h3><p>$($cor.tip)</p></div></div></div></section>"
      $seenHtml = $seenHtml.Replace("{{ORIGIN}}", $aName).Replace("{{DEST}}", $zone.n)
    }
  }

  # --- La parada de cortesia de ese camino, si la hay ---
  $stopNote = if ($ROUTE_STOPS.ContainsKey($rkey)) { $ROUTE_STOPS[$rkey] } else { "" }

  # --- Resenas reales de ese mismo trayecto ---
  $reviewHtml = ""; $reviewLd = ""
  if ($ROUTE_REVIEWS.ContainsKey($rkey)) {
    $figs = ""; $lds = @()
    foreach($rv in @($ROUTE_REVIEWS[$rkey])) {
      $rvSource = if ($rv.source) { $rv.source } else { "Google Reviews" }
      $figs += "<figure class='rp-review'><span class='stars' aria-hidden='true'>&#9733;&#9733;&#9733;&#9733;&#9733;</span><blockquote>&ldquo;$($rv.quote)&rdquo;</blockquote><figcaption>&mdash; $($rv.author) &middot; on $rvSource</figcaption></figure>"
      $q = $rv.quote -replace '&oacute;','o' -replace '&aacute;','a' -replace '&eacute;','e' -replace '&iacute;','i' -replace '&uacute;','u' -replace '&ntilde;','n' -replace '&iexcl;','' -replace '&iquest;','' -replace '\\','\\\\' -replace '"','\"'
      $a = ($rv.author -replace '\\','\\\\' -replace '"','\"')
      $s = ($rvSource -replace '"','\"')
      $lds += '{"@type":"Review","reviewRating":{"@type":"Rating","ratingValue":"5","bestRating":"5"},"author":{"@type":"Person","name":"'+$a+'"},"publisher":{"@type":"Organization","name":"'+$s+'"},"reviewBody":"'+$q+'"}'
    }
    # Google exige un aggregateRating junto a cualquier lista de "review" - sin
    # esto marca el bloque entero como invalido (Search Console, 18-set-2026).
    $reviewLd = ',"aggregateRating":{"@type":"AggregateRating","ratingValue":"5","reviewCount":"' + $lds.Count + '"},"review":[' + ($lds -join ',') + ']'
    $reviewHtml = "<section class='rp-sec'><div class='wrap'><h2>What travelers say about this transfer</h2>$figs</div></section>"
  }

  # --- Guias relacionadas con la zona ---
  $gList = New-Object System.Collections.ArrayList
  $gSeen = @{}
  foreach ($src in @($GUIDE_MAP[[int]$h.place], $GUIDE_MAP[[int]$best.airport], $GUIDE_DEFAULT)) {
    if ($null -eq $src) { continue }
    foreach ($g in @($src)) {
      if ($gList.Count -ge 3) { break }
      if ($null -eq $g -or $gSeen.ContainsKey($g.u)) { continue }
      $gSeen[$g.u] = $true; [void]$gList.Add($g)
    }
  }
  $gCards = ""
  foreach ($g in $gList) { $gCards += "<a href='$($g.u)'><div class='g-title'>$($g.t)</div><div class='g-sub'>Read the guide &rarr;</div></a>" }
  $guidesHtml = "<section class='rp-sec'><div class='wrap'><h2>Plan the rest of your trip</h2><div class='rp-guides'>$gCards</div></div></section>"

  # --- Precio por persona ---
  $perPerson = ""
  if ($best.s -gt 0) { $pp = [Math]::Round($best.s / 4); $perPerson = "For a group of 4 that works out to about `$$pp per person." }

  # --- Rutas reales que salen de esta zona (enlaces a /shuttle/...) ---
  $zoneRoutes = ""
  $zr = 0
  foreach ($row in $rows) {
    if ($zr -ge 6) { break }
    $f=[int]$row[0]; $t=[int]$row[1]
    if ($f -ne [int]$h.place -and $t -ne [int]$h.place) { continue }
    $other = if ($f -eq [int]$h.place) { $t } else { $f }
    if (-not $meta.ContainsKey($other)) { continue }
    $rslug = "$($zone.slug)-to-$($meta[$other].slug)"
    if (-not (Test-Path (Join-Path $root "shuttle\$rslug.html"))) { continue }
    $rp = if ($row[2]) { [int]$row[2] } else { 0 }
    if ($rp -le 0) { continue }
    $zoneRoutes += "<a href='/shuttle/$rslug'><div class='r-route'>$($zone.n) &rarr; $($meta[$other].n)</div><div class='r-price'>From `$$rp</div></a>"
    $zr++
  }
  $zoneRoutesHtml = ""
  if ($zoneRoutes -ne "") {
    $zoneRoutesHtml = "<section class='rp-sec'><div class='wrap'><h2>Where we drive from $($zone.n)</h2><p class='rp-lead'>The same driver and the same flat price per vehicle, from the door of $($h.name) to anywhere else on your itinerary:</p><div class='rp-related'>$zoneRoutes</div></div></section>"
  }

  # Relacionados: otros hoteles de la misma zona + la ruta principal de esa zona
  # Ventana circular: cada hotel enlaza a los 4 SIGUIENTES de su zona, no siempre
  # a los 4 primeros. Antes, en una zona de 15 hoteles, 11 quedaban con un solo
  # enlace entrante (el del indice) y Google casi no los veia.
  $rel = ""
  $count = 0
  $zoneList = @($byZone[$h.place])
  $start = 0
  for ($i = 0; $i -lt $zoneList.Count; $i++) { if ($zoneList[$i].name -eq $h.name) { $start = $i; break } }
  for ($k = 1; $k -le $zoneList.Count; $k++) {
    if ($count -ge 4) { break }
    $h2 = $zoneList[($start + $k) % $zoneList.Count]
    if ($h2.name -eq $h.name) { continue }
    $slug2 = Slugify $h2.name
    $rel += "<a href='/hotel/$slug2'><div class='r-route'>$($h2.name)</div><div class='r-price'>$($zone.n)</div></a>"
    $count++
  }
  # Los hoteles del propio SJO no pueden enlazar "SJO -> SJO" (esa pagina no existe):
  # se les da la ruta mas buscada desde el aeropuerto.
  if ($routeCovered -contains $h.place) {
    if ([int]$h.place -eq 0) {
      $rel += "<a href='/shuttle/san-jose-airport-to-la-fortuna'><div class='r-route'>San Jose Airport &rarr; La Fortuna</div><div class='r-price'>All routes</div></a>"
    } else {
      $routeSlug = "$($zone.slug)-to-san-jose-airport"
      if (Test-Path (Join-Path $root "shuttle\$routeSlug.html")) {
        $rel += "<a href='/shuttle/$routeSlug'><div class='r-route'>$($zone.n) &rarr; San Jose Airport</div><div class='r-price'>All routes</div></a>"
      }
    }
  }

  $waMsg = "Hi Travesia! I'd like a private transfer to/from $($h.name). Date & passengers: "
  $waHref = "https://wa.me/$WA" + "?text=" + [uri]::EscapeDataString($waMsg)
  $title = FitTitle "$($h.name) Shuttle from `$$($best.s)"
  $desc = "Private door-to-door shuttle from $($h.name) in $($zone.n), Costa Rica. From `$$($best.s) per vehicle, taxes included. Bilingual driver, flight tracking, book online or on WhatsApp."
  $url = "$base/hotel/$slug"
  # El review/aggregateRating va DENTRO de "provider" (TravelAgency), no en
  # el "Service" de arriba - ver nota igual en genroutes.ps1.
  $jsonld = '{"@context":"https://schema.org","@type":"Service","serviceType":"Private hotel shuttle transfer","name":"Private Shuttle from ' + $h.name + '","provider":{"@type":"TravelAgency","name":"Travesia Costa Rica","telephone":"+50685028476","url":"' + $base + '/"' + $reviewLd + '},"areaServed":{"@type":"Country","name":"Costa Rica"},"offers":{"@type":"Offer","price":"' + $best.s + '","priceCurrency":"USD","url":"' + $url + '"}}'
  $bc = '{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"' + $base + '/"},{"@type":"ListItem","position":2,"name":"Hotels","item":"' + $base + '/hotel"},{"@type":"ListItem","position":3,"name":"' + $h.name + '","item":"' + $url + '"}]}'

  $html = $tpl
  $html = $html.Replace("{{TITLE}}", $title).Replace("{{DESC}}", $desc).Replace("{{CANON}}", $url)
  $html = $html.Replace("{{JSONLD}}", $jsonld).Replace("{{BREADCRUMB}}", $bc)
  $html = $html.Replace("{{HOTEL}}", $h.name).Replace("{{ZONE}}", $zone.n)
  $html = $html.Replace("{{PRICEFROM}}", "$($best.s)").Replace("{{ROUTECARDS}}", $routeCards)
  $html = $html.Replace("{{RELATED}}", $rel).Replace("{{WAHREF}}", $waHref)
  $html = $html.Replace("{{SEEN}}", $seenHtml).Replace("{{STOPNOTE}}", $stopNote).Replace("{{REVIEW}}", $reviewHtml).Replace("{{X4NOTE}}", $x4Note).Replace("{{HOTELNOTE}}", $HOTELNOTE).Replace("{{INTRO}}", $intro)
  $html = $html.Replace("{{GUIDES}}", $guidesHtml).Replace("{{PERPERSON}}", $perPerson).Replace("{{ZONEROUTES}}", $zoneRoutesHtml)
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
  if ($sm -like "*<loc>$u</loc>*") { continue }   # ya esta en el sitemap: no duplicar
  $newEntries += "  <url><loc>$u</loc><lastmod>2026-08-21</lastmod><changefreq>monthly</changefreq><priority>0.75</priority></url>`n"
}
$sm = $sm.Replace("</urlset>", "$newEntries</urlset>")
$sm | Out-File -FilePath $smPath -Encoding utf8

Write-Host "Generadas $generated paginas de hotel (de $($hotels.Count) hoteles en la lista). Sitemap actualizado con $($hotelUrls.Count) URLs nuevas."
