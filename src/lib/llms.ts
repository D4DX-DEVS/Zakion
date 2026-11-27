import { loadContent, type Faq, type Project, type System } from "./content";
import { db } from "./env";
import { htmlToText } from "./html";
import { CANONICAL, isHiddenPath, PLACEHOLDER_SQL, siteUrl } from "./seo";

type Row = { path: string; title: string; description: string };
const oneLine = (s: unknown, max = 220) => { const t = String(s ?? "").replace(/==|\*\*/g, "").replace(/\s+/g, " ").trim(); return t.length > max ? t.slice(0, max).replace(/\s+\S*$/, "") + "…" : t; };
const link = (base: string, path: string, title: string, desc: string) => `- [${oneLine(title.replace(/\s*[|–-]\s*Zakion( Energy)?$/i, ""), 90)}](${base}${path})${desc ? `: ${oneLine(desc)}` : ""}`;

/** The /llms.txt summary for AI assistants (full = true adds every FAQ answer, for /llms-full.txt).
 *  The facts below are the ones the site itself states; the page lists come from the database, so they follow the admin. */
export async function llmsText(full: boolean): Promise<string> {
  const base = siteUrl();
  const d = db();
  const [pages, posts, c] = await Promise.all([
    d.prepare("SELECT path, title, description FROM pages WHERE status='published' AND kind IN ('page','project') AND body_html NOT LIKE ? ORDER BY path").bind(PLACEHOLDER_SQL).all<Row>(),
    d.prepare("SELECT '/' || slug || '/' path, title, excerpt description FROM posts WHERE status='published' AND content NOT LIKE ? ORDER BY published_at DESC").bind(PLACEHOLDER_SQL).all<Row>(),
    loadContent(),
  ]);
  const systems: System[] = c._systems ?? [], projects: Project[] = c._projects ?? [], faqs: Faq[] = c._faqs ?? [];
  const keep = (r: Row) => !CANONICAL[r.path] && !isHiddenPath(r.path);

  const out: string[] = [
    "# Zakion Energy",
    "",
    "> Zakion Energy Pvt. Ltd. is a solar EPC, energy engineering and eMobility infrastructure company founded in 2015 and based in Calicut, Kerala, India. It designs, supplies, installs, commissions and maintains solar systems for homes, businesses and industry (on-grid, hybrid, off-grid and battery storage), carries out energy audits, and builds electric vehicle charging infrastructure.",
    "",
    "## Key facts",
    "- Founded: 2015",
    "- Offices: Calicut (63/700, D Space, Sky Tower, Bank Road, 673001) and Pulamanthole (Kalathil Complex, opp. Federal Bank, 679323), Kerala, India",
    "- Contact: +91 9188 944 337, zakionenergy20@gmail.com",
    `- Website: ${base}/`,
    "- How a project runs: site auditing, consulting, designing and architecting, supply of material, installation, testing, commissioning, then an annual maintenance contract (AMC)",
    "",
    "## Pages",
    ...pages.results.filter(keep).map((r) => link(base, r.path, r.title, r.description)),
  ];
  if (systems.length) out.push("", "## Solar systems", ...systems.map((s) => link(base, `/services/${s.slug}/`, s.title, htmlToText(s.text))));
  if (projects.length) out.push("", "## Projects", ...projects.map((p) => link(base, `/projects/${p.slug}/`, p.title, htmlToText(p.summary) || [p.system_type, p.location, p.capacity].filter(Boolean).join(", "))));
  const articles = posts.results.filter(keep);
  if (articles.length) out.push("", "## Articles", ...articles.map((r) => link(base, r.path, r.title, r.description)));
  if (!full) out.push("", "## Optional", `- [Full text version, including every FAQ answer](${base}/llms-full.txt)`);

  if (full && faqs.length) {
    out.push("", "## Frequently asked questions");
    for (const f of faqs) out.push("", `### ${oneLine(f.question, 300)}`, "", String(f.answer ?? "").replace(/\r\n?/g, "\n").trim());
  }
  return out.join("\n") + "\n";
}
