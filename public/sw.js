const CACHE_VERSION = "ct-belcar-v5";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PAGE_CACHE = `${CACHE_VERSION}-pages`;
const APP_SHELL = [
  "/painel",
  "/links",
  "/fichas-tecnicas",
  "/manifest.webmanifest",
  "/brand/christiano-tadeu-logo-clara.webp",
  "/brand/christiano-tadeu-logo-negativa.webp",
  "/brand/christiano-tadeu-monograma-claro.webp",
  "/brand/christiano-tadeu-monograma-negativo.webp",
  "/media/christiano-tadeu-perfil.webp",
  "/media/christiano-tadeu-encontro-vw.webp",
  "/media/christiano-tadeu-visita-tecnica.webp",
  "/icons/app-192.png",
  "/icons/app-512.png",
  "/icons/app-maskable-512.png",
  "/icons/favicon-light-64.png",
  "/icons/favicon-dark-64.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => !key.startsWith(CACHE_VERSION)).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/painel") || request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(PAGE_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/painel"))),
    );
    return;
  }
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && ["style", "script", "image", "font"].includes(request.destination)) {
          const copy = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    }),
  );
});
