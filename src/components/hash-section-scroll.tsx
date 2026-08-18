"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";
import {
  scrollBehaviorForMotion,
  scrollToSection,
  waitAndScrollToHash,
} from "@/lib/scroll-to-section";

/**
 * Next.js ignore souvent le hash des Link (`/#faq`).
 * On scrolle nous-mêmes : même page au clic, et après navigation.
 */
export function HashSectionScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (!window.location.hash) return;
    return waitAndScrollToHash(window.location.hash);
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
      scrollToSection(url.hash, scrollBehaviorForMotion());
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    let cancel = () => {};
    const onHashChange = () => {
      cancel();
      if (!window.location.hash) return;
      cancel = waitAndScrollToHash(window.location.hash);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => {
      cancel();
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  return null;
}
