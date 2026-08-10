"use client";

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
} from "react";
import Script from "next/script";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact" | "flexible";
          appearance?: "always" | "execute" | "interaction-only";
          language?: string;
          action?: string;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export type TurnstileWidgetHandle = {
  reset: () => void;
};

type TurnstileWidgetProps = {
  onToken: (token: string) => void;
  onExpire: () => void;
  className?: string;
  /** Défaut `flexible` : bandeau pleine largeur (évite le carré `compact`). */
  size?: "normal" | "compact" | "flexible";
  appearance?: "always" | "execute" | "interaction-only";
  /** Code i18n site (`fr` | `en` | `ar`) ou `auto`. */
  language?: string;
  theme?: "light" | "dark" | "auto";
  /** Action stable, vérifiée côté serveur via Siteverify. */
  action: string;
};

export const TurnstileWidget = forwardRef<
  TurnstileWidgetHandle,
  TurnstileWidgetProps
>(function TurnstileWidget(
  {
    onToken,
    onExpire,
    className,
    size = "flexible",
    appearance = "always",
    language = "auto",
    theme = "dark",
    action,
  },
  ref
) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  const onExpireRef = useRef(onExpire);
  const [scriptReady, setScriptReady] = useState(false);

  onTokenRef.current = onToken;
  onExpireRef.current = onExpire;

  const reset = useCallback(() => {
    onExpireRef.current();
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }, []);

  useImperativeHandle(ref, () => ({ reset }), [reset]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.turnstile) {
      setScriptReady(true);
    }
  }, []);

  useEffect(() => {
    if (!siteKey || !scriptReady || !containerRef.current || !window.turnstile) {
      return;
    }

    if (widgetIdRef.current) {
      window.turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: (token) => onTokenRef.current(token),
      "expired-callback": () => onExpireRef.current(),
      "error-callback": () => onExpireRef.current(),
      theme,
      size,
      appearance,
      language,
      action,
    });

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, scriptReady, size, appearance, language, theme, action]);

  if (!siteKey) return null;

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="lazyOnload"
        onLoad={() => setScriptReady(true)}
      />
      <div
        ref={containerRef}
        className={cn(
          "flex w-full max-w-full justify-center",
          // Hauteur native Turnstile : normal/flexible 65px, compact 140px
          size === "compact" ? "min-h-[140px]" : "min-h-[65px]",
          className
        )}
      />
    </>
  );
});
