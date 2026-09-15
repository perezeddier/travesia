<#
  Contenido compartido de las paginas de ruta y de hotel:
  - $ZGROUP / $CORRIDORS : que se ve en el camino, estado de la carretera y
    consejo, por corredor real. Confirmado con Eddie el 2026-09-15 (el que
    maneja): al Arenal por San Ramon, Monteverde por Sardinal/Guacimal salvo
    desde La Fortuna, Guanacaste por Ruta 1 o 27 segun trafico, Nosara/Samara
    por el puente de la Amistad, Osa por la Costanera, Caribe por Ruta 4.
  - $ROUTE_STOPS  : las dos paradas de siempre (Mi Rancho y Cafe y Macadamia).
  - $ROUTE_REVIEWS: resenas reales verificadas, atadas a la ruta que nombran.
  - $GUIDE_MAP    : guias del blog relacionadas con cada destino.

  Lo usan genroutes.ps1 y genhotels.ps1 con dot-source, para que las dos
  familias de paginas digan exactamente lo mismo.
#>
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
foreach($z in @(1,5,6,7,8,12,13,14,16,18,27,30,49,50)){ $ZGROUP[$z]="GUA" }
foreach($z in @(39,40,10)){ $ZGROUP[$z]="NIC" }
foreach($z in @(11,22,23,29,46,4)){ $ZGROUP[$z]="PAC" }
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
  16 = @($G.itinG, $G.airports)
  18 = @($G.itinG, $G.airports)
  27 = @($G.itinG, $G.lir)
  14 = @($G.itinG, $G.airports)
  19 = @($G.sloths, $G.surf)
  20 = @($G.sloths, $G.when)
  22 = @($G.surf, $G.itin)
  23 = @($G.itin, $G.kids)
  29 = @($G.itin, $G.kids)
  49 = @($G.itinG, $G.when)
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


# --- Nombre corto para los <title>. Google corta el titulo a ~60 caracteres:
# lo que pase de ahi no lo ve nadie. Con estos nombres el precio queda visible.
$SHORTNAME = @{
  0="SJO Airport"; 1="Liberia Airport"; 2="La Fortuna"; 3="Monteverde"; 4="Manuel Antonio"
  5="Tamarindo"; 6="Playa Conchal"; 7="Brasilito"; 8="Papagayo"; 9="Puerto Viejo"
  10="Santa Teresa"; 11="Jaco"; 12="Playas del Coco"; 13="Playa Flamingo"; 14="Playa Hermosa"
  16="Playa Potrero"; 18="Ocotal"; 19="Dominical"; 20="Uvita"; 22="Esterillos"
  23="Los Suenos"; 27="Las Catalinas"; 29="Punta Leona"; 30="Rincon de la Vieja"
  32="La Paz Waterfall"; 36="Sarapiqui"; 38="Montezuma"; 39="Nosara"; 40="Samara"
  41="Puerto Jimenez"; 42="Rio Celeste"; 44="San Jose"; 45="Alajuela"; 46="Puntarenas"
  49="Rio Perdido"; 50="JW Marriott Costa Elena"
}
function ShortName($id, $fallback) {
  if ($SHORTNAME.ContainsKey([int]$id)) { return $SHORTNAME[[int]$id] }
  return $fallback
}
# Arma el titulo y le quita la marca si se pasa de largo, para no perder el precio.
function FitTitle([string]$core) {
  $withBrand = "$core | Travesia"
  if ($withBrand.Length -le 60) { return $withBrand }
  return $core
}