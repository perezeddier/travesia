<#
  Genera /es/shuttle/*: la version en espanol de las paginas de ruta.

  Mismo contenido que las paginas en ingles (mismos precios, mismos corredores,
  mismas resenas reales), escrito en espanol. Cada pagina se enlaza con su
  gemela en ingles con hreflang, que es lo que Google necesita para entender
  que son la misma ruta en dos idiomas y no contenido duplicado.

  Correr despues de genroutes.ps1.
#>
$ErrorActionPreference = "Stop"
$root = "C:\Users\veroc\travesia"
$outDir = Join-Path $root "es\shuttle"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
Get-ChildItem -Path $outDir -Filter *.html -ErrorAction SilentlyContinue | Remove-Item -Force
$base = "https://travesiacr.online"
$WA = "50685028476"
$year = "2026"

. (Join-Path $PSScriptRoot "contenido-rutas.ps1")
. (Join-Path $PSScriptRoot "contenido-rutas-es.ps1")

$rd = Get-Content -Raw -Encoding UTF8 (Join-Path $root "routes-data.js")
$mrx = [regex]::Match($rd, 'const PT_ROWS = (\[.*?\]);', [System.Text.RegularExpressions.RegexOptions]::Singleline)
$rows = $mrx.Groups[1].Value | ConvertFrom-Json

# Hoteles por zona (solo los que tienen pagina)
function Slugify($text) {
  $normalized = $text.Normalize([Text.NormalizationForm]::FormD)
  $stripped = -join ($normalized.ToCharArray() | Where-Object { [Globalization.CharUnicodeInfo]::GetUnicodeCategory($_) -ne [Globalization.UnicodeCategory]::NonSpacingMark })
  $t = $stripped.ToLower(); $t = $t -replace "[^a-z0-9]+", "-"
  return $t.Trim("-")
}
$hotelsByZone = @{}
foreach ($m in [regex]::Matches($rd, '\{\s*name:\s*"([^"]+)",\s*place:\s*(\d+)[^}]*\}')) {
  $hn = $m.Groups[1].Value; $hp = [int]$m.Groups[2].Value
  $hs = Slugify $hn
  if (-not (Test-Path (Join-Path $root "hotel\$hs.html"))) { continue }
  if (-not $hotelsByZone.ContainsKey($hp)) { $hotelsByZone[$hp] = New-Object System.Collections.ArrayList }
  [void]$hotelsByZone[$hp].Add(@{ name = $hn; slug = $hs })
}

# --- Zonas: nombre y descripcion en espanol (mismos slugs que la version en ingles) ---
$meta = @{}
$meta[0]  = @{ n="Aeropuerto de San José (SJO)"; slug="san-jose-airport"; blurb="El aeropuerto Juan Santamaría (SJO) es la puerta de entrada principal del país, a las afueras de la capital." }
$meta[1]  = @{ n="Aeropuerto de Liberia (LIR)"; slug="liberia-airport"; blurb="El aeropuerto Daniel Oduber (LIR) es la entrada natural a las playas de Guanacaste." }
$meta[2]  = @{ n="La Fortuna / Arenal"; slug="la-fortuna"; blurb="La Fortuna es la puerta del volcán Arenal: aguas termales, cataratas y puentes colgantes, uno de los destinos más visitados de Costa Rica." }
$meta[3]  = @{ n="Monteverde"; slug="monteverde"; blurb="Monteverde es famoso por su bosque nuboso, los canopy y los puentes colgantes en lo alto de la montaña." }
$meta[4]  = @{ n="Manuel Antonio"; slug="manuel-antonio"; blurb="Manuel Antonio junta un parque nacional precioso con playas de arena blanca y mucha fauna, en el Pacífico central." }
$meta[5]  = @{ n="Tamarindo"; slug="tamarindo"; blurb="Tamarindo es el pueblo playero más movido de Guanacaste: surf, atardeceres y vida nocturna." }
$meta[6]  = @{ n="Playa Conchal"; slug="playa-conchal"; blurb="Playa Conchal es esa playa de conchas molidas en Guanacaste, con resorts como el Westin Reserva Conchal." }
$meta[7]  = @{ n="Brasilito"; slug="brasilito"; blurb="Brasilito es un pueblo pesquero tranquilo de Guanacaste, pegado a Playa Conchal." }
$meta[8]  = @{ n="Papagayo"; slug="papagayo"; blurb="La península de Papagayo es la zona de resorts de lujo de Guanacaste, con playas calmadas y hoteles cinco estrellas." }
$meta[9]  = @{ n="Puerto Viejo"; slug="puerto-viejo"; blurb="Puerto Viejo es el Caribe sur: reggae, selva y playas relajadas." }
$meta[10] = @{ n="Santa Teresa"; slug="santa-teresa"; blurb="Santa Teresa es el pueblo surfero y bohemio de la península de Nicoya, famoso por sus playas y sus atardeceres." }
$meta[11] = @{ n="Jacó"; slug="jaco"; blurb="Jacó es la playa del Pacífico más cercana a San José, popular por el surf y el ambiente." }
$meta[12] = @{ n="Playas del Coco"; slug="playas-del-coco"; blurb="Playas del Coco es un pueblo playero animado de Guanacaste, cerquita del aeropuerto de Liberia." }
$meta[13] = @{ n="Playa Flamingo"; slug="playa-flamingo"; blurb="Playa Flamingo es una playa de arena blanca en Guanacaste, con marina y agua calmada." }
$meta[14] = @{ n="Playa Hermosa (Guanacaste)"; slug="playa-hermosa"; blurb="Playa Hermosa es una bahía tranquila en forma de herradura cerca de Playas del Coco, buena para nadar y bucear." }
$meta[19] = @{ n="Dominical"; slug="dominical"; blurb="Dominical es un pueblo surfero del Pacífico sur, cerca de cataratas y del Parque Marino Ballena." }
$meta[20] = @{ n="Uvita"; slug="uvita"; blurb="Uvita es la entrada al Parque Marino Ballena y a su famosa cola de ballena de arena." }
$meta[23] = @{ n="Herradura / Los Sueños"; slug="los-suenos"; blurb="Herradura es donde están el Los Sueños Marriott y la marina, unos minutos al norte de Jacó." }
$meta[30] = @{ n="Rincón de la Vieja"; slug="rincon-de-la-vieja"; blurb="El Rincón de la Vieja es un parque nacional volcánico en Guanacaste: aguas termales, pailas de barro, cataratas y aventura." }
$meta[32] = @{ n="La Paz Waterfall Gardens"; slug="la-paz-waterfall-gardens"; blurb="La Paz Waterfall Gardens es un parque de naturaleza cerca del Poás, con cataratas, refugio de animales y senderos de bosque nuboso." }
$meta[36] = @{ n="Sarapiquí"; slug="sarapiqui"; blurb="Sarapiquí, en las llanuras del norte, es zona de rafting, fauna y lodges metidos en la selva." }
$meta[39] = @{ n="Nosara"; slug="nosara"; blurb="Nosara es refugio de surf y bienestar en la península de Nicoya, conocida por Playa Guiones y el yoga." }
$meta[40] = @{ n="Sámara"; slug="samara"; blurb="Sámara es una playa familiar y tranquila de la península de Nicoya, con una bahía protegida por el arrecife." }
$meta[42] = @{ n="Río Celeste"; slug="rio-celeste"; blurb="El Río Celeste, en el Parque Nacional Volcán Tenorio, es famoso por su río azul turquesa y su catarata." }
$meta[44] = @{ n="San José (centro)"; slug="san-jose-city"; blurb="San José es la capital: museos, el mercado central y el aeropuerto principal del país a pocos minutos." }
$meta[45] = @{ n="Alajuela"; slug="alajuela"; blurb="Alajuela es la ciudad pegada al aeropuerto internacional (SJO), buena primera o última parada del viaje." }
$meta[46] = @{ n="Puntarenas / Caldera"; slug="puntarenas"; blurb="Puntarenas (Caldera) es el puerto de cruceros del Pacífico, en una península angosta del golfo de Nicoya, con ferry a la península de Nicoya." }
$meta[50] = @{ n="JW Marriott Costa Elena (La Cruz)"; slug="jw-marriott-costa-elena"; blurb="El JW Marriott Costa Elena es un resort todo incluido en Playa El Jobo, en La Cruz, al norte de Guanacaste." }
$meta[41] = @{ n="Puerto Jiménez (Osa)"; slug="puerto-jimenez"; blurb="Puerto Jiménez es la entrada a la península de Osa y al Parque Nacional Corcovado, en el Pacífico sur." }

$airports = @(0,1)
$hubs = @(2,3,4,5,6,7,8,9,10,11,12,13,14,19,20,23,30,32,36,39,40,42,46,50,41,44,45)

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
$byOrigin = @{}
foreach($p in $pages){ if(-not $byOrigin.ContainsKey($p.f)){ $byOrigin[$p.f]=New-Object System.Collections.ArrayList }; [void]$byOrigin[$p.f].Add($p) }

# Duraciones en espanol: "3h 30min" -> "3 h 30 min"
function DurEs($d) { return ($d -replace 'h', ' h ' -replace 'min', ' min' -replace '\s+', ' ').Trim() }

$MIRANCHO_ES = "<p class='rp-note'><strong>La parada que hacemos en esta ruta:</strong> <em>Mi Rancho</em>, en Los &Aacute;ngeles de San Ram&oacute;n: caf&eacute; y restaurante con vista a la monta&ntilde;a, y un tuc&aacute;n que llega tan seguido a las mesas que ya lo tratan de cliente fijo. Es parada de cortes&iacute;a: sin costo y sin apuro.</p>"
$MACADAMIA_ES = "<p class='rp-note'><strong>La parada que hacemos en esta ruta:</strong> <em>Caf&eacute; y Macadamia</em>, a la orilla del lago Arenal: comida fresca, muy buena, y una de las mejores vistas del recorrido. Es parada de cortes&iacute;a, sin costo.</p>"
$STOPS_ES = @{ "0-2" = $MIRANCHO_ES; "2-44" = $MIRANCHO_ES; "2-4" = $MIRANCHO_ES; "2-45" = $MIRANCHO_ES; "2-3" = $MACADAMIA_ES }

function PriceCardEs($v,$pax,$price){
  if($price -gt 0){ $amt = "<div class='amt'><em>`$</em>$price</div>" } else { $amt = "<div class='amt na'>A consultar</div>" }
  return "<div class='rp-price'><div class='v'>$v</div><div class='p'>Hasta $pax pasajeros</div>$amt</div>"
}

$tpl = Get-Content -Raw -Encoding UTF8 (Join-Path $PSScriptRoot "route-template-es.html")
$urls = New-Object System.Collections.ArrayList

foreach($p in $pages){
  $o=$meta[$p.f]; $d=$meta[$p.t]
  $slug="$($o.slug)-to-$($d.slug)"
  $url="$base/es/shuttle/$slug"
  $urlEn="$base/shuttle/$slug"
  $dur = DurEs $p.dur
  $cards=(PriceCardEs "Hyundai Staria" 5 $p.s)+(PriceCardEs "Toyota Hiace" 9 $p.h)+(PriceCardEs "Maxus V90" 12 $p.m)
  $intro="Viaja en privado de $($o.n) a $($d.n) con Travesía Costa Rica. $($d.blurb) El traslado toma alrededor de $dur, puerta a puerta, con un chofer local. Un solo precio por vehículo &mdash; impuestos y peajes incluidos, sin cobros por persona."

  $faq=@"
<details><summary>¿Cuánto dura el traslado de $($o.n) a $($d.n)?</summary><div class='a'>Alrededor de $dur puerta a puerta, según el tráfico y las paradas que pidas.</div></details>
<details><summary>¿Cuánto cuesta el traslado de $($o.n) a $($d.n)?</summary><div class='a'>Desde `$$($p.s) por vehículo para hasta 5 pasajeros (Hyundai Staria), y hay vehículos más grandes. El precio es por vehículo, no por persona, e incluye impuestos y peajes.</div></details>
<details><summary>¿El traslado es privado?</summary><div class='a'>Sí. El vehículo es solo para vos y tu grupo &mdash; sin desconocidos y sin paradas extra. Puerta a puerta, de hotel a hotel.</div></details>
<details><summary>¿Y si mi vuelo se atrasa?</summary><div class='a'>Solo compartinos el número de vuelo al reservar. Le damos seguimiento y ajustamos la hora de recogida sin costo extra.</div></details>
<details><summary>¿Recogen en cualquier dirección de $($o.n)?</summary><div class='a'>Sí. El servicio es puerta a puerta: te recogemos en el hotel, la villa, el Airbnb o la terminal del aeropuerto en $($o.n) y te dejamos en la puerta de donde te quedes en $($d.n).</div></details>
<details><summary>¿Cuántos pasajeros caben?</summary><div class='a'>Hasta 5 en la Hyundai Staria, hasta 9 en la Toyota Hiace y hasta 12 en la Maxus V90, siempre con campo para el equipaje. Contanos cuántas maletas llevás y asignamos el vehículo correcto.</div></details>
<details><summary>¿Las sillas de bebé son gratis?</summary><div class='a'>Sí, sin costo. Solo decinos las edades de los niños al reservar y las sillas van instaladas y listas en el vehículo.</div></details>
<details><summary>¿Podemos parar en el camino?</summary><div class='a'>Claro. Las paradas de cortesía para el baño, un café, comida o una foto van incluidas en todos los traslados. Si querés una parada guiada en una atracción del camino, la mejora VIP suma guía, paradas turísticas y kit de bienvenida por `$80 más.</div></details>
<details><summary>¿Cómo se paga?</summary><div class='a'>Podés reservar y pagar con tarjeta en línea en nuestra página segura de pago, o coordinarlo con nosotros por WhatsApp. El pago es completo al reservar y el precio que ves es el precio final: impuestos y peajes incluidos, sin cobros escondidos.</div></details>
<details><summary>¿Cuál es la política de cancelación?</summary><div class='a'>Cancelación gratis hasta 48 horas antes de la hora de recogida. Dentro de las 48 horas la reserva no es reembolsable.</div></details>
"@

  # rutas relacionadas (ventana rotativa, igual que en ingles)
  $rel=""; $count=0
  $sib = @($byOrigin[$p.f]); $start = 0
  for($i=0; $i -lt $sib.Count; $i++){ if($sib[$i].t -eq $p.t){ $start=$i; break } }
  for($k=1; $k -le $sib.Count; $k++){
    if($count -ge 5){break}
    $p2 = $sib[($start + $k) % $sib.Count]
    if($p2.t -eq $p.t){continue}
    $d2=$meta[$p2.t]; $slug2="$($o.slug)-to-$($d2.slug)"
    $rel+="<a href='/es/shuttle/$slug2'><div class='r-route'>$($o.n) &rarr; $($d2.n)</div><div class='r-price'>Desde `$$($p2.s)</div></a>"
    $count++
  }

  $rkey = "$([Math]::Min($p.f,$p.t))-$([Math]::Max($p.f,$p.t))"

  # resenas reales de esa ruta (texto original de quien la escribio)
  $reviewHtml = ""
  if ($ROUTE_REVIEWS.ContainsKey($rkey)) {
    $figs = ""
    foreach($rv in @($ROUTE_REVIEWS[$rkey])) {
      $rvSource = if ($rv.source) { $rv.source } else { "Google Reviews" }
      $figs += "<figure class='rp-review'><span class='stars' aria-hidden='true'>&#9733;&#9733;&#9733;&#9733;&#9733;</span><blockquote>&ldquo;$($rv.quote)&rdquo;</blockquote><figcaption>&mdash; $($rv.author) &middot; en $rvSource</figcaption></figure>"
    }
    $reviewHtml = "<section class='rp-sec'><div class='wrap'><h2>Lo que dicen los viajeros de esta ruta</h2><p class='rp-note'>Reseñas reales, tal y como las escribieron sus autores.</p>$figs</div></section>"
  }

  # que se ve en el camino
  $seenHtml = ""
  $ga = $ZGROUP[[int]$p.f]; $gb = $ZGROUP[[int]$p.t]
  if ($ga -and $gb) {
    $ckey = if ($ga -le $gb) { "$ga-$gb" } else { "$gb-$ga" }
    if ($CORRIDORS_ES.ContainsKey($ckey)) {
      $cor = $CORRIDORS_ES[$ckey]
      $bullets = ""
      foreach ($s in $cor.see) { $bullets += "<li>$s</li>" }
      $seenHtml = "<section class='rp-sec'><div class='wrap'><h2>Qué se ve entre $($o.n) y $($d.n)</h2><p class='rp-lead'>$($cor.intro)</p><ul class='rp-see'>$bullets</ul><div class='rp-facts'><div><h3>Cómo está la carretera</h3><p>$($cor.road)</p></div><div><h3>El consejo del chofer</h3><p>$($cor.tip)</p></div></div></div></section>"
    }
  }

  # hoteles del destino (enlazan a la pagina de hotel en ingles, que es la que existe)
  $hotelsHtml = ""
  if ($hotelsByZone.ContainsKey($p.t)) {
    $hcards = ""; $hc = 0
    $hz = @($hotelsByZone[$p.t])
    $off = [Math]::Abs(($p.f * 7 + $p.t * 13)) % $hz.Count
    for ($k = 0; $k -lt $hz.Count; $k++) {
      if ($hc -ge 6) { break }
      $h = $hz[($off + $k) % $hz.Count]
      $hcards += "<a href='/hotel/$($h.slug)'><div class='h-name'>$($h.name)</div><div class='h-sub'>Traslado privado &middot; $($d.n)</div></a>"
      $hc++
    }
    if ($hcards -ne "") {
      $hotelsHtml = "<section class='rp-sec'><div class='wrap'><h2>Hoteles a los que llevamos en $($d.n)</h2><p class='rp-lead'>Te dejamos en la puerta de cualquier hotel, villa o Airbnb en $($d.n). Estos son algunos de los que más visitamos en esta ruta:</p><div class='rp-hotels'>$hcards</div><p class='rp-note'>¿Te quedás en otro lado? <a href='/hotel'>Mirá todos los hoteles que atendemos</a> &mdash; o mandanos el nombre por WhatsApp.</p></div></section>"
    }
  }

  $hubHtml = ""
  if (Test-Path (Join-Path $root "shuttle-to\$($d.slug).html")) {
    $hubHtml = "<p class='rp-note'>¿Venís desde otro lugar? <a href='/shuttle-to/$($d.slug)'>Mirá todos los traslados privados a $($d.n)</a>, desde cualquier aeropuerto o pueblo del país.</p>"
  }

  $perPerson = ""
  if ($p.s -gt 0) { $pp = [Math]::Round($p.s / 4); $perPerson = "Para un grupo de 4 salen unos `$$pp por persona." }

  $waMsg="Hola Travesia! Quiero reservar un traslado privado de $($o.n) a $($d.n). Fecha y pasajeros: "
  $waHref="https://wa.me/$WA"+"?text="+[uri]::EscapeDataString($waMsg)
  $bookHref="/?from=$($p.f)&to=$($p.t)"
  $title = FitTitle "Traslado $(ShortName $p.f $o.n) a $(ShortName $p.t $d.n) desde `$$($p.s)"
  $desc="Traslado privado de $($o.n) a $($d.n) en Costa Rica. Puerta a puerta, unas $dur, desde `$$($p.s) por vehículo. Chofer local, precio fijo, reservá en línea o por WhatsApp."
  $jsonld='{"@context":"https://schema.org","@type":"Service","serviceType":"Traslado privado","inLanguage":"es","name":"Traslado privado de '+$o.n+' a '+$d.n+'","provider":{"@type":"TravelAgency","name":"Travesia Costa Rica","telephone":"+50685028476","url":"'+$base+'/"},"areaServed":{"@type":"Country","name":"Costa Rica"},"offers":{"@type":"Offer","price":"'+$p.s+'","priceCurrency":"USD","url":"'+$url+'"}}'
  $bc='{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Inicio","item":"'+$base+'/"},{"@type":"ListItem","position":2,"name":"Todas las rutas","item":"'+$base+'/es/shuttle"},{"@type":"ListItem","position":3,"name":"'+$o.n+' a '+$d.n+'","item":"'+$url+'"}]}'

  $html=$tpl
  $html=$html.Replace("{{TITLE}}",$title).Replace("{{DESC}}",$desc).Replace("{{CANON}}",$url).Replace("{{CANONEN}}",$urlEn)
  $html=$html.Replace("{{JSONLD}}",$jsonld).Replace("{{BREADCRUMB}}",$bc)
  $html=$html.Replace("{{ORIGIN}}",$o.n).Replace("{{DEST}}",$d.n)
  $html=$html.Replace("{{DURATION}}",$dur).Replace("{{PRICEFROM}}","$($p.s)")
  $html=$html.Replace("{{INTRO}}",$intro).Replace("{{PRICECARDS}}",$cards)
  $html=$html.Replace("{{FAQ}}",$faq).Replace("{{RELATED}}",$rel)
  $html=$html.Replace("{{SEEN}}",$seenHtml).Replace("{{REVIEW}}",$reviewHtml)
  $html=$html.Replace("{{HOTELS}}",$hotelsHtml).Replace("{{HUB}}",$hubHtml).Replace("{{PERPERSON}}",$perPerson)
  $stopNote = if ($STOPS_ES.ContainsKey($rkey)) { $STOPS_ES[$rkey] } else { "" }
  $html=$html.Replace("{{STOPNOTE}}",$stopNote)
  $html=$html.Replace("{{WAHREF}}",$waHref).Replace("{{BOOKHREF}}",$bookHref).Replace("{{YEAR}}",$year)
  [System.IO.File]::WriteAllText((Join-Path $outDir "$slug.html"), $html, (New-Object System.Text.UTF8Encoding $false))
  [void]$urls.Add($url)
}

Write-Host "Generadas $($urls.Count) paginas de ruta en espanol."

# ---------------- INDICE EN ESPANOL /es/shuttle ----------------
$byOr = @{}
foreach($p in $pages){
  $o=$meta[$p.f]; $d=$meta[$p.t]
  if(-not $byOr.ContainsKey($o.n)){ $byOr[$o.n]=New-Object System.Collections.ArrayList }
  [void]$byOr[$o.n].Add(@{ n=$d.n; slug="$($o.slug)-to-$($d.slug)"; price=$p.s })
}
$secs = ""
foreach($orig in ($byOr.Keys | Sort-Object)){
  $items = ""
  foreach($r in ($byOr[$orig] | Sort-Object { $_.n })){
    $items += "<a href='/es/shuttle/$($r.slug)'><div class='r-route'>$orig &rarr; $($r.n)</div><div class='r-price'>Desde `$$($r.price)</div></a>"
  }
  $secs += "<section class='rp-sec'><div class='wrap'><h2>Desde $orig</h2><div class='rp-related'>$items</div></div></section>"
}

$idxTitle = "Todas las rutas de traslado privado en Costa Rica | Travesia"
$idxDesc = "Las 500 rutas de traslado privado que hacemos en Costa Rica, con el precio por vehiculo de cada una: aeropuertos SJO y Liberia, La Fortuna, Monteverde, Manuel Antonio, Guanacaste y el Pacifico sur."
$idxBc = '{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Inicio","item":"' + $base + '/"},{"@type":"ListItem","position":2,"name":"Todas las rutas","item":"' + $base + '/es/shuttle"}]}'

$idx = $tpl
$idx = $idx.Replace("{{TITLE}}",$idxTitle).Replace("{{DESC}}",$idxDesc)
$idx = $idx.Replace("{{CANON}}","$base/es/shuttle").Replace("{{CANONEN}}","$base/shuttle")
$idx = $idx.Replace("{{JSONLD}}",$idxBc).Replace("{{BREADCRUMB}}",$idxBc)
$idx = $idx.Replace("{{WAHREF}}","https://wa.me/$WA").Replace("{{BOOKHREF}}","/").Replace("{{YEAR}}",$year)

# cuerpo propio del indice
$rx = [System.Text.RegularExpressions.Regex]::new('<section class="rp-hero">.*?<footer class="rp-footer">', [System.Text.RegularExpressions.RegexOptions]::Singleline)
$body = @"
<section class="rp-hero">
  <div class="wrap">
    <nav class="rp-crumbs"><a href="/">Inicio</a> &rsaquo; Todas las rutas</nav>
    <h1>Todas nuestras <span class="to">rutas</span></h1>
    <div class="rp-meta">
      <span class="rp-chip"><strong>500</strong> rutas con precio</span>
      <span class="rp-chip">Precio por veh&iacute;culo, no por persona</span>
      <span class="rp-chip price">Impuestos <strong>incluidos</strong></span>
    </div>
  </div>
</section>

<section class="rp-sec">
  <div class="wrap">
    <p class="rp-lead">Estas son las rutas que manejamos, con el precio fijo de cada una. Todas son privadas y puerta a puerta: el veh&iacute;culo es solo para tu grupo. Si no ves tu ruta, escribinos por WhatsApp y te la cotizamos igual.</p>
  </div>
</section>

$secs

<footer class="rp-footer">
"@
$idx = $rx.Replace($idx, $body, 1)
[System.IO.File]::WriteAllText((Join-Path $root "es\shuttle\index.html"), $idx, (New-Object System.Text.UTF8Encoding $false))
[void]$urls.Add("$base/es/shuttle")
Write-Host "Escrito es/shuttle/index.html"

# ---------------- SITEMAP ----------------
$smPath = Join-Path $root "sitemap.xml"
$sm = Get-Content -Raw -Encoding UTF8 $smPath
$new = ""
foreach ($u in $urls) {
  if ($sm -like "*<loc>$u</loc>*") { continue }
  $pri = if ($u -eq "$base/es/shuttle") { "0.9" } else { "0.8" }
  $new += "  <url><loc>$u</loc><lastmod>2026-09-15</lastmod><changefreq>monthly</changefreq><priority>$pri</priority></url>`n"
}
$sm = $sm.Replace("</urlset>", "$new</urlset>")
$sm | Out-File -FilePath $smPath -Encoding utf8
Write-Host "Sitemap actualizado con las URLs en espanol."