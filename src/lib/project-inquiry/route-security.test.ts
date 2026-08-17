import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it, mock } from "node:test";

const SERVICE_ID = "123e4567-e89b-42d3-a456-426614174000";

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    projectType: "web_app",
    objective: "create_product",
    budgetRange: "1000_3000",
    timeline: "1_3_months",
    targetLaunchDate: null,
    description: "Une application complète pour gérer mon activité.",
    name: "Alex Martin",
    email: "alex@example.com",
    phone: null,
    whatsapp: null,
    company: null,
    currentWebsite: null,
    locale: "fr",
    source: "site",
    serviceId: null,
    serviceReference: null,
    _honeypot: "",
    ...overrides,
  };
}

describe("POST /api/project-inquiry — persistance et attribution", () => {
  let requestBody: unknown;
  let existing: { reference: string } | null;
  let createResult: unknown;
  let lastCreateInput: unknown;
  let publishedService: { id: string; reference: string } | null;
  let route: typeof import("@/app/api/project-inquiry/route");

  before(() => {
    mock.module("@/lib/api/parse-form-request", {
      namedExports: {
        parseFormRequest: async () => ({
          ok: true as const,
          body: requestBody,
          ip: "203.0.113.42",
        }),
      },
    });
    mock.module("@/lib/project-inquiry/store", {
      namedExports: {
        getProjectInquiryByFingerprint: async () => existing,
        createProjectInquiry: async (input: unknown) => {
          lastCreateInput = input;
          return createResult;
        },
      },
    });
    mock.module("@/lib/services/store", {
      namedExports: {
        getPublishedServiceById: async () => publishedService,
      },
    });
    mock.module("@/lib/security/project-inquiry-daily-limit", {
      namedExports: {
        checkProjectInquiryIpDailyLimit: async () => ({ allowed: true }),
        checkProjectInquiryEmailDailyLimit: async () => ({ allowed: true }),
      },
    });
    mock.module("@/lib/security/email-submission-limit", {
      namedExports: {
        checkEmailSubmissionLimit: () => ({ allowed: true }),
      },
    });
    mock.module("@/lib/supabase/service", {
      namedExports: {
        isSupabaseServiceConfigured: () => true,
      },
    });
    mock.module("@/lib/security/audit-log", {
      namedExports: { logFormSecurityEvent: () => undefined },
    });
    mock.module("@/lib/admin/push/notify", {
      namedExports: { notifyAdminsOfNewInquiry: async () => undefined },
    });
  });

  before(async () => {
    route = await import("@/app/api/project-inquiry/route");
  });

  after(() => mock.reset());

  beforeEach(() => {
    requestBody = validBody();
    existing = null;
    publishedService = null;
    lastCreateInput = null;
    createResult = { ok: false, reason: "persist_failed" };
  });

  it("ne transforme pas un échec de persistance en faux succès au nouvel essai", async () => {
    const first = await route.POST(
      new Request("http://localhost/api/project-inquiry", { method: "POST" })
    );
    assert.equal(first.status, 503);

    createResult = {
      ok: true,
      inquiry: { reference: "VZ—LEAD 101" },
    };
    const retry = await route.POST(
      new Request("http://localhost/api/project-inquiry", { method: "POST" })
    );
    assert.equal(retry.status, 200);
    const body = (await retry.json()) as { reference?: string };
    assert.equal(body.reference, "VZ—LEAD 101");
  });

  it("ne reconnaît comme doublon qu'une ligne déjà persistée", async () => {
    existing = { reference: "VZ—LEAD 077" };
    const response = await route.POST(
      new Request("http://localhost/api/project-inquiry", { method: "POST" })
    );
    assert.equal(response.status, 200);
    assert.equal(lastCreateInput, null);
    const body = (await response.json()) as { reference?: string };
    assert.equal(body.reference, "VZ—LEAD 077");
  });

  it("remplace la référence d'offre forgée par celle du service publié", async () => {
    requestBody = validBody({
      source: "service-buy",
      serviceId: SERVICE_ID,
      serviceReference: "FORGED-REF",
    });
    publishedService = { id: SERVICE_ID, reference: "VZ-SVC-004" };
    createResult = {
      ok: true,
      inquiry: { reference: "VZ—LEAD 102" },
    };

    const response = await route.POST(
      new Request("http://localhost/api/project-inquiry", { method: "POST" })
    );
    assert.equal(response.status, 200);
    const saved = lastCreateInput as {
      data: { serviceReference: string; source: string };
    };
    assert.equal(saved.data.serviceReference, "VZ-SVC-004");
    assert.equal(saved.data.source, "service-buy");
  });
});
