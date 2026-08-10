import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { logAdminAuthEvent } from "@/lib/admin/audit-log";
import { ADMIN_ERROR_CODES } from "@/lib/admin/error-codes";
import {
  adminErrorResponse,
  adminMethodNotAllowed,
} from "@/lib/admin/error-response";
import { jsonResponse } from "@/lib/api/json-response";
import {
  FAQ_LIMITS,
  parseFaqReorderBody,
  parseFaqWriteBody,
} from "@/lib/faqs/schema";
import {
  createFaq,
  listFaqsForAdmin,
  reorderFaqs,
} from "@/lib/faqs/store";
import { revalidateFaqSurfaces } from "@/lib/faqs/revalidate";
import { getClientIp } from "@/lib/rate-limit-core";
import { parseJsonBody } from "@/lib/security/parse-json-body";
import { isSupabaseServiceConfigured } from "@/lib/supabase/service";

/** GET /api/admin/faqs */
export async function GET(request: Request) {
  const ip = getClientIp(request);
  const guard = await requireAdminApi(request);
  if (!guard.ok) return guard.response;

  const result = await listFaqsForAdmin();
  if (!result.ok) {
    return adminErrorResponse(ADMIN_ERROR_CODES.UNAVAILABLE, 503);
  }

  logAdminAuthEvent("faqs_listed", ip);

  return jsonResponse(
    {
      ok: true,
      configured: result.configured,
      faqs: result.faqs,
    },
    200
  );
}

/** POST /api/admin/faqs — create, or { action: "reorder", orderedIds } */
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

  const parsedBody = await parseJsonBody(request, FAQ_LIMITS.maxBodyBytes);
  if (!parsedBody.ok) {
    return adminErrorResponse(ADMIN_ERROR_CODES.INVALID_REQUEST, 400);
  }

  const body = parsedBody.body as Record<string, unknown> | null;
  if (body && body.action === "reorder") {
    const parsed = parseFaqReorderBody(body);
    if (!parsed.ok) {
      return jsonResponse(
        { error: parsed.error, code: ADMIN_ERROR_CODES.INVALID_REQUEST },
        400
      );
    }
    const result = await reorderFaqs(parsed.values.orderedIds);
    if (!result.ok) {
      return adminErrorResponse(ADMIN_ERROR_CODES.UNAVAILABLE, 503);
    }
    logAdminAuthEvent("faqs_reordered", ip);
    revalidateFaqSurfaces();
    return jsonResponse({ ok: true }, 200);
  }

  const parsed = parseFaqWriteBody(body);
  if (!parsed.ok) {
    return jsonResponse(
      { error: parsed.error, code: ADMIN_ERROR_CODES.INVALID_REQUEST },
      400
    );
  }

  const created = await createFaq(parsed.values);
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

  logAdminAuthEvent("faq_created", ip);
  revalidateFaqSurfaces();

  return jsonResponse({ ok: true, faq: created.faq }, 201);
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
