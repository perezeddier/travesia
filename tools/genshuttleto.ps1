$root = "C:\Users\veroc\travesia"
$outDir = Join-Path $root "shuttle-to"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
Get-ChildItem -Path $outDir -Filter *.html -ErrorAction SilentlyContinue | Remove-Item -Force
$shuttleDir = Join-Path $root "shuttle"
$base = "https://travesiacr.online"
$WA = "50685028476"

# --- Leer PT_PLACES, PT_DISPLAY, PT_SLUG, PT_ROWS, PT_HOTELS desde routes-data.js ---
$rd = Get-Content -Raw -Encoding UTF8 (Join-Path $root "routes-data.js")

$placesMatch = [regex]::Match($rd, 'const PT_PLACES = \[(.*?)\];', [System.Text.RegularExpressions.RegexOptions]::Singleline)
$places = [regex]::Matches($placesMatch.Groups[1].Value, '"([^"]*)"') | ForEach-Object { $_.Groups[1].Value }

$dispMatch = [regex]::Match($rd, 'const PT_DISPLAY = \{(.*?)\};', [System.Text.RegularExpressions.RegexOptions]::Singleline)
$DISPLAY = @{}
foreach ($m in [regex]::Matches($dispMatch.Groups[1].Value, '"([^"]+)":\s*"([^"]+)"')) { $DISPLAY[$m.Groups[1].Value] = $m.Groups[2].Value }

$slugMatch = [regex]::Match($rd, 'const PT_SLUG = \{(.*?)\};', [System.Text.RegularExpressions.RegexOptions]::Singleline)
$SLUG = @{}
foreach ($m in [regex]::Matches($slugMatch.Groups[1].Value, '(\d+):\s*"([a-z0-9-]+)"')) { $SLUG[[int]$m.Groups[1].Value] = $m.Groups[2].Value }

$rowsMatch = [regex]::Match($rd, 'const PT_ROWS = (\[.*?\]);', [System.Text.RegularExpressions.RegexOptions]::Singleline)
$rows = $rowsMatch.Groups[1].Value | ConvertFrom-Json

$hotels = New-Object System.Collections.ArrayList
foreach ($m in [regex]::Matches($rd, '\{\s*name:\s*"([^"]+)",\s*place:\s*(\d+)\s*\}')) {
  [void]$hotels.Add(@{ name = $m.Groups[1].Value; place = [int]$m.Groups[2].Value })
}
$byZoneHotels = @{}
foreach ($h in $hotels) { if (-not $byZoneHotels.ContainsKey($h.place)) { $byZoneHotels[$h.place] = New-Object System.Collections.ArrayList }; [void]$byZoneHotels[$h.place].Add($h) }

function NameOf($idx) {
  $p = $places[$idx]
  if ($DISPLAY.ContainsKey($p)) { return $DISPLAY[$p] }
  return $p
}
function Slugify($text) {
  $normalized = $text.Normalize([Text.NormalizationForm]::FormD)
  $stripped = -join ($normalized.ToCharArray() | Where-Object { [Globalization.CharUnicodeInfo]::GetUnicodeCategory($_) -ne [Globalization.UnicodeCategory]::NonSpacingMark })
  $t = $stripped.ToLower() -replace "[^a-z0-9]+", "-"
  return $t.Trim("-")
}

# Destinos vacacionales reales con pagina de ruta ya existente (excluye aeropuertos SJO/LIR y ciudades San Jose/Alajuela)
$DEST_ZONES = @(2,3,4,5,6,7,8,9,10,11,12,13,14,19,20,23,30,32,36,39,40,42)

$year = "2026"
$tpl = Get-Content -Raw -Encoding UTF8 (Join-Path $PSScriptRoot "shuttleto-template.html")
$urls = New-Object System.Collections.ArrayList
$generated = 0

foreach ($z in $DEST_ZONES) {
  if (-not $SLUG.ContainsKey($z)) { continue }
  $destName = NameOf $z
  $destSlug = $SLUG[$z]

  $origins = New-Object System.Collections.ArrayList
  foreach ($row in $rows) {
    $a = [int]$row[0]; $b = [int]$row[1]
    if ($a -ne $z -and $b -ne $z) { continue }
    $other = if ($a -eq $z) { $b } else { $a }
    if (-not $SLUG.ContainsKey($other)) { continue }  # solo origenes con destino/hub reconocido, no cruces fronterizos ni pueblos sueltos
    $price = $row[2]
    if ($null -eq $price -or [int]$price -le 0) { continue }
    [void]$origins.Add(@{ idx = $other; price = [int]$price; dur = [string]$row[5] })
  }
  if ($origins.Count -eq 0) { continue }

  # Aeropuertos primero, luego el resto ordenado por precio (mas cercano/barato primero)
  $sorted = $origins | Sort-Object @{Expression = { if ($_.idx -eq 0 -or $_.idx -eq 1) { 0 } else { 1 } } }, price

  $cards = ""
  foreach ($o in $sorted) {
    $originName = NameOf $o.idx
    $originSlug = $SLUG[$o.idx]
    $href = "/?from=$($o.idx)&to=$z"
    if ($originSlug) {
      $pageFile = Join-Path $shuttleDir "$originSlug-to-$destSlug.html"
      if (Test-Path $pageFile) { $href = "/shuttle/$originSlug-to-$destSlug" }
    }
    $cards += "<a class='rp-price' href='$href'><div class='v'>From $originName</div><div class='p'>$($o.dur) &middot; up to 5 pax</div><div class='amt'><em>`$</em>$($o.price)</div></a>"
  }
  $best = $sorted | Sort-Object price | Select-Object -First 1
  $bookHref = "/?from=$($best.idx)&to=$z"

  $hotelsSection = ""
  if ($byZoneHotels.ContainsKey($z)) {
    $hcards = ""
    $hc = 0
    foreach ($h in $byZoneHotels[$z]) {
      if ($hc -ge 8) { break }
      $hslug = Slugify $h.name
      $hcards += "<a href='/hotel/$hslug'><div class='r-route'>$($h.name)</div><div class='r-price'>$destName</div></a>"
      $hc++
    }
    if ($hcards) {
      $hotelsSection = "<section class='rp-sec'><div class='wrap'><h2>Popular hotels in $destName</h2><div class='rp-related'>$hcards</div></div></section>"
    }
  }

  $waMsg = "Hi Travesia! I'd like a private transfer to $destName. Date & passengers: "
  $waHref = "https://wa.me/$WA" + "?text=" + [uri]::EscapeDataString($waMsg)
  $title = "Private Shuttle to $destName - From `$$($best.price) (2026) | Travesia"
  $desc = "Private door-to-door shuttle to $destName, Costa Rica, from the airport or other destinations. From `$$($best.price) per vehicle, taxes included. Bilingual driver, flight tracking, book online or on WhatsApp."
  $url = "$base/shuttle-to/$destSlug"
  $jsonld = '{"@context":"https://schema.org","@type":"Service","serviceType":"Private shuttle transfer","name":"Private Shuttle to ' + $destName + '","provider":{"@type":"TravelAgency","name":"Travesia Costa Rica","telephone":"+50685028476","url":"' + $base + '/"},"areaServed":{"@type":"Country","name":"Costa Rica"},"offers":{"@type":"Offer","price":"' + $best.price + '","priceCurrency":"USD","url":"' + $url + '"}}'
  $bc = '{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"' + $base + '/"},{"@type":"ListItem","position":2,"name":"Shuttle routes","item":"' + $base + '/#routes"},{"@type":"ListItem","position":3,"name":"Shuttle to ' + $destName + '","item":"' + $url + '"}]}'

  $html = $tpl
  $html = $html.Replace("{{TITLE}}", $title).Replace("{{DESC}}", $desc).Replace("{{CANON}}", $url)
  $html = $html.Replace("{{JSONLD}}", $jsonld).Replace("{{BREADCRUMB}}", $bc)
  $html = $html.Replace("{{DEST}}", $destName).Replace("{{PRICEFROM}}", "$($best.price)")
  $html = $html.Replace("{{ROUTECARDS}}", $cards).Replace("{{HOTELSSECTION}}", $hotelsSection)
  $html = $html.Replace("{{WAHREF}}", $waHref).Replace("{{BOOKHREF}}", $bookHref).Replace("{{YEAR}}", $year)
  [System.IO.File]::WriteAllText((Join-Path $outDir "$destSlug.html"), $html, (New-Object System.Text.UTF8Encoding $false))
  [void]$urls.Add($url)
  $generated++
}

# --- Agregar las URLs nuevas al sitemap existente ---
$smPath = Join-Path $root "sitemap.xml"
$sm = Get-Content -Raw -Encoding UTF8 $smPath
$newEntries = ""
foreach ($u in $urls) {
  $newEntries += "  <url><loc>$u</loc><lastmod>2026-08-22</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`n"
}
$sm = $sm.Replace("</urlset>", "$newEntries</urlset>")
$sm | Out-File -FilePath $smPath -Encoding utf8

Write-Host "Generadas $generated paginas 'shuttle to' (de $($DEST_ZONES.Count) zonas destino candidatas). Sitemap actualizado con $($urls.Count) URLs nuevas."
