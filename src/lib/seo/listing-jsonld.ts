export type ListingJsonLdItem = {
  name: string;
  url: string;
};

/** BreadcrumbList + ItemList pour les catalogues publics. */
export function buildListingJsonLd({
  home,
  name,
  url,
  items,
}: {
  home: ListingJsonLdItem;
  name: string;
  url: string;
  items: ListingJsonLdItem[];
}) {
  const graph: Record<string, unknown>[] = [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: home.name,
          item: home.url,
        },
        {
          "@type": "ListItem",
          position: 2,
          name,
          item: url,
        },
      ],
    },
  ];

  if (items.length > 0) {
    graph.push({
      "@type": "ItemList",
      name,
      url,
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: item.url,
      })),
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

export function absoluteUrlWithoutSearch(url: string) {
  try {
    const parsed = new URL(url);
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return url.split("?")[0] ?? url;
  }
}
