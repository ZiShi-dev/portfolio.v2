import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { logAdminAuthEvent } from "@/lib/admin/audit-log";
import { ADMIN_ERROR_CODES } from "@/lib/admin/error-codes";
import {
  adminErrorResponse,
  adminMethodNotAllowed,
} from "@/lib/admin/error-response";
import { jsonResponse } from "@/lib/api/json-response";
import {
  ENGAGEMENT_LIMITS,
  parseEngagementPatchBody,
} from "@/lib/engagements/schema";
import {
  deleteEngagement,
  getEngagementByIdForAdmin,
  updateEngagement,
} from "@/lib/engagements/store";
import { getClientIp } from "@/lib/rate-limit-core";
import { parseJsonBody } from "@/lib/security/parse-json-body";
import { isSupabaseServiceConfigured } from "@/lib/supabase/service";

type RouteContext = { params: Promise<{ id: string }> };

/** GET /api/admin/engagements/[id] */
export async function GET(request: Request, context: RouteContext) {
  const ip = getClientIp(request);
  const guard = await requireAdminApi(request);
  if (!guard.ok) return guard.response;

  const { id } = await context.params;
  const engagement = await getEngagementByIdForAdmin(id);
  if (!engagement) {
    return adminErrorResponse(ADMIN_ERROR_CODES.INVALID_REQUEST, 404);
  }

  logAdminAuthEvent("engagement_viewed", ip);
  return jsonResponse({ ok: true, engagement }, 200);
}

/** PATCH /api/admin/engagements/[id] */
export async function PATCH(request: Request, context: RouteContext) {
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

  const parsedBody = await parseJsonBody(
    request,
    ENGAGEMENT_LIMITS.maxBodyBytes
  );
  if (!parsedBody.ok) {
    return adminErrorResponse(ADMIN_ERROR_CODES.INVALID_REQUEST, 400);
  }

  const { id } = await context.params;
  const body = parsedBody.body as Record<string, unknown> | null;

  if (body && body.action === "archive") {
    const result = await updateEngagement(id, { status: "archived" });
    if (!result.ok) {
      if (result.reason === "not_found" || result.reason === "invalid_id") {
        return adminErrorResponse(ADMIN_ERROR_CODES.INVALID_REQUEST, 404);
      }
      return adminErrorResponse(ADMIN_ERROR_CODES.UNAVAILABLE, 503);
    }
    logAdminAuthEvent("engagement_archived", ip);
    const { revalidateEngagementSurfaces } = await import(
      "@/lib/engagements/revalidate"
    );
    revalidateEngagementSurfaces();
    return jsonResponse({ ok: true, engagement: result.engagement }, 200);
  }

  const parsed = parseEngagementPatchBody(body);
  if (!parsed.ok) {
    return jsonResponse(
      { error: parsed.error, code: ADMIN_ERROR_CODES.INVALID_REQUEST },
      400
    );
  }

  const updated = await updateEngagement(id, parsed.values);
  if (!updated.ok) {
    if (updated.reason === "not_found" || updated.reason === "invalid_id") {
      return adminErrorResponse(ADMIN_ERROR_CODES.INVALID_REQUEST, 404);
    }
    if (updated.reason === "duplicate_reference") {
      return jsonResponse(
        {
          error: "duplicate_reference",
          code: ADMIN_ERROR_CODES.INVALID_REQUEST,
        },
        409
      );
    }
    return adminErrorResponse(ADMIN_ERROR_CODES.UNAVAILABLE, 503);
  }

  logAdminAuthEvent("engagement_updated", ip);
  const { revalidateEngagementSurfaces } = await import(
    "@/lib/engagements/revalidate"
  );
  revalidateEngagementSurfaces();

  return jsonResponse({ ok: true, engagement: updated.engagement }, 200);
}

/** DELETE /api/admin/engagements/[id] */
export async function DELETE(request: Request, context: RouteContext) {
  const ip = getClientIp(request);
  const guard = await requireAdminApi(request, { requireOrigin: true });
  if (!guard.ok) return guard.response;

  if (!isSupabaseServiceConfigured()) {
    return adminErrorResponse(ADMIN_ERROR_CODES.UNAVAILABLE, 503);
  }

  const { id } = await context.params;
  const result = await deleteEngagement(id);
  if (!result.ok) {
    if (result.reason === "not_found" || result.reason === "invalid_id") {
      return adminErrorResponse(ADMIN_ERROR_CODES.INVALID_REQUEST, 404);
    }
    return adminErrorResponse(ADMIN_ERROR_CODES.UNAVAILABLE, 503);
  }

  logAdminAuthEvent("engagement_deleted", ip);
  const { revalidateEngagementSurfaces } = await import(
    "@/lib/engagements/revalidate"
  );
  revalidateEngagementSurfaces();

  return jsonResponse({ ok: true }, 200);
}

export async function PUT() {
  return adminMethodNotAllowed();
}

export async function POST() {
  return adminMethodNotAllowed();
}
