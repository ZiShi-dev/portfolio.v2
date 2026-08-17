import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it, mock } from "node:test";

type MockResult = {
  data?: unknown;
  error?: { code?: string; message?: string } | null;
};

function createProjectsClient(
  resolver: (op: {
    table: string;
    method: "select" | "insert" | "update" | "delete";
    payload?: unknown;
    filters: Array<{ type: string; args: unknown[] }>;
  }) => MockResult
) {
  let table = "";
  let method: "select" | "insert" | "update" | "delete" = "select";
  let payload: unknown;
  const filters: Array<{ type: string; args: unknown[] }> = [];

  const finish = () => resolver({ table, method, payload, filters });
  const api: Record<string, unknown> = {};
  const chain = () => api;

  api.from = (t: string) => {
    table = t;
    filters.length = 0;
    payload = undefined;
    method = "select";
    return chain();
  };
  api.insert = (row: unknown) => {
    method = "insert";
    payload = row;
    return chain();
  };
  api.update = (row: unknown) => {
    method = "update";
    payload = row;
    return chain();
  };
  api.delete = () => {
    method = "delete";
    return chain();
  };
  api.select = (...args: unknown[]) => {
    filters.push({ type: "select", args });
    return chain();
  };
  api.eq = (...args: unknown[]) => {
    filters.push({ type: "eq", args });
    return chain();
  };
  api.order = (...args: unknown[]) => {
    filters.push({ type: "order", args });
    return chain();
  };
  api.limit = (...args: unknown[]) => {
    filters.push({ type: "limit", args });
    return chain();
  };
  api.not = (...args: unknown[]) => {
    filters.push({ type: "not", args });
    return chain();
  };
  api.single = async () => finish();
  api.maybeSingle = async () => finish();
  api.then = (
    resolve: (v: MockResult) => unknown,
    reject?: (e: unknown) => unknown
  ) => Promise.resolve(finish()).then(resolve, reject);

  return api;
}

const sampleRow = {
  id: "08d86636-9162-4aca-9fb8-b2f77ad90539",
  created_at: "2026-07-16T00:00:00Z",
  updated_at: "2026-07-16T00:00:00Z",
  slug: "nova",
  reference: "VZ—CASE 001",
  title: { fr: "Nova FR", en: "Nova EN", ar: "Nova AR" },
  description: {
    fr: "Desc FR assez longue ici.",
    en: "Desc EN long enough here.",
    ar: "وصف عربي كافٍ هنا فعلا.",
  },
  kind: "personal",
  business_type_ids: ["dashboard"],
  images: [
    {
      url: "https://abc.supabase.co/storage/v1/object/public/portfolio-projects/a.jpg",
    },
  ],
  link: null,
  app_link: null,
  sort_order: 0,
  published: true,
  featured: false,
  cover_image: null,
  technologies: [],
  features: [],
  client_need: { fr: "", en: "", ar: "" },
  objective: { fr: "", en: "", ar: "" },
  solution: { fr: "", en: "", ar: "" },
  result: { fr: "", en: "", ar: "" },
  seo_title: { fr: "", en: "", ar: "" },
  seo_description: { fr: "", en: "", ar: "" },
  listing_price_cents: null as number | null,
  listing_intent: { fr: "", en: "", ar: "" },
  published_at: "2026-07-16T00:00:00Z",
};

describe("projects/store", () => {
  let configured = true;
  let resultQueue: MockResult[] = [];
  let lastOps: Array<{ method: string; payload?: unknown }> = [];
  let store: typeof import("@/lib/projects/store");

  before(() => {
    mock.module("@/lib/supabase/service", {
      namedExports: {
        isSupabaseServiceConfigured: () => configured,
        createSupabaseServiceClient: () => {
          if (!configured) return null;
          return createProjectsClient((op) => {
            lastOps.push({ method: op.method, payload: op.payload });
            return resultQueue.shift() ?? { data: null, error: null };
          });
        },
      },
    });
  });

  before(async () => {
    store = await import("@/lib/projects/store");
  });

  after(() => mock.reset());

  beforeEach(() => {
    configured = true;
    resultQueue = [];
    lastOps = [];
  });

  it("listPublished → null si non configuré", async () => {
    configured = false;
    assert.equal(await store.listPublishedProjectRows(), null);
  });

  it("getPublishedProjects mappe la locale", async () => {
    resultQueue.push({ data: [sampleRow], error: null });
    const items = await store.getPublishedProjects("fr", {
      personal: "Perso",
      for_sale: "Vente",
      sold: "Vendu",
    });
    assert.equal(items.length, 1);
    assert.equal(items[0]?.title, "Nova FR");
    assert.equal(items[0]?.categoryKey, "personal");
    assert.equal(items[0]?.businessTypeIds?.[0], "dashboard");
    assert.deepEqual(items[0]?.tags, sampleRow.technologies);
    assert.equal(
      (items[0]?.tags ?? []).some((tag) => tag === "Tableau de bord"),
      false
    );
  });

  it("getPublishedProjects place les projets mis en avant en premier", async () => {
    const later = {
      ...sampleRow,
      id: "18d86636-9162-4aca-9fb8-b2f77ad90539",
      slug: "later",
      featured: false,
      sort_order: 0,
      created_at: "2026-08-01T00:00:00Z",
      title: { fr: "Plus récent", en: "Newer", ar: "أحدث" },
    };
    const featured = {
      ...sampleRow,
      id: "28d86636-9162-4aca-9fb8-b2f77ad90539",
      slug: "featured-shop",
      featured: true,
      sort_order: 40,
      created_at: "2026-01-01T00:00:00Z",
      title: { fr: "Boutique mise en avant", en: "Featured shop", ar: "متجر مميز" },
    };
    resultQueue.push({ data: [later, featured], error: null });
    const items = await store.getPublishedProjects("fr", {
      personal: "Perso",
      for_sale: "Vente",
      sold: "Vendu",
    });
    assert.equal(items[0]?.slug, "featured-shop");
    assert.equal(items[1]?.slug, "later");
  });

  it("createProject écrit business_type_ids snake_case", async () => {
    // 1) allocateNextCaseReference select · 2) insert
    resultQueue.push(
      { data: [{ reference: "VZ—CASE 001" }], error: null },
      { data: sampleRow, error: null }
    );
    const result = await store.createProject({
      slug: "nova",
      title: sampleRow.title,
      description: sampleRow.description,
      kind: "personal",
      listingPriceCents: null,
      listingIntent: { fr: "", en: "", ar: "" },
      businessTypeIds: ["dashboard"],
      images: sampleRow.images,
      link: null,
  appLink: null,
      sortOrder: 0,
      published: true,
      featured: false,
      coverImage: null,
      technologies: [],
      features: [],
      clientNeed: { fr: "", en: "", ar: "" },
      objective: { fr: "", en: "", ar: "" },
      solution: { fr: "", en: "", ar: "" },
      result: { fr: "", en: "", ar: "" },
      seoTitle: { fr: "", en: "", ar: "" },
      seoDescription: { fr: "", en: "", ar: "" },
    });
    assert.equal(result.ok, true);
    const insertOp = lastOps.find((op) => op.method === "insert");
    assert.ok(insertOp);
    const payload = insertOp?.payload as Record<string, unknown>;
    assert.deepEqual(payload.business_type_ids, ["dashboard"]);
    assert.equal("businessTypeIds" in payload, false);
    assert.equal(payload.reference, "VZ—CASE 002");
  });

  it("createProject duplicate_slug", async () => {
    resultQueue.push(
      { data: [], error: null },
      {
        data: null,
        error: { code: "23505", message: "duplicate key slug" },
      }
    );
    const result = await store.createProject({
      slug: "nova",
      title: sampleRow.title,
      description: sampleRow.description,
      kind: "sold",
      listingPriceCents: null,
      listingIntent: { fr: "", en: "", ar: "" },
      businessTypeIds: [],
      images: sampleRow.images,
      link: null,
  appLink: null,
      sortOrder: 0,
      published: false,
      featured: false,
      coverImage: null,
      technologies: [],
      features: [],
      clientNeed: { fr: "", en: "", ar: "" },
      objective: { fr: "", en: "", ar: "" },
      solution: { fr: "", en: "", ar: "" },
      result: { fr: "", en: "", ar: "" },
      seoTitle: { fr: "", en: "", ar: "" },
      seoDescription: { fr: "", en: "", ar: "" },
    });
    assert.deepEqual(result, { ok: false, reason: "duplicate_slug" });
  });

  it("deleteProject refuse UUID invalide", async () => {
    assert.equal(await store.deleteProject("not-uuid"), false);
  });

  it("updateProject invalid_id", async () => {
    const result = await store.updateProject("bad", { published: true });
    assert.deepEqual(result, { ok: false, reason: "invalid_id" });
  });

  it("projectCoverUrl ignore une cover orpheline hors galerie", () => {
    const stale = {
      ...sampleRow,
      cover_image:
        "https://abc.supabase.co/storage/v1/object/public/portfolio-projects/old.jpg",
      images: [
        {
          url: "https://abc.supabase.co/storage/v1/object/public/portfolio-projects/new.jpg",
        },
      ],
    };
    assert.equal(
      store.projectCoverUrl(stale),
      "https://abc.supabase.co/storage/v1/object/public/portfolio-projects/new.jpg"
    );

    const localized = store.projectRowToLocalized(stale, "fr", "Perso");
    assert.equal(
      localized.images[0]?.src,
      "https://abc.supabase.co/storage/v1/object/public/portfolio-projects/new.jpg"
    );
    assert.equal(localized.images.length, 1);
  });
});
