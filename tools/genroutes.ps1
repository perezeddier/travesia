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
foreach ($m in [regex]::Matches($rd, '\{\s*name:\s*"([^"]+)",\s*place:\s*(\d+)\s*\}')) {
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

# --- Corredores: el camino real que maneja Eddie, confirmado por el 2026-09-15 ---
# Cada zona pertenece a un grupo; el par de grupos (ordenado alfabeticamente) elige el texto.
# Reglas confirmadas por Eddie: al Arenal se sube por SAN RAMON (no Zarcero, no Vara Blanca);
# a Monteverde se sube por la Interamericana / Sardinal / Guacimal, salvo desde La Fortuna
# que se va por el lago y Tilaran; a Osa se va por la Costanera; a Nosara/Samara por el
# puente de la Amistad; a Guanacaste por Ruta 1 o Ruta 27 segun el trafico; a Santa Teresa
# por ferry o por tierra segun el dia. Paradas de siempre: Mi Rancho (Los Angeles de San
# Ramon) y Cafe y Macadamia (orilla del lago Arenal).
$ZGROUP = @{}
foreach($z in @(0,44,45,32)){ $ZGROUP[$z]="VC" }
foreach($z in @(2,42,36)){ $ZGROUP[$z]="ARENAL" }
foreach($z in @(3)){ $ZGROUP[$z]="MV" }
foreach($z in @(1,5,6,7,8,12,13,14,30,50)){ $ZGROUP[$z]="GUA" }
foreach($z in @(39,40,10)){ $ZGROUP[$z]="NIC" }
foreach($z in @(11,23,46,4)){ $ZGROUP[$z]="PAC" }
foreach($z in @(19,20,41)){ $ZGROUP[$z]="SUR" }
foreach($z in @(9)){ $ZGROUP[$z]="CAR" }

$CORRIDORS = @{
  "GUA-GUA" = @{
    intro = "The drive between {{ORIGIN}} and {{DEST}} stays inside Guanacaste, on the short coastal roads through Comunidad, Sardinal, Filadelfia and the junctions at Huacas and Villarreal."
    see = @("The dry tropical savanna, with Brahman cattle grazing right by the road","Guanacaste trees, and the yellow cortez in bloom in the dry season","Filadelfia and Santa Cruz, working sabanero towns rather than resort strips","The Gulf of Papagayo opening up as you come down to the coast")
    road = "Paved the whole way - the roads down to these beaches are surfaced now, not gravel."
    tip = "These are short hops - twenty minutes to about an hour - so there is room to stop and eat without missing your check-in."
  }
  "GUA-VC" = @{
    intro = "Between {{ORIGIN}} and {{DEST}} we cross the country from the Central Valley out to Guanacaste. Depending on how the traffic is running that day we take the Pan-American (Route 1) through Esparza and Ca&ntilde;as, or Route 27 down to Caldera and north from there."
    see = @("The descent out of the Central Valley - cool mountain air to Guanacaste heat in about an hour","The Gulf of Nicoya on your left around Esparza","Sugar cane and rice fields through Ca&ntilde;as and Bagaces","The Miravalles and Rinc&oacute;n de la Vieja volcanoes standing on the right","Liberia, the white city, before you turn off for the coast")
    road = "Paved from end to end and one of the easiest long drives in the country, with long straight stretches."
    tip = "It is around five hours on the road, so your driver plans a proper stop along the way for the restroom and something to eat."
  }
  "GUA-PAC" = @{
    intro = "From {{ORIGIN}} to {{DEST}} we come down the Pan-American to the Caldera and Orotina area, then pick up the Costanera Sur (Route 34), which runs along the Pacific all the way to Quepos."
    see = @("The T&aacute;rcoles river bridge, where you can look down on wild crocodiles","Your first look at the Pacific on the drop toward Herradura","Jac&oacute; and its long grey-sand surf beach","The African palm plantations around Parrita - kilometres of palms in perfect rows","The fishing port at Quepos, right before the hill up to Manuel Antonio")
    road = "Paved the whole way. The Costanera is flat and easy; the only slow part is getting out of Guanacaste."
    tip = "Ask your driver to stop at the T&aacute;rcoles bridge. It takes ten minutes, it costs nothing, and there are almost always big crocodiles on the sandbank below."
  }
  "GUA-NIC" = @{
    intro = "The road between {{ORIGIN}} and {{DEST}} goes into the Nicoya Peninsula through Santa Cruz and Nicoya. For S&aacute;mara and Nosara you drop down to the coast from there; for Santa Teresa you cross the whole peninsula through Jicaral and C&oacute;bano."
    see = @("Nicoya, one of the oldest towns in Costa Rica and the heart of the Blue Zone","Dry hills and cattle pasture - a very different Costa Rica from the green of the north","Howler monkeys in the roadside trees, especially early in the morning","The drop down into S&aacute;mara's calm, reef-protected bay")
    road = "Paved as far as Nicoya and S&aacute;mara. The last stretches into Nosara and Santa Teresa are still stone and gravel road, so your driver takes them slowly."
    tip = "This part of the country is slower than the map suggests - it is curves and small towns, not highway. Leaving early changes the whole trip."
  }
  "ARENAL-GUA" = @{
    intro = "Between {{ORIGIN}} and {{DEST}} we normally go around Lake Arenal through Tilar&aacute;n and come out at Ca&ntilde;as. On some days we take the Bijagua road instead, on the flank of Tenorio volcano."
    see = @("Arenal volcano in the mirror for the first twenty minutes","The whole of Lake Arenal, with the wind turbines lined up on the ridge","Tilar&aacute;n, a windy cattle town above the lake","The switch from rainforest to dry savanna in under an hour")
    road = "Paved for most of the way - there are some unpaved stretches along the lake - and one curve after another. What costs time here is the bends, not the distance."
    tip = "If we go around the lake, the stop is Caf&eacute; y Macadamia on the shore: fresh food and one of the best views of the drive."
  }
  "GUA-SUR" = @{
    intro = "{{ORIGIN}} to {{DEST}} is the long one: all the way down the Pan-American, across to the Costanera at Caldera, and then south past Jac&oacute;, Quepos and Dominical."
    see = @("The entire Pacific side of Costa Rica in a single day, from dry savanna to the wet forest of the south","The T&aacute;rcoles bridge and its crocodiles","The palm plantations of Parrita and the port at Quepos","The open coast past Dominical, where the beaches are nearly empty")
    road = "Paved the whole way, but it is seven to nine hours depending on where you start. Treat it as a travel day."
    tip = "On a run like this we start early in the morning and plan two good stops instead of one."
  }
  "PAC-VC" = @{
    intro = "From {{ORIGIN}} to {{DEST}} we take Route 27, the toll highway out of the Central Valley, cross Orotina and join the Costanera Sur toward the beach."
    see = @("The descent out of the mountains with the Gulf of Nicoya ahead of you","The T&aacute;rcoles river bridge and its crocodiles","Playa Herradura and the Los Sue&ntilde;os marina","Jac&oacute;, and further south the palm plantations of Parrita")
    road = "Among the best roads in the country: highway to the coast and good pavement on the Costanera. The tolls are already included in your price."
    tip = "This is the shortest transfer from the airport to a Pacific beach, so even a late-night arrival works without a problem."
  }
  "GUA-MV" = @{
    intro = "Between {{ORIGIN}} and {{DEST}} we run down the Pan-American to the Sardinal junction and then climb through Guacimal up to Santa Elena and Monteverde."
    see = @("The Gulf of Nicoya spreading out below you for the whole climb","Dairy farms, and the Quaker community that founded Monteverde","The moment you drive into the cloud and the temperature drops")
    road = "Highway as far as the junction; from there the climb is winding, narrow and slow - the curves are what cost you time."
    tip = "Keep a light jacket where you can reach it: you leave the coast at around 32&deg;C and arrive in the cloud forest at about 16&deg;C."
  }
  "ARENAL-VC" = @{
    intro = "This is the classic arrival drive, and we do it through San Ram&oacute;n: from Alajuela along Route 1 to San Ram&oacute;n, then up over the mountain through Los &Aacute;ngeles de San Ram&oacute;n and down onto the San Carlos plains."
    see = @("The dairy hills of San Ram&oacute;n on the climb","The cool green forest of Los &Aacute;ngeles de San Ram&oacute;n","Pineapple and sugar cane fields as far as you can see across the San Carlos plains","The cone of Arenal appearing straight ahead - from there it is about thirty minutes")
    road = "Paved the whole way: mountain curves on the San Ram&oacute;n climb, then flat road into La Fortuna."
    tip = "Our stop on this drive is Mi Rancho, in Los &Aacute;ngeles de San Ram&oacute;n - and the toucan that shows up at the tables often enough that the staff call him a regular. Would you rather come up the other way, by Vara Blanca and the La Paz waterfalls on the Po&aacute;s side of the mountain? Tell us when you book and we take that road instead - same price, no surcharge."
  }
  "SUR-VC" = @{
    intro = "From {{ORIGIN}} to {{DEST}} we go out on Route 27 and down the Costanera along the coast, through Jac&oacute; and Quepos and on into the south."
    see = @("The T&aacute;rcoles bridge and its crocodiles","Jac&oacute; and the palm plantations around Parrita","The port at Quepos","The open southern coast past Dominical - more forest, fewer people")
    road = "Paved all the way, but it is a full day on the road."
    tip = "If your flight lands late, it usually works out better to sleep near the airport and start early the next morning."
  }
  "NIC-VC" = @{
    intro = "Between {{ORIGIN}} and {{DEST}} we cross to the Nicoya Peninsula over the Amistad bridge on the Tempisque river for Nosara and S&aacute;mara. For Santa Teresa it can be either the Puntarenas ferry or the road around - whichever works better for your day."
    see = @("The Tempisque river and its mangroves from the bridge","Nicoya and the dry hills of the peninsula","On ferry days, the Gulf of Nicoya and its islands from the water")
    road = "Paved for most of the route, with slower going on the last stretch into some beach towns."
    tip = "On a ferry day the sailing sets the departure time. Naviera Tambor leaves both Puntarenas and Paquera at 4:00am, 6:30am, 9:00am, 12:00 noon, 3:00pm, 6:00pm, 8:00pm and 10:00pm - the schedule in force since April 2026, which we check again before your travel date. We plan your pickup around the sailing and get to the terminal with time to spare."
  }
  "NIC-PAC" = @{
    intro = "{{ORIGIN}} to {{DEST}} either crosses the Gulf of Nicoya on the ferry or goes around it by land through Nicoya and the Pan-American."
    see = @("The gulf and its islands from the deck of the ferry","Puntarenas, its fishing boats and the old seafront promenade","The Costanera with the ocean beside you most of the way")
    road = "Part road, part ferry - the crossing schedule matters more than the pavement."
    tip = "This is one of the few transfers where the timetable rules. Naviera Tambor sails from Puntarenas and from Paquera at 4:00am, 6:30am, 9:00am, 12:00 noon, 3:00pm, 6:00pm, 8:00pm and 10:00pm (schedule in force since April 2026; we confirm it before your date), so it is worth booking with your day clearly set."
  }
  "ARENAL-PAC" = @{
    intro = "From {{ORIGIN}} to {{DEST}} we cross the San Carlos plains, climb over and down through San Ram&oacute;n, and pick up Route 27 and the Costanera to the coast."
    see = @("Arenal seeing you off in the mirror, then the dairy hills of San Ram&oacute;n","The Gulf of Nicoya on the descent","The T&aacute;rcoles bridge, Jac&oacute; and the palms of Parrita")
    road = "Paved the whole way - curves through the mountains, flat along the coast."
    tip = "Few drives change the scenery this much: volcano in the morning, Pacific beach by midday."
  }
  "VC-VC" = @{
    intro = "Short runs around the airport and the capital. For La Paz Waterfall Gardens we climb by Vara Blanca, between Po&aacute;s and Barva."
    see = @("Coffee farms on the slopes of Po&aacute;s","The Vara Blanca climb - dairy country, often in the mist","The La Paz waterfalls right from the roadside")
    road = "Paved. What decides the time here is San Jos&eacute; traffic, not the distance."
    tip = "Between 6 and 9 in the morning and 4 to 7 in the afternoon, Central Valley traffic can double the trip. Travelling outside those hours makes all the difference."
  }
  "PAC-SUR" = @{
    intro = "Straight down the Costanera Sur from {{ORIGIN}} toward {{DEST}}, past Savegre and Matapalo."
    see = @("One big, nearly empty beach after another","The river bridges coming down off the Fila CosteÃ±a","The whale-tail sandbar at Uvita when the tide is out")
    road = "Smooth pavement and light traffic - an easy couple of hours."
    tip = "Humpback whales pass Uvita between July and October and again from December to March; it is worth timing your arrival with low tide."
  }
  "NIC-SUR" = @{
    intro = "Out of the peninsula through Nicoya, south on the Pan-American, and then the length of the Costanera between {{ORIGIN}} and {{DEST}}."
    see = @("Both ends of the Costa Rican Pacific in one day","The Gulf of Nicoya and Puntarenas, then the open coast of the south")
    road = "Paved for nearly all of it, but it is a full-day drive."
    tip = "On a run this long your driver spaces the stops - one mid-morning and one at lunch."
  }
  "MV-PAC" = @{
    intro = "Down out of the cloud forest to the Pan-American, across at Caldera, and south on the Costanera between {{ORIGIN}} and {{DEST}}."
    see = @("The descent from Monteverde with the Gulf of Nicoya in front of you","Puntarenas and the fishing boats","The T&aacute;rcoles bridge, Jac&oacute; and the palms of Parrita")
    road = "The descent from Monteverde is slow because of the curves; after that it is comfortable road all the way."
    tip = "There are about three hours between cloud-forest cold and beach heat, so dress in layers."
  }
  "PAC-PAC" = @{
    intro = "A short run on the Costanera between {{ORIGIN}} and {{DEST}} - somewhere between an hour and an hour and a half."
    see = @("The Los Sue&ntilde;os marina and its sportfishing fleet","The Parrita palm plantations and the old one-lane bridges","The port at Quepos")
    road = "Flat and paved: the easiest drive on the whole coast."
    tip = "It is short enough that many travellers use it to fit in a lunch stop by the sea."
  }
  "MV-VC" = @{
    intro = "Northwest on the Pan-American from {{ORIGIN}}, then up through Sardinal and Guacimal to Santa Elena and Monteverde."
    see = @("The Gulf of Nicoya below you on the climb","Dairy farms and the town of Santa Elena","Driving into the cloud at the top")
    road = "Highway to the junction; the climb is winding and slow."
    tip = "It is better to arrive in daylight - the climb in fog is uncomfortable for passengers even though your driver knows it well."
  }
  "MV-SUR" = @{
    intro = "Down to the Pan-American, across to the Costanera and south along the coast between {{ORIGIN}} and {{DEST}}."
    see = @("Cloud forest in the morning, southern beach in the afternoon","The T&aacute;rcoles bridge, Jac&oacute; and Quepos","The open coast past Dominical")
    road = "Paved throughout; five to six hours including the slow descent from Monteverde."
    tip = "Leaving Monteverde early gets you down the mountain before the morning mist settles in."
  }
  "MV-NIC" = @{
    intro = "Down to the Pan-American and into the Nicoya Peninsula through Nicoya, between {{ORIGIN}} and {{DEST}}."
    see = @("The Gulf of Nicoya from above on the way down","Nicoya and the dry hills of the peninsula","The contrast between cloud forest and dry coast in a single morning")
    road = "Paved for most of the way, slower on the final stretch."
    tip = "Half a day on the road: you leave in a jacket and arrive in a swimsuit."
  }
  "CAR-VC" = @{
    intro = "Between {{ORIGIN}} and {{DEST}} we take Route 32: across Braulio Carrillo National Park through the Zurqu&iacute; tunnel, down to Gu&aacute;piles, and along the coast past Lim&oacute;n and Cahuita."
    see = @("Braulio Carrillo - primary rainforest on both sides of the road","The Zurqu&iacute; tunnel, with waterfalls hanging off the mountain","Banana plantations around Gu&aacute;piles and Siquirres","Your first sight of the Caribbean past Lim&oacute;n","Cahuita and its national park before you arrive")
    road = "Paved, but the mountain section can close in with rain or fog and there is a lot of truck traffic."
    tip = "The Caribbean keeps its own weather - clear mornings and showers in the afternoon - so we leave early."
  }
  "ARENAL-SUR" = @{
    intro = "From {{ORIGIN}} to {{DEST}}: across the San Carlos plains, over the mountain by San Ram&oacute;n, and then Route 27 and the Costanera south."
    see = @("Arenal at the start of the day and the southern sea at the end of it","The T&aacute;rcoles bridge, Jac&oacute;, Parrita and Quepos along the way")
    road = "Paved from end to end, and one of the longest transfers we run."
    tip = "We always suggest leaving La Fortuna in the morning, so you reach the south coast in daylight."
  }
  "ARENAL-NIC" = @{
    intro = "Around Lake Arenal and out at Ca&ntilde;as, then into the Nicoya Peninsula through Nicoya, between {{ORIGIN}} and {{DEST}}."
    see = @("Lake Arenal and the wind turbines on the ridge","The savanna around Ca&ntilde;as and Nicoya","The drop down to the peninsula coast")
    road = "Curves and a few unpaved stretches along the lake, easy road across the savanna, slower at the end."
    tip = "This one crosses the country from east to west, so we always suggest a morning start and you count it as a travel day rather than a quick hop."
  }
  "NIC-NIC" = @{
    intro = "Between {{ORIGIN}} and {{DEST}} we go back out to the main peninsula road and down through Jicaral and C&oacute;bano. There is no shortcut along the beaches - the coastal track is slower and much harder going, so the inland road is the real route."
    see = @("Small inland towns and cattle pasture, away from the beach strip","Howler monkeys in the roadside trees, especially early","The long descent back down to the coast at the end")
    road = "Gravel road for a good part of the way: short in kilometres, slow in time."
    tip = "Better not to leave this one for the end of the day."
  }
  "ARENAL-MV" = @{
    intro = "All the way around the north shore of Lake Arenal to Tilar&aacute;n, and then up the mountain to Santa Elena and Monteverde."
    see = @("Arenal volcano behind you for the first half hour","The whole lake, with the wind turbines turning on the ridge","The forest closing in and cooling down as you climb")
    road = "Paved for most of the way - there are unpaved stretches - and one curve after another. The bends are what cost time, not the distance."
    tip = "Leaving between 8 and 9 in the morning gives you the best of this drive."
  }
  "ARENAL-ARENAL" = @{
    intro = "For R&iacute;o Celeste we climb through Bijagua, on the flank of Tenorio volcano; for Sarapiqu&iacute; we head out through Muelle and Aguas Zarcas."
    see = @("Tenorio volcano and the farms around Bijagua - sloth country","Pineapple, sugar cane and cattle across the northern plains","Big rivers and lowland forest on the way to Sarapiqu&iacute;")
    road = "Paved the whole way, both up to R&iacute;o Celeste and out to Sarapiqu&iacute;."
    tip = "Get to R&iacute;o Celeste early: after heavy rain the river loses its blue for a few hours."
  }
  "SUR-SUR" = @{
    intro = "South on the Costanera past Palmar, then into the Osa Peninsula at Chacarita between {{ORIGIN}} and {{DEST}}."
    see = @("The T&eacute;rraba-Sierpe wetlands, the largest mangrove in the country","The Golfo Dulce on the last stretch","Forest closing in around the road - this is the wildest corner of Costa Rica")
    road = "Paved down to the peninsula, with some gravel on the last part into Puerto Jim&eacute;nez."
    tip = "Out here there is no gas station or soda every few minutes, so we fill up and take the stop before Chacarita."
  }
  "CAR-MV" = @{
    intro = "From the cloud forest down to the Central Valley, then Route 32 through Braulio Carrillo to the Caribbean."
    see = @("Cloud forest, valley, mountain rainforest and the Caribbean in a single day","The Zurqu&iacute; tunnel and the banana country around Gu&aacute;piles")
    road = "Paved, and one of the longest drives in the country - ocean to ocean."
    tip = "We start early in the morning on this one: it is seven to eight hours, and nobody wants to arrive on the south Caribbean after dark."
  }
  "ARENAL-CAR" = @{
    intro = "Out of San Carlos along Route 4 - the newer road through Bajo Chilamate - all the way across to Route 32, and then down the coast past Lim&oacute;n to Puerto Viejo."
    see = @("Pineapple fields and banana plantations across the northern lowlands","The big Sarapiqu&iacute; rivers - serious birding country","The Caribbean appearing once you are past Lim&oacute;n")
    road = "Paved, with heavy truck traffic on the Route 32 stretch."
    tip = "Going this way you skip San Jos&eacute; traffic completely, which is the real advantage of the northern road."
  }
}

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

# Resenas reales de Google (verificadas en el perfil de negocio 2026-08-29), asociadas a una ruta especifica.
# Clave = "min-max" de los indices de zona (aplica a las 2 direcciones de esa ruta).
# Cada valor es un ARRAY de resenas (1 a 3 por ruta). Texto VERBATIM del perfil (recortado en limites de oracion).
# Paradas de cortesia reales que Eddie usa siempre en ciertas rutas. Clave = "menor-mayor".
$MIRANCHO = "<p class='rp-note'><strong>The stop we usually make on this route:</strong> <em>Mi Rancho</em>, a roadside cafe and restaurant with wide mountain views &mdash; and a toucan that turns up at the tables often enough that the staff call him a regular. It is an ordinary courtesy stop: no extra charge, no schedule, just tell your driver you would like to break the drive there.</p>"
$MACADAMIA = "<p class='rp-note'><strong>The stop we usually make on this route:</strong> <em>Caf&eacute; y Macadamia</em>, on the shore of Lake Arenal &mdash; fresh, genuinely good food and one of the best views of the whole drive. It is an ordinary courtesy stop: no extra charge, no schedule, just tell your driver you would like to break the drive there.</p>"
$ROUTE_STOPS = @{
  "2-45" = $MIRANCHO   # Alajuela <-> La Fortuna
  "2-3"  = $MACADAMIA  # La Fortuna <-> Monteverde
  "0-2"  = $MIRANCHO   # SJO <-> La Fortuna
  "2-44" = $MIRANCHO   # San Jose ciudad <-> La Fortuna
  "2-4"  = $MIRANCHO   # La Fortuna <-> Manuel Antonio
}

$ROUTE_REVIEWS = @{
  "0-2" = @(
    @{ quote = "We booked a transfer very last minute for our family of 5 from San Jose to La Fortuna. Communication with Eddie Perez was great. The driver was professional, friendly, safe and the van was clean, comfortable with AC and WIFI. We stopped at a lovely cafe/restaurant called MI Rancho which had beautiful views but best of all a visiting toucan on the next table! We were informed he is a regular visitor. Great transfer."; author = "melanie a"; source = "TripAdvisor" },
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
    @{ quote = "Excellent transportation service throughout our trip to Costa Rica: San Jos&eacute; to La Fortuna; La Fortuna to Manuel Antonio, including an overnight transfer; Manuel Antonio to Alajuela and San Jos&eacute;. They were always available to answer my calls and accommodate our requests, even on very short notice. Thank you for being so responsive, reliable, flexible, and punctual. I highly recommend them!"; author = "Beatriz Nava-Villase&ntilde;or" },
    @{ quote = "Excellent transportation and service from La Fortuna to Manuel Antonio with Eric! He shared local info and helped us practice some Spanish on the way!"; author = "Suzanne P." },
    @{ quote = "Having private shuttles took the stress out of driving (especially during heavy rain and thunderstorms between La Fortuna and MA) and our driver John was extremely informative with a wealth of knowledge as well as pointing out wildlife (monkeys, birds etc) and stopped at interesting places to break the journey up."; author = "Phoebe S." }
  )
  "0-4" = @(
    @{ quote = "Excellent transportation service throughout our trip to Costa Rica: San Jos&eacute; to La Fortuna; La Fortuna to Manuel Antonio, including an overnight transfer; Manuel Antonio to Alajuela and San Jos&eacute;. They were always available to answer my calls and accommodate our requests, even on very short notice. Thank you for being so responsive, reliable, flexible, and punctual. I highly recommend them!"; author = "Beatriz Nava-Villase&ntilde;or" },
    @{ quote = "We connected with Eddie at Travesia CR to arrange a few key shuttle transfers for our group of 11, including San Jose to La Fortuna, La Fortuna to Manuel Antonio, and Manuel Antonio back to the San Jose airport. Every transfer and tour they managed was exceptional. The drivers were kind, thoughtful, and punctual, and the vehicles were consistently clean, comfortable, and modern."; author = "David I." },
    @{ quote = "We used Travesia when we visited Costa Rica in February. It was great to get off a plane and have a whole van to our self. They took us from San Jose to Manuel Antonio and back to the airport when we left. Both of our drivers were great. Knowledgeable, friendly and willing to answer all my silly questions. They both stopped for us to eat and shop. They were on time and always kept in contact with us."; author = "Michelle A."; source = "Facebook" }
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
  "2-42" = @(
    @{ quote = "Eddie drove our family of three, including our 4-year-old daughter, on two long excursions/trips from Nayara Resort to Rio Celeste and also to Dreams Las Mareas. We were in the car with him for 5+ hours. He was professional, kind, safety-conscious and extremely friendly and knowledgeable. He didn't even blink when our daughter got car sick in the mountains. He helped us get cleaned up and continued on. I would highly recommend Eddie to anyone traveling with family in the Arenal/Fortuna region."; author = "Corey M."; source = "Facebook" }
  )
  "2-50" = @(
    @{ quote = "Eddie drove our family of three, including our 4-year-old daughter, on two long excursions/trips from Nayara Resort to Rio Celeste and also to Dreams Las Mareas. We were in the car with him for 5+ hours. He was professional, kind, safety-conscious and extremely friendly and knowledgeable. He didn't even blink when our daughter got car sick in the mountains. He helped us get cleaned up and continued on. I would highly recommend Eddie to anyone traveling with family in the Arenal/Fortuna region."; author = "Corey M."; source = "Facebook" }
  )
}

function PriceCard($v,$pax,$price){
  if($price -gt 0){ $amt = "<div class='amt'><em>`$</em>$price</div>" } else { $amt = "<div class='amt na'>On request</div>" }
  return "<div class='rp-price'><div class='v'>$v</div><div class='p'>Up to $pax passengers</div>$amt</div>"
}

# --- Guias del blog relacionadas con cada destino (enlaces internos reales) ---
$G = @{
  sjo      = @{ u="/guide/how-to-get-from-sjo-to-la-fortuna"; t="How to get from SJO airport to La Fortuna" }
  lir      = @{ u="/guide/how-to-get-from-liberia-to-tamarindo"; t="How to get from Liberia airport (LIR) to Tamarindo" }
  airports = @{ u="/guide/sjo-vs-lir-which-airport"; t="SJO vs LIR: which airport should you fly into?" }
  arrival  = @{ u="/guide/sjo-airport-arrival-guide"; t="Landing at SJO: what happens after you get off the plane" }
  around   = @{ u="/guide/getting-around-costa-rica"; t="Getting around Costa Rica: shuttle, rental car or bus" }
  car      = @{ u="/guide/do-you-need-a-car-in-costa-rica"; t="Do you need a rental car in Costa Rica?" }
  cost     = @{ u="/guide/how-much-do-shuttles-cost-in-costa-rica"; t="How much do private shuttles cost in Costa Rica?" }
  days     = @{ u="/guide/how-many-days-in-la-fortuna"; t="How many days to spend in La Fortuna" }
  monte    = @{ u="/guide/how-to-get-to-monteverde"; t="How to get to Monteverde" }
  osa      = @{ u="/guide/how-to-get-to-osa-peninsula"; t="How to get to the Osa Peninsula" }
  itin     = @{ u="/guide/costa-rica-7-day-itinerary"; t="Costa Rica 7-day itinerary" }
  itinG    = @{ u="/guide/costa-rica-7-day-itinerary-guanacaste"; t="Costa Rica 7-day itinerary: Guanacaste" }
  kids     = @{ u="/guide/costa-rica-with-kids"; t="Costa Rica with kids" }
  sloths   = @{ u="/guide/where-to-see-sloths-in-costa-rica"; t="Where to see sloths in Costa Rica" }
  surf     = @{ u="/guide/traveling-with-a-surfboard-in-costa-rica"; t="Traveling with a surfboard in Costa Rica" }
  when     = @{ u="/guide/best-time-to-visit-costa-rica"; t="The best time to visit Costa Rica" }
  pack     = @{ u="/guide/what-to-pack-for-costa-rica"; t="What to pack for Costa Rica" }
  food     = @{ u="/guide/best-restaurants-costa-rica"; t="Best restaurants in Costa Rica" }
  faq      = @{ u="/guide/costa-rica-travel-faq"; t="Costa Rica travel FAQ" }
}
$GUIDE_MAP = @{
  0  = @($G.arrival, $G.airports, $G.car)
  1  = @($G.airports, $G.lir, $G.car)
  2  = @($G.days, $G.sjo, $G.sloths)
  3  = @($G.monte, $G.around, $G.when)
  4  = @($G.sloths, $G.itin, $G.food)
  5  = @($G.lir, $G.itinG, $G.surf)
  6  = @($G.itinG, $G.airports)
  7  = @($G.itinG, $G.airports)
  8  = @($G.itinG, $G.when)
  9  = @($G.around, $G.when)
  10 = @($G.surf, $G.around)
  11 = @($G.surf, $G.itin)
  12 = @($G.itinG, $G.airports)
  13 = @($G.itinG, $G.when)
  14 = @($G.itinG, $G.airports)
  19 = @($G.sloths, $G.surf)
  20 = @($G.sloths, $G.when)
  23 = @($G.itin, $G.kids)
  30 = @($G.itinG, $G.when)
  32 = @($G.around, $G.sloths)
  36 = @($G.sloths, $G.around)
  39 = @($G.surf, $G.lir)
  40 = @($G.surf, $G.around)
  41 = @($G.osa, $G.sloths)
  42 = @($G.days, $G.when)
  44 = @($G.arrival, $G.car)
  45 = @($G.arrival, $G.airports)
  46 = @($G.around, $G.itin)
  50 = @($G.itinG, $G.lir)
}
$GUIDE_DEFAULT = @($G.cost, $G.car, $G.faq, $G.pack, $G.kids)

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
  foreach($p2 in $byOrigin[$p.f]){
    if($count -ge 5){break}
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
    $reviewLd = ',"review":[' + ($lds -join ',') + ']'
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
    $hcards = ""; $hc = 0
    foreach ($h in $hotelsByZone[$p.t]) {
      if ($hc -ge 6) { break }
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
  $title="$($o.n) to $($d.n) Shuttle - Private Transfer from `$$($p.s) (2026) | Travesia"
  $desc="Private shuttle from $($o.n) to $($d.n) in Costa Rica. Door-to-door, about $($p.dur), from `$$($p.s) per vehicle. Bilingual driver, flat rate, book online or on WhatsApp."
  $jsonld='{"@context":"https://schema.org","@type":"Service","serviceType":"Private airport shuttle transfer","name":"'+$o.n+' to '+$d.n+' Private Shuttle","provider":{"@type":"TravelAgency","name":"Travesia Costa Rica","telephone":"+50685028476","url":"'+$base+'/"},"areaServed":{"@type":"Country","name":"Costa Rica"},"offers":{"@type":"Offer","price":"'+$p.s+'","priceCurrency":"USD","url":"'+$url+'"}'+$reviewLd+'}'
  $bc='{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"'+$base+'/"},{"@type":"ListItem","position":2,"name":"All routes","item":"'+$base+'/shuttle"},{"@type":"ListItem","position":3,"name":"'+$o.n+' to '+$d.n+'","item":"'+$url+'"}]}'

  $html=$tpl
  $html=$html.Replace("{{TITLE}}",$title).Replace("{{DESC}}",$desc).Replace("{{CANON}}",$url)
  $html=$html.Replace("{{JSONLD}}",$jsonld).Replace("{{BREADCRUMB}}",$bc)
  $html=$html.Replace("{{ORIGIN}}",$o.n).Replace("{{DEST}}",$d.n)
  $html=$html.Replace("{{DURATION}}",$p.dur).Replace("{{PRICEFROM}}","$($p.s)")
  $html=$html.Replace("{{INTRO}}",$intro).Replace("{{PRICECARDS}}",$cards)
  $html=$html.Replace("{{FAQ}}",$faq).Replace("{{RELATED}}",$rel)
  $html=$html.Replace("{{HOTELS}}",$hotelsHtml).Replace("{{GUIDES}}",$guidesHtml).Replace("{{PERPERSON}}",$perPerson)
  $html=$html.Replace("{{SEEN}}",$seenHtml)
  $html=$html.Replace("{{REVIEW}}",$reviewHtml)
  $stopNote = if ($ROUTE_STOPS.ContainsKey($rkey)) { $ROUTE_STOPS[$rkey] } else { "" }
  $html=$html.Replace("{{STOPNOTE}}",$stopNote)
  $html=$html.Replace("{{WAHREF}}",$waHref).Replace("{{BOOKHREF}}",$bookHref).Replace("{{YEAR}}",$year)
  [System.IO.File]::WriteAllText((Join-Path $outDir "$slug.html"), $html, (New-Object System.Text.UTF8Encoding $false))
  [void]$urls.Add($url)
}

# --- Guias del blog ---
$guides=@("guide","tours","reviews","guide/how-to-get-from-sjo-to-la-fortuna","guide/how-to-get-from-liberia-to-tamarindo","guide/sjo-vs-lir-which-airport","guide/getting-around-costa-rica","guide/costa-rica-7-day-itinerary","guide/costa-rica-7-day-itinerary-guanacaste","guide/costa-rica-honeymoon-itinerary","guide/best-restaurants-costa-rica","guide/best-time-to-visit-costa-rica","guide/do-you-need-a-car-in-costa-rica","guide/how-many-days-in-la-fortuna","guide/costa-rica-with-kids","guide/costa-rica-travel-faq","guide/sjo-airport-arrival-guide","guide/how-much-do-shuttles-cost-in-costa-rica","guide/how-to-get-to-monteverde","guide/how-to-get-to-osa-peninsula","guide/traveling-with-a-surfboard-in-costa-rica","guide/getting-around-costa-rica-for-birders","guide/birding-stops-on-your-costa-rica-transfer","guide/where-to-see-sloths-in-costa-rica","guide/what-to-pack-for-costa-rica","guide/do-you-need-spanish-in-costa-rica","tours/la-fortuna-full-day","tours/safari-float","tours/hanging-bridges","tours/volcano-hike","tours/volcano-waterfall-combo","tours/cano-negro","tours/rafting","tours/canyoning","tours/rio-celeste","tours/coffee-chocolate","tours/bridges-waterfall-combo","terms","privacy","full-trip-chauffeur","private-shuttle-costa-rica","costa-rica-airport-transfers","costa-rica-private-transportation","costa-rica-birding-transportation")
foreach($g in $guides){ [void]$urls.Add("$base/$g") }

# Paginas hub y de aterrizaje: prioridad alta y revision semanal (se respeta al regenerar)
$hiPri = @("$base/shuttle","$base/hotel","$base/tours","$base/reviews","$base/full-trip-chauffeur","$base/private-shuttle-costa-rica","$base/costa-rica-airport-transfers","$base/costa-rica-private-transportation","$base/costa-rica-birding-transportation")

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
