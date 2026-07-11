/**
 * Central typed React Query key factory.
 *
 * Use these instead of ad-hoc string arrays so invalidations stay in sync
 * across components. Every key is `as const` so TypeScript keeps the literal
 * tuple shape.
 *
 * Example:
 *   queryClient.invalidateQueries({ queryKey: qk.products.all });
 *   queryOptions({ queryKey: qk.products.bySlug(slug), queryFn: ... });
 */
export const qk = {
  products: {
    all: ["products"] as const,
    list: (filters?: Record<string, unknown>) =>
      filters ? (["products", "list", filters] as const) : (["products", "list"] as const),
    bySlug: (slug: string) => ["products", "slug", slug] as const,
    byId: (id: string) => ["products", "id", id] as const,
    related: (productId: string, categoryId?: string | null) =>
      ["related", productId, categoryId ?? null] as const,
  },
  collections: {
    all: ["collections"] as const,
    bySlug: (slug: string) => ["collections", "slug", slug] as const,
  },
  categories: { all: ["categories"] as const },
  tags: { all: ["tags"] as const },
  nav: { all: ["nav"] as const },
  announcements: { all: ["announcements"] as const },
  blog: {
    all: ["blog"] as const,
    list: ["blog", "list"] as const,
    bySlug: (slug: string) => ["blog", "slug", slug] as const,
  },
  reviews: {
    all: ["reviews"] as const,
    summary: (productId: string) => ["review-summary", productId] as const,
    forProduct: (productId: string) => ["reviews", productId] as const,
  },
  admin: {
    dashboard: ["admin", "dashboard"] as const,
    products: ["admin", "products"] as const,
    reviews: ["admin", "reviews"] as const,
    visitorStats: ["admin", "visitor-stats"] as const,
  },
} as const;
