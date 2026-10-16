import assert from "node:assert/strict";
import { after, before, describe, it, mock } from "node:test";

describe("public CMS cache invalidation", () => {
  const tags: unknown[][] = [];
  const paths: unknown[][] = [];
  before(() => {
    mock.module("next/cache", { namedExports: {
      revalidateTag: (...args: unknown[]) => tags.push(args),
      revalidatePath: (...args: unknown[]) => paths.push(args),
    } });
  });
  after(() => mock.reset());
  it("expires each changed dataset immediately across every language", async () => {
    const { revalidateProjectSurfaces } = await import("@/lib/projects/revalidate");
    const { revalidateServiceSurfaces } = await import("@/lib/services/revalidate");
    const { revalidateReviewSurfaces } = await import("@/lib/reviews/revalidate");
    const { revalidateFaqSurfaces } = await import("@/lib/faqs/revalidate");
    const { revalidateEngagementSurfaces } = await import("@/lib/engagements/revalidate");
    revalidateProjectSurfaces("example");
    revalidateServiceSurfaces("vitrine");
    revalidateReviewSurfaces();
    revalidateFaqSurfaces(["vitrine"]);
    revalidateEngagementSurfaces();
    assert.deepEqual(tags, ["projects", "services", "reviews", "faqs", "engagements"].map((key) => [`public:${key}`, { expire: 0 }]));
    assert.equal(paths.filter(([path, type]) => path === "/" && type === "layout").length, 5);
  });
});
