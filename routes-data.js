/* ============================================================
   Travesía Costa Rica — base de datos de rutas y precios
   ------------------------------------------------------------
   PT_PLACES: lista de destinos (índice = posición en el array)
   PT_ROWS:   [i, j, staria, hiace, maxus, duracion]
              i, j  = índices en PT_PLACES (ruta sin dirección: i<j)
              staria = precio 1-5 pax  (Hyundai Staria)
              hiace  = precio 6-9 pax  (Toyota Hiace)   — null si no hay
              maxus  = precio 10-12 pax (Maxus V90)      — null si no hay
              duracion = tiempo aprox. de viaje (texto)
   Precios en USD, por VEHÍCULO, impuestos incluidos.
   ============================================================ */

const PT_PLACES = ["SJO - Juan Santamaria Int. Airport","LIR - Liberia Int. Airport","La Fortuna (Arenal)","Monteverde (Cloud Forest)","Manuel Antonio / Quepos","Tamarindo (Guanacaste)","Conchal (Guanacaste)","Brasilito (Guanacaste)","Papagayo Peninsula, Guanacaste","Puerto Viejo (Caribbean Coast)","Santa Teresa (Nicoya Peninsula)","Jaco","Playas del Coco (Guanacaste)","Flamingo (Guanacaste)","Playa Hermosa (Guanacaste)","Playa Grande (Guanacaste)","Playa Potrero (Guanacaste)","Playa Avellanas (Guanacaste)","Ocotal (Guanacaste)","Dominical (Beach Town)","Uvita","Ojochal","Esterillos (Este & Oeste Beach)","Herradura (Los Sueños)","Hacienda Pinilla (Guanacaste)","JW Marriott (Guanacaste)","RIU Guanacaste Hotel / RIU Palace Hotel (Guanacaste)","Las Catalinas, Guanacaste","Punta Islita (Hotel & Beach)","Punta Leona (Resort)","Rincon de la Vieja (National Park)","Bajos del Toro (Cloud Forest)","La Paz Waterfall Gardens","La Pavona (Tortuguero)","Los Chiles (Nicaragua Border)","Penas Blancas (Nicaragua Border)","Sarapiqui, Heredia","Malpaís (Nicoya Peninsula)","Montezuma (Nicoya Peninsula)","Nosara (Playa Guiones Area)","Samara / Playa Carrillo (Guanacaste)","Puerto Jimenez (Osa Peninsula)","Rio Celeste","San Gerardo de Dota (Cloud Forest)","San Jose Downtown","Alajuela City","Puntarenas (Caldera)","Sierpe (Osa)","Playa Panama (Guanacaste)","Rio Perdido Thermal Resort (Bagaces)"];

/* Nombre bonito para mostrar (mismo para ES/EN — son nombres de lugares). */
const PT_DISPLAY = {
  "SJO - Juan Santamaria Int. Airport": "San José · Aeropuerto (SJO)",
  "LIR - Liberia Int. Airport": "Liberia · Aeropuerto (LIR)",
  "San Jose Downtown": "San José (centro)",
  "Alajuela City": "Alajuela (ciudad)",
  "La Fortuna (Arenal)": "La Fortuna / Arenal",
  "Monteverde (Cloud Forest)": "Monteverde",
  "Manuel Antonio / Quepos": "Manuel Antonio / Quepos",
  "Tamarindo (Guanacaste)": "Tamarindo",
  "Conchal (Guanacaste)": "Playa Conchal",
  "Brasilito (Guanacaste)": "Brasilito",
  "Papagayo Peninsula, Guanacaste": "Península Papagayo",
  "Puerto Viejo (Caribbean Coast)": "Puerto Viejo (Caribe)",
  "Santa Teresa (Nicoya Peninsula)": "Santa Teresa",
  "Jaco": "Jacó",
  "Playas del Coco (Guanacaste)": "Playas del Coco",
  "Flamingo (Guanacaste)": "Playa Flamingo",
  "Playa Hermosa (Guanacaste)": "Playa Hermosa (Guanacaste)",
  "Playa Grande (Guanacaste)": "Playa Grande",
  "Playa Potrero (Guanacaste)": "Playa Potrero",
  "Playa Avellanas (Guanacaste)": "Playa Avellanas",
  "Ocotal (Guanacaste)": "Playa Ocotal",
  "Dominical (Beach Town)": "Dominical",
  "Uvita": "Uvita",
  "Ojochal": "Ojochal",
  "Esterillos (Este & Oeste Beach)": "Esterillos",
  "Herradura (Los Sueños)": "Herradura / Los Sueños",
  "Hacienda Pinilla (Guanacaste)": "Hacienda Pinilla",
  "JW Marriott (Guanacaste)": "JW Marriott Guanacaste",
  "RIU Guanacaste Hotel / RIU Palace Hotel (Guanacaste)": "RIU Guanacaste / RIU Palace",
  "Las Catalinas, Guanacaste": "Las Catalinas",
  "Punta Islita (Hotel & Beach)": "Punta Islita",
  "Punta Leona (Resort)": "Punta Leona",
  "Rincon de la Vieja (National Park)": "Rincón de la Vieja",
  "Bajos del Toro (Cloud Forest)": "Bajos del Toro",
  "La Paz Waterfall Gardens": "La Paz Waterfall Gardens",
  "La Pavona (Tortuguero)": "Tortuguero (La Pavona)",
  "Los Chiles (Nicaragua Border)": "Los Chiles (frontera Nicaragua)",
  "Penas Blancas (Nicaragua Border)": "Peñas Blancas (frontera Nicaragua)",
  "Sarapiqui, Heredia": "Sarapiquí",
  "Malpaís (Nicoya Peninsula)": "Malpaís",
  "Montezuma (Nicoya Peninsula)": "Montezuma",
  "Nosara (Playa Guiones Area)": "Nosara / Playa Guiones",
  "Samara / Playa Carrillo (Guanacaste)": "Sámara / Playa Carrillo",
  "Puerto Jimenez (Osa Peninsula)": "Puerto Jiménez (Osa)",
  "Rio Celeste": "Río Celeste",
  "San Gerardo de Dota (Cloud Forest)": "San Gerardo de Dota",
  "Puntarenas (Caldera)": "Puntarenas / Caldera",
  "Sierpe (Osa)": "Sierpe (Osa)",
  "Playa Panama (Guanacaste)": "Playa Panamá",
  "Rio Perdido Thermal Resort (Bagaces)": "Río Perdido (Bagaces)",
};

/* Slugs de destinos con página de ruta SEO (index -> slug en /shuttle/) */
const PT_SLUG = {
  0: "san-jose-airport", 1: "liberia-airport", 2: "la-fortuna", 3: "monteverde",
  4: "manuel-antonio", 5: "tamarindo", 6: "playa-conchal", 7: "brasilito", 8: "papagayo",
  9: "puerto-viejo", 10: "santa-teresa", 11: "jaco", 12: "playas-del-coco",
  13: "playa-flamingo", 14: "playa-hermosa", 19: "dominical", 20: "uvita",
  23: "los-suenos", 30: "rincon-de-la-vieja", 32: "la-paz-waterfall-gardens",
  36: "sarapiqui", 39: "nosara", 40: "samara", 42: "rio-celeste",
  44: "san-jose-city", 45: "alajuela",
};

/* [i, j, staria, hiace, maxus, duracion] — 633 rutas */
const PT_ROWS = [[0,8,340,385,470,"5h"],[0,28,330,375,460,"5h"],[0,1,305,null,435,"4h"],[0,26,345,390,null,"5h"],[0,33,240,285,null,"4h"],[0,34,310,355,null,"4h 30min"],[0,35,320,365,null,"6h"],[0,36,170,215,null,"2h 30min"],[0,17,345,null,475,"5h 30min"],[0,27,350,395,480,"4h 30min"],[0,5,345,390,null,"5h"],[0,9,320,365,450,"4h 30min"],[0,7,345,390,null,"5h"],[0,30,350,null,null,"4h"],[0,16,345,390,475,"5h"],[0,15,345,390,null,"5h"],[0,11,175,null,245,"1h 30min"],[0,24,345,null,null,"5h 30min"],[0,13,345,null,null,"5h"],[0,18,340,null,null,"5h"],[0,25,345,390,null,"5h 30min"],[0,29,180,225,310,"2h"],[0,31,165,null,null,"2h"],[0,4,220,null,360,"3h"],[0,20,335,380,null,"4h"],[0,37,375,420,505,"6h"],[0,21,365,null,null,"4h 30min"],[0,22,195,240,325,"2h"],[0,38,375,420,null,"6h"],[0,12,340,null,null,"5h"],[0,2,220,275,360,"3h"],[0,3,220,265,350,"3h"],[0,6,345,390,475,"5h"],[0,32,130,175,260,"2h"],[0,44,80,140,180,"30h"],[0,10,375,420,505,"6h"],[0,39,370,415,500,"5h"],[0,40,355,400,485,"4h 30min"],[0,46,155,175,235,"1h"],[0,41,535,580,665,"6h"],[0,43,220,265,350,"3h 30min"],[0,19,305,350,435,"3h 30min"],[0,42,240,285,null,"4h"],[0,23,180,195,250,"1h 30min"],[1,2,225,280,null,"3h"],[0,47,350,370,430,"5h"],[1,4,375,420,505,"5h"],[1,7,135,175,230,"1h 30min"],[0,14,340,385,470,"5h"],[1,11,300,null,null,"3h 30min"],[1,6,135,175,null,"1h 30min"],[1,10,350,null,480,"5h"],[1,3,230,275,360,"3h"],[1,12,110,140,195,"45min"],[1,5,135,175,230,"1h 30min"],[1,14,110,null,195,"45min"],[1,8,110,null,180,"45min"],[1,13,135,175,230,"1h 30min"],[1,21,405,null,535,"6h"],[1,24,140,175,230,"2h"],[1,15,135,150,200,"1h 30min"],[1,16,135,175,230,"1h 30min"],[1,22,310,355,440,"4h"],[1,19,375,420,505,"6h"],[1,20,390,435,520,"6h"],[1,26,125,140,195,"45min"],[1,23,300,345,430,"3h 30min"],[1,18,125,140,195,"45min"],[1,28,270,315,null,"3h"],[1,17,145,175,230,"2h"],[1,27,135,175,230,"1h 30min"],[1,40,215,null,345,"2h"],[1,39,240,285,null,"2h 30min"],[1,30,125,140,195,"1h"],[1,37,350,395,480,"5h"],[1,42,190,null,320,"2h 30min"],[1,38,350,395,480,"5h"],[1,25,140,null,270,"2h"],[1,49,155,175,235,"1h"],[2,3,255,300,385,"4h"],[2,4,330,375,460,"5h 30min"],[1,45,305,350,435,"3h 30min"],[2,8,285,330,415,"4h 30min"],[2,7,315,360,445,"4h 30min"],[2,9,390,435,520,"6h"],[1,44,325,370,455,"4h"],[2,5,315,360,445,"4h 30min"],[1,48,110,140,195,"45min"],[2,6,315,360,445,"4h 30min"],[2,10,400,445,530,"5h 30min"],[2,11,260,305,390,"3h 30min"],[2,15,315,360,445,"4h 30min"],[2,33,270,315,400,"4h 30min"],[2,30,280,325,410,"3h 30min"],[2,23,260,305,390,"2h 30min"],[2,35,330,375,460,"4h 30min"],[2,22,305,350,435,"4h"],[2,29,260,305,390,"3h"],[2,14,280,325,410,"4h 30min"],[2,21,430,475,560,"5h 30min"],[2,38,400,null,null,"5h 30min"],[2,20,415,460,545,"6h"],[2,36,180,225,310,"2h 30min"],[2,24,315,360,445,"5h"],[2,17,315,360,445,"5h"],[2,37,400,445,530,"5h 30min"],[2,16,315,360,445,"4h 30min"],[2,40,370,415,500,"4h 30min"],[2,25,315,360,445,"5h"],[2,27,315,360,null,"4h 30min"],[2,26,280,325,410,"4h"],[2,32,215,260,345,"2h 30min"],[2,12,280,325,410,"4h 30min"],[2,28,370,415,500,"5h 30min"],[2,31,195,240,325,"3h 30min"],[2,18,280,325,410,"4h 30min"],[2,13,315,360,445,"4h 30min"],[2,39,390,435,520,"5h 30min"],[2,34,240,285,370,"2h"],[2,19,400,445,530,"5h 30min"],[2,41,570,615,700,"8h"],[3,4,310,null,440,"4h"],[3,5,270,315,400,"4h"],[2,42,185,230,315,"2h"],[2,44,250,295,380,"3h"],[3,8,275,320,405,"4h"],[3,6,270,315,400,"4h"],[2,47,510,530,590,"6h"],[2,49,220,null,300,"3h"],[3,10,400,445,530,"5h 30min"],[3,13,270,315,400,"4h"],[3,7,270,null,400,"4h"],[3,11,240,285,370,"3h"],[2,46,205,225,285,"3h"],[3,17,270,315,400,"4h"],[3,14,270,315,400,"4h"],[3,9,480,525,610,"7h 30min"],[3,12,270,null,400,"4h"],[3,16,270,315,400,"4h"],[3,18,270,315,400,"4h"],[3,19,340,385,470,"5h"],[3,24,270,315,400,"4h"],[3,15,270,315,400,"4h"],[3,21,370,415,500,"5h"],[3,23,235,280,365,"3h"],[3,22,235,280,365,"5h"],[3,20,355,400,485,"5h"],[2,45,220,265,350,"3h"],[3,25,270,315,400,"4h"],[3,27,270,315,400,"4h"],[3,28,305,350,435,"4h"],[3,29,215,260,345,"2h"],[3,30,270,315,400,"3h"],[3,38,400,445,530,"5h 30min"],[3,39,305,350,435,"4h"],[3,26,270,315,400,"4h"],[3,41,520,565,650,"6h 30min"],[3,37,400,445,530,"5h 30min"],[3,40,280,325,410,"4h"],[3,42,235,280,365,"3h 30min"],[4,5,410,455,540,"5h 30min"],[3,44,240,285,370,"3h"],[3,45,235,280,365,"3h"],[4,7,410,455,540,"5h 30min"],[4,10,470,515,600,"6h 30min"],[3,49,230,250,310,"3h"],[4,6,410,455,540,"5h 30min"],[4,11,175,230,295,"1h 30min"],[4,8,420,465,550,"5h 30min"],[4,13,410,455,540,"5h 30min"],[4,12,420,null,550,"6h 30min"],[4,14,420,465,550,"6h 30min"],[4,20,180,195,250,"1h 30min"],[4,21,205,250,335,"2h"],[4,18,420,465,550,"6h 30min"],[4,28,395,440,525,"5h 30min"],[4,24,410,455,540,"6h 30min"],[4,25,405,450,535,"6h 30min"],[4,30,420,465,550,"5h 30min"],[4,16,410,455,540,"5h 30min"],[4,19,160,205,290,"1h"],[4,26,420,465,550,"5h 30min"],[4,27,410,455,540,"6h 30min"],[4,15,410,455,540,"5h 30min"],[4,17,410,455,540,"6h 30min"],[4,37,470,515,600,"6h 30min"],[4,38,470,515,600,"6h 30min"],[4,40,405,450,535,"5h 30min"],[4,42,360,405,490,"5h 30min"],[4,45,235,280,365,"3h"],[4,39,405,450,535,"5h 30min"],[4,46,250,270,330,"1h"],[4,44,250,295,380,"3h"],[5,8,145,160,215,"55h"],[4,47,220,240,300,"3h"],[5,10,365,410,495,"4h 30min"],[5,11,325,370,455,"4h"],[5,17,125,140,195,"40h"],[5,12,130,145,200,"45h"],[5,14,130,145,200,"45h"],[5,19,455,500,585,"6h"],[5,20,470,null,null,"6h 30min"],[5,18,130,145,200,"45h"],[5,22,410,455,540,"6h"],[5,23,325,370,455,"4h"],[5,25,125,140,195,"40h"],[5,21,455,500,585,"6h"],[5,30,225,270,355,"2h 30min"],[5,28,305,350,435,"2h 30min"],[5,29,315,360,445,"4h"],[5,26,130,145,200,"45h"],[5,24,125,140,195,"40h"],[5,35,240,285,370,"3h"],[5,38,365,410,495,"4h 30min"],[5,37,365,410,495,"4h 30min"],[5,40,220,265,350,"3h"],[5,42,275,320,405,"3h"],[5,39,235,280,365,"2h"],[5,44,365,410,495,"5h"],[6,10,365,410,495,"4h 30min"],[6,8,145,160,215,"55h"],[6,11,325,370,455,"4h"],[6,12,130,145,200,"45h"],[5,49,220,240,300,"2h"],[5,45,345,390,475,"5h"],[6,14,130,145,200,"45h"],[6,18,130,145,200,"45h"],[6,26,130,145,200,"45h"],[6,25,125,140,195,"40h"],[6,23,325,null,455,"4h"],[6,17,125,140,195,"40h"],[6,28,305,350,435,"2h 30min"],[6,19,455,500,585,"6h"],[6,20,470,515,600,"6h 30min"],[6,30,225,270,355,"2h 30min"],[6,29,315,360,445,"4h"],[6,21,455,500,585,"6h"],[6,24,125,140,195,"40h"],[6,22,410,455,540,"6h"],[6,39,235,280,365,"2h"],[6,38,365,410,495,"4h 30min"],[6,40,220,265,350,"3h"],[6,37,365,410,495,"4h 30min"],[6,42,275,320,405,"3h"],[6,45,345,390,475,"5h"],[6,44,365,410,495,"5h"],[6,35,240,285,370,"3h"],[7,8,145,160,215,"55h"],[7,29,315,360,445,"4h"],[7,23,325,370,455,"4h"],[7,21,455,500,585,"6h"],[7,18,130,145,200,"45h"],[6,49,220,240,300,"2h"],[7,19,455,500,585,"6h"],[7,20,470,515,600,"6h 30min"],[7,26,130,145,200,"45h"],[7,25,125,140,195,"40h"],[7,30,225,270,355,"2h 30min"],[7,10,365,410,495,"4h 30min"],[7,28,305,350,435,"2h 30min"],[7,17,125,140,195,"40h"],[7,22,410,455,540,"6h"],[7,12,130,145,200,"45h"],[7,24,125,140,195,"40h"],[7,11,325,370,455,"4h"],[7,14,130,145,200,"45h"],[7,37,365,410,495,"4h 30min"],[7,44,365,410,495,"5h"],[7,40,220,265,350,"3h"],[7,45,345,390,475,"5h"],[8,12,120,135,190,"30h"],[8,10,395,440,525,"4h 30min"],[7,39,235,280,365,"2h"],[7,38,365,null,495,"4h 30min"],[8,13,145,160,215,"55h"],[7,42,275,320,405,"3h"],[8,11,335,380,465,"4h"],[8,15,145,160,215,"55h"],[8,14,120,135,190,"30h"],[8,21,455,500,585,"6h"],[7,35,240,285,370,"3h"],[8,18,120,135,190,"30h"],[8,20,470,515,600,"6h 30min"],[8,19,455,500,585,"6h"],[8,16,145,160,215,"55h"],[8,17,155,170,225,"1h 9min"],[8,22,410,455,540,"6h"],[8,23,335,380,465,"4h"],[8,25,155,170,225,"1h 9min"],[8,27,145,160,215,"55h"],[8,30,260,305,390,"2h 30min"],[8,29,315,360,445,"4h"],[8,35,240,285,370,"3h"],[8,39,280,325,410,"2h"],[8,38,395,440,525,"4h 30min"],[8,42,245,290,375,"3h"],[8,40,265,310,395,"3h"],[8,49,205,225,285,"2h"],[8,37,395,440,525,"4h 30min"],[8,24,155,170,225,"1h 9min"],[8,28,315,null,445,"2h 30min"],[8,26,120,135,190,"30h"],[8,44,360,405,null,"5h"],[8,45,340,385,null,"5h"],[9,33,545,null,675,"4h 30min"],[10,16,365,410,495,"4h 30min"],[10,14,395,440,null,"4h 30min"],[10,12,395,440,null,"4h 30min"],[9,44,340,385,470,"4h 30min"],[10,25,365,410,495,"4h 30min"],[10,27,365,410,495,"4h 30min"],[10,17,365,410,495,"4h 30min"],[10,15,365,410,495,"4h 30min"],[9,45,310,355,440,"4h 30min"],[10,24,365,410,495,"4h 30min"],[10,13,365,410,495,"4h 30min"],[10,18,395,440,525,"4h 30min"],[10,26,395,440,525,"4h 30min"],[10,28,355,400,485,"5h"],[10,39,375,420,505,"5h"],[10,40,355,400,485,"5h"],[10,44,395,440,525,"6h"],[11,12,335,380,465,"4h"],[11,13,325,370,455,"4h"],[11,15,325,370,455,"4h"],[11,17,325,370,455,"4h"],[11,16,325,370,455,"4h"],[10,45,375,420,null,"6h"],[11,14,335,380,465,"4h"],[11,20,240,285,370,"3h"],[11,19,220,265,350,"2h 30min"],[11,21,260,305,390,"3h 30min"],[11,18,335,380,465,"4h"],[11,26,335,380,465,"4h"],[11,25,325,370,455,"4h"],[11,27,325,370,455,"4h"],[11,28,350,395,480,"4h"],[11,30,335,380,465,"4h"],[11,24,325,370,455,"4h"],[11,39,350,395,480,"4h 30min"],[11,47,310,null,390,"4h"],[11,44,195,210,265,"1h 30min"],[11,42,320,365,450,"3h 30min"],[11,45,165,180,235,"1h 30min"],[11,40,350,395,null,"4h"],[12,15,130,145,200,"45h"],[12,17,150,165,220,"1h"],[12,22,410,455,540,"6h"],[12,19,455,500,585,"6h"],[12,24,150,165,null,"1h"],[12,20,470,515,600,"6h"],[12,23,335,380,465,"4h"],[12,16,130,145,200,"45h"],[12,27,130,145,200,"45h"],[12,13,130,145,200,"45h"],[12,25,150,null,220,"1h"],[12,30,260,305,390,"3h"],[12,21,455,500,585,"6h"],[12,29,315,360,445,"4h"],[12,35,240,285,370,"3h"],[12,28,315,360,445,"2h 30min"],[12,38,395,440,525,"4h 30min"],[12,39,270,315,400,"2h"],[12,40,255,300,385,"3h"],[12,37,395,440,525,"4h 30min"],[12,42,305,350,435,"3h 30min"],[12,45,340,null,470,"5h"],[12,49,205,null,285,"2h"],[13,14,130,145,null,"45h"],[13,17,125,140,195,"40h"],[13,18,130,145,200,"45h"],[13,19,455,500,585,"6h"],[13,20,470,515,600,"6h 30min"],[13,21,455,500,585,"6h"],[13,23,325,370,455,"4h"],[12,44,360,405,null,"5h"],[13,26,130,145,200,"45h"],[13,29,315,360,445,"4h"],[13,28,305,null,435,"2h 30min"],[13,25,125,null,195,"40h"],[13,30,225,270,355,"2h 30min"],[13,24,125,140,195,"40h"],[13,22,410,455,540,"6h"],[13,38,365,410,495,"4h 30min"],[13,37,365,410,495,"4h 30min"],[13,39,235,280,365,"2h"],[13,42,275,320,405,"3h"],[13,35,240,285,370,"3h"],[13,45,345,390,475,"5h"],[13,44,365,null,495,"5h"],[14,15,130,null,null,"45h"],[13,40,220,265,null,"3h"],[13,49,220,240,null,"2h"],[14,17,150,165,null,"1h"],[14,16,130,145,200,"45h"],[14,20,470,515,600,"6h"],[14,22,410,455,540,"6h"],[14,24,150,165,220,"1h"],[14,19,455,500,585,"6h"],[14,21,455,500,585,"6h"],[14,23,335,380,465,"4h"],[14,27,130,145,200,"45h"],[14,25,150,165,220,"1h"],[14,29,315,360,445,"4h"],[14,28,315,360,445,"2h 30min"],[14,39,270,null,400,"2h"],[14,40,255,300,null,"3h"],[14,30,260,null,null,"3h"],[14,37,395,440,525,"4h 30min"],[14,35,240,285,370,"3h"],[14,42,305,350,435,"3h 30min"],[14,38,395,440,null,"4h 30min"],[14,44,360,null,null,"5h"],[14,45,340,385,null,"5h"],[14,49,205,225,285,"2h"],[15,19,455,500,585,"6h"],[15,18,130,145,null,"45h"],[15,17,125,140,195,"40h"],[15,21,455,500,585,"6h"],[15,20,470,515,null,"6h 30min"],[15,22,410,null,null,"6h"],[15,23,325,370,455,"4h"],[15,24,125,null,195,"40h"],[15,25,125,140,195,"40h"],[15,29,315,360,null,"4h"],[15,28,305,null,435,"2h 30min"],[15,26,130,null,null,"45h"],[15,30,225,270,355,"2h 30min"],[15,38,365,410,495,"4h 30min"],[15,35,240,285,370,"3h"],[15,37,365,410,495,"4h 30min"],[15,40,220,265,null,"3h"],[15,45,345,null,475,"5h"],[15,44,365,null,495,"5h"],[15,39,235,280,365,"2h"],[15,42,275,320,405,"3h"],[16,18,130,145,200,"45h"],[16,19,455,500,585,"6h"],[16,17,125,140,195,"40h"],[16,20,470,515,600,"6h 30min"],[16,21,455,null,585,"6h"],[16,22,410,455,540,"6h"],[16,28,305,350,435,"2h 30min"],[16,29,315,360,null,"4h"],[16,25,125,140,null,"40h"],[16,23,325,370,null,"4h"],[16,39,235,280,365,"2h"],[16,42,275,320,405,"3h"],[16,35,240,285,370,"3h"],[16,24,125,140,195,"40h"],[16,30,225,270,null,"2h 30min"],[16,38,365,410,null,"4h 30min"],[16,44,365,null,495,"5h"],[16,45,345,390,475,"5h"],[16,37,365,410,495,"4h 30min"],[16,26,130,145,200,"45h"],[16,40,220,265,350,"3h"],[17,19,455,500,585,"6h"],[17,18,150,165,220,"1h"],[17,20,470,515,600,"6h 30min"],[17,21,455,500,585,"6h"],[17,30,260,305,390,"3h"],[17,28,315,360,445,"2h 30min"],[17,22,410,455,null,"6h"],[17,37,365,410,495,"4h 30min"],[17,45,345,390,475,"5h 30min"],[17,29,315,360,null,"4h"],[17,26,150,165,null,"1h"],[17,44,365,410,495,"5h 30min"],[17,42,275,null,405,"3h 30min"],[17,27,125,140,195,"40h"],[17,39,235,null,365,"2h"],[17,23,325,null,455,"4h"],[17,38,365,410,null,"4h 30min"],[18,24,150,165,220,"1h"],[18,21,455,null,null,"6h"],[18,27,130,145,200,"45h"],[18,25,150,null,220,"1h"],[18,28,315,360,null,"2h 30min"],[18,19,455,null,null,"6h"],[18,22,410,455,null,"6h"],[18,23,335,null,465,"4h"],[18,20,470,null,null,"6h"],[18,29,315,null,null,"4h"],[18,30,260,null,390,"3h"],[18,35,240,null,null,"3h"],[18,39,270,null,null,"2h"],[18,44,360,405,null,"5h"],[18,37,395,440,null,"4h 30min"],[18,40,255,300,385,"3h"],[18,45,340,385,470,"5h"],[18,42,305,350,435,"3h 30min"],[19,28,420,465,null,"7h 30min"],[19,26,455,null,585,"6h"],[19,27,455,500,585,"6h"],[19,25,455,500,585,"6h"],[18,38,395,null,525,"4h 30min"],[19,24,455,null,585,"6h"],[19,40,430,null,560,"7h 30min"],[19,39,430,null,560,"7h 30min"],[19,45,320,365,null,"3h 30min"],[19,44,325,370,null,"3h 30min"],[20,24,470,515,600,"6h 30min"],[20,27,470,515,600,"6h 30min"],[20,25,470,515,600,"6h 30min"],[20,26,470,515,600,"6h 30min"],[20,28,610,null,740,"7h 30min"],[20,39,610,655,740,"7h 30min"],[20,40,610,null,null,"7h 30min"],[20,45,335,null,null,"4h"],[20,44,355,null,485,"4h"],[20,47,150,170,230,"2h"],[21,24,455,500,null,"6h"],[21,27,455,null,null,"6h"],[21,28,610,655,740,"7h 30min"],[21,25,455,null,585,"6h"],[21,40,610,null,740,"7h 30min"],[21,39,610,655,740,"7h 30min"],[21,44,385,430,515,"3h 30min"],[21,45,365,410,495,"3h 30min"],[22,27,410,455,540,"6h"],[22,25,410,455,540,"6h"],[22,24,410,455,540,"6h"],[22,28,365,410,495,"7h 30min"],[22,44,215,260,345,"3h 30min"],[22,45,195,null,325,"3h 30min"],[22,26,410,455,540,"6h"],[22,40,375,420,505,"7h 30min"],[23,24,325,null,null,"4h"],[23,27,325,370,455,"4h"],[23,28,350,395,null,"4h"],[23,26,335,380,465,"4h"],[23,25,325,null,455,"4h"],[22,39,375,420,null,"7h 30min"],[24,30,260,305,390,"3h"],[24,26,150,null,null,"1h"],[24,28,315,360,null,"2h 30min"],[24,27,125,null,195,"40h"],[23,39,350,null,null,"4h"],[23,45,180,195,250,"1h 30min"],[24,29,315,360,445,"4h"],[24,35,270,315,null,"3h"],[23,40,350,null,480,"4h"],[24,37,365,410,495,"4h 30min"],[23,44,200,null,270,"1h 30min"],[24,39,235,250,null,"1h 30min"],[24,40,220,265,350,"2h 30min"],[24,38,365,410,495,"4h 30min"],[24,44,365,410,495,"5h 30min"],[25,26,150,165,null,"1h"],[25,29,315,360,445,"4h"],[25,27,125,140,195,"40h"],[25,38,365,null,null,"4h 30min"],[25,30,260,305,390,"3h"],[25,35,270,315,400,"3h"],[25,28,315,360,445,"2h 30min"],[25,37,365,null,null,"4h 30min"],[24,45,345,390,null,"5h 30min"],[25,40,220,null,null,"2h 30min"],[24,49,230,250,310,"2h"],[25,39,235,null,null,"1h 30min"],[24,42,275,320,null,"3h 30min"],[25,42,305,350,435,"3h 30min"],[25,45,345,390,null,"5h 30min"],[26,28,280,null,null,"3h"],[26,29,315,null,null,"4h"],[26,27,130,null,null,"45h"],[26,45,345,null,475,"5h"],[26,42,235,null,null,"3h 30min"],[26,44,365,null,null,"5h"],[26,38,395,null,525,"4h 30min"],[26,40,255,null,385,"2h"],[26,39,270,315,null,"2h"],[26,37,395,null,null,"4h 30min"],[26,35,240,285,370,"3h"],[27,28,305,350,435,"2h 30min"],[27,30,255,300,385,"2h 30min"],[27,29,315,360,null,"4h"],[27,35,240,285,370,"3h"],[27,42,275,320,405,"2h 30min"],[27,45,350,395,480,"4h 30min"],[27,38,365,410,495,"4h 30min"],[27,40,235,280,365,"2h"],[27,39,250,295,null,"2h 30min"],[27,49,220,null,null,"2h"],[27,44,370,null,null,"4h 30min"],[27,37,365,410,null,"4h 30min"],[28,29,350,null,null,"4h"],[28,30,285,330,null,"3h"],[28,35,240,null,null,"3h"],[28,37,355,null,null,"5h"],[29,45,180,225,null,"2h"],[28,44,350,null,480,"5h"],[29,39,375,null,null,"4h 30min"],[28,42,345,390,null,"3h 30min"],[29,40,350,395,null,"4h"],[30,40,285,null,415,"3h"],[30,39,325,370,455,"3h 30min"],[30,45,350,null,null,"4h"],[30,44,370,null,null,"4h"],[31,44,185,230,null,"2h"],[31,45,165,null,null,"2h"],[32,44,150,null,null,"2h"],[32,45,130,175,null,"2h"],[33,44,260,305,390,"4h"],[33,45,240,285,370,"4h"],[34,44,330,375,460,"4h 30min"],[34,45,310,355,440,"4h 30min"],[35,39,240,285,370,"3h"],[35,40,240,285,370,"3h"],[35,44,340,385,470,"6h"],[35,45,320,365,450,"6h"],[36,44,190,null,null,"2h 30min"],[37,40,355,null,null,"5h"],[37,39,375,null,null,"5h"],[37,44,395,440,null,"6h"],[36,45,170,null,null,"2h 30min"],[37,45,375,null,null,"6h"],[38,39,375,null,505,"5h"],[38,40,355,null,null,"5h"],[38,45,375,420,null,"6h"],[38,44,395,null,null,"6h"],[39,44,390,null,null,"5h"],[40,45,355,null,485,"4h 30min"],[41,44,555,null,null,"6h"],[41,45,535,580,null,"6h"],[41,47,280,null,null,"3h"],[42,44,260,305,390,"4h"],[43,44,240,285,null,"3h 30min"],[42,45,240,null,null,"4h"],[43,45,220,265,350,"3h 30min"],[44,47,360,380,440,"5h"],[48,49,205,225,285,"2h"]];

/* ============================================================
   HOTELES POPULARES -> zona/destino (índice en PT_PLACES)
   El cliente escribe el hotel y se resuelve al precio de su zona.
   Lista inicial de hoteles conocidos; ampliar con los que más piden.
   ============================================================ */
const PT_HOTELS = [
  // La Fortuna / Arenal (2)
  { name: "Tabacón Thermal Resort", place: 2 },
  { name: "Nayara Springs / Nayara Gardens", place: 2 },
  { name: "Nayara Tented Camp", place: 2 },
  { name: "The Springs Resort & Spa", place: 2 },
  { name: "Arenal Springs Resort", place: 2 },
  { name: "Hotel Arenal Kioro", place: 2 },
  { name: "Baldí Hot Springs", place: 2 },
  { name: "Volcano Lodge & Springs", place: 2 },
  { name: "Arenal Manoa", place: 2 },
  { name: "Los Lagos Hotel", place: 2 },
  { name: "The Royal Corin Thermal Water Spa & Resort", place: 2 },
  { name: "Arenal Observatory Lodge & Trails", place: 2 },
  { name: "Lost Iguana Resort & Spa", place: 2 },
  { name: "Arenal Paraiso Resort & Spa", place: 2 },
  { name: "Hotel El Silencio del Campo", place: 2 },
  { name: "Rancho Margot", place: 2 },
  // Monteverde (3)
  { name: "Hotel Belmar", place: 3 },
  { name: "Monteverde Lodge & Gardens", place: 3 },
  { name: "El Establo Mountain Hotel", place: 3 },
  { name: "Senda Monteverde", place: 3 },
  { name: "Hotel Fonda Vela", place: 3 },
  { name: "Trapp Family Lodge", place: 3 },
  { name: "Hotel Poco a Poco", place: 3 },
  // Manuel Antonio / Quepos (4)
  { name: "Si Como No Resort", place: 4 },
  { name: "Tulemar Resort", place: 4 },
  { name: "Parador Resort & Spa", place: 4 },
  { name: "Arenas del Mar", place: 4 },
  { name: "Hotel Costa Verde", place: 4 },
  { name: "Gaia Hotel & Reserve", place: 4 },
  { name: "Makanda by the Sea", place: 4 },
  { name: "Hotel La Mariposa", place: 4 },
  { name: "Shana by the Beach", place: 4 },
  { name: "Karahe Beach Hotel", place: 4 },
  // Tamarindo (5)
  { name: "Tamarindo Diriá", place: 5 },
  { name: "Wyndham Tamarindo", place: 5 },
  { name: "Hotel Capitán Suizo", place: 5 },
  { name: "Cala Luna Boutique Hotel", place: 5 },
  { name: "Jardín del Edén Boutique Hotel", place: 5 },
  { name: "The Coast Beachfront Hotel", place: 5 },
  // Papagayo (8)
  { name: "Four Seasons Papagayo", place: 8 },
  { name: "Andaz Peninsula Papagayo", place: 8 },
  { name: "Planet Hollywood Costa Rica", place: 8 },
  { name: "El Mangroove", place: 8 },
  { name: "Secrets Papagayo", place: 8 },
  // Conchal (6)
  { name: "Westin Reserva Conchal", place: 6 },
  { name: "W Costa Rica (Reserva Conchal)", place: 6 },
  // Flamingo (13)
  { name: "Margaritaville Beach Resort", place: 13 },
  { name: "Flamingo Beach Resort", place: 13 },
  { name: "Flamingo Marina Resort", place: 13 },
  // Nosara (39)
  { name: "The Harmony Hotel", place: 39 },
  { name: "Bodhi Tree Yoga Resort", place: 39 },
  { name: "Lagarta Lodge", place: 39 },
  // Santa Teresa (10)
  { name: "Hotel Nantipa", place: 10 },
  { name: "Florblanca Resort", place: 10 },
  { name: "Hotel Casa Chameleon", place: 10 },
  { name: "Pranamar Villas & Yoga Retreat", place: 10 },
  { name: "Tropico Latino", place: 10 },
  // Herradura / Los Sueños (23)
  { name: "Los Sueños Marriott", place: 23 },
  // Puerto Viejo (9)
  { name: "Le Caméléon Boutique Hotel", place: 9 },
  { name: "Hotel Banana Azul", place: 9 },
  { name: "Cariblue Beach & Jungle Resort", place: 9 },
  { name: "Tree House Lodge", place: 9 },
  // Uvita (20)
  { name: "Kurà Design Villas", place: 20 },
  { name: "Cristal Ballena Boutique Hotel & Spa", place: 20 },
  { name: "Rancho Pacifico", place: 20 },
  // Jaco (11)
  { name: "Croc's Resort & Casino", place: 11 },
  { name: "Best Western Jaco Beach Resort", place: 11 },
  { name: "Club del Mar Oceanfront Resort", place: 11 },
  { name: "DoceLunas Hotel", place: 11 },
  // Playas del Coco (12)
  { name: "Café de Playa Beachfront Hotel", place: 12 },
  { name: "Bahia Pez Vela", place: 12 },
  // Playa Hermosa, Guanacaste (14)
  { name: "Hotel Bosque del Mar", place: 14 },
  { name: "Villas Sol Beach Resort", place: 14 },
  { name: "Condovac La Costa", place: 14 },
  // Playa Potrero (16)
  { name: "Bahía del Sol Beachfront Boutique Hotel", place: 16 },
  // Ocotal (18)
  { name: "Ocotal Beach Resort", place: 18 },
  // Dominical (19)
  { name: "Hacienda Barú", place: 19 },
  // Montezuma (38)
  { name: "Ylang Ylang Beach Resort", place: 38 },
  { name: "Hotel Amor de Mar", place: 38 },
  // Samara (40)
  { name: "Villas Playa Samara", place: 40 },
  // Puerto Jimenez / Osa (41)
  { name: "Lapa Rios Lodge", place: 41 },
  { name: "Crocodile Bay Resort", place: 41 },
  // Rincon de la Vieja (30)
  { name: "Hacienda Guachipelín", place: 30 },
  { name: "Borinquen Thermal Resort", place: 30 },
  { name: "Blue River Resort & Hot Springs", place: 30 },
  // Rio Celeste (42)
  { name: "Celeste Mountain Lodge", place: 42 },
  { name: "Rio Celeste Hideaway", place: 42 },
  // Liberia / LIR (1)
  { name: "Hilton Garden Inn Liberia Airport", place: 1 },
  { name: "Hampton by Hilton Guanacaste Airport", place: 1 },
  // San José Aeropuerto / SJO (0)
  { name: "Hampton by Hilton San José Airport", place: 0 },
  { name: "Courtyard by Marriott San José Airport", place: 0 },
  // San José centro (44)
  { name: "Gran Hotel Costa Rica", place: 44 },
  { name: "Hotel Grano de Oro", place: 44 },
  { name: "Hotel Presidente", place: 44 },
  { name: "Barceló San José", place: 44 },
  // Alajuela / cerca aeropuerto (45)
  { name: "Xandari Resort & Spa", place: 45 },
  { name: "Costa Rica Marriott Hotel Hacienda Belén", place: 45 },
];

/* Exportar datos para el servidor (Node/Vercel). En el navegador, "module" no existe y se ignora. */
if (typeof module !== "undefined" && module.exports) {
  module.exports = { PT_PLACES: PT_PLACES, PT_ROWS: PT_ROWS };
}
