/* Jornal — service worker
   Dos estrategias, cada una donde toca:
   · El HTML (la app en sí) va a RED PRIMERO con respaldo en caché. Así, con
     cobertura siempre se abre la última versión, y sin cobertura se abre la
     guardada. Evita quedarse con una versión vieja pegada.
   · Los iconos y el manifiesto van a CACHÉ PRIMERO: no cambian casi nunca y
     así el arranque es instantáneo.
   En ningún caso se queda en blanco por falta de conexión. */

const CACHE = "jornal-v1.9.0";
const RED_TIMEOUT = 4000;   // si la red tarda más, tira de caché
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png"
];

/* OJO: aquí NO se llama a skipWaiting(). La versión nueva se queda esperando
   hasta que la persona pulsa «Actualizar» en la app. Así nunca se le cambia la
   aplicación por debajo mientras está escribiendo, y da tiempo a que la app
   haga una copia de seguridad local antes de aplicar el cambio. */
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .catch(err => console.warn("[sw] precache incompleto", err))
  );
});

/* La app pide aplicar la actualización cuando ya ha guardado la copia */
self.addEventListener("message", e => {
  if (e.data && e.data.tipo === "APLICAR_ACTUALIZACION") self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function guardar(req, res) {
  if (res && res.ok && res.type !== "opaque") {
    const copia = res.clone();
    caches.open(CACHE).then(c => c.put(req, copia)).catch(() => {});
  }
  return res;
}

/** Red primero, con tope de espera y respaldo en caché. Para el HTML. */
async function redPrimero(req) {
  try {
    const res = await Promise.race([
      fetch(req).then(r => guardar(req, r)),
      new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), RED_TIMEOUT))
    ]);
    if (res) return res;
  } catch (e) { /* sin conexión o demasiado lenta: seguimos abajo */ }
  return (await caches.match(req, { ignoreSearch: true })) ||
         (await caches.match("./index.html")) ||
         (await caches.match("./")) ||
         new Response("<h1>Sin conexión</h1><p>Abre Jornal de nuevo cuando tengas cobertura.</p>",
                      { headers: { "Content-Type": "text/html; charset=utf-8" }, status: 503 });
}

/** Caché primero y actualización en segundo plano. Para iconos y manifiesto. */
async function cachePrimero(req) {
  const cached = await caches.match(req, { ignoreSearch: true });
  const red = fetch(req).then(r => guardar(req, r)).catch(() => cached);
  return cached || red;
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // nada externo que cachear

  const esHTML = req.mode === "navigate" ||
                 (req.headers.get("accept") || "").includes("text/html") ||
                 url.pathname.endsWith(".html") ||
                 url.pathname.endsWith("/");

  e.respondWith(esHTML ? redPrimero(req) : cachePrimero(req));
});
