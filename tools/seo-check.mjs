// Self-check for the SEO helpers: node tools/seo-check.mjs
import assert from "node:assert/strict";
import { redirectTarget, isHiddenPath } from "../src/lib/canonical.ts";

const SITE = "https://zakionenergy.com";
// already right: no redirect
assert.equal(redirectTarget("https://zakionenergy.com/about-us/", SITE), null);
// the old address, plain http and www all go to the one real address, keeping path and query
assert.equal(redirectTarget("https://zakion-energy.d4dx-fatwa.workers.dev/faq/?a=1", SITE), "https://zakionenergy.com/faq/?a=1");
assert.equal(redirectTarget("http://zakionenergy.com/", SITE), "https://zakionenergy.com/");
assert.equal(redirectTarget("https://www.zakionenergy.com/blog/", SITE), "https://zakionenergy.com/blog/");
// local development is never redirected
assert.equal(redirectTarget("http://localhost:3000/", SITE), null);
assert.equal(redirectTarget("http://127.0.0.1:3001/x/", SITE), null);
// staging (SITE_URL still a workers.dev address) and an empty SITE_URL: no redirects
assert.equal(redirectTarget("https://zakion-energy.d4dx-fatwa.workers.dev/", "https://zakion-energy.d4dx-fatwa.workers.dev"), null);
assert.equal(redirectTarget("https://anything.example/", ""), null);

assert.ok(isHiddenPath("/portfolio/ecoharbor/"));
assert.ok(isHiddenPath("/category/uncategorized/"));
assert.ok(!isHiddenPath("/projects/home-solar-project/"));
assert.ok(!isHiddenPath("/"));
console.log("seo helpers: all checks passed");
