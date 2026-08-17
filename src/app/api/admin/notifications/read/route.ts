import { requireAdminApi } from "@/lib/admin/require-admin-api";
import {
  adminErrorResponse,
  adminMethodNotAllowed,
} from "@/lib/admin/error-response";
import { ADMIN_ERROR_CODES } from "@/lib/admin/error-codes";
import { jsonResponse } from "@/lib/api/json-response";
import { markNewProjectInquiriesSeen } from "@/lib/project-inquiry/store";

export async function POST(request: Request) {
  const guard = await requireAdminApi(request);
  if (!guard.ok) return guard.response;

  try {
    const marked = await markNewProjectInquiriesSeen();
    return jsonResponse({ ok: true, marked }, 200);
  } catch {
    return adminErrorResponse(ADMIN_ERROR_CODES.UNAVAILABLE, 503);
  }
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
