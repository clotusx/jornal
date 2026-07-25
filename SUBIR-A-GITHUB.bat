@echo off
chcp 65001 >nul
title Subir Jornal a GitHub
cd /d "%~dp0"

echo.
echo  ========================================
echo    JORNAL - Subir la app a GitHub
echo  ========================================
echo.
echo  Se abrira una ventana del navegador para que inicies
echo  sesion en GitHub y autorices el acceso.
echo.
echo  Es la UNICA vez que hay que hacerlo: despues Windows
echo  recuerda la autorizacion.
echo.
pause
echo.

set "PATH=C:\Program Files\Git\cmd;%PATH%"

git push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
  echo  ========================================
  echo    LISTO. La app ya esta en GitHub.
  echo  ========================================
  echo.
  echo  Ahora falta activar GitHub Pages:
  echo.
  echo   1. Abre https://github.com/clotusx/jornal/settings/pages
  echo   2. En "Source" elige: Deploy from a branch
  echo   3. Branch: main    Carpeta: / ^(root^)
  echo   4. Pulsa Save
  echo.
  echo  En 1-2 minutos la app estara en:
  echo   https://clotusx.github.io/jornal/
  echo.
) else (
  echo  ========================================
  echo    Algo ha fallado. Codigo: %ERRORLEVEL%
  echo  ========================================
  echo.
  echo  Copia el mensaje de arriba y pasamelo.
  echo.
)
pause
