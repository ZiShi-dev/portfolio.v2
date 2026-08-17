"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Bell, BellOff, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ADMIN_ROUTES } from "@/lib/admin/constants";

const SW_URL = "/admin-push-sw.js";
const SW_SCOPE = "/admin/";
const POLL_MS = 25_000;

type UnseenInquiry = {
  id: string;
  reference: string;
  name: string;
  createdAt: string;
};

type PushStatus =
  | "loading"
  | "unsupported"
  | "ios-browser"
  | "unconfigured"
  | "denied"
  | "off"
  | "on";

function urlBase64ToUint8Array(value: string): Uint8Array {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

function isIosDevice() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iOS = /iPhone|iPad|iPod/i.test(ua);
  const iPadOs = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return iOS || iPadOs;
}

function isStandaloneDisplay() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

function subscriptionBody(subscription: PushSubscription) {
  const json = subscription.toJSON();
  return {
    endpoint: json.endpoint ?? subscription.endpoint,
    keys: {
      p256dh: json.keys?.p256dh ?? "",
      auth: json.keys?.auth ?? "",
    },
  };
}

export function AdminPushNotifications() {
  const t = useTranslations("admin.notifications");
  const pathname = usePathname();
  const [status, setStatus] = useState<PushStatus>("loading");
  const [busy, setBusy] = useState(false);
  const [marking, setMarking] = useState(false);
  const [newInquiries, setNewInquiries] = useState(0);
  const [items, setItems] = useState<UnseenInquiry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refreshSummary = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications/summary", {
        credentials: "include",
      });
      if (!res.ok) return;
      const body = (await res.json()) as {
        newInquiries?: number;
        items?: UnseenInquiry[];
      };
      if (typeof body.newInquiries === "number") {
        setNewInquiries(Math.max(0, body.newInquiries));
      }
      if (Array.isArray(body.items)) {
        setItems(
          body.items.filter(
            (row): row is UnseenInquiry =>
              Boolean(row) && typeof row.id === "string"
          )
        );
      }
    } catch {
      /* polling silencieux */
    }
  }, []);

  const syncStatus = useCallback(async () => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    ) {
      setStatus(isIosDevice() && !isStandaloneDisplay() ? "ios-browser" : "unsupported");
      return;
    }

    if (isIosDevice() && !isStandaloneDisplay()) {
      setStatus("ios-browser");
      return;
    }

    try {
      const vapid = await fetch("/api/admin/push/vapid", {
        credentials: "include",
      });
      if (!vapid.ok) {
        setStatus("unconfigured");
        return;
      }
      const vapidBody = (await vapid.json()) as {
        configured?: boolean;
      };
      if (!vapidBody.configured) {
        setStatus("unconfigured");
        return;
      }

      if (Notification.permission === "denied") {
        setStatus("denied");
        return;
      }

      const registration = await navigator.serviceWorker.getRegistration(SW_SCOPE);
      const subscription = await registration?.pushManager.getSubscription();
      setStatus(subscription ? "on" : "off");
    } catch {
      setStatus("off");
    }
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      void syncStatus();
      void refreshSummary();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [syncStatus, refreshSummary]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") void refreshSummary();
    }, POLL_MS);

    function onVisible() {
      if (document.visibilityState === "visible") {
        void refreshSummary();
        void syncStatus();
      }
    }

    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refreshSummary, syncStatus]);

  const markRead = useCallback(async () => {
    setMarking(true);
    try {
      const res = await fetch("/api/admin/notifications/read", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        setNewInquiries(0);
        setItems([]);
      }
      await refreshSummary();
    } catch {
      /* silencieux : le prochain poll rattrape */
    } finally {
      setMarking(false);
    }
  }, [refreshSummary]);

  useEffect(() => {
    if (pathname !== ADMIN_ROUTES.inquiries) return;
    const frame = window.requestAnimationFrame(() => {
      void markRead();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, markRead]);

  async function enable() {
    setBusy(true);
    setError(null);
    try {
      const vapid = await fetch("/api/admin/push/vapid", {
        credentials: "include",
      });
      const vapidBody = (await vapid.json()) as {
        configured?: boolean;
        publicKey?: string | null;
      };
      if (!vapid.ok || !vapidBody.configured || !vapidBody.publicKey) {
        setStatus("unconfigured");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "off");
        return;
      }

      const registration = await navigator.serviceWorker.register(SW_URL, {
        scope: SW_SCOPE,
      });
      await registration.update().catch(() => undefined);

      const existing = await registration.pushManager.getSubscription();
      const subscription =
        existing ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidBody.publicKey) as BufferSource,
        }));

      const res = await fetch("/api/admin/push/subscribe", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscriptionBody(subscription)),
      });
      if (!res.ok) {
        setError(t("error"));
        return;
      }
      setStatus("on");
      void refreshSummary();
    } catch {
      setError(t("error"));
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setError(null);
    try {
      const registration = await navigator.serviceWorker.getRegistration(SW_SCOPE);
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await fetch("/api/admin/push/unsubscribe", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      setStatus("off");
    } catch {
      setError(t("error"));
    } finally {
      setBusy(false);
    }
  }

  const badge = newInquiries > 9 ? "9+" : String(newInquiries);
  const Icon = status === "on" ? BellRing : status === "denied" ? BellOff : Bell;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="relative"
          aria-label={t("bellLabel")}
        >
          <Icon className="h-4 w-4" aria-hidden />
          {newInquiries > 0 ? (
            <span className="absolute -end-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-mono text-[9px] font-semibold leading-none text-primary-foreground">
              {badge}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))] space-y-3 p-4">
        <div>
          <p className="font-display text-sm text-foreground">{t("title")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {newInquiries > 0
              ? t("newInquiries", { count: newInquiries })
              : t("noNew")}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground/80">
            {t("unreadOnly")}
          </p>
        </div>

        {items.length > 0 ? (
          <ul className="max-h-40 space-y-1.5 overflow-y-auto">
            {items.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-border bg-background/50 px-3 py-2"
              >
                <p className="truncate font-mono text-[11px] tracking-wide text-primary">
                  {item.reference || "—"}
                </p>
                <p className="mt-0.5 truncate text-sm text-foreground">
                  {item.name}
                </p>
              </li>
            ))}
          </ul>
        ) : null}

        {status === "ios-browser" ? (
          <p className="text-sm leading-relaxed text-muted-foreground">{t("iphoneHint")}</p>
        ) : null}
        {status === "unsupported" ? (
          <p className="text-sm text-muted-foreground">{t("notSupported")}</p>
        ) : null}
        {status === "unconfigured" ? (
          <p className="text-sm text-muted-foreground">{t("notConfigured")}</p>
        ) : null}
        {status === "denied" ? (
          <p className="text-sm text-muted-foreground">{t("denied")}</p>
        ) : null}
        {error ? <p className="text-sm text-muted-foreground">{error}</p> : null}

        <div className="flex flex-col gap-2">
          {status === "off" ? (
            <Button type="button" size="sm" onClick={() => void enable()} disabled={busy}>
              {busy ? t("enabling") : t("enable")}
            </Button>
          ) : null}
          {status === "on" ? (
            <>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
                {t("enabled")}
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void disable()}
                disabled={busy}
              >
                {busy ? t("disabling") : t("disable")}
              </Button>
            </>
          ) : null}
          {newInquiries > 0 && pathname !== ADMIN_ROUTES.inquiries ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void markRead()}
              disabled={marking}
            >
              {marking ? t("markingRead") : t("markRead")}
            </Button>
          ) : null}
          <Button asChild size="sm" variant={status === "on" ? "default" : "outline"}>
            <Link href={ADMIN_ROUTES.inquiries}>{t("openInquiries")}</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
