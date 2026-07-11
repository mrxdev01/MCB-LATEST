// Central SEO helpers so canonical URLs stay consistent everywhere.
export const SITE_ORIGIN = "https://meenucollection.in";

/** Build an absolute canonical URL for a route path (must start with "/"). */
export function canonical(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  // Never emit trailing slash except for root
  const normalized = clean.length > 1 && clean.endsWith("/") ? clean.slice(0, -1) : clean;
  return `${SITE_ORIGIN}${normalized}`;
}
