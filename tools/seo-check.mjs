// Self-check for the SEO helpers: node tools/seo-check.mjs
import assert from "node:assert/strict";
import { redirectTarget, isHiddenPath } from "../src/lib/canonical.ts";

const SITE = "https://zakionenergy.com";
// already right: no redirect
assert.equal(redirectTarget("https://zakionenergy.com/about-us/", SITE, "https"), null);
// THE OUTAGE: behind OpenNext the page code sees "http://" for a secure visitor. That must never redirect (it looped forever).
assert.equal(redirectTarget("http://zakionenergy.com/", SITE, "https"), null);
assert.equal(redirectTarget("http://zakionenergy.com/", SITE), null, "no usable header: never redirect on scheme");
assert.equal(redirectTarget("http://zakionenergy.com/", SITE, "garbage"), null);
// a visitor really on plain http goes to https, keeping path and query
assert.equal(redirectTarget("http://zakionenergy.com/faq/?a=1", SITE, "http"), "https://zakionenergy.com/faq/?a=1");
// the old address and www go to the one real address
assert.equal(redirectTarget("https://zakion-energy.d4dx-fatwa.workers.dev/faq/?a=1", SITE, "https"), "https://zakionenergy.com/faq/?a=1");
assert.equal(redirectTarget("https://www.zakionenergy.com/blog/", SITE, "https"), "https://zakionenergy.com/blog/");
// a redirect target must itself never redirect again (no loop, whatever scheme the code sees)
for (const seen of ["http://zakionenergy.com/x/", "https://zakionenergy.com/x/"]) assert.equal(redirectTarget(seen, SITE, "https"), null);
// local development is never redirected
assert.equal(redirectTarget("http://localhost:3000/", SITE, "http"), null);
assert.equal(redirectTarget("http://127.0.0.1:3001/x/", SITE, "http"), null);
// staging (SITE_URL still a workers.dev address) and an empty SITE_URL: no redirects
assert.equal(redirectTarget("https://zakion-energy.d4dx-fatwa.workers.dev/", "https://zakion-energy.d4dx-fatwa.workers.dev", "http"), null);
assert.equal(redirectTarget("https://anything.example/", "", "http"), null);

assert.ok(isHiddenPath("/portfolio/ecoharbor/"));
assert.ok(isHiddenPath("/category/uncategorized/"));
assert.ok(!isHiddenPath("/projects/home-solar-project/"));
assert.ok(!isHiddenPath("/"));
console.log("seo helpers: all checks passed");
