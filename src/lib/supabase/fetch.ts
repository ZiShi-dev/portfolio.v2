/** Délai max d’un appel REST Supabase (évite les pages bloquées ~20 s). */
export const SUPABASE_FETCH_TIMEOUT_MS = 8_000;

function requestPath(input: RequestInfo | URL): string {
  try {
    const raw =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    const url = new URL(raw);
    return `${url.origin}${url.pathname}`;
  } catch {
    return "[supabase]";
  }
}

function errorCode(err: unknown): string | undefined {
  if (!err || typeof err !== "object") return undefined;
  const direct = err as { code?: unknown; cause?: unknown };
  if (typeof direct.code === "string") return direct.code;
  if (direct.cause && typeof direct.cause === "object") {
    const nested = direct.cause as { code?: unknown; cause?: unknown };
    if (typeof nested.code === "string") return nested.code;
    if (nested.cause && typeof nested.cause === "object") {
      const deep = nested.cause as { code?: unknown };
      if (typeof deep.code === "string") return deep.code;
    }
  }
  return undefined;
}

function isTimeoutError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return err.name === "TimeoutError" || err.name === "AbortError";
}

/** Erreurs réseau transitoires (VPN, reset) — un seul retry. */
export function isRetryableSupabaseNetworkError(err: unknown): boolean {
  if (isTimeoutError(err)) return false;
  const code = errorCode(err);
  if (
    code === "ECONNRESET" ||
    code === "ECONNREFUSED" ||
    code === "EPIPE" ||
    code === "ENOTFOUND" ||
    code === "UND_ERR_SOCKET" ||
    code === "UND_ERR_CONNECT_TIMEOUT"
  ) {
    return true;
  }
  return err instanceof TypeError && err.message === "fetch failed";
}

function logFetchFailure(input: RequestInfo | URL, err: unknown) {
  const cause =
    err instanceof Error && "cause" in err ? (err as { cause?: unknown }).cause : undefined;
  const causeErr = cause instanceof Error ? cause : undefined;
  console.error("[supabase] fetch failed", {
    path: requestPath(input),
    message: err instanceof Error ? err.message : String(err),
    name: err instanceof Error ? err.name : undefined,
    code: errorCode(err),
    cause: causeErr
      ? { name: causeErr.name, message: causeErr.message, code: errorCode(causeErr) }
      : undefined,
  });
}

function withTimeoutSignal(existing?: AbortSignal | null): AbortSignal {
  const timeout = AbortSignal.timeout(SUPABASE_FETCH_TIMEOUT_MS);
  if (!existing) return timeout;
  if (typeof AbortSignal.any === "function") {
    return AbortSignal.any([existing, timeout]);
  }
  return timeout;
}

async function fetchOnce(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  return fetch(input, {
    ...init,
    signal: withTimeoutSignal(init?.signal),
  });
}

/**
 * fetch pour les clients Supabase serveur : timeout court + 1 retry réseau.
 */
export async function supabaseFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const original = input instanceof Request ? input : null;
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const nextInput = original ? original.clone() : input;
    try {
      return await fetchOnce(nextInput, init);
    } catch (err) {
      lastError = err;
      if (attempt === 0 && isRetryableSupabaseNetworkError(err)) {
        continue;
      }
      logFetchFailure(nextInput, err);
      throw err;
    }
  }

  throw lastError;
}
