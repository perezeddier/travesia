<#
  Audita PT_ROWS (routes-data.js) contra las paginas reales en /shuttle:
  para cada par con precio, si AMBOS extremos tienen slug (PT_SLUG), deberia
  existir una pagina en cada direccion. Reporta huecos reales.
#>
$ErrorActionPreference = "Stop"
$root = "C:/Users/veroc/travesia"
$rd = Get-Content -Raw -Encoding UTF8 (Join-Path $root "routes-data.js")

$mrx = [regex]::Match($rd, 'const PT_ROWS = (\[.*?\]);', [System.Text.RegularExpressions.RegexOptions]::Singleline)
$rows = $mrx.Groups[1].Value | ConvertFrom-Json

$mplaces = [regex]::Match($rd, 'const PT_PLACES = (\[.*?\]);', [System.Text.RegularExpressions.RegexOptions]::Singleline)
$places = $mplaces.Groups[1].Value | ConvertFrom-Json

# PT_SLUG: parsear "N: "slug"" pares
$slugMatches = [regex]::Matches($rd, '(\d+):\s*"([a-z0-9-]+)"')
$slug = @{}
foreach ($m in $slugMatches) { $slug[[int]$m.Groups[1].Value] = $m.Groups[2].Value }

Write-Host "Total lugares con slug: $($slug.Count)"
Write-Host "Total filas de precio (PT_ROWS): $($rows.Count)"
Write-Host ""

$missing = New-Object System.Collections.ArrayList
$checked = 0
foreach ($row in $rows) {
  $i = [int]$row[0]; $j = [int]$row[1]
  if (-not $slug.ContainsKey($i) -or -not $slug.ContainsKey($j)) { continue }
  $checked++
  $s1 = "$($slug[$i])-to-$($slug[$j])"
  $s2 = "$($slug[$j])-to-$($slug[$i])"
  $p1 = Join-Path $root "shuttle/$s1.html"
  $p2 = Join-Path $root "shuttle/$s2.html"
  if (-not (Test-Path $p1)) { [void]$missing.Add(@{ pair="$($places[$i]) -> $($places[$j])"; slug=$s1 }) }
  if (-not (Test-Path $p2)) { [void]$missing.Add(@{ pair="$($places[$j]) -> $($places[$i])"; slug=$s2 }) }
}

Write-Host "Pares con slug en ambos lados (deberian tener pagina): $checked"
Write-Host "Paginas faltantes: $($missing.Count)"
foreach ($m in $missing) { Write-Host "  FALTA: $($m.pair)  [$($m.slug)]" }
