import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { LocalizedProjectItem } from "@/data/projects";
import {
  homeProjectRank,
  partitionHomeProjects,
  splitHomeProjects,
} from "@/lib/projects/home-order";

function item(
  overrides: Partial<LocalizedProjectItem> & Pick<LocalizedProjectItem, "id">
): LocalizedProjectItem {
  return {
    title: overrides.id,
    category: "cat",
    desc: "",
    tags: [],
    images: [{ src: "/x.jpg" }],
    categoryKey: "personal",
    ...overrides,
  };
}

describe("home project order", () => {
  it("place un projet à vendre avant un projet perso mis en avant", () => {
    const sale = item({ id: "sale", categoryKey: "for_sale" });
    const featured = item({ id: "feat", featured: true, categoryKey: "personal" });
    assert.ok(homeProjectRank(sale) < homeProjectRank(featured));
    const { spotlight, rest } = partitionHomeProjects([featured, sale]);
    assert.equal(spotlight?.id, "sale");
    assert.equal(rest[0]?.id, "feat");
  });

  it("préfère le projet à vendre aussi coché mis en avant", () => {
    const sale = item({ id: "sale", categoryKey: "for_sale" });
    const saleStar = item({
      id: "star",
      categoryKey: "for_sale",
      featured: true,
    });
    const { listings, others } = splitHomeProjects([sale, saleStar]);
    assert.deepEqual(
      listings.map((p) => p.id),
      ["star", "sale"]
    );
    assert.equal(others.length, 0);
  });

  it("sépare les sites en vente du reste du catalogue", () => {
    const sale = item({ id: "sale", categoryKey: "for_sale" });
    const personal = item({ id: "perso", categoryKey: "personal" });
    const sold = item({ id: "sold", categoryKey: "sold" });
    const { listings, others } = splitHomeProjects([sold, sale, personal]);
    assert.deepEqual(
      listings.map((p) => p.id),
      ["sale"]
    );
    assert.deepEqual(
      others.map((p) => p.id),
      ["sold", "perso"]
    );
  });
});
