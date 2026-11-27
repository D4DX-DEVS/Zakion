// Pure helper (no imports) so tools/seo-check.mjs can test it in plain Node.
//
// There is deliberately no http/www/workers.dev redirect in the Worker: Cloudflare reaches it through its workers.dev address,
// so on zakionenergy.com the code sees that host and an https scheme, and any redirect from it loops forever (a live outage).
// Duplicate addresses are handled by the canonical tags; redirects belong in Cloudflare rules.

/** Pages that stay reachable but out of search results and the sitemap. /portfolio/* are the old demo project pages:
 *  nothing links to them any more and their text is generic (the real projects live under /projects/<name>/). */
export const isHiddenPath = (path: string) => path === "/category/uncategorized/" || path.startsWith("/portfolio/");
