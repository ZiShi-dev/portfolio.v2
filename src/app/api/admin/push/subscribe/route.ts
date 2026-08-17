import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { logAdminAuthEvent } from "@/lib/admin/audit-log";
import { ADMIN_ERROR_CODES } from "@/lib/admin/error-codes";
import {
  adminErrorResponse,
  adminMethodNotAllowed,
} from "@/lib/admin/error-response";
import { jsonResponse } from "@/lib/api/json-response";
import { parsePushSubscriptionBody } from "@/lib/admin/push/schema";
import { upsertAdminPushSubscription } from "@/lib/admin/push/store";
import { isWebPushConfigured } from "@/lib/admin/push/vapid";
import { getClientIp } from "@/lib/rate-limit-core";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const guard = await requireAdminApi(request);
  if (!guard.ok) return guard.response;

  if (!isWebPushConfigured()) {
    return adminErrorResponse(ADMIN_ERROR_CODES.UNAVAILABLE, 503);
  }

  const body = await request.json().catch(() => null);
  const parsed = parsePushSubscriptionBody(body);
  if (!parsed.ok) {
    return adminErrorResponse(ADMIN_ERROR_CODES.INVALID_REQUEST, 400);
  }

  const email = guard.user.email;
  if (!email) {
    return adminErrorResponse(ADMIN_ERROR_CODES.SESSION_EXPIRED, 401);
  }

  const saved = await upsertAdminPushSubscription({
    email,
    subscription: parsed.value,
    userAgent: request.headers.get("user-agent"),
  });

  if (!saved) {
    return adminErrorResponse(ADMIN_ERROR_CODES.UNAVAILABLE, 503);
  }

  logAdminAuthEvent("push_subscribed", ip);
  return jsonResponse({ ok: true }, 200);
}

export function GET() {
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
