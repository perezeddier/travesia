#!/bin/bash
# Auditoria tecnica del sitio: enlaces, indexabilidad y datos estructurados.
# Correr desde la raiz del proyecto:  bash tools/audit-sitio.sh
cd "$(dirname "$0")/.." || exit 1
T=$(mktemp -d)

# --- lista de paginas publicas (sin /gastos, sin tools, sin plantillas) ---
find . -name '*.html' -not -path './gastos/*' -not -path './tools/*' -not -path './node_modules/*' \
  | sed 's|^\./||' | sort > "$T/files.txt"

# --- URLs validas que puede servir Vercel (cleanUrls) ---
sed 's|\.html$||; s|/index$||' "$T/files.txt" | sed 's|^index$||' | sed 's|^|/|' | sed 's|^//|/|' | sort -u > "$T/valid.txt"
echo "/" >> "$T/valid.txt"
sort -u "$T/valid.txt" -o "$T/valid.txt"

# --- todos los enlaces internos, con su origen ---
xargs -a "$T/files.txt" grep -ohE 'href="/[^"#?]*"|href='"'"'/[^'"'"'#?]*'"'"'' 2>/dev/null \
  | sed -E 's/href=["'"'"']//; s/["'"'"']$//' \
  | grep -vE '^/(assets|api)/' | grep -vE '\.(css|js|xml|txt|svg|png|jpg|jpeg|webp|ico|json)$' \
  | sed 's|/$||' | sed 's|^$|/|' | sort > "$T/links_all.txt"
sort -u "$T/links_all.txt" > "$T/links.txt"

echo "================ TRAVESIA - AUDITORIA TECNICA ================"
echo "Paginas publicas:      $(wc -l < "$T/files.txt")"
echo "URLs en el sitemap:    $(grep -c '<url>' sitemap.xml)"
echo "Enlaces internos:      $(wc -l < "$T/links_all.txt") ($(wc -l < "$T/links.txt") destinos distintos)"
echo

echo "--- 1. ENLACES INTERNOS ROTOS ---"
comm -23 "$T/links.txt" "$T/valid.txt" > "$T/rotos.txt"
if [ -s "$T/rotos.txt" ]; then cat "$T/rotos.txt"; else echo "  ninguno"; fi
echo

echo "--- 2. PAGINAS HUERFANAS (sin un solo enlace entrante) ---"
awk '{c[$0]++} END{for(k in c) print k}' "$T/links_all.txt" | sort -u > "$T/con_entrada.txt"
comm -23 "$T/valid.txt" "$T/con_entrada.txt" > "$T/huerfanas.txt"
n=$(wc -l < "$T/huerfanas.txt"); echo "  total: $n"; head -20 "$T/huerfanas.txt"
echo

echo "--- 3. PAGINAS CON UN SOLO ENLACE ENTRANTE (debiles) ---"
awk '{c[$0]++} END{for(k in c) if(c[k]==1) print k}' "$T/links_all.txt" | sort | head -20
echo "  total: $(awk '{c[$0]++} END{n=0; for(k in c) if(c[k]==1) n++; print n}' "$T/links_all.txt")"
echo

echo "--- 4. SITEMAP vs ARCHIVOS ---"
grep -oE '<loc>[^<]*' sitemap.xml | sed 's|<loc>https://travesiacr.online||; s|^$|/|' | sort -u > "$T/sm.txt"
echo "  en el sitemap pero sin pagina:"; comm -23 "$T/sm.txt" "$T/valid.txt" | head -10
echo "  con pagina pero fuera del sitemap:"; comm -13 "$T/sm.txt" "$T/valid.txt" | head -20
echo

echo "--- 5. CANONICAL / TITLE / DESCRIPTION / H1 ---"
sin_canon=0; sin_title=0; sin_desc=0; sin_h1=0; multi_h1=0
while read -r f; do
  grep -q 'rel="canonical"' "$f" || { sin_canon=$((sin_canon+1)); echo "  sin canonical: $f"; }
  grep -q '<title>' "$f" || { sin_title=$((sin_title+1)); echo "  sin title: $f"; }
  grep -q 'name="description"' "$f" || { sin_desc=$((sin_desc+1)); echo "  sin description: $f"; }
  h=$(grep -c '<h1' "$f")
  [ "$h" -eq 0 ] && { sin_h1=$((sin_h1+1)); echo "  sin H1: $f"; }
  [ "$h" -gt 1 ] && { multi_h1=$((multi_h1+1)); echo "  varios H1 ($h): $f"; }
done < "$T/files.txt"
echo "  resumen -> sin canonical: $sin_canon | sin title: $sin_title | sin description: $sin_desc | sin H1: $sin_h1 | H1 repetido: $multi_h1"
echo

echo "--- 6. TITLES DUPLICADOS ---"
while read -r f; do grep -oE '<title>[^<]*' "$f" | head -1 | sed 's/<title>//'; done < "$T/files.txt" | sort | uniq -c | sort -rn | awk '$1>1' | head -10
echo

echo "--- 7. TITLES DEMASIADO LARGOS (>62 car.) ---"
while read -r f; do t=$(grep -oE '<title>[^<]*' "$f" | head -1 | sed 's/<title>//'); [ ${#t} -gt 62 ] && echo "${#t} $f"; done < "$T/files.txt" | wc -l
echo

echo "--- 8. DATOS ESTRUCTURADOS (JSON-LD) ---"
for t in Organization LocalBusiness TravelAgency Service FAQPage BreadcrumbList Review AggregateRating WebSite ItemList; do
  printf "  %-16s %s paginas\n" "$t" "$(xargs -a "$T/files.txt" grep -l "\"@type\":\"$t\"\|\"@type\": \"$t\"" 2>/dev/null | wc -l)"
done
echo

echo "--- 9. IMAGENES SIN ALT ---"
xargs -a "$T/files.txt" grep -ohE '<img [^>]*>' 2>/dev/null | grep -vc 'alt='
echo

echo "--- 10. ROBOTS.TXT ---"
cat robots.txt
echo
echo "--- 11. REDIRECCIONES DE VERCEL QUE NO LLEGAN A NINGUNA PAGINA ---"
grep -oE '"destination": "[^"]*"' vercel.json | sed 's/"destination": "//; s/"//' | sed 's/#.*//' | sort -u | while read -r d; do
  case "$d" in http*|"") continue;; esac
  grep -qx "$d" "$T/valid.txt" || echo "  $d"
done
rm -rf "$T"
