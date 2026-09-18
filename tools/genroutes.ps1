$root = "C:\Users\veroc\travesia"
$outDir = Join-Path $root "shuttle"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
Get-ChildItem -Path $outDir -Filter *.html -ErrorAction SilentlyContinue | Remove-Item -Force
$base = "https://travesiacr.online"
$WA = "50685028476"

# --- Leer PT_ROWS (JSON) desde routes-data.js ---
$rd = Get-Content -Raw -Encoding UTF8 (Join-Path $root "routes-data.js")
$mrx = [regex]::Match($rd, 'const PT_ROWS = (\[.*?\]);', [System.Text.RegularExpressions.RegexOptions]::Singleline)
$rows = $mrx.Groups[1].Value | ConvertFrom-Json

# --- Hoteles reales por zona (PT_HOTELS) para enlazar /hotel/... desde cada pagina de ruta ---
function Slugify($text) {
  $normalized = $text.Normalize([Text.NormalizationForm]::FormD)
  $stripped = -join ($normalized.ToCharArray() | Where-Object { [Globalization.CharUnicodeInfo]::GetUnicodeCategory($_) -ne [Globalization.UnicodeCategory]::NonSpacingMark })
  $t = $stripped.ToLower()
  $t = $t -replace "[^a-z0-9]+", "-"
  return $t.Trim("-")
}
$hotelsByZone = @{}
foreach ($m in [regex]::Matches($rd, '\{\s*name:\s*"([^"]+)",\s*place:\s*(\d+)[^}]*\}')) {
  $hn = $m.Groups[1].Value; $hp = [int]$m.Groups[2].Value
  $hs = Slugify $hn
  # solo enlazar si la pagina de hotel existe de verdad (genhotels omite los que no tienen precio)
  if (-not (Test-Path (Join-Path $root "hotel\$hs.html"))) { continue }
  if (-not $hotelsByZone.ContainsKey($hp)) { $hotelsByZone[$hp] = New-Object System.Collections.ArrayList }
  [void]$hotelsByZone[$hp].Add(@{ name = $hn; slug = $hs })
}

# --- Destinos con pagina: nombre (ASCII), slug, blurb ---
$meta = @{}
$meta[0]  = @{ n="San Jose Airport (SJO)"; slug="san-jose-airport"; blurb="San Jose's Juan Santamaria International Airport (SJO) is Costa Rica's main gateway, just outside the capital." }
$meta[1]  = @{ n="Liberia Airport (LIR)"; slug="liberia-airport"; blurb="Liberia's Daniel Oduber International Airport (LIR) is the gateway to Guanacaste's Pacific beaches." }
$meta[2]  = @{ n="La Fortuna / Arenal"; slug="la-fortuna"; blurb="La Fortuna is the gateway to the Arenal Volcano, hot springs, waterfalls and hanging bridges - one of Costa Rica's most popular destinations." }
$meta[3]  = @{ n="Monteverde"; slug="monteverde"; blurb="Monteverde is famous for its misty cloud forest, zip-lines and hanging bridges high in the mountains." }
$meta[4]  = @{ n="Manuel Antonio"; slug="manuel-antonio"; blurb="Manuel Antonio pairs a beautiful national park with white-sand beaches and abundant wildlife on the central Pacific coast." }
$meta[5]  = @{ n="Tamarindo"; slug="tamarindo"; blurb="Tamarindo is Guanacaste's lively beach town, known for surfing, sunsets and a fun nightlife scene." }
$meta[6]  = @{ n="Playa Conchal"; slug="playa-conchal"; blurb="Playa Conchal is a stunning shell-covered beach in Guanacaste, home to luxury resorts like the Westin Reserva Conchal." }
$meta[7]  = @{ n="Brasilito"; slug="brasilito"; blurb="Brasilito is a laid-back Guanacaste fishing village next to Playa Conchal, with a long beach and easy access to nearby resorts." }
$meta[8]  = @{ n="Papagayo"; slug="papagayo"; blurb="The Papagayo Peninsula is Guanacaste's premier luxury resort area, with calm beaches and five-star hotels." }
$meta[9]  = @{ n="Puerto Viejo"; slug="puerto-viejo"; blurb="Puerto Viejo brings Caribbean flavor - reggae, rainforest and laid-back beaches on Costa Rica's south Caribbean coast." }
$meta[10] = @{ n="Santa Teresa"; slug="santa-teresa"; blurb="Santa Teresa is a bohemian surf town on the Nicoya Peninsula, loved for its beaches, yoga and sunsets." }
$meta[11] = @{ n="Jaco"; slug="jaco"; blurb="Jaco is the closest Pacific beach town to San Jose, popular for surfing, nightlife and easy access." }
$meta[12] = @{ n="Playas del Coco"; slug="playas-del-coco"; blurb="Playas del Coco is a lively Guanacaste beach town close to Liberia Airport, great for diving and dining." }
$meta[13] = @{ n="Playa Flamingo"; slug="playa-flamingo"; blurb="Playa Flamingo is an upscale Guanacaste beach with white sand, a marina and calm turquoise waters." }
$meta[14] = @{ n="Playa Hermosa (Guanacaste)"; slug="playa-hermosa"; blurb="Playa Hermosa is a calm, horseshoe-shaped bay near Playas del Coco, popular for swimming, diving and quiet beach days." }
$meta[19] = @{ n="Dominical"; slug="dominical"; blurb="Dominical is a rugged surf town on the south Pacific coast, near waterfalls and Marino Ballena National Park." }
$meta[20] = @{ n="Uvita"; slug="uvita"; blurb="Uvita is the gateway to Marino Ballena National Park and its famous whale-tail sandbar on the south Pacific coast." }
$meta[23] = @{ n="Herradura / Los Suenos"; slug="los-suenos"; blurb="Herradura is home to the Los Suenos Marriott and marina, a short drive north of Jaco on the central Pacific." }
$meta[30] = @{ n="Rincon de la Vieja"; slug="rincon-de-la-vieja"; blurb="Rincon de la Vieja is a volcanic national park in Guanacaste known for hot springs, mud pots, waterfalls and adventure tours." }
$meta[32] = @{ n="La Paz Waterfall Gardens"; slug="la-paz-waterfall-gardens"; blurb="La Paz Waterfall Gardens is a popular nature park near Poas Volcano, with waterfalls, a wildlife refuge and cloud-forest trails." }
$meta[36] = @{ n="Sarapiqui"; slug="sarapiqui"; blurb="Sarapiqui, in the northern lowlands, is a rainforest hub for white-water rafting, wildlife and eco-lodges." }
$meta[39] = @{ n="Nosara"; slug="nosara"; blurb="Nosara is a wellness and surf haven on the Nicoya Peninsula, known for Playa Guiones and yoga retreats." }
$meta[40] = @{ n="Samara"; slug="samara"; blurb="Samara is a mellow, family-friendly beach town on the Nicoya Peninsula with a calm, reef-protected bay." }
$meta[42] = @{ n="Rio Celeste"; slug="rio-celeste"; blurb="Rio Celeste, in Tenorio Volcano National Park, is famous for its surreal turquoise-blue river and waterfall." }
$meta[44] = @{ n="San Jose (city)"; slug="san-jose-city"; blurb="San Jose is Costa Rica's capital, home to museums, the central market and the country's main airport nearby." }
$meta[45] = @{ n="Alajuela"; slug="alajuela"; blurb="Alajuela is the city right next to San Jose's international airport (SJO), a convenient first or last stop." }
$meta[46] = @{ n="Puntarenas / Caldera"; slug="puntarenas"; blurb="Puntarenas (Caldera) is Costa Rica's main Pacific cruise port, on a narrow peninsula in the Gulf of Nicoya with ferry connections to the Nicoya Peninsula." }
$meta[50] = @{ n="JW Marriott Costa Elena (La Cruz)"; slug="jw-marriott-costa-elena"; blurb="JW Marriott Costa Elena Resort & Spa is an all-inclusive resort at Playa El Jobo in La Cruz, on Costa Rica's northern Guanacaste coast near the Nicaragua border - the former Dreams Las Mareas property." }
$meta[41] = @{ n="Puerto Jimenez (Osa)"; slug="puerto-jimenez"; blurb="Puerto Jimenez is the gateway to the Osa Peninsula and Corcovado National Park, on Costa Rica's remote southern Pacific coast." }

. (Join-Path $PSScriptRoot "contenido-rutas.ps1")

$airports = @(0,1)
# Zonas turisticas reales y reconocidas (mismas 22 que usa genshuttleto.ps1) -- se genera
# pagina de ruta entre CUALQUIER par de estas zonas con precio real, no solo el viejo set de 6.
# Deliberadamente NO incluye endpoints de resort/hotel individual (RIU, JW Marriott, Punta Islita,
# Las Catalinas, Hacienda Pinilla, Playa Grande, Playa Potrero, Playa Avellanas, Herradura, Esterillos,
# Ojochal, etc.) porque nadie busca esas combinaciones especificas en Google -- esas zonas ya estan
# cubiertas por las paginas de hotel + shuttle-to, no necesitan pagina de ruta punto a punto.
$hubs = @(2,3,4,5,6,7,8,9,10,11,12,13,14,19,20,23,30,32,36,39,40,42,46,50,41,44,45)

# --- Construir lista de paginas dirigidas (ambos sentidos) ---
$pages = New-Object System.Collections.ArrayList
foreach($row in $rows){
  $f=[int]$row[0]; $t=[int]$row[1]
  if(-not $meta.ContainsKey($f) -or -not $meta.ContainsKey($t)){ continue }
  $isAirport = ($airports -contains $f) -or ($airports -contains $t)
  $isHubHub = ($hubs -contains $f) -and ($hubs -contains $t)
  if(-not ($isAirport -or $isHubHub)){ continue }
  $s = if($row[2]){[int]$row[2]}else{0}
  $h = if($row[3]){[int]$row[3]}else{0}
  $m = if($row[4]){[int]$row[4]}else{0}
  $dur = [string]$row[5]
  [void]$pages.Add(@{f=$f;t=$t;s=$s;h=$h;m=$m;dur=$dur})
  [void]$pages.Add(@{f=$t;t=$f;s=$s;h=$h;m=$m;dur=$dur})
}

# --- Indice por origen (para rutas relacionadas) ---
$byOrigin = @{}
foreach($p in $pages){ if(-not $byOrigin.ContainsKey($p.f)){ $byOrigin[$p.f]=New-Object System.Collections.ArrayList }; [void]$byOrigin[$p.f].Add($p) }

function PriceCard($v,$pax,$price){
  if($price -gt 0){ $amt = "<div class='amt'><em>`$</em>$price</div>" } else { $amt = "<div class='amt na'>On request</div>" }
  return "<div class='rp-price'><div class='v'>$v</div><div class='p'>Up to $pax passengers</div>$amt</div>"
}

$year = "2026"
$tpl = Get-Content -Raw -Encoding UTF8 (Join-Path $PSScriptRoot "route-template.html")
$urls = New-Object System.Collections.ArrayList
[void]$urls.Add("$base/")

foreach($p in $pages){
  $o=$meta[$p.f]; $d=$meta[$p.t]
  $slug="$($o.slug)-to-$($d.slug)"
  $url="$base/shuttle/$slug"
  $cards=(PriceCard "Hyundai Staria" 5 $p.s)+(PriceCard "Toyota Hiace" 9 $p.h)+(PriceCard "Maxus V90" 12 $p.m)
  $intro="Travel privately from $($o.n) to $($d.n) with Travesia Costa Rica. $($d.blurb) The transfer takes about $($p.dur), door to door, with a professional local driver. One flat price per vehicle - taxes and tolls included, and no per-person fees."
  $faq=@"
<details><summary>How long is the transfer from $($o.n) to $($d.n)?</summary><div class='a'>The private shuttle takes about $($p.dur) door to door, depending on traffic and any stops you request.</div></details>
<details><summary>How much is a shuttle from $($o.n) to $($d.n)?</summary><div class='a'>From `$$($p.s) per vehicle for up to 5 passengers (Hyundai Staria), with larger vehicles available. The price is per vehicle, not per person, and includes taxes and tolls.</div></details>
<details><summary>Is the transfer private?</summary><div class='a'>Yes. The vehicle is exclusively for you and your group - no strangers and no extra stops. Door-to-door, hotel to hotel.</div></details>
<details><summary>What if my flight is delayed?</summary><div class='a'>Just share your flight number when you book. We monitor it and adjust your pickup time at no extra cost.</div></details>
<details><summary>Do you pick up at any address in $($o.n)?</summary><div class='a'>Yes. The transfer is door to door: we collect you at your hotel, villa, Airbnb or airport terminal in $($o.n) and drop you right at the door of where you are staying in $($d.n).</div></details>
<details><summary>How many passengers fit in the vehicle?</summary><div class='a'>Up to 5 in the Hyundai Staria, up to 9 in the Toyota Hiace and up to 12 in the Maxus V90 - always with room for the luggage. Tell us how many bags you are carrying and we assign the right vehicle.</div></details>
<details><summary>Are child seats included?</summary><div class='a'>Yes, and they are free. Tell us the ages of the children when you book and the seats are installed and ready in the vehicle.</div></details>
<details><summary>Can we stop along the way?</summary><div class='a'>Yes. Courtesy stops for the restroom, a coffee, food or a photo are included on every transfer - just ask your driver. If you want a guided stop at a real attraction on the way, the VIP upgrade adds a guide, tourist stops and a welcome kit for `$80 more.</div></details>
<details><summary>How do I pay?</summary><div class='a'>You can book and pay by card online on our secure payment page, or arrange it with us on WhatsApp. Payment is in full at booking, and the price you see is the final price - taxes and tolls included, with no hidden fees.</div></details>
<details><summary>What is the cancellation policy?</summary><div class='a'>Free cancellation up to 48 hours before your pickup time. Within 48 hours of the pickup the booking is non-refundable.</div></details>
"@
  $rel=""; $count=0
  $sib = @($byOrigin[$p.f])
  $start = 0
  for($i=0; $i -lt $sib.Count; $i++){ if($sib[$i].t -eq $p.t){ $start=$i; break } }
  for($k=1; $k -le $sib.Count; $k++){
    if($count -ge 5){break}
    $p2 = $sib[($start + $k) % $sib.Count]
    if($p2.t -eq $p.t){continue}
    $d2=$meta[$p2.t]; $slug2="$($o.slug)-to-$($d2.slug)"
    $rel+="<a href='/shuttle/$slug2'><div class='r-route'>$($o.n) &rarr; $($d2.n)</div><div class='r-price'>From `$$($p2.s)</div></a>"
    $count++
  }
  $rkey = "$([Math]::Min($p.f,$p.t))-$([Math]::Max($p.f,$p.t))"
  $reviewHtml = ""
  $reviewLd = ""
  if ($ROUTE_REVIEWS.ContainsKey($rkey)) {
    $figs = ""
    $lds = @()
    foreach($rv in @($ROUTE_REVIEWS[$rkey])) {
      $rvSource = if ($rv.source) { $rv.source } else { "Google Reviews" }
      $figs += "<figure class='rp-review'><span class='stars' aria-hidden='true'>&#9733;&#9733;&#9733;&#9733;&#9733;</span><blockquote>&ldquo;$($rv.quote)&rdquo;</blockquote><figcaption>&mdash; $($rv.author) &middot; on $rvSource</figcaption></figure>"
      # mismo texto para el JSON-LD: sin entidades HTML y con las comillas escapadas
      $q = $rv.quote -replace '&oacute;','o' -replace '&aacute;','a' -replace '&eacute;','e' -replace '&iacute;','i' -replace '&uacute;','u' -replace '&ntilde;','n' -replace '&iexcl;','' -replace '&iquest;','' -replace '\\','\\\\' -replace '"','\"'
      $a = ($rv.author -replace '\\','\\\\' -replace '"','\"')
      $s = ($rvSource -replace '"','\"')
      $lds += '{"@type":"Review","reviewRating":{"@type":"Rating","ratingValue":"5","bestRating":"5"},"author":{"@type":"Person","name":"'+$a+'"},"publisher":{"@type":"Organization","name":"'+$s+'"},"reviewBody":"'+$q+'"}'
    }
    # Google exige un aggregateRating junto a cualquier lista de "review" - sin
    # esto marca el bloque entero como invalido (Search Console, 18-set-2026).
    # Las cinco estrellas son reales: son citas textuales de resenas de 5.0 en
    # Google/TripAdvisor, no un promedio inventado.
    $reviewLd = ',"aggregateRating":{"@type":"AggregateRating","ratingValue":"5","reviewCount":"' + $lds.Count + '"},"review":[' + ($lds -join ',') + ']'
    $revTitle = if (@($ROUTE_REVIEWS[$rkey]).Count -gt 1) { "<h2>What travelers say about this route</h2>" } else { "" }
    $reviewHtml = "<section class='rp-sec'><div class='wrap'>$revTitle$figs</div></section>"
  }
  # Que se ve en el camino (texto por corredor real)
  $seenHtml = ""
  $ga = $ZGROUP[[int]$p.f]; $gb = $ZGROUP[[int]$p.t]
  if ($ga -and $gb) {
    $ckey = if ($ga -le $gb) { "$ga-$gb" } else { "$gb-$ga" }
    if ($CORRIDORS.ContainsKey($ckey)) {
      $cor = $CORRIDORS[$ckey]
      $bullets = ""
      foreach ($s in $cor.see) { $bullets += "<li>$s</li>" }
      $seenHtml = "<section class='rp-sec'><div class='wrap'><h2>What you&rsquo;ll see between {{ORIGIN}} and {{DEST}}</h2><p class='rp-lead'>$($cor.intro)</p><ul class='rp-see'>$bullets</ul><div class='rp-facts'><div><h3>Road conditions</h3><p>$($cor.road)</p></div><div><h3>From your driver</h3><p>$($cor.tip)</p></div></div></div></section>"
      $seenHtml = $seenHtml.Replace("{{ORIGIN}}", $o.n).Replace("{{DEST}}", $d.n)
    }
  }

  # Hoteles del destino (enlaces internos a /hotel/...)
  $hotelsHtml = ""
  if ($hotelsByZone.ContainsKey($p.t)) {
    # Rotar el punto de partida segun la ruta, para que en una zona con muchos
    # hoteles no siempre se enlacen los mismos 6.
    $hcards = ""; $hc = 0
    $hz = @($hotelsByZone[$p.t])
    $off = [Math]::Abs(($p.f * 7 + $p.t * 13)) % $hz.Count
    for ($k = 0; $k -lt $hz.Count; $k++) {
      if ($hc -ge 6) { break }
      $h = $hz[($off + $k) % $hz.Count]
      $hcards += "<a href='/hotel/$($h.slug)'><div class='h-name'>$($h.name)</div><div class='h-sub'>Private transfer &middot; $($d.n)</div></a>"
      $hc++
    }
    if ($hcards -ne "") {
      $hotelsHtml = "<section class='rp-sec'><div class='wrap'><h2>Hotels we drive to in $($d.n)</h2><p class='rp-lead'>We drop you at the door of any hotel, villa or Airbnb in $($d.n). These are some of the properties we drive to most on this route:</p><div class='rp-hotels'>$hcards</div><p class='rp-note'>Staying somewhere else? <a href='/hotel'>See every hotel we serve</a> &mdash; or just send us the name on WhatsApp.</p></div></section>"
    }
  }

  # Guias relacionadas con el destino (y, si faltan, con el origen)
  $gList = New-Object System.Collections.ArrayList
  $gSeen = @{}
  foreach ($src in @($GUIDE_MAP[$p.t], $GUIDE_MAP[$p.f], $GUIDE_DEFAULT)) {
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

  # Precio por persona (matematica real sobre el precio de la van chica)
  $perPerson = ""
  if ($p.s -gt 0) {
    $pp = [Math]::Round($p.s / 4)
    $perPerson = "For a group of 4 that works out to about `$$pp per person."
  }

  $waMsg="Hi Travesia! I'd like to book a private transfer from $($o.n) to $($d.n). Date & passengers: "
  $waHref="https://wa.me/$WA"+"?text="+[uri]::EscapeDataString($waMsg)
  $bookHref="/?from=$($p.f)&to=$($p.t)"
  $title = FitTitle "$(ShortName $p.f $o.n) to $(ShortName $p.t $d.n) Shuttle from `$$($p.s)"
  $desc="Private shuttle from $($o.n) to $($d.n) in Costa Rica. Door-to-door, about $($p.dur), from `$$($p.s) per vehicle. Bilingual driver, flat rate, book online or on WhatsApp."
  $jsonld='{"@context":"https://schema.org","@type":"Service","serviceType":"Private airport shuttle transfer","name":"'+$o.n+' to '+$d.n+' Private Shuttle","provider":{"@type":"TravelAgency","name":"Travesia Costa Rica","telephone":"+50685028476","url":"'+$base+'/"},"areaServed":{"@type":"Country","name":"Costa Rica"},"offers":{"@type":"Offer","price":"'+$p.s+'","priceCurrency":"USD","url":"'+$url+'"}'+$reviewLd+'}'
  $bc='{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"'+$base+'/"},{"@type":"ListItem","position":2,"name":"All routes","item":"'+$base+'/shuttle"},{"@type":"ListItem","position":3,"name":"'+$o.n+' to '+$d.n+'","item":"'+$url+'"}]}'

  $html=$tpl
  $html=$html.Replace("{{TITLE}}",$title).Replace("{{DESC}}",$desc).Replace("{{CANON}}",$url).Replace("{{CANONES}}","$base/es/shuttle/$slug")
  $html=$html.Replace("{{JSONLD}}",$jsonld).Replace("{{BREADCRUMB}}",$bc)
  $html=$html.Replace("{{ORIGIN}}",$o.n).Replace("{{DEST}}",$d.n)
  $html=$html.Replace("{{DURATION}}",$p.dur).Replace("{{PRICEFROM}}","$($p.s)")
  $html=$html.Replace("{{INTRO}}",$intro).Replace("{{PRICECARDS}}",$cards)
  $html=$html.Replace("{{FAQ}}",$faq).Replace("{{RELATED}}",$rel)
  $html=$html.Replace("{{HOTELS}}",$hotelsHtml).Replace("{{GUIDES}}",$guidesHtml).Replace("{{PERPERSON}}",$perPerson)
  $html=$html.Replace("{{SEEN}}",$seenHtml)
  $hubHtml = ""
  if (Test-Path (Join-Path $root "shuttle-to\$($d.slug).html")) {
    $hubHtml = "<p class='rp-note'>Coming from somewhere else? <a href='/shuttle-to/$($d.slug)'>See every private shuttle to $($d.n)</a>, from any airport or town in Costa Rica.</p>"
  }
  $html=$html.Replace("{{HUB}}",$hubHtml)
  $html=$html.Replace("{{REVIEW}}",$reviewHtml)
  $stopNote = if ($ROUTE_STOPS.ContainsKey($rkey)) { $ROUTE_STOPS[$rkey] } else { "" }
  $html=$html.Replace("{{STOPNOTE}}",$stopNote)
  $html=$html.Replace("{{WAHREF}}",$waHref).Replace("{{BOOKHREF}}",$bookHref).Replace("{{YEAR}}",$year)
  [System.IO.File]::WriteAllText((Join-Path $outDir "$slug.html"), $html, (New-Object System.Text.UTF8Encoding $false))
  [void]$urls.Add($url)
}

# --- Guias del blog ---
$guides=@("guide","tours","reviews","about","fleet","faq","guide/how-to-get-from-sjo-to-la-fortuna","guide/how-to-get-from-liberia-to-tamarindo","guide/sjo-vs-lir-which-airport","guide/getting-around-costa-rica","guide/costa-rica-7-day-itinerary","guide/costa-rica-7-day-itinerary-guanacaste","guide/costa-rica-honeymoon-itinerary","guide/best-restaurants-costa-rica","guide/best-time-to-visit-costa-rica","guide/do-you-need-a-car-in-costa-rica","guide/how-many-days-in-la-fortuna","guide/costa-rica-with-kids","guide/costa-rica-travel-faq","guide/sjo-airport-arrival-guide","guide/how-much-do-shuttles-cost-in-costa-rica","guide/how-to-get-to-monteverde","guide/how-to-get-to-osa-peninsula","guide/traveling-with-a-surfboard-in-costa-rica","guide/getting-around-costa-rica-for-birders","guide/birding-stops-on-your-costa-rica-transfer","guide/where-to-see-sloths-in-costa-rica","guide/what-to-pack-for-costa-rica","guide/do-you-need-spanish-in-costa-rica","tours/la-fortuna-full-day","tours/safari-float","tours/hanging-bridges","tours/volcano-hike","tours/volcano-waterfall-combo","tours/cano-negro","tours/rafting","tours/canyoning","tours/rio-celeste","tours/coffee-chocolate","tours/bridges-waterfall-combo","terms","privacy","full-trip-chauffeur","private-shuttle-costa-rica","costa-rica-airport-transfers","costa-rica-private-transportation","costa-rica-birding-transportation")
foreach($g in $guides){ [void]$urls.Add("$base/$g") }

# Paginas hub y de aterrizaje: prioridad alta y revision semanal (se respeta al regenerar)
$hiPri = @("$base/shuttle","$base/hotel","$base/tours","$base/reviews","$base/about","$base/fleet","$base/faq","$base/full-trip-chauffeur","$base/private-shuttle-costa-rica","$base/costa-rica-airport-transfers","$base/costa-rica-private-transportation","$base/costa-rica-birding-transportation")

# --- Conservar URLs de otras herramientas (hoteles, shuttle-to, etc.) ya presentes en el sitemap ---
$smPath = Join-Path $root "sitemap.xml"
if (Test-Path $smPath) {
  $old = Get-Content -Raw -Encoding UTF8 $smPath
  foreach($m in [regex]::Matches($old,'<loc>([^<]+)</loc>')){
    $u = $m.Groups[1].Value
    if ($urls -notcontains $u) { [void]$urls.Add($u) }
  }
}

# --- Sitemap ---
$sm="<?xml version=""1.0"" encoding=""UTF-8""?>`n<urlset xmlns=""http://www.sitemaps.org/schemas/sitemap/0.9"">`n"
foreach($u in $urls){
  $pri= if($u -eq "$base/"){"1.0"} elseif($hiPri -contains $u){"0.9"} elseif($u -like "*/guide*"){"0.7"} else {"0.8"}
  $freq = if($hiPri -contains $u -or $u -eq "$base/"){"weekly"} else {"monthly"}
  $sm+="  <url><loc>$u</loc><lastmod>2026-08-07</lastmod><changefreq>$freq</changefreq><priority>$pri</priority></url>`n"
}
$sm+="</urlset>`n"
$sm | Out-File -FilePath (Join-Path $root "sitemap.xml") -Encoding utf8
Write-Host "Generadas $($pages.Count) paginas de ruta. Sitemap con $($urls.Count) URLs."
