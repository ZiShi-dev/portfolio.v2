import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { logAdminAuthEvent } from "@/lib/admin/audit-log";
import { ADMIN_ERROR_CODES } from "@/lib/admin/error-codes";
import {
  adminErrorResponse,
  adminMethodNotAllowed,
} from "@/lib/admin/error-response";
import { jsonResponse } from "@/lib/api/json-response";
import { isProjectInquiryStatus } from "@/lib/project-inquiry/schema";
import { listProjectInquiriesForAdmin } from "@/lib/project-inquiry/store";
import { getClientIp } from "@/lib/rate-limit-core";
import type { ProjectInquiryStatus } from "@/data/project-inquiry-options";

/** GET /api/admin/project-inquiries?status=new|all|… */
export async function GET(request: Request) {
  const ip = getClientIp(request);
  const guard = await requireAdminApi(request);
  if (!guard.ok) return guard.response;

  const url = new URL(request.url);
  const statusParam = url.searchParams.get("status") ?? "all";
  const status: ProjectInquiryStatus | "all" =
    statusParam === "all"
      ? "all"
      : isProjectInquiryStatus(statusParam)
        ? statusParam
        : "all";

  const result = await listProjectInquiriesForAdmin({ status });
  if (!result.ok) {
    return adminErrorResponse(ADMIN_ERROR_CODES.UNAVAILABLE, 503);
  }

  logAdminAuthEvent("project_inquiries_listed", ip);

  return jsonResponse(
    {
      ok: true,
      configured: result.configured,
      inquiries: result.inquiries,
    },
    200
  );
}

export function POST() {
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
