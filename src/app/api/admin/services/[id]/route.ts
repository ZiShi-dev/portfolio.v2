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
  parseServicePatchBody,
} from "@/lib/services/schema";
import {
  deleteService,
  duplicateService,
  getServiceByIdForAdmin,
  updateService,
} from "@/lib/services/store";
import { getClientIp } from "@/lib/rate-limit-core";
import { parseJsonBody } from "@/lib/security/parse-json-body";
import { isSupabaseServiceConfigured } from "@/lib/supabase/service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/** GET /api/admin/services/[id] */
export async function GET(request: Request, context: RouteContext) {
  const guard = await requireAdminApi(request);
  if (!guard.ok) return guard.response;

  if (!isSupabaseServiceConfigured()) {
    return adminErrorResponse(ADMIN_ERROR_CODES.UNAVAILABLE, 503);
  }

  const { id } = await context.params;
  const service = await getServiceByIdForAdmin(id);
  if (!service) {
    return adminErrorResponse(ADMIN_ERROR_CODES.INVALID_REQUEST, 404);
  }

  return jsonResponse({ ok: true, service }, 200);
}

/** PATCH /api/admin/services/[id] — update, or { action: "duplicate" } */
export async function PATCH(request: Request, context: RouteContext) {
  const ip = getClientIp(request);
  const guard = await requireAdminApi(request, { requireOrigin: true });
  if (!guard.ok) return guard.response;

  if (!isSupabaseServiceConfigured()) {
    return adminErrorResponse(ADMIN_ERROR_CODES.UNAVAILABLE, 503);
  }

  const { id } = await context.params;
  const contentType = request.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return adminErrorResponse(ADMIN_ERROR_CODES.INVALID_CONTENT_TYPE, 415);
  }

  const parsedBody = await parseJsonBody(request, SERVICE_LIMITS.maxBodyBytes);
  if (!parsedBody.ok) {
    return adminErrorResponse(ADMIN_ERROR_CODES.INVALID_REQUEST, 400);
  }

  const body = parsedBody.body as Record<string, unknown> | null;
  if (body && body.action === "duplicate") {
    const duplicated = await duplicateService(id);
    if (!duplicated.ok) {
      if (
        duplicated.reason === "invalid_id" ||
        duplicated.reason === "not_found"
      ) {
        return jsonResponse(
          { error: duplicated.reason, code: ADMIN_ERROR_CODES.INVALID_REQUEST },
          400
        );
      }
      if (
        duplicated.reason === "duplicate_slug" ||
        duplicated.reason === "duplicate_reference"
      ) {
        return jsonResponse(
          { error: duplicated.reason, code: ADMIN_ERROR_CODES.INVALID_REQUEST },
          409
        );
      }
      logAdminAuthEvent("service_create_failed", ip, {
        reason: duplicated.reason,
      });
      return adminErrorResponse(ADMIN_ERROR_CODES.UNAVAILABLE, 503);
    }
    logAdminAuthEvent("service_duplicated", ip);
    const { revalidateServiceSurfaces } = await import(
      "@/lib/services/revalidate"
    );
    revalidateServiceSurfaces(duplicated.service.slug);
    return jsonResponse({ ok: true, service: duplicated.service }, 201);
  }

  const parsed = parseServicePatchBody(parsedBody.body);
  if (!parsed.ok) {
    return jsonResponse(
      { error: parsed.error, code: ADMIN_ERROR_CODES.INVALID_REQUEST },
      400
    );
  }

  const updated = await updateService(id, parsed.values);
  if (!updated.ok) {
    if (
      updated.reason === "invalid_id" ||
      updated.reason === "not_found" ||
      updated.reason === "duplicate_slug" ||
      updated.reason === "duplicate_reference" ||
      updated.reason === "publish_incomplete"
    ) {
      return jsonResponse(
        {
          error: updated.reason,
          code: ADMIN_ERROR_CODES.INVALID_REQUEST,
        },
        updated.reason === "duplicate_slug" ||
          updated.reason === "duplicate_reference"
          ? 409
          : 400
      );
    }
    logAdminAuthEvent("service_update_failed", ip, { reason: updated.reason });
    return adminErrorResponse(ADMIN_ERROR_CODES.UNAVAILABLE, 503);
  }

  logAdminAuthEvent("service_updated", ip);
  const { revalidateServiceSurfaces } = await import(
    "@/lib/services/revalidate"
  );
  revalidateServiceSurfaces(updated.service.slug);
  return jsonResponse({ ok: true, service: updated.service }, 200);
}

/** DELETE /api/admin/services/[id] */
export async function DELETE(request: Request, context: RouteContext) {
  const ip = getClientIp(request);
  const guard = await requireAdminApi(request, { requireOrigin: true });
  if (!guard.ok) return guard.response;

  if (!isSupabaseServiceConfigured()) {
    return adminErrorResponse(ADMIN_ERROR_CODES.UNAVAILABLE, 503);
  }

  const { id } = await context.params;
  const ok = await deleteService(id);
  if (!ok) {
    return adminErrorResponse(ADMIN_ERROR_CODES.INTERNAL, 502);
  }

  logAdminAuthEvent("service_deleted", ip);
  const { revalidateServiceSurfaces } = await import(
    "@/lib/services/revalidate"
  );
  revalidateServiceSurfaces();
  return jsonResponse({ ok: true, id }, 200);
}

export function POST() {
  return adminMethodNotAllowed();
}

export function PUT() {
  return adminMethodNotAllowed();
}
