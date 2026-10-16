"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  waitAndScrollToHash,
} from "@/lib/scroll-to-section";

/**
 * Next.js ignore souvent le hash des Link (`/#faq`).
 * On scrolle nous-mêmes : même page au clic, et après navigation.
 */
export function HashSectionScroll() {
  const pathname = usePathname();
  const pendingScroll = useRef<() => void>(() => {});

  useEffect(() => {
    pendingScroll.current();
    if (window.location.hash) pendingScroll.current = waitAndScrollToHash(window.location.hash);
    return () => pendingScroll.current();
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.hasAttribute("download")) return;
      const tab = anchor.getAttribute("target");
      if (tab && tab !== "_self") return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin || !url.hash) return;
      if (url.pathname !== window.location.pathname) return;
      if (url.search !== window.location.search) return;

      event.preventDefault();
      if (window.location.hash !== url.hash) {
        window.history.pushState(null, "", `${url.pathname}${url.search}${url.hash}`);
      }
      pendingScroll.current();
      pendingScroll.current = waitAndScrollToHash(url.hash);
    };

    document.addEventListener("click", onClick, true);
    return () => {
      pendingScroll.current();
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  useEffect(() => {
    // Once the visitor scrolls manually, the old anchor is no longer their
    // destination. Sync the clean URL with Next so reload uses the real position.
    const clearAnchor = () => {
      if (!window.location.hash || document.body.style.position === "fixed") return;
      pendingScroll.current();
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof Element && event.target.closest("input, textarea, select, [contenteditable]")) return;
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) clearAnchor();
    };
    window.addEventListener("wheel", clearAnchor, { passive: true });
    window.addEventListener("touchmove", clearAnchor, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", clearAnchor);
      window.removeEventListener("touchmove", clearAnchor);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      pendingScroll.current();
      if (!window.location.hash) return;
      pendingScroll.current = waitAndScrollToHash(window.location.hash);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => {
      pendingScroll.current();
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  return null;
}
