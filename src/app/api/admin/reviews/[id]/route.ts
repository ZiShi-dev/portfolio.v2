import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { logAdminAuthEvent } from "@/lib/admin/audit-log";
import { ADMIN_ERROR_CODES } from "@/lib/admin/error-codes";
import {
  adminErrorResponse,
  adminMethodNotAllowed,
} from "@/lib/admin/error-response";
import { jsonResponse } from "@/lib/api/json-response";
import { isValidReviewStatus } from "@/lib/reviews/admin-query";
import {
  deleteReview,
  updateReviewProjectId,
  updateReviewStatus,
  type ReviewStatus,
} from "@/lib/reviews/store";
import { getClientIp } from "@/lib/rate-limit-core";
import { parseJsonBody } from "@/lib/security/parse-json-body";
import { isSupabaseServiceConfigured } from "@/lib/supabase/service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** PATCH — status et/ou liaison projet. DELETE — suppression. */
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

  const parsedBody = await parseJsonBody(request, 4_096);
  if (!parsedBody.ok) {
    return adminErrorResponse(ADMIN_ERROR_CODES.INVALID_REQUEST, 400);
  }

  const body = parsedBody.body as {
    status?: string;
    projectId?: string | null;
  };

  let touched = false;

  if (body.projectId !== undefined) {
    const projectId =
      body.projectId === null || body.projectId === ""
        ? null
        : body.projectId;
    if (projectId !== null && !UUID_RE.test(projectId)) {
      return adminErrorResponse(ADMIN_ERROR_CODES.INVALID_REQUEST, 400);
    }
    const ok = await updateReviewProjectId(id, projectId);
    if (!ok) {
      return adminErrorResponse(ADMIN_ERROR_CODES.INTERNAL, 502);
    }
    touched = true;
    logAdminAuthEvent("review_updated", ip, {
      projectLinked: Boolean(projectId),
    });
  }

  if (body.status !== undefined) {
    if (!isValidReviewStatus(body.status)) {
      return adminErrorResponse(ADMIN_ERROR_CODES.INVALID_REQUEST, 400);
    }
    const ok = await updateReviewStatus(id, body.status as ReviewStatus);
    if (!ok) {
      return adminErrorResponse(ADMIN_ERROR_CODES.INTERNAL, 502);
    }
    touched = true;
    logAdminAuthEvent("review_updated", ip, { status: body.status });
  }

  if (!touched) {
    return adminErrorResponse(ADMIN_ERROR_CODES.INVALID_REQUEST, 400);
  }

  const { revalidateReviewSurfaces } = await import(
    "@/lib/reviews/revalidate"
  );
  revalidateReviewSurfaces();

  return jsonResponse(
    {
      ok: true,
      id,
      ...(body.status ? { status: body.status } : {}),
      ...(body.projectId !== undefined
        ? { projectId: body.projectId || null }
        : {}),
    },
    200
  );
}

export async function DELETE(request: Request, context: RouteContext) {
  const ip = getClientIp(request);
  const guard = await requireAdminApi(request, { requireOrigin: true });
  if (!guard.ok) return guard.response;

  if (!isSupabaseServiceConfigured()) {
    return adminErrorResponse(ADMIN_ERROR_CODES.UNAVAILABLE, 503);
  }

  const { id } = await context.params;
  const ok = await deleteReview(id);
  if (!ok) {
    return adminErrorResponse(ADMIN_ERROR_CODES.INTERNAL, 502);
  }

  logAdminAuthEvent("review_deleted", ip);
  const { revalidateReviewSurfaces } = await import(
    "@/lib/reviews/revalidate"
  );
  revalidateReviewSurfaces();
  return jsonResponse({ ok: true, id }, 200);
}

export function GET() {
  return adminMethodNotAllowed();
}

export function POST() {
  return adminMethodNotAllowed();
}
