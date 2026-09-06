<#
  Corrige el BreadcrumbList (datos estructurados JSON-LD, los que leen las IAs
  y Google, no el texto visible) para que apunte a /shuttle o /hotel en vez de
  /#routes -- quedo desactualizado cuando se arreglo el breadcrumb visible.
#>
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Fix-Files($pattern, $oldStr, $newStr) {
  $n = 0
  Get-ChildItem $pattern | ForEach-Object {
    $c = [System.IO.File]::ReadAllText($_.FullName, [Text.Encoding]::UTF8)
    if ($c.Contains($oldStr)) {
      [System.IO.File]::WriteAllText($_.FullName, $c.Replace($oldStr, $newStr), $utf8NoBom)
      $n++
    }
  }
  return $n
}

$old = '"name":"Shuttle routes","item":"https://travesiacr.online/#routes"'
$n1 = Fix-Files "$root/shuttle/*.html"    $old '"name":"All routes","item":"https://travesiacr.online/shuttle"'
$n2 = Fix-Files "$root/shuttle-to/*.html" $old '"name":"All routes","item":"https://travesiacr.online/shuttle"'
$n3 = Fix-Files "$root/hotel/*.html"      $old '"name":"Hotels","item":"https://travesiacr.online/hotel"'
Write-Host "shuttle/: $n1 | shuttle-to/: $n2 | hotel/: $n3"
