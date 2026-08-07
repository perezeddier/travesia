$root = "C:\Users\veroc\travesia"
$outDir = Join-Path $root "shuttle"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$base = "https://travesiacr.online"
$WA = "50685028476"

# --- Destinos: nombre (ASCII), slug, blurb (EN, ASCII) ---
$dest = @{}
$dest[0]  = @{ n="San Jose Airport (SJO)"; slug="san-jose-airport"; blurb="San Jose's Juan Santamaria International Airport (SJO) is Costa Rica's main gateway, just outside the capital." }
$dest[1]  = @{ n="Liberia Airport (LIR)"; slug="liberia-airport"; blurb="Liberia's Daniel Oduber International Airport (LIR) is the gateway to Guanacaste's Pacific beaches." }
$dest[2]  = @{ n="La Fortuna / Arenal"; slug="la-fortuna"; blurb="La Fortuna is the gateway to the Arenal Volcano, hot springs, waterfalls and hanging bridges - one of Costa Rica's most popular destinations." }
$dest[3]  = @{ n="Monteverde"; slug="monteverde"; blurb="Monteverde is famous for its misty cloud forest, zip-lines and hanging bridges high in the mountains." }
$dest[4]  = @{ n="Manuel Antonio"; slug="manuel-antonio"; blurb="Manuel Antonio pairs a beautiful national park with white-sand beaches and abundant wildlife on the central Pacific coast." }
$dest[5]  = @{ n="Tamarindo"; slug="tamarindo"; blurb="Tamarindo is Guanacaste's lively beach town, known for surfing, sunsets and a fun nightlife scene." }
$dest[6]  = @{ n="Playa Conchal"; slug="playa-conchal"; blurb="Playa Conchal is a stunning shell-covered beach in Guanacaste, home to luxury resorts like the Westin Reserva Conchal." }
$dest[8]  = @{ n="Papagayo"; slug="papagayo"; blurb="The Papagayo Peninsula is Guanacaste's premier luxury resort area, with calm beaches and five-star hotels." }
$dest[9]  = @{ n="Puerto Viejo"; slug="puerto-viejo"; blurb="Puerto Viejo brings Caribbean flavor - reggae, rainforest and laid-back beaches on Costa Rica's south Caribbean coast." }
$dest[10] = @{ n="Santa Teresa"; slug="santa-teresa"; blurb="Santa Teresa is a bohemian surf town on the Nicoya Peninsula, loved for its beaches, yoga and sunsets." }
$dest[11] = @{ n="Jaco"; slug="jaco"; blurb="Jaco is the closest Pacific beach town to San Jose, popular for surfing, nightlife and easy access." }
$dest[12] = @{ n="Playas del Coco"; slug="playas-del-coco"; blurb="Playas del Coco is a lively Guanacaste beach town close to Liberia Airport, great for diving and dining." }
$dest[13] = @{ n="Playa Flamingo"; slug="playa-flamingo"; blurb="Playa Flamingo is an upscale Guanacaste beach with white sand, a marina and calm turquoise waters." }
$dest[19] = @{ n="Dominical"; slug="dominical"; blurb="Dominical is a rugged surf town on the south Pacific coast, near waterfalls and Marino Ballena National Park." }
$dest[39] = @{ n="Nosara"; slug="nosara"; blurb="Nosara is a wellness and surf haven on the Nicoya Peninsula, known for Playa Guiones and yoga retreats." }

# --- Rutas: f,t,s,h,m,dur (0 = no disponible) ---
$routes = @(
  @{f=0;t=2;s=220;h=275;m=360;dur="3h"},
  @{f=0;t=3;s=220;h=265;m=350;dur="3h"},
  @{f=0;t=4;s=220;h=0;m=360;dur="3h"},
  @{f=0;t=5;s=345;h=390;m=0;dur="5h"},
  @{f=0;t=11;s=175;h=0;m=245;dur="1h 30min"},
  @{f=0;t=9;s=305;h=350;m=435;dur="3h 30min"},
  @{f=0;t=8;s=340;h=385;m=470;dur="5h"},
  @{f=0;t=39;s=370;h=415;m=500;dur="5h"},
  @{f=0;t=19;s=305;h=350;m=435;dur="3h 30min"},
  @{f=0;t=10;s=375;h=420;m=505;dur="6h"},
  @{f=1;t=5;s=135;h=175;m=230;dur="1h 30min"},
  @{f=1;t=2;s=225;h=280;m=0;dur="3h"},
  @{f=1;t=3;s=230;h=275;m=360;dur="3h"},
  @{f=1;t=12;s=110;h=140;m=195;dur="1h 30min"},
  @{f=1;t=13;s=135;h=175;m=230;dur="1h 30min"},
  @{f=1;t=8;s=110;h=0;m=180;dur="1h 30min"},
  @{f=1;t=39;s=240;h=285;m=0;dur="2h 30min"},
  @{f=1;t=6;s=135;h=175;m=0;dur="1h 30min"},
  @{f=2;t=3;s=255;h=300;m=385;dur="4h"},
  @{f=2;t=5;s=315;h=360;m=445;dur="4h 30min"},
  @{f=2;t=4;s=330;h=375;m=460;dur="5h 30min"},
  @{f=3;t=4;s=310;h=0;m=440;dur="4h"},
  @{f=4;t=5;s=410;h=455;m=540;dur="5h 30min"},
  @{f=11;t=2;s=260;h=305;m=390;dur="3h 30min"}
)

function PriceCard($v,$pax,$price){
  if($price -gt 0){ $amt = "<div class='amt'><em>`$</em>$price</div>" }
  else { $amt = "<div class='amt na'>On request</div>" }
  return "<div class='rp-price'><div class='v'>$v</div><div class='p'>Up to $pax passengers</div>$amt</div>"
}

$year = "2026"
$tpl = Get-Content -Raw -Encoding UTF8 (Join-Path $PSScriptRoot "route-template.html")

$urls = New-Object System.Collections.ArrayList
[void]$urls.Add("$base/")

foreach($r in $routes){
  $o = $dest[[int]$r.f]; $d = $dest[[int]$r.t]
  $slug = "$($o.slug)-to-$($d.slug)"
  $url = "$base/shuttle/$slug"
  $cards = (PriceCard "Hyundai Staria" 5 $r.s) + (PriceCard "Toyota Hiace" 9 $r.h) + (PriceCard "Maxus V90" 12 $r.m)
  $intro = "Travel privately from $($o.n) to $($d.n) with Travesia Costa Rica. $($d.blurb) The transfer takes about $($r.dur), door to door, with a professional English- and Spanish-speaking driver. One flat price per vehicle - taxes and tolls included, and no per-person fees."
  $faq = @"
<details><summary>How long is the transfer from $($o.n) to $($d.n)?</summary><div class='a'>The private shuttle takes about $($r.dur) door to door, depending on traffic and any stops you request.</div></details>
<details><summary>How much is a shuttle from $($o.n) to $($d.n)?</summary><div class='a'>From `$$($r.s) per vehicle for up to 5 passengers (Hyundai Staria), with larger vehicles available. The price is per vehicle, not per person, and includes taxes and tolls.</div></details>
<details><summary>Is the transfer private?</summary><div class='a'>Yes. The vehicle is exclusively for you and your group - no strangers and no extra stops. Door-to-door, hotel to hotel.</div></details>
<details><summary>What if my flight is delayed?</summary><div class='a'>Just share your flight number when you book. We monitor it and adjust your pickup time at no extra cost.</div></details>
"@
  $rel = ""; $count = 0
  foreach($r2 in $routes){
    if($count -ge 5){break}
    if($r2.f -eq $r.f -and $r2.t -eq $r.t){continue}
    $o2=$dest[[int]$r2.f]; $d2=$dest[[int]$r2.t]; $slug2="$($o2.slug)-to-$($d2.slug)"
    $rel += "<a href='/shuttle/$slug2'><div class='r-route'>$($o2.n) &rarr; $($d2.n)</div><div class='r-price'>From `$$($r2.s)</div></a>"
    $count++
  }
  $waMsg = "Hi Travesia! I'd like to book a private transfer from $($o.n) to $($d.n). Date & passengers: "
  $waHref = "https://wa.me/$WA" + "?text=" + [uri]::EscapeDataString($waMsg)
  $bookHref = "/?from=$($r.f)&to=$($r.t)"
  $title = "$($o.n) to $($d.n) Shuttle - Private Transfer from `$$($r.s) | Travesia"
  $desc = "Private shuttle from $($o.n) to $($d.n) in Costa Rica. Door-to-door, about $($r.dur), from `$$($r.s) per vehicle. Bilingual driver, flat rate, book online or on WhatsApp."
  $jsonld = '{"@context":"https://schema.org","@type":"Service","serviceType":"Private airport shuttle transfer","name":"' + $o.n + ' to ' + $d.n + ' Private Shuttle","provider":{"@type":"TravelAgency","name":"Travesia Costa Rica","telephone":"+50685028476","url":"' + $base + '/"},"areaServed":{"@type":"Country","name":"Costa Rica"},"offers":{"@type":"Offer","price":"' + $r.s + '","priceCurrency":"USD","url":"' + $url + '"}}'
  $bc = '{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"' + $base + '/"},{"@type":"ListItem","position":2,"name":"Shuttle routes","item":"' + $base + '/#routes"},{"@type":"ListItem","position":3,"name":"' + $o.n + ' to ' + $d.n + '","item":"' + $url + '"}]}'

  $html = $tpl
  $html = $html.Replace("{{TITLE}}",$title).Replace("{{DESC}}",$desc).Replace("{{CANON}}",$url)
  $html = $html.Replace("{{JSONLD}}",$jsonld).Replace("{{BREADCRUMB}}",$bc)
  $html = $html.Replace("{{ORIGIN}}",$o.n).Replace("{{DEST}}",$d.n)
  $html = $html.Replace("{{DURATION}}",$r.dur).Replace("{{PRICEFROM}}","$($r.s)")
  $html = $html.Replace("{{INTRO}}",$intro).Replace("{{PRICECARDS}}",$cards)
  $html = $html.Replace("{{FAQ}}",$faq).Replace("{{RELATED}}",$rel)
  $html = $html.Replace("{{WAHREF}}",$waHref).Replace("{{BOOKHREF}}",$bookHref).Replace("{{YEAR}}",$year)

  $html | Out-File -FilePath (Join-Path $outDir "$slug.html") -Encoding utf8
  [void]$urls.Add($url)
}

$sm = "<?xml version=""1.0"" encoding=""UTF-8""?>`n<urlset xmlns=""http://www.sitemaps.org/schemas/sitemap/0.9"">`n"
foreach($u in $urls){
  $pri = if($u -eq "$base/"){"1.0"}else{"0.8"}
  $sm += "  <url><loc>$u</loc><lastmod>2026-08-07</lastmod><changefreq>monthly</changefreq><priority>$pri</priority></url>`n"
}
$sm += "</urlset>`n"
$sm | Out-File -FilePath (Join-Path $root "sitemap.xml") -Encoding utf8
Write-Host "Generadas $($routes.Count) paginas. Sitemap con $($urls.Count) URLs."
