<#
  Agrega datos estructurados FAQPage (schema.org) a las paginas que ya
  muestran preguntas frecuentes visibles (<details><summary>...) pero no
  tenian la etiqueta que le dice a Google/ChatGPT/Perplexity "esto es una
  pregunta y respuesta verificada". No cambia nada visible para el usuario.

  Corre sobre /shuttle, /shuttle-to y /hotel. Volver a correr si se agregan
  paginas nuevas (es idempotente: si una pagina ya tiene FAQPage, se salta).
#>
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Decode-Entities([string]$s) {
  $s = $s -replace '&mdash;', [char]0x2014
  $s = $s -replace '&ndash;', [char]0x2013
  $s = $s -replace '&rsquo;', [char]0x2019
  $s = $s -replace '&lsquo;', [char]0x2018
  $s = $s -replace '&ldquo;', [char]0x201C
  $s = $s -replace '&rdquo;', [char]0x201D
  $s = $s -replace '&nbsp;', ' '
  $s = $s -replace '&amp;', '&'
  return $s
}

function Strip-Tags([string]$s) {
  return [System.Text.RegularExpressions.Regex]::Replace($s, '<[^>]+>', '')
}

function Process-Dir($dir) {
  $n = 0; $skipped = 0
  Get-ChildItem "$dir/*.html" | Where-Object { $_.Name -ne "index.html" } | ForEach-Object {
    $c = [System.IO.File]::ReadAllText($_.FullName, [Text.Encoding]::UTF8)
    if ($c -match 'FAQPage') { $skipped++; return }

    $re = [System.Text.RegularExpressions.Regex]::new(
      '<details><summary>(.*?)</summary><div class=[''"]a[''"]>(.*?)</div></details>',
      [System.Text.RegularExpressions.RegexOptions]::Singleline)
    $matches = $re.Matches($c)
    if ($matches.Count -eq 0) { return }

    $qa = @()
    foreach ($m in $matches) {
      $q = Decode-Entities(Strip-Tags($m.Groups[1].Value)).Trim()
      $a = Decode-Entities(Strip-Tags($m.Groups[2].Value)).Trim()
      $qa += [PSCustomObject]@{
        "@type" = "Question"
        name = $q
        acceptedAnswer = [PSCustomObject]@{ "@type" = "Answer"; text = $a }
      }
    }
    $faq = [PSCustomObject]@{
      "@context" = "https://schema.org"
      "@type" = "FAQPage"
      mainEntity = $qa
    }
    $json = $faq | ConvertTo-Json -Depth 6 -Compress
    $scriptTag = "<script type=`"application/ld+json`">$json</script>"

    if ($c -notmatch '<script defer src="/analytics\.js"></script>') { return }
    $c2 = $c -replace '(<script defer src="/analytics\.js"></script>)', "$scriptTag`n`$1"
    [System.IO.File]::WriteAllText($_.FullName, $c2, $utf8NoBom)
    $n++
  }
  return @{ done = $n; skipped = $skipped }
}

$r1 = Process-Dir "$root/shuttle"
$r2 = Process-Dir "$root/shuttle-to"
$r3 = Process-Dir "$root/hotel"
Write-Host "shuttle/: $($r1.done) agregadas, $($r1.skipped) ya tenian"
Write-Host "shuttle-to/: $($r2.done) agregadas, $($r2.skipped) ya tenian"
Write-Host "hotel/: $($r3.done) agregadas, $($r3.skipped) ya tenian"
