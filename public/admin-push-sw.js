/* Notifications admin — scope /admin/ uniquement. */

/** Chemins relatifs /admin/* uniquement — anti open-redirect (OWASP A01). */
function safeAdminUrl(url, fallback = "/admin/inquiries") {
  if (typeof url !== "string") return fallback;
  const trimmed = url.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("\\") || trimmed.includes("://")) return fallback;
  if (trimmed !== "/admin" && !trimmed.startsWith("/admin/")) return fallback;
  return trimmed;
}

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = { title: "VORZIX", body: "Nouvelle demande", url: "/admin/inquiries" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    /* payload non JSON */
  }
  event.waitUntil(
    self.registration.showNotification(String(data.title || "VORZIX"), {
      body: String(data.body || ""),
      icon: "/images/favicon-192.png",
      badge: "/images/favicon-32.png",
      data: { url: safeAdminUrl(data.url) },
      tag: "vorzix-inquiry",
      renotify: true,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = safeAdminUrl(
    event.notification.data && event.notification.data.url
  );
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.focus();
          if ("navigate" in client) client.navigate(url);
          return;
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
