import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { logAdminAuthEvent } from "@/lib/admin/audit-log";
import { ADMIN_ERROR_CODES } from "@/lib/admin/error-codes";
import {
  adminErrorResponse,
  adminMethodNotAllowed,
} from "@/lib/admin/error-response";
import { jsonResponse } from "@/lib/api/json-response";
import { FAQ_LIMITS, parseFaqPatchBody } from "@/lib/faqs/schema";
import {
  deleteFaq,
  duplicateFaq,
  getFaqByIdForAdmin,
  updateFaq,
} from "@/lib/faqs/store";
import { revalidateFaqSurfaces } from "@/lib/faqs/revalidate";
import { getClientIp } from "@/lib/rate-limit-core";
import { parseJsonBody } from "@/lib/security/parse-json-body";
import { isSupabaseServiceConfigured } from "@/lib/supabase/service";

type RouteContext = { params: Promise<{ id: string }> };

/** GET /api/admin/faqs/[id] */
export async function GET(request: Request, context: RouteContext) {
  const ip = getClientIp(request);
  const guard = await requireAdminApi(request);
  if (!guard.ok) return guard.response;

  const { id } = await context.params;
  const faq = await getFaqByIdForAdmin(id);
  if (!faq) {
    return adminErrorResponse(ADMIN_ERROR_CODES.INVALID_REQUEST, 404);
  }

  logAdminAuthEvent("faq_viewed", ip);
  return jsonResponse({ ok: true, faq }, 200);
}

/** PATCH /api/admin/faqs/[id] — update, archive, or duplicate */
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

  const parsedBody = await parseJsonBody(request, FAQ_LIMITS.maxBodyBytes);
  if (!parsedBody.ok) {
    return adminErrorResponse(ADMIN_ERROR_CODES.INVALID_REQUEST, 400);
  }

  const { id } = await context.params;
  const body = parsedBody.body as Record<string, unknown> | null;

  if (body && body.action === "archive") {
    const result = await updateFaq(id, { status: "archived" });
    if (!result.ok) {
      if (result.reason === "not_found" || result.reason === "invalid_id") {
        return adminErrorResponse(ADMIN_ERROR_CODES.INVALID_REQUEST, 404);
      }
      return adminErrorResponse(ADMIN_ERROR_CODES.UNAVAILABLE, 503);
    }
    logAdminAuthEvent("faq_archived", ip);
    revalidateFaqSurfaces();
    return jsonResponse({ ok: true, faq: result.faq }, 200);
  }

  if (body && body.action === "duplicate") {
    const result = await duplicateFaq(id);
    if (!result.ok) {
      if (result.reason === "not_found" || result.reason === "invalid_id") {
        return adminErrorResponse(ADMIN_ERROR_CODES.INVALID_REQUEST, 404);
      }
      if (result.reason === "duplicate_reference") {
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
    logAdminAuthEvent("faq_duplicated", ip);
    revalidateFaqSurfaces();
    return jsonResponse({ ok: true, faq: result.faq }, 201);
  }

  const parsed = parseFaqPatchBody(body);
  if (!parsed.ok) {
    return jsonResponse(
      { error: parsed.error, code: ADMIN_ERROR_CODES.INVALID_REQUEST },
      400
    );
  }

  const updated = await updateFaq(id, parsed.values);
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
    if (
      updated.reason === "publish_requires_question" ||
      updated.reason === "publish_requires_answer"
    ) {
      return jsonResponse(
        {
          error: updated.reason,
          code: ADMIN_ERROR_CODES.INVALID_REQUEST,
        },
        400
      );
    }
    return adminErrorResponse(ADMIN_ERROR_CODES.UNAVAILABLE, 503);
  }

  logAdminAuthEvent("faq_updated", ip);
  revalidateFaqSurfaces();

  return jsonResponse({ ok: true, faq: updated.faq }, 200);
}

/** DELETE /api/admin/faqs/[id] */
export async function DELETE(request: Request, context: RouteContext) {
  const ip = getClientIp(request);
  const guard = await requireAdminApi(request, { requireOrigin: true });
  if (!guard.ok) return guard.response;

  if (!isSupabaseServiceConfigured()) {
    return adminErrorResponse(ADMIN_ERROR_CODES.UNAVAILABLE, 503);
  }

  const { id } = await context.params;
  const result = await deleteFaq(id);
  if (!result.ok) {
    if (result.reason === "not_found" || result.reason === "invalid_id") {
      return adminErrorResponse(ADMIN_ERROR_CODES.INVALID_REQUEST, 404);
    }
    return adminErrorResponse(ADMIN_ERROR_CODES.UNAVAILABLE, 503);
  }

  logAdminAuthEvent("faq_deleted", ip);
  revalidateFaqSurfaces();

  return jsonResponse({ ok: true }, 200);
}

export async function PUT() {
  return adminMethodNotAllowed();
}

export async function POST() {
  return adminMethodNotAllowed();
}
