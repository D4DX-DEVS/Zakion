// Self-check for the SEO helpers: node tools/seo-check.mjs
import assert from "node:assert/strict";
import { isHiddenPath } from "../src/lib/canonical.ts";

assert.ok(isHiddenPath("/portfolio/ecoharbor/"));
assert.ok(isHiddenPath("/category/uncategorized/"));
assert.ok(!isHiddenPath("/projects/home-solar-project/"));
assert.ok(!isHiddenPath("/"));
console.log("seo helpers: all checks passed");
