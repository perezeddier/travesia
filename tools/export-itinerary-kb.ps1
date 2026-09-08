<#
  Exporta una base de conocimiento en texto plano (Markdown) con TODOS los
  precios reales de rutas (routes-data.js) para usar como "Knowledge" en un
  Proyecto de Claude - el asistente de itinerarios de Eddie.
  Volver a correr cada vez que cambien precios, para mantenerlo actualizado.
#>
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$rd = Get-Content -Raw -Encoding UTF8 (Join-Path $root "routes-data.js")

$mplaces = [regex]::Match($rd, 'const PT_PLACES = (\[.*?\]);', [System.Text.RegularExpressions.RegexOptions]::Singleline)
$places = $mplaces.Groups[1].Value | ConvertFrom-Json

$mdisplay = [regex]::Match($rd, 'const PT_DISPLAY = (\{.*?\});', [System.Text.RegularExpressions.RegexOptions]::Singleline)
$displayJson = $mdisplay.Groups[1].Value -replace ',(\s*[\}\]])', '$1'
$displayRaw = $displayJson | ConvertFrom-Json
$display = @{}
$displayRaw.PSObject.Properties | ForEach-Object { $display[$_.Name] = $_.Value }

function NiceName($idx) {
  $raw = $places[$idx]
  if ($display.ContainsKey($raw)) { return $display[$raw] }
  return $raw
}

$mrows = [regex]::Match($rd, 'const PT_ROWS = (\[.*?\]);', [System.Text.RegularExpressions.RegexOptions]::Singleline)
$rows = $mrows.Groups[1].Value | ConvertFrom-Json

$mhotels = [regex]::Match($rd, 'const PT_HOTELS = (\[.*?\]);', [System.Text.RegularExpressions.RegexOptions]::Singleline)
$hotelsJson = $mhotels.Groups[1].Value -replace '//[^\r\n]*', ''
$hotelsJson = $hotelsJson -replace ',(\s*[\}\]])', '$1'
$hotels = $hotelsJson | ConvertFrom-Json

$ARROW = [string][char]0x2194
$DASH = [string][char]0x2014

$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine("# Travesia Costa Rica - Precios reales de traslados (para armar itinerarios)")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("Generado automaticamente desde la base de datos real del sitio (routes-data.js) el $(Get-Date -Format 'yyyy-MM-dd').")
[void]$sb.AppendLine("REGLA DE ORO: nunca inventes ni redondees un precio. Si una combinacion no aparece en esta lista, dilo claramente y sugiere escribir a Eddie por WhatsApp (+506 8502 8476) para cotizar, en vez de adivinar.")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("Todos los precios son por vehiculo (no por persona), tarifa plana, impuestos incluidos. Elige el vehiculo segun el total de pasajeros del grupo:")
[void]$sb.AppendLine("- Hyundai Staria: hasta 5 pasajeros")
[void]$sb.AppendLine("- Toyota Hiace: hasta 9 pasajeros")
[void]$sb.AppendLine("- Maxus V90: hasta 12 pasajeros")
[void]$sb.AppendLine("- Si el grupo supera 12 personas, se necesita mas de un vehiculo (combinalos).")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("## Tabla de precios por ruta")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("Formato: Origen $ARROW Destino $DASH Staria / Hiace / Maxus $DASH duracion aprox.")
[void]$sb.AppendLine("")

$rows | Sort-Object { NiceName([int]$_[0]) } | ForEach-Object {
  $i = [int]$_[0]; $j = [int]$_[1]
  $s = if ($_[2]) { "`$$($_[2])" } else { "N/D" }
  $h = if ($_[3]) { "`$$($_[3])" } else { "N/D" }
  $m = if ($_[4]) { "`$$($_[4])" } else { "N/D" }
  $dur = $_[5]
  [void]$sb.AppendLine("- $(NiceName $i) $ARROW $(NiceName $j) $DASH $s / $h / $m $DASH $dur")
}

[void]$sb.AppendLine("")
[void]$sb.AppendLine("## Hoteles conocidos (para ubicar la zona/precio del cliente)")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("Si el cliente menciona un hotel de esta lista, usa el precio de SU ZONA (entre parentesis) para cotizar.")
[void]$sb.AppendLine("")
$byZone = $hotels | Group-Object place
foreach ($g in ($byZone | Sort-Object { NiceName([int]$_.Name) })) {
  $zoneName = NiceName([int]$g.Name)
  $names = ($g.Group | ForEach-Object { $_.name }) -join ", "
  [void]$sb.AppendLine("- $zoneName): $names")
}

$out = Join-Path $root "tools/itinerary-kb-precios.md"
[System.IO.File]::WriteAllText($out, $sb.ToString(), (New-Object System.Text.UTF8Encoding($false)))
Write-Host "Escrito: $out ($([int]((Get-Item $out).Length/1KB)) KB, $($rows.Count) rutas, $($hotels.Count) hoteles)"
