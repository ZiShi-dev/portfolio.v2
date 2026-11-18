export const PUSH_RETRY_DELAYS_MS = [0, 400, 1200] as const;

export function pushStatusCode(error: unknown): number {
  if (typeof error === "object" && error && "statusCode" in error) {
    const status = Number((error as { statusCode?: number }).statusCode);
    return Number.isFinite(status) ? status : 0;
  }
  return 0;
}

/** 404/410 : abonnement mort. 408/429/5xx et réseau : nouvel essai. Le reste est définitif. */
export function pushFailureKind(status: number): "gone" | "retry" | "drop" {
  if (status === 404 || status === 410) return "gone";
  if (
    status === 0 ||
    status === 408 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  ) {
    return "retry";
  }
  return "drop";
}

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Quelques essais courts dans la même invocation.
 * Le sujet Web Push et l'étiquette de notification empêchent un doublon visible
 * si le premier envoi a en fait réussi avant l'expiration.
 */
export async function deliverWithRetry(
  send: () => Promise<void>,
  options?: {
    delays?: readonly number[];
    sleep?: (ms: number) => Promise<void>;
  }
): Promise<"sent" | "gone" | "failed"> {
  const delays = options?.delays ?? PUSH_RETRY_DELAYS_MS;
  const sleep = options?.sleep ?? defaultSleep;
  let kind: "retry" | "gone" | "drop" = "retry";

  for (let attempt = 0; attempt < delays.length; attempt += 1) {
    const wait = delays[attempt] ?? 0;
    if (wait > 0) await sleep(wait);
    try {
      await send();
      return "sent";
    } catch (error) {
      kind = pushFailureKind(pushStatusCode(error));
      if (kind !== "retry") break;
    }
  }

  return kind === "gone" ? "gone" : "failed";
}
