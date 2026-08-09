import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { logAdminAuthEvent } from "@/lib/admin/audit-log";
import { ADMIN_ERROR_CODES } from "@/lib/admin/error-codes";
import {
  adminErrorResponse,
  adminMethodNotAllowed,
} from "@/lib/admin/error-response";
import { jsonResponse } from "@/lib/api/json-response";
import {
  PROJECT_INQUIRY_LIMITS,
  parseProjectInquiryAdminPatch,
} from "@/lib/project-inquiry/schema";
import {
  deleteProjectInquiry,
  getProjectInquiryById,
  updateProjectInquiry,
} from "@/lib/project-inquiry/store";
import { getClientIp } from "@/lib/rate-limit-core";
import { parseJsonBody } from "@/lib/security/parse-json-body";
import { isSupabaseServiceConfigured } from "@/lib/supabase/service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/** GET /api/admin/project-inquiries/[id] */
export async function GET(request: Request, context: RouteContext) {
  const guard = await requireAdminApi(request);
  if (!guard.ok) return guard.response;

  const { id } = await context.params;
  const inquiry = await getProjectInquiryById(id);
  if (!inquiry) {
    return adminErrorResponse(ADMIN_ERROR_CODES.INVALID_REQUEST, 404);
  }

  return jsonResponse({ ok: true, inquiry }, 200);
}

/** PATCH /api/admin/project-inquiries/[id] */
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

  const parsedBody = await parseJsonBody(
    request,
    PROJECT_INQUIRY_LIMITS.maxBodyBytes
  );
  if (!parsedBody.ok) {
    return adminErrorResponse(ADMIN_ERROR_CODES.INVALID_REQUEST, 400);
  }

  const parsed = parseProjectInquiryAdminPatch(parsedBody.body);
  if (!parsed.ok) {
    return jsonResponse(
      { error: parsed.error, code: ADMIN_ERROR_CODES.INVALID_REQUEST },
      400
    );
  }

  const updated = await updateProjectInquiry(id, parsed.values);
  if (!updated.ok) {
    if (updated.reason === "invalid_id") {
      return jsonResponse(
        { error: "invalid_id", code: ADMIN_ERROR_CODES.INVALID_REQUEST },
        400
      );
    }
    return adminErrorResponse(ADMIN_ERROR_CODES.UNAVAILABLE, 503);
  }

  logAdminAuthEvent("project_inquiry_updated", ip);
  return jsonResponse({ ok: true, inquiry: updated.inquiry }, 200);
}

/** DELETE /api/admin/project-inquiries/[id] */
export async function DELETE(request: Request, context: RouteContext) {
  const ip = getClientIp(request);
  const guard = await requireAdminApi(request, { requireOrigin: true });
  if (!guard.ok) return guard.response;

  if (!isSupabaseServiceConfigured()) {
    return adminErrorResponse(ADMIN_ERROR_CODES.UNAVAILABLE, 503);
  }

  const { id } = await context.params;
  const ok = await deleteProjectInquiry(id);
  if (!ok) {
    return adminErrorResponse(ADMIN_ERROR_CODES.INTERNAL, 502);
  }

  logAdminAuthEvent("project_inquiry_deleted", ip);
  return jsonResponse({ ok: true, id }, 200);
}

export function POST() {
  return adminMethodNotAllowed();
}

export function PUT() {
  return adminMethodNotAllowed();
}
