/* Notifications admin — scope /admin/ uniquement.
   Les noms de messages restent alignés avec src/lib/admin/push/events.ts. */

/** Chemins relatifs /admin/* uniquement — anti open-redirect (OWASP A01). */
function safeAdminUrl(url, fallback = "/admin/inquiries") {
  if (typeof url !== "string") return fallback;
  const trimmed = url.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("\\") || trimmed.includes("://")) return fallback;
  if (trimmed !== "/admin" && !trimmed.startsWith("/admin/")) return fallback;
  return trimmed;
}

function safeInquiryId(id) {
  if (typeof id !== "string") return null;
  const trimmed = id.trim().toLowerCase();
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
      trimmed
    )
  ) {
    return null;
  }
  return trimmed;
}

function safeTag(tag, id) {
  if (id && tag === `inquiry-${id}`) return tag;
  return "vorzix-inquiry";
}

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {
    title: "VORZIX",
    body: "Une nouvelle demande de projet est arrivée.",
    url: "/admin/inquiries",
    tag: "vorzix-inquiry",
    id: null,
  };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    /* payload non JSON */
  }

  const id = safeInquiryId(data.id);
  const url = safeAdminUrl(data.url);
  const title = String(data.title || "VORZIX").slice(0, 120);
  const body = String(data.body || "").slice(0, 240);

  event.waitUntil(
    Promise.all([
      self.clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((clients) =>
          Promise.all(
            clients.map((client) =>
              client.postMessage({
                type: "vorzix-inquiry-push",
                url,
                id,
              })
            )
          )
        ),
      self.registration.showNotification(title, {
        body,
        icon: "/images/favicon-192.png",
        badge: "/images/favicon-32.png",
        data: { url },
        tag: safeTag(data.tag, id),
        renotify: false,
      }),
    ])
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = safeAdminUrl(
    event.notification.data && event.notification.data.url
  );
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(async (clients) => {
        const current = clients.find((client) => {
          try {
            return new URL(client.url).pathname.startsWith("/admin");
          } catch {
            return false;
          }
        });
        if (current && "focus" in current) {
          await current.focus();
          if (typeof current.navigate === "function") {
            try {
              await current.navigate(url);
              return;
            } catch {
              /* Le message ci-dessous reprend la main. */
            }
          }
          current.postMessage({ type: "vorzix-push-open", url });
          return;
        }
        if (self.clients.openWindow) await self.clients.openWindow(url);
      })
  );
});
