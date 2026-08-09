import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { logAdminAuthEvent } from "@/lib/admin/audit-log";
import { ADMIN_ERROR_CODES } from "@/lib/admin/error-codes";
import {
  adminErrorResponse,
  adminMethodNotAllowed,
} from "@/lib/admin/error-response";
import { jsonResponse } from "@/lib/api/json-response";
import {
  SERVICE_LIMITS,
  parseServiceReorderBody,
  parseServiceWriteBody,
} from "@/lib/services/schema";
import {
  createService,
  listServicesForAdmin,
  reorderServices,
} from "@/lib/services/store";
import { getClientIp } from "@/lib/rate-limit-core";
import { parseJsonBody } from "@/lib/security/parse-json-body";
import { isSupabaseServiceConfigured } from "@/lib/supabase/service";

/** GET /api/admin/services */
export async function GET(request: Request) {
  const ip = getClientIp(request);
  const guard = await requireAdminApi(request);
  if (!guard.ok) return guard.response;

  const result = await listServicesForAdmin();
  if (!result.ok) {
    return adminErrorResponse(ADMIN_ERROR_CODES.UNAVAILABLE, 503);
  }

  logAdminAuthEvent("services_listed", ip);

  return jsonResponse(
    {
      ok: true,
      configured: result.configured,
      services: result.services,
    },
    200
  );
}

/** POST /api/admin/services — create, or { action: "reorder", orderedIds } */
export async function POST(request: Request) {
  const ip = getClientIp(request);
  const guard = await requireAdminApi(request, { requireOrigin: true });
  if (!guard.ok) return guard.response;

  if (!isSupabaseServiceConfigured()) {
    return adminErrorResponse(ADMIN_ERROR_CODES.UNAVAILABLE, 503);
  }

  const contentType = request.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return adminErrorResponse(ADMIN_ERROR_CODES.INVALID_CONTENT_TYPE, 415);
  }

  const parsedBody = await parseJsonBody(request, SERVICE_LIMITS.maxBodyBytes);
  if (!parsedBody.ok) {
    return adminErrorResponse(ADMIN_ERROR_CODES.INVALID_REQUEST, 400);
  }

  const body = parsedBody.body as Record<string, unknown> | null;
  if (body && body.action === "reorder") {
    const parsed = parseServiceReorderBody(body);
    if (!parsed.ok) {
      return jsonResponse(
        { error: parsed.error, code: ADMIN_ERROR_CODES.INVALID_REQUEST },
        400
      );
    }
    const result = await reorderServices(parsed.values.orderedIds);
    if (!result.ok) {
      return adminErrorResponse(ADMIN_ERROR_CODES.UNAVAILABLE, 503);
    }
    logAdminAuthEvent("services_reordered", ip);
    const { revalidateServiceSurfaces } = await import(
      "@/lib/services/revalidate"
    );
    revalidateServiceSurfaces();
    return jsonResponse({ ok: true }, 200);
  }

  const parsed = parseServiceWriteBody(parsedBody.body);
  if (!parsed.ok) {
    return jsonResponse(
      { error: parsed.error, code: ADMIN_ERROR_CODES.INVALID_REQUEST },
      400
    );
  }

  const created = await createService(parsed.values);
  if (!created.ok) {
    if (
      created.reason === "duplicate_slug" ||
      created.reason === "duplicate_reference"
    ) {
      return jsonResponse(
        { error: created.reason, code: ADMIN_ERROR_CODES.INVALID_REQUEST },
        409
      );
    }
    logAdminAuthEvent("service_create_failed", ip, { reason: created.reason });
    return adminErrorResponse(ADMIN_ERROR_CODES.UNAVAILABLE, 503);
  }

  logAdminAuthEvent("service_created", ip);
  const { revalidateServiceSurfaces } = await import(
    "@/lib/services/revalidate"
  );
  revalidateServiceSurfaces(created.service.slug);
  return jsonResponse({ ok: true, service: created.service }, 201);
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
