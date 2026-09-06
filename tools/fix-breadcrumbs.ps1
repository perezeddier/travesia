<#
  Arregla el breadcrumb de las paginas de ruta/hotel/shuttle-to: antes decia
  "Shuttle routes" apuntando a /#routes (la portada), ahora apunta a los
  nuevos indices reales /shuttle y /hotel (ver genindexes.ps1).
#>
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Fix-Files($pattern, $oldStr, $newStr) {
  $n = 0
  Get-ChildItem $pattern | ForEach-Object {
    $c = [System.IO.File]::ReadAllText($_.FullName, [Text.Encoding]::UTF8)
    if ($c.Contains($oldStr)) {
      $c2 = $c.Replace($oldStr, $newStr)
      [System.IO.File]::WriteAllText($_.FullName, $c2, $utf8NoBom)
      $n++
    }
  }
  return $n
}

$oldRoute = 'href="/#routes">Shuttle routes'
$n1 = Fix-Files "$root/shuttle/*.html"    $oldRoute 'href="/shuttle">All routes'
$n2 = Fix-Files "$root/shuttle-to/*.html" $oldRoute 'href="/shuttle">All routes'
$n3 = Fix-Files "$root/hotel/*.html"      $oldRoute 'href="/hotel">Hotels'
Write-Host "shuttle/: $n1 archivos | shuttle-to/: $n2 archivos | hotel/: $n3 archivos"

# Plantillas (para que las paginas nuevas generadas ya salgan bien)
$t1 = Fix-Files "$root/tools/route-template.html"     $oldRoute 'href="/shuttle">All routes'
$t2 = Fix-Files "$root/tools/shuttleto-template.html" $oldRoute 'href="/shuttle">All routes'
$t3 = Fix-Files "$root/tools/hotel-template.html"     $oldRoute 'href="/hotel">Hotels'
Write-Host "plantillas corregidas: $($t1+$t2+$t3)"
