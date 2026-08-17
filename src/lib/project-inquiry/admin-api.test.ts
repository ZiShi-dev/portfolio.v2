import assert from "node:assert/strict";
import { after, before, describe, it, mock } from "node:test";
import { ADMIN_ERROR_CODES } from "@/lib/admin/error-codes";

describe("API admin project-inquiries", () => {
  let guardOk = true;
  let listRoute: typeof import("@/app/api/admin/project-inquiries/route");

  before(() => {
    mock.module("@/lib/admin/require-admin-api", {
      namedExports: {
        requireAdminApi: async () =>
          guardOk
            ? { ok: true as const, user: { id: "u", email: "a@b.c" } }
            : {
                ok: false as const,
                response: Response.json(
                  { code: ADMIN_ERROR_CODES.SESSION_EXPIRED },
                  { status: 401 }
                ),
              },
      },
    });

    mock.module("@/lib/project-inquiry/store", {
      namedExports: {
        listProjectInquiriesForAdmin: async () => ({
          ok: true,
          configured: true,
          inquiries: [],
        }),
        getProjectInquiryById: async () => null,
        updateProjectInquiry: async () => ({
          ok: false,
          reason: "invalid_id",
        }),
        deleteProjectInquiry: async () => false,
        countNewProjectInquiries: async () => 0,
        listUnseenNewProjectInquiries: async () => [],
        markNewProjectInquiriesSeen: async () => 0,
      },
    });

    mock.module("@/lib/admin/audit-log", {
      namedExports: { logAdminAuthEvent: () => undefined },
    });
  });

  before(async () => {
    listRoute = await import("@/app/api/admin/project-inquiries/route");
  });

  after(() => mock.reset());

  it("refuse sans session", async () => {
    guardOk = false;
    const res = await listRoute.GET(
      new Request("http://localhost/api/admin/project-inquiries")
    );
    assert.equal(res.status, 401);
  });

  it("liste ok", async () => {
    guardOk = true;
    const res = await listRoute.GET(
      new Request("http://localhost/api/admin/project-inquiries")
    );
    assert.equal(res.status, 200);
    const body = (await res.json()) as { ok?: boolean };
    assert.equal(body.ok, true);
  });
});
