import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { adminMethodNotAllowed } from "@/lib/admin/error-response";
import { jsonResponse } from "@/lib/api/json-response";
import { getVapidPublicKey, isWebPushConfigured } from "@/lib/admin/push/vapid";

export async function GET(request: Request) {
  const guard = await requireAdminApi(request, { requireOrigin: false });
  if (!guard.ok) return guard.response;

  if (!isWebPushConfigured()) {
    return jsonResponse({ ok: true, configured: false, publicKey: null }, 200);
  }

  return jsonResponse(
    { ok: true, configured: true, publicKey: getVapidPublicKey() },
    200
  );
}

export function POST() {
  return adminMethodNotAllowed();
}

export function PUT() {
  return adminMethodNotAllowed();
}

export function PATCH() {
  return adminMethodNotAllowed();
}

export function DELETE() {
  return adminMethodNotAllowed();
}
