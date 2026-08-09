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
  parseEngagementReorderBody,
  parseEngagementWriteBody,
} from "@/lib/engagements/schema";
import {
  createEngagement,
  listEngagementsForAdmin,
  reorderEngagements,
} from "@/lib/engagements/store";
import { getClientIp } from "@/lib/rate-limit-core";
import { parseJsonBody } from "@/lib/security/parse-json-body";
import { isSupabaseServiceConfigured } from "@/lib/supabase/service";

/** GET /api/admin/engagements */
export async function GET(request: Request) {
  const ip = getClientIp(request);
  const guard = await requireAdminApi(request);
  if (!guard.ok) return guard.response;

  const result = await listEngagementsForAdmin();
  if (!result.ok) {
    return adminErrorResponse(ADMIN_ERROR_CODES.UNAVAILABLE, 503);
  }

  logAdminAuthEvent("engagements_listed", ip);

  return jsonResponse(
    {
      ok: true,
      configured: result.configured,
      engagements: result.engagements,
    },
    200
  );
}

/** POST /api/admin/engagements — create, or { action: "reorder", orderedIds } */
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

  const parsedBody = await parseJsonBody(
    request,
    ENGAGEMENT_LIMITS.maxBodyBytes
  );
  if (!parsedBody.ok) {
    return adminErrorResponse(ADMIN_ERROR_CODES.INVALID_REQUEST, 400);
  }

  const body = parsedBody.body as Record<string, unknown> | null;
  if (body && body.action === "reorder") {
    const parsed = parseEngagementReorderBody(body);
    if (!parsed.ok) {
      return jsonResponse(
        { error: parsed.error, code: ADMIN_ERROR_CODES.INVALID_REQUEST },
        400
      );
    }
    const result = await reorderEngagements(parsed.values.orderedIds);
    if (!result.ok) {
      return adminErrorResponse(ADMIN_ERROR_CODES.UNAVAILABLE, 503);
    }
    logAdminAuthEvent("engagements_reordered", ip);
    const { revalidateEngagementSurfaces } = await import(
      "@/lib/engagements/revalidate"
    );
    revalidateEngagementSurfaces();
    return jsonResponse({ ok: true }, 200);
  }

  const parsed = parseEngagementWriteBody(body);
  if (!parsed.ok) {
    return jsonResponse(
      { error: parsed.error, code: ADMIN_ERROR_CODES.INVALID_REQUEST },
      400
    );
  }

  const created = await createEngagement(parsed.values);
  if (!created.ok) {
    if (created.reason === "duplicate_reference") {
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

  logAdminAuthEvent("engagement_created", ip);
  const { revalidateEngagementSurfaces } = await import(
    "@/lib/engagements/revalidate"
  );
  revalidateEngagementSurfaces();

  return jsonResponse({ ok: true, engagement: created.engagement }, 201);
}

export async function PUT() {
  return adminMethodNotAllowed();
}

export async function PATCH() {
  return adminMethodNotAllowed();
}

export async function DELETE() {
  return adminMethodNotAllowed();
}
