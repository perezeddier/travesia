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

$airports = @(0,1)
# Zonas turisticas reales y reconocidas (mismas 22 que usa genshuttleto.ps1) -- se genera
# pagina de ruta entre CUALQUIER par de estas zonas con precio real, no solo el viejo set de 6.
# Deliberadamente NO incluye endpoints de resort/hotel individual (RIU, JW Marriott, Punta Islita,
# Las Catalinas, Hacienda Pinilla, Playa Grande, Playa Potrero, Playa Avellanas, Herradura, Esterillos,
# Ojochal, etc.) porque nadie busca esas combinaciones especificas en Google -- esas zonas ya estan
# cubiertas por las paginas de hotel + shuttle-to, no necesitan pagina de ruta punto a punto.
$hubs = @(2,3,4,5,6,7,8,9,10,11,12,13,14,19,20,23,30,32,36,39,40,42)

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

# Resenas reales de Google (verificadas en el perfil de negocio 2026-08-29), asociadas a una ruta especifica.
# Clave = "min-max" de los indices de zona (aplica a las 2 direcciones de esa ruta).
# Cada valor es un ARRAY de resenas (1 a 3 por ruta). Texto VERBATIM del perfil (recortado en limites de oracion).
$ROUTE_REVIEWS = @{
  "0-2" = @(
    @{ quote = "Very good service got us safe and sound from La Fortuna to San Jose. Steven was our driver, he was amazing, a very nice person and a very good driver. Would definitely recommend if you're looking for a short or long distance shuttle service."; author = "Diego R." },
    @{ quote = "Eddier was an amazing driver! He was so kind and got me from La Fortuna to SJO airport safely. The car was clean and comfortable. As a solo female traveler I felt very safe and I am so thankful to him for helping me with my Spanish and for getting me back safely!"; author = "Grace" },
    @{ quote = "Mr. Eddie was our driver and he was so amazing! He drove us 3 hours from the main airport to Lost Iguana Resort around the La Fortuna area. He knew a lot about the history and scenery of Costa Rica as we drove through the country. It was a very engaging ride!"; author = "Mayah M." }
  )
  "1-2" = @(
    @{ quote = "The drive from Liberia to La Fortuna was an activity in itself, thanks to Eddy. He made the experience incredibly enjoyable by making our needs the forefront of his service. He was extremely thoughtful, accommodating and had so much insight on the area."; author = "Ben M." },
    @{ quote = "Eddie drove us from Liberia to La Fortuna. He was so kind to wait for us while we went tubing at Rio Celeste (one of the highlights for our trip). He watched our luggage and belongings while we were tubing and brought us safely to our next destination."; author = "Annie L." },
    @{ quote = "Eric was a wonderful driver. He pointed out interesting facts about this beautiful country including a scenic spot for breakfast. It was a lovely drive from La Fortuna to the Liberia airport. We highly recommend his services."; author = "Sidney K." }
  )
  "2-4" = @(
    @{ quote = "Excellent transportation and service from La Fortuna to Manuel Antonio with Eric! He shared local info and helped us practice some Spanish on the way!"; author = "Suzanne P." },
    @{ quote = "Having private shuttles took the stress out of driving (especially during heavy rain and thunderstorms between La Fortuna and MA) and our driver John was extremely informative with a wealth of knowledge as well as pointing out wildlife (monkeys, birds etc) and stopped at interesting places to break the journey up."; author = "Phoebe S." }
  )
  "0-4" = @(
    @{ quote = "We connected with Eddie at Travesia CR to arrange a few key shuttle transfers for our group of 11, including San Jose to La Fortuna, La Fortuna to Manuel Antonio, and Manuel Antonio back to the San Jose airport. Every transfer and tour they managed was exceptional. The drivers were kind, thoughtful, and punctual, and the vehicles were consistently clean, comfortable, and modern."; author = "David I." }
  )
  "2-3" = @(
    @{ quote = "Un viaje muy agradable en un coche estupendo, limpio y c&oacute;modo con Eddy, quien nos llev&oacute; perfectamente desde La Fortuna hasta Santa Elena. &iexcl;100% recomendable!"; author = "Nicole P." }
  )
  "2-5" = @(
    @{ quote = "We just got back from Costa Rica - Monteverde, La Fortuna, Tamarindo. Eddie (Travesia) planned all our transportation and tours. We were two families with 3 kids and 4 adults. Eddie has been amazing in making our trip comfortable and successful!"; author = "Viprali B." }
  )
  "3-10" = @(
    @{ quote = "We did a last minute request and Eddie responded in a minute! Everything was smooth. Miguel, our driver drove us up to Monteverde from Santa Teresa, we chatted about animals, the land, the people. Everything was deep in the tico culture."; author = "Yu H." }
  )
  "0-9" = @(
    @{ quote = "Exceptional and super efficient service! Carlos drove my wife, son, and I from Puerto Viejo to San Jose. Carlos is a great driver, very friendly, and he taught us so much about Costa Rica along the way. He even made some stops for us to get some photos and enjoy some of the country's beauty."; author = "BTL" }
  )
  "1-39" = @(
    @{ quote = "American canceled my flight and we ended up getting into Liberia later than expected and so my previous travel plans changed. Eddie was able to help me book a chartered van all the way to Nosara (3 hour drive) the night before for a very fair transport price. My drive with Carlos was 10/10."; author = "Ryan B." }
  )
  "2-14" = @(
    @{ quote = "Our driver Eddy took the time to point out and sometimes stop to explain some of the amazing views such as the different volcanos, pineapple field, and this gigantic tree. He was our driver from La Fortuna area to playa Hermosa area, and would check-in to see if we were fine."; author = "Roxanne G." }
  )
  "2-38" = @(
    @{ quote = "We just completed a wonderful 5 hour drive from Montezuma to La Fortuna. Our driver, Eric was so nice and accommodating. He pointed out many points of interest and any animals he spotted along the way. The van was super clean and comfortable and Eric navigated the roads flawlessly."; author = "Lindsey Q." }
  )
}

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
"@
  $rel=""; $count=0
  foreach($p2 in $byOrigin[$p.f]){
    if($count -ge 5){break}
    if($p2.t -eq $p.t){continue}
    $d2=$meta[$p2.t]; $slug2="$($o.slug)-to-$($d2.slug)"
    $rel+="<a href='/shuttle/$slug2'><div class='r-route'>$($o.n) &rarr; $($d2.n)</div><div class='r-price'>From `$$($p2.s)</div></a>"
    $count++
  }
  $rkey = "$([Math]::Min($p.f,$p.t))-$([Math]::Max($p.f,$p.t))"
  $reviewHtml = ""
  if ($ROUTE_REVIEWS.ContainsKey($rkey)) {
    $figs = ""
    foreach($rv in @($ROUTE_REVIEWS[$rkey])) {
      $figs += "<figure class='rp-review'><span class='stars' aria-hidden='true'>&#9733;&#9733;&#9733;&#9733;&#9733;</span><blockquote>&ldquo;$($rv.quote)&rdquo;</blockquote><figcaption>&mdash; $($rv.author) &middot; on Google Reviews</figcaption></figure>"
    }
    $revTitle = if (@($ROUTE_REVIEWS[$rkey]).Count -gt 1) { "<h2>What travelers say about this route</h2>" } else { "" }
    $reviewHtml = "<section class='rp-sec'><div class='wrap'>$revTitle$figs</div></section>"
  }
  $waMsg="Hi Travesia! I'd like to book a private transfer from $($o.n) to $($d.n). Date & passengers: "
  $waHref="https://wa.me/$WA"+"?text="+[uri]::EscapeDataString($waMsg)
  $bookHref="/?from=$($p.f)&to=$($p.t)"
  $title="$($o.n) to $($d.n) Shuttle - Private Transfer from `$$($p.s) (2026) | Travesia"
  $desc="Private shuttle from $($o.n) to $($d.n) in Costa Rica. Door-to-door, about $($p.dur), from `$$($p.s) per vehicle. Bilingual driver, flat rate, book online or on WhatsApp."
  $jsonld='{"@context":"https://schema.org","@type":"Service","serviceType":"Private airport shuttle transfer","name":"'+$o.n+' to '+$d.n+' Private Shuttle","provider":{"@type":"TravelAgency","name":"Travesia Costa Rica","telephone":"+50685028476","url":"'+$base+'/"},"areaServed":{"@type":"Country","name":"Costa Rica"},"offers":{"@type":"Offer","price":"'+$p.s+'","priceCurrency":"USD","url":"'+$url+'"}}'
  $bc='{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"'+$base+'/"},{"@type":"ListItem","position":2,"name":"Shuttle routes","item":"'+$base+'/#routes"},{"@type":"ListItem","position":3,"name":"'+$o.n+' to '+$d.n+'","item":"'+$url+'"}]}'

  $html=$tpl
  $html=$html.Replace("{{TITLE}}",$title).Replace("{{DESC}}",$desc).Replace("{{CANON}}",$url)
  $html=$html.Replace("{{JSONLD}}",$jsonld).Replace("{{BREADCRUMB}}",$bc)
  $html=$html.Replace("{{ORIGIN}}",$o.n).Replace("{{DEST}}",$d.n)
  $html=$html.Replace("{{DURATION}}",$p.dur).Replace("{{PRICEFROM}}","$($p.s)")
  $html=$html.Replace("{{INTRO}}",$intro).Replace("{{PRICECARDS}}",$cards)
  $html=$html.Replace("{{FAQ}}",$faq).Replace("{{RELATED}}",$rel)
  $html=$html.Replace("{{REVIEW}}",$reviewHtml)
  $html=$html.Replace("{{WAHREF}}",$waHref).Replace("{{BOOKHREF}}",$bookHref).Replace("{{YEAR}}",$year)
  [System.IO.File]::WriteAllText((Join-Path $outDir "$slug.html"), $html, (New-Object System.Text.UTF8Encoding $false))
  [void]$urls.Add($url)
}

# --- Guias del blog ---
$guides=@("guide","guide/how-to-get-from-sjo-to-la-fortuna","guide/how-to-get-from-liberia-to-tamarindo","guide/sjo-vs-lir-which-airport","guide/getting-around-costa-rica","guide/costa-rica-7-day-itinerary","guide/costa-rica-7-day-itinerary-guanacaste","guide/costa-rica-honeymoon-itinerary","guide/best-restaurants-costa-rica","guide/best-time-to-visit-costa-rica","guide/do-you-need-a-car-in-costa-rica","guide/how-many-days-in-la-fortuna","guide/costa-rica-with-kids","guide/costa-rica-travel-faq","guide/sjo-airport-arrival-guide","guide/how-much-do-shuttles-cost-in-costa-rica","tours/la-fortuna-full-day","tours/safari-float","tours/hanging-bridges","tours/volcano-hike","tours/volcano-waterfall-combo","tours/cano-negro","tours/rafting","tours/canyoning","tours/rio-celeste","tours/coffee-chocolate","terms","privacy")
foreach($g in $guides){ [void]$urls.Add("$base/$g") }

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
  $pri= if($u -eq "$base/"){"1.0"} elseif($u -like "*/guide*"){"0.7"} else {"0.8"}
  $sm+="  <url><loc>$u</loc><lastmod>2026-08-07</lastmod><changefreq>monthly</changefreq><priority>$pri</priority></url>`n"
}
$sm+="</urlset>`n"
$sm | Out-File -FilePath (Join-Path $root "sitemap.xml") -Encoding utf8
Write-Host "Generadas $($pages.Count) paginas de ruta. Sitemap con $($urls.Count) URLs."
