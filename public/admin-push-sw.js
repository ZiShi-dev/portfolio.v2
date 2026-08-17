/* Notifications admin — scope /admin/ uniquement. */
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
      data: { url: String(data.url || "/admin/inquiries") },
      tag: "vorzix-inquiry",
      renotify: true,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/admin/inquiries";
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
