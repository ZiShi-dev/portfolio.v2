/* Ancien service worker éventuel : se désinscrit pour arrêter les GET /sw.js 404. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(
    self.registration.unregister().then(() => self.clients.matchAll()).then((clients) => {
      clients.forEach((client) => {
        if ("navigate" in client) client.navigate(client.url);
      });
    })
  );
});
