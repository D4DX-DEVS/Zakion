// Pure helpers (no imports) so tools/seo-check.mjs can test them in plain Node.

/** Where a page request must be sent so that only ONE address per page exists, or null when it is already right.
 *  Covers http -> https, www -> bare domain and the old *.workers.dev address. Local dev, and the staging copy while
 *  SITE_URL is still a workers.dev address, are left alone. */
export function redirectTarget(requestUrl: string, siteUrl: string): string | null {
  if (!siteUrl) return null;
  const want = new URL(siteUrl), u = new URL(requestUrl);
  if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(u.hostname) || /\.workers\.dev$/.test(want.hostname)) return null;
  return u.host === want.host && u.protocol === want.protocol ? null : want.origin + u.pathname + u.search;
}

/** Pages that stay reachable but out of search results and the sitemap. /portfolio/* are the old demo project pages:
 *  nothing links to them any more and their text is generic (the real projects live under /projects/<name>/). */
export const isHiddenPath = (path: string) => path === "/category/uncategorized/" || path.startsWith("/portfolio/");
