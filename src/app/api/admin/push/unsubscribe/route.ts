import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { logAdminAuthEvent } from "@/lib/admin/audit-log";
import { ADMIN_ERROR_CODES } from "@/lib/admin/error-codes";
import {
  adminErrorResponse,
  adminMethodNotAllowed,
} from "@/lib/admin/error-response";
import { jsonResponse } from "@/lib/api/json-response";
import { deleteAdminPushSubscription } from "@/lib/admin/push/store";
import { getClientIp } from "@/lib/rate-limit-core";
import { FORM_SECURITY } from "@/lib/security/constants";
import { parseJsonBody } from "@/lib/security/parse-json-body";
import { z } from "zod";

const bodySchema = z.object({
  endpoint: z.string().trim().url().max(2048),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const guard = await requireAdminApi(request, { requireOrigin: true });
  if (!guard.ok) return guard.response;

  const contentType = request.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return adminErrorResponse(ADMIN_ERROR_CODES.INVALID_CONTENT_TYPE, 415);
  }

  const parsedBody = await parseJsonBody(request, FORM_SECURITY.MAX_BODY_BYTES);
  if (!parsedBody.ok) {
    return adminErrorResponse(ADMIN_ERROR_CODES.INVALID_REQUEST, 400);
  }

  const parsed = bodySchema.safeParse(parsedBody.body);
  if (!parsed.success) {
    return adminErrorResponse(ADMIN_ERROR_CODES.INVALID_REQUEST, 400);
  }

  await deleteAdminPushSubscription(parsed.data.endpoint);
  logAdminAuthEvent("push_unsubscribed", ip);
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
