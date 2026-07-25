# Jornal

Registro de jornadas, horas extra y sueldo para trabajadores por cuenta ajena.

**App web instalable (PWA)**: funciona en iPhone y Android, se añade a la pantalla
de inicio y se abre sin conexión.

## Cómo funciona

- Cada persona abre el enlace, rellena un formulario inicial con su nómina y sus
  tarifas, y empieza a registrar.
- **Los datos nunca salen del dispositivo.** No hay cuentas, ni servidor, ni base
  de datos. Se guardan en IndexedDB con un espejo en localStorage.
- Copia de seguridad automática dentro del móvil cada 7 días (se conservan las 8
  últimas) y antes de cada actualización.
- Exportación manual a archivo `.json` (copia completa) y a `.csv` (informe mensual).

## Cálculo

| Caso | Regla |
|---|---|
| Lunes a viernes | Extra = horas por encima de la jornada. Se paga la fracción. |
| Sábado y domingo | Todas las horas son extra. Configurable: pagar solo horas completas (8,5 h → 8 h pagadas + 0,5 h registradas sin computar). |
| Ausencias | Médico, permiso, vacaciones, baja y festivo. Configurable si cubren jornada. |

Todo es configurable por usuario desde Ajustes.

## Estructura

```
index.html              Toda la app: HTML, CSS y JS. Sin dependencias externas.
sw.js                   Service worker. HTML a red primero, estáticos a caché primero.
manifest.webmanifest    Manifiesto PWA.
icon-180/192/512.png    Iconos.
servidor-pruebas.ps1    Servidor local para desarrollo. No se usa en producción.
```

**No hay build.** Se edita `index.html` y se publica. No hay `npm install`, ni
dependencias que caduquen, ni CDN que pueda caerse.

## Publicar una actualización

1. Editar `index.html`.
2. Subir `APP_VER` y añadir las novedades en la constante `NOVEDADES`.
3. Subir la misma versión en `CACHE` dentro de `sw.js` (**imprescindible**: si no
   se cambia, los usuarios no reciben la actualización).
4. `git add . && git commit -m "..." && git push`

Los usuarios verán un botón **Actualizar** al abrir la app. Al pulsarlo se guarda
una copia local de sus datos, se aplica la versión nueva y se les muestra la
pantalla de novedades. Sus datos no se tocan en ningún momento.

## Probar en local

```powershell
powershell -ExecutionPolicy Bypass -File servidor-pruebas.ps1
```

Abre http://localhost:8099
