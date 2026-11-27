// Pure helpers (no imports) so tools/seo-check.mjs can test them in plain Node.

/** Where a page request must be sent so that only ONE address per page exists, or null when it is already right.
 *  Covers www -> bare domain, the old *.workers.dev address and plain http. Local dev, and the staging copy while
 *  SITE_URL is still a workers.dev address, are left alone.
 *
 *  The scheme is NOT read from requestUrl: behind OpenNext the page code sees "http://" even for secure visitors, and
 *  trusting it caused a redirect loop. `visitorScheme` is the scheme from Cloudflare's cf-visitor header; only an explicit
 *  "http" redirects, so a missing or odd header can never loop. */
export function redirectTarget(requestUrl: string, siteUrl: string, visitorScheme?: string | null): string | null {
  if (!siteUrl) return null;
  const want = new URL(siteUrl), u = new URL(requestUrl);
  if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(u.hostname) || /\.workers\.dev$/.test(want.hostname)) return null;
  return u.host === want.host && visitorScheme !== "http" ? null : want.origin + u.pathname + u.search;
}

/** Pages that stay reachable but out of search results and the sitemap. /portfolio/* are the old demo project pages:
 *  nothing links to them any more and their text is generic (the real projects live under /projects/<name>/). */
export const isHiddenPath = (path: string) => path === "/category/uncategorized/" || path.startsWith("/portfolio/");
