# Publica los cambios de Jornal en GitHub Pages.
# Uso:  powershell -ExecutionPolicy Bypass -File publicar.ps1 "descripción del cambio"
param([string]$Mensaje = "Actualización de Jornal")

$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $MyInvocation.MyCommand.Path)

# Aviso si se ha olvidado subir la versión de la caché del service worker:
# sin ese cambio los usuarios NO reciben la actualización.
$verApp = (Select-String -Path "index.html" -Pattern 'const APP_VER = "([^"]+)"').Matches[0].Groups[1].Value
$verSw  = (Select-String -Path "sw.js"      -Pattern 'const CACHE = "jornal-v([^"]+)"').Matches[0].Groups[1].Value

Write-Host "Version en index.html : $verApp"
Write-Host "Version en sw.js      : $verSw"

if ($verApp -ne $verSw) {
  Write-Host ""
  Write-Host "AVISO: las versiones no coinciden." -ForegroundColor Yellow
  Write-Host "Si no cambias CACHE en sw.js, los usuarios seguiran con la version vieja." -ForegroundColor Yellow
  $r = Read-Host "Publicar igualmente? (s/N)"
  if ($r -ne "s") { Write-Host "Cancelado."; exit 1 }
}

git add -A
git commit -m $Mensaje
git push

Write-Host ""
Write-Host "Publicado. GitHub Pages tarda 1-2 minutos en servir los cambios." -ForegroundColor Green
