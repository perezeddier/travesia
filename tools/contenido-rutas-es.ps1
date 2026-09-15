<#
  Los 30 corredores en espanol, tal y como Eddie los reviso uno por uno el
  2026-09-15. Es el mismo contenido que las paginas en ingles, no una
  traduccion automatica: se escribio en espanol primero y el lo corrigio.
  Lo usa genroutes-es.ps1.
#>
$CORRIDORS_ES = @{
  "GUA-GUA" = @{
    intro = "Desde Liberia se sale por la Ruta 21 hacia Comunidad y Sardinal para Playas del Coco, Playa Hermosa y Papagayo; para Brasilito, Conchal, Flamingo y Tamarindo se sigue por Filadelfia y Belén hasta los cruces de Huacas y Villarreal. Entre playa y playa son trayectos cortos, de 20 minutos a una hora."
    see = @("La sabana seca guanacasteca y el ganado brahman a la orilla del camino","Los guanacastes y, en verano, los cortezas amarillas florecidos","Filadelfia y Santa Cruz, los pueblos sabaneros de verdad","El golfo de Papagayo apareciendo en la bajada")
    road = "Asfaltada: los caminos a estas playas ya están pavimentados, no son de lastre."
    tip = "Son viajes cortos: si va del aeropuerto a la playa a media mañana, da tiempo de parar a almorzar sin llegar tarde al check-in."
  }
  "GUA-VC" = @{
    intro = "Se baja del Valle Central y se sale hacia el norte por la Interamericana — Esparza, el cruce de Puntarenas, Cañas, Bagaces y Liberia — o por la Ruta 27 hasta Caldera, <b>la que esté corriendo mejor ese día</b>."
    see = @("La bajada del Valle Central, con el clima cambiando de fresco a caliente en una hora","El golfo de Nicoya a la izquierda por Esparza","Cañaverales y arrozales por Cañas y Bagaces","El volcán Miravalles y el Rincón de la Vieja a mano derecha","Liberia, la ciudad blanca, antes de agarrar para la costa")
    road = "Pavimentada de punta a punta; es de las rutas más cómodas del país, con tramos rectos largos."
    tip = "Es un viaje de alrededor de cinco horas, así que el chofer planea una parada buena de baño y comida en el camino."
  }
  "GUA-PAC" = @{
    intro = "Se baja por la Interamericana hasta la zona de Caldera y Orotina, y ahí se agarra la Costanera Sur (Ruta 34), que va pegada al Pacífico hasta Quepos."
    see = @("El puente del río Tárcoles, donde se ven los cocodrilos desde arriba","La primera vista del Pacífico bajando hacia Herradura","Jacó y su playa larga de arena gris","Las plantaciones de palma africana por Parrita, kilómetros de palmeras en fila","El puerto de Quepos antes de subir a Manuel Antonio")
    road = "Pavimento todo el camino. La Costanera es plana y tranquila; el único tramo lento es la salida de Guanacaste."
    tip = "Pida la parada en el puente de Tárcoles: son diez minutos, es gratis y casi siempre hay cocodrilos grandes en el banco de arena."
  }
  "GUA-NIC" = @{
    intro = "Se entra a la península por Santa Cruz y Nicoya. De ahí baja a Sámara, o sigue a Nosara. Para Santa Teresa se atraviesa toda la península por Jicaral, Lepanto y Cóbano, o se cruza en ferry: las dos se hacen según el día."
    see = @("Nicoya, uno de los pueblos más viejos del país y corazón de la Zona Azul","Cerros secos y potreros, muy distinto al verde del resto de Costa Rica","Monos congo en los árboles de la orilla del camino, sobre todo temprano","La bajada a la bahía de Sámara, calmada y protegida por el arrecife")
    road = "Pavimento hasta Nicoya y Sámara. Los últimos tramos a Nosara y a Santa Teresa siguen siendo calle de piedra, así que se manejan despacio."
    tip = "En esta zona el camino es más lento de lo que dice el mapa: son curvas y pueblos, no autopista. Salir temprano cambia el viaje."
  }
  "ARENAL-GUA" = @{
    intro = "Normalmente bordeando el lago Arenal hasta Tilarán y saliendo a Cañas; algunas veces por Bijagua, en la falda del Tenorio."
    see = @("El volcán Arenal por el retrovisor los primeros 20 minutos","El lago Arenal completo, con los molinos de viento en la loma","Tilarán, pueblo de viento y ganado, arriba del lago","El cambio de bosque húmedo a sabana seca en menos de una hora")
    road = "Pavimento en casi todo el camino — por el lago hay tramos sin asfaltar — y muchas curvas: lo que toma tiempo son las vueltas, no la distancia."
    tip = "Si vamos por el lago, la parada es <b>Café y Macadamia</b>: comida fresca y vista al agua. La orilla del lago es de los manejos más bonitos del país."
  }
  "GUA-SUR" = @{
    intro = "Es el viaje largo del país: se baja toda la Interamericana, se cruza a la Costanera por Caldera y se sigue al sur pasando Jacó, Quepos y Dominical."
    see = @("Todo el Pacífico de Costa Rica en un solo día, de la sabana seca a la selva húmeda del sur","El puente de Tárcoles y los cocodrilos","Las palmeras de Parrita y el puerto de Quepos","La costa abierta después de Dominical, con playas casi vacías")
    road = "Pavimento todo el camino, pero son entre 7 y 9 horas según el punto de salida: es un día completo de viaje."
    tip = "Para este tipo de traslado conviene salir temprano en la mañana y contar con dos paradas buenas de comida en vez de una."
  }
  "PAC-VC" = @{
    intro = "Se sale de San José por la Ruta 27 (la autopista de peaje), se cruza Orotina y se entra a la Costanera Sur rumbo a la playa."
    see = @("La bajada de la montaña con el golfo de Nicoya al fondo","El puente del río Tárcoles y sus cocodrilos","Playa Herradura y la marina de Los Sueños","Jacó, y más al sur las palmeras de Parrita")
    road = "De las mejores del país: autopista hasta la costa y pavimento nuevo en la Costanera. Los peajes ya van incluidos en el precio."
    tip = "Es el traslado más corto del aeropuerto a una playa del Pacífico: si llega tarde en la noche, todavía se puede hacer sin problema."
  }
  "GUA-MV" = @{
    intro = "Por la Interamericana hasta el cruce de Sardinal, y ahí empieza la subida por Guacimal hasta Santa Elena y Monteverde. Por Tilarán solo se va desde La Fortuna; por este lado sería más largo."
    see = @("El golfo de Nicoya a lo ancho durante toda la subida","Fincas lecheras y el pueblo cuáquero que fundó Monteverde","El momento en que se entra a la nube y baja la temperatura de golpe")
    road = "Carretera principal hasta el cruce; de ahí para arriba es angosto, de curvas y lento — lo que cuesta tiempo son las vueltas."
    tip = "Lleve un abrigo liviano a mano: se sale de 32 °C en la costa y se llega a 16 °C en el bosque nuboso."
  }
  "ARENAL-VC" = @{
    intro = "Es la ruta de llegada clásica y nosotros la hacemos <b>por San Ramón</b>: de Alajuela por la Ruta 1 hasta San Ramón, y de ahí montaña arriba por Los Ángeles de San Ramón hasta bajar a las llanuras de San Carlos y La Fortuna."
    see = @("Los cerros y las lecherías de San Ramón en la subida","El bosque de Los Ángeles de San Ramón, verde y fresco","Piñales y cañales hasta donde alcanza la vista en la llanura de San Carlos","El cono del Arenal apareciendo de frente: de ahí faltan unos 30 minutos")
    road = "Pavimento todo el camino: curvas de montaña en la subida de San Ramón y luego plano hasta La Fortuna."
    tip = "Aquí paramos en <b>Mi Rancho</b>, en Los Ángeles de San Ramón: café y restaurante con vista a la montaña, y el tucán que llega a las mesas tan seguido que ya es cliente fijo. Es parada de cortesía: sin costo y sin apuro. Y si el cliente prefiere subir por <b>Vara Blanca</b>, viendo las cataratas de La Paz y el lado del Poás, lo pide al reservar y por ahí lo llevamos: <b>mismo precio, sin recargo</b>."
  }
  "SUR-VC" = @{
    intro = "Por la Ruta 27 y la Costanera, bordeando el mar por Jacó y Quepos hasta el sur. (No por el Cerro de la Muerte.)"
    see = @("El puente de Tárcoles y sus cocodrilos","Jacó y las palmeras de Parrita","El puerto de Quepos","La costa abierta pasando Dominical: más selva, menos gente")
    road = "Pavimentada todo el camino, pero es un día completo de viaje."
    tip = "Es un viaje de día entero. Si el vuelo llega tarde, muchas veces sale mejor dormir cerca del aeropuerto y salir temprano."
  }
  "NIC-VC" = @{
    intro = "A Nosara y Sámara, por el puente de la Amistad sobre el río Tempisque, que es la vía más cercana. A Santa Teresa, ferry de Puntarenas a Paquera o por tierra, según el día."
    see = @("El río Tempisque y sus manglares desde el puente","Nicoya y los cerros secos de la península","Si va en ferry: el golfo de Nicoya y sus islas desde el agua")
    road = "Pavimento en la mayor parte; los últimos kilómetros hacia algunas playas son más lentos."
    tip = "En día de ferry manda el barco: Naviera Tambor sale de Puntarenas y de Paquera a las 4:00, 6:30, 9:00, 12 md, 3:00, 6:00, 8:00 y 10:00 pm (horario vigente desde abril 2026, lo revisamos antes de cada viaje). La recogida se planea alrededor de la salida."
  }
  "NIC-PAC" = @{
    intro = "Cruzando el golfo de Nicoya en ferry, o rodeándolo por tierra por Nicoya y la Interamericana: las dos se hacen."
    see = @("El golfo de Nicoya con sus islas, si se va en ferry","Puntarenas, el paseo de los Turistas y los barcos pesqueros","La Costanera hacia el sur con el mar siempre a un lado")
    road = "Mezcla de carretera y ferry; el tiempo depende del horario del barco más que del camino."
    tip = "Es de los pocos traslados donde el horario manda: Naviera Tambor sale a las 4:00, 6:30, 9:00, 12 md, 3:00, 6:00, 8:00 y 10:00 pm (vigente desde abril 2026). Conviene reservar con el día bien definido."
  }
  "ARENAL-PAC" = @{
    intro = "Se cruza la llanura de San Carlos, se sube y se baja por San Ramón, y de ahí a la Ruta 27 y la Costanera hasta la playa."
    see = @("El Arenal despidiéndose por atrás y los cerros lecheros de San Ramón","El golfo de Nicoya en la bajada","Tárcoles, Jacó y las palmeras de Parrita")
    road = "Pavimento todo el camino; la parte de montaña es de curvas y la de costa es plana."
    tip = "Es de los traslados donde más cambia el paisaje: volcán en la mañana, playa al mediodía."
  }
  "VC-VC" = @{
    intro = "Trayectos cortos alrededor del aeropuerto y la capital. Para La Paz Waterfall Gardens se sube por Vara Blanca, entre el Poás y el Barva."
    see = @("Cafetales en las faldas del Poás","La subida de Vara Blanca, con lechería y neblina","Las cataratas del río La Paz desde la carretera")
    road = "Pavimento; lo que manda es la presa de San José, no la distancia."
    tip = "Entre las 6 y las 9 de la mañana y de 4 a 7 de la tarde el tráfico del Valle Central duplica el tiempo: salir fuera de esas horas hace toda la diferencia."
  }
  "PAC-SUR" = @{
    intro = "Puro Costanera Sur hacia abajo, pasando Savegre y Matapalo hasta Dominical y Uvita."
    see = @("Playas grandes y vacías una tras otra","Los puentes de los ríos que bajan de la Fila Costeña","La cola de ballena de Uvita cuando la marea está baja")
    road = "Pavimento parejo y poco tráfico: es un manejo tranquilo de un par de horas."
    tip = "Entre julio y octubre y de diciembre a marzo pasan las ballenas jorobadas frente a Uvita; vale coordinar la llegada con la marea baja."
  }
  "NIC-SUR" = @{
    intro = "Salida de la península por Nicoya, Interamericana al sur y luego toda la Costanera."
    see = @("Los dos extremos del Pacífico costarricense en un mismo día","El golfo de Nicoya, Puntarenas y después la costa abierta del sur")
    road = "Pavimentada casi toda; es viaje largo, de día completo."
    tip = "En traslados así el chofer va rotando las paradas: una a media mañana y otra al almuerzo."
  }
  "MV-PAC" = @{
    intro = "Se baja del bosque nuboso a la Interamericana, se cruza por Caldera y se sigue por la Costanera."
    see = @("La bajada de Monteverde con el golfo de Nicoya de frente","Puntarenas y los barcos","Tárcoles, Jacó y las palmeras de Parrita")
    road = "La bajada de Monteverde es lenta por las curvas; de ahí en adelante es carretera cómoda."
    tip = "Del frío del bosque nuboso al calor de playa hay tres horas: conviene ir vestido por capas."
  }
  "PAC-PAC" = @{
    intro = "Tramos cortos de la Costanera, entre una hora y hora y media según el par."
    see = @("La marina de Los Sueños y los yates de pesca","Las palmeras de Parrita y los puentes de un solo carril de la zona","El puerto de Quepos")
    road = "Plana y pavimentada; el trayecto más fácil de toda la costa."
    tip = "Por lo corto del viaje, muchos lo aprovechan para hacer una parada de almuerzo frente al mar."
  }
  "MV-VC" = @{
    intro = "Interamericana hacia el noroeste y subida por Sardinal y Guacimal hasta Santa Elena."
    see = @("El golfo de Nicoya durante toda la subida","Fincas lecheras y el pueblo de Santa Elena","La entrada a la nube y el cambio de temperatura")
    road = "Pavimento hasta el cruce; la subida es de curvas y se maneja despacio."
    tip = "Es mejor llegar con luz: la subida de noche, con neblina, es incómoda para el pasajero aunque el chofer la conozca."
  }
  "MV-SUR" = @{
    intro = "Bajada a la Interamericana, cruce a la Costanera y todo el litoral hacia el sur."
    see = @("Bosque nuboso en la mañana y playa del sur en la tarde","Tárcoles, Jacó, Quepos y la costa abierta después de Dominical")
    road = "Pavimentada; son entre 5 y 6 horas con las curvas de la bajada incluidas."
    tip = "Salir temprano de Monteverde le gana la neblina de la mañana en la bajada."
  }
  "MV-NIC" = @{
    intro = "Bajada a la Interamericana y entrada a la península por Nicoya; a Santa Teresa, ferry o por tierra según el día."
    see = @("El golfo de Nicoya desde arriba en la bajada","Nicoya y los cerros secos de la península","El contraste entre el bosque nuboso y la costa seca")
    road = "Pavimento en la mayor parte, con los últimos tramos más lentos."
    tip = "Es un traslado de media jornada: se sale con abrigo y se llega en traje de baño."
  }
  "CAR-VC" = @{
    intro = "Por la Ruta 32: se cruza el Parque Nacional Braulio Carrillo por el túnel del Zurquí, se baja a Guápiles y se sigue por Limón hasta Cahuita y Puerto Viejo."
    see = @("El Braulio Carrillo: selva primaria a los dos lados de la carretera","El túnel del Zurquí y las cascadas colgando de la montaña","Bananales y el tren de la fruta por Guápiles y Siquirres","El primer pedazo de mar Caribe pasando Limón","Cahuita y su parque nacional antes de llegar")
    road = "Pavimentada. La montaña puede cerrarse con lluvia o neblina, y es una ruta con bastante tráiler."
    tip = "El Caribe tiene su propio clima: amanece despejado y llueve en la tarde. Salir temprano es la costumbre."
  }
  "ARENAL-SUR" = @{
    intro = "De San Carlos a la montaña del Valle Central, y de ahí a la Costanera hacia el sur."
    see = @("El Arenal en la salida y el mar del sur en la llegada","Tárcoles, Jacó, Parrita y Quepos por el camino")
    road = "Pavimentada de punta a punta; es de los traslados más largos que hacemos."
    tip = "Siempre recomendamos salir de La Fortuna en la mañana, para llegar a Uvita con luz."
  }
  "ARENAL-NIC" = @{
    intro = "Por el lago Arenal y Cañas hacia la península, entrando por Nicoya."
    see = @("El lago Arenal y los molinos de viento","La sabana de Cañas y Nicoya","La bajada a la costa de la península")
    road = "Curvas y algún tramo sin asfaltar en el lago, carretera cómoda en la sabana y tramos lentos al final."
    tip = "Es un traslado que cruza el país entero de este a oeste: siempre recomendamos salir en la mañana y contarlo como día de viaje, no como traslado corto."
  }
  "NIC-NIC" = @{
    intro = "Se sale de vuelta a la carretera principal de la península y se baja por Jicaral y Cóbano. Por la playa no hay atajo: ese camino es más lento y mucho más duro."
    see = @("Pueblos chicos, potreros y monos congo","Playas de la península una tras otra")
    road = "De lastre en buena parte del camino: corto en kilómetros, lento en tiempo."
    tip = "Es corto en kilómetros pero lento en tiempo; mejor no dejarlo para última hora del día."
  }
  "ARENAL-MV" = @{
    intro = "Todo el camino alrededor del lago Arenal hasta Tilarán, y luego la subida por la montaña hasta Santa Elena y Monteverde."
    see = @("El volcán Arenal por atrás durante media hora","El lago Arenal entero, con los molinos de viento en la loma","La entrada al bosque, que se va cerrando y enfriando conforme se sube")
    road = "Pavimento en casi todo el camino — hay tramos sin asfaltar — y de curva en curva: lo que cuesta tiempo son las vueltas, no la distancia."
    tip = "Aquí ofrecemos la parada en <b>Café y Macadamia</b>, a la orilla del lago: comida fresca, muy buena, y una de las mejores vistas del recorrido. Lo mejor es salir entre 8 y 9 de la mañana."
  }
  "ARENAL-ARENAL" = @{
    intro = "A Río Celeste se sube por Bijagua, en la falda del Tenorio. A Sarapiquí se sale por Muelle y Aguas Zarcas."
    see = @("El volcán Tenorio y las fincas de Bijagua, zona de perezosos","Llanuras de piña, caña y ganado","Ríos grandes y bosque de bajura camino a Sarapiquí")
    road = "Pavimentada todo el camino, tanto a Río Celeste como hacia Sarapiquí."
    tip = "Al Río Celeste hay que entrar temprano: si llueve fuerte, el agua pierde el color celeste por unas horas."
  }
  "SUR-SUR" = @{
    intro = "Costanera al sur por Palmar, y entrada a la península de Osa por Chacarita rumbo a Puerto Jiménez."
    see = @("Los humedales de Térraba-Sierpe, el manglar más grande del país","El Golfo Dulce en el último tramo","Selva cada vez más cerrada: es la zona más salvaje de Costa Rica")
    road = "Pavimentada hasta la península, con algo de lastre en la última parte hacia Puerto Jiménez."
    tip = "Por aquí no hay gasolineras ni sodas cada rato: el chofer sale con el tanque lleno y conviene parar antes de Chacarita."
  }
  "CAR-MV" = @{
    intro = "Del bosque nuboso al Valle Central, y de ahí por la Ruta 32 y el Braulio Carrillo hasta el Caribe."
    see = @("Bosque nuboso, valle, selva de montaña y mar Caribe en un solo día","El túnel del Zurquí y los bananales de Guápiles")
    road = "Pavimentada; es de las rutas más largas del país y cruza de océano a océano."
    tip = "Un traslado así se sale temprano en la mañana: son 7 u 8 horas y nadie quiere llegar de noche al Caribe sur."
  }
}
