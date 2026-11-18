/** Message du service worker vers les pages admin ouvertes. */
export const INQUIRY_PUSH_EVENT = "vorzix-inquiry-push";

/** Secours si le navigateur ne sait pas naviguer la fenêtre depuis le service worker. */
export const PUSH_OPEN_MESSAGE = "vorzix-push-open";

export function isSafeAdminPath(url: string): boolean {
  if (url !== "/admin" && !url.startsWith("/admin/")) return false;
  if (url.startsWith("//") || url.includes("\\") || url.includes("://")) return false;
  return true;
}
