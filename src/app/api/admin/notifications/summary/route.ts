import { requireAdminApi } from "@/lib/admin/require-admin-api";
import {
  adminErrorResponse,
  adminMethodNotAllowed,
} from "@/lib/admin/error-response";
import { ADMIN_ERROR_CODES } from "@/lib/admin/error-codes";
import { jsonResponse } from "@/lib/api/json-response";
import { countNewProjectInquiries, listUnseenNewProjectInquiries } from "@/lib/project-inquiry/store";

export async function GET(request: Request) {
  const guard = await requireAdminApi(request, { requireOrigin: false });
  if (!guard.ok) return guard.response;

  try {
    const [newInquiries, items] = await Promise.all([
      countNewProjectInquiries(),
      listUnseenNewProjectInquiries(),
    ]);
    return jsonResponse({ ok: true, newInquiries, items }, 200);
  } catch {
    return adminErrorResponse(ADMIN_ERROR_CODES.UNAVAILABLE, 503);
  }
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
