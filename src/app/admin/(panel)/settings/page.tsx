import { db } from "@/lib/env";
import { CANONICAL } from "@/lib/seo";
import { ALL_KEYS, HOME_KEYS, loadContent, PAGE_DEFAULTS, PAGE_TITLES, SECTION_BY_KEY } from "@/lib/content";
import { pageKeys } from "@/lib/home";
import { SETTINGS_TABS, siteOf, socialForEditor } from "@/lib/site";
import { resetSettings, saveSettings, savePageLayout, uploadSectionFile } from "../../actions";
import { Icon, type IconName } from "../../icons";
import { PageLayoutEditor } from "../../page-layout";
import { SEC_ICON } from "../../section-meta";
import { SettingsEditor } from "../../settings-editor";
import { PreviewPanel } from "../../studio-parts";
import { Toast } from "../../ui";

const TAB_ICON: Record<string, IconName> = { layout: "layoutGrid", sections: "listOrdered", theme: "palette", fonts: "type", header: "panelTop", navigation: "menu", footer: "panelBottom", social: "share" };
const SECTIONS_TAB = { id: "sections", label: "Section order", sub: "Choose which blocks each page shows and drag them into the order you want." };
// the tabs in the order they are listed: layout first, then the order of blocks, then everything else
const TABS = [SETTINGS_TABS[0], SECTIONS_TAB, ...SETTINGS_TABS.slice(1)];

const NOTES: Record<string, string> = {
  "/": "The video banner always stays at the very top. Removing a block hides it on the home page; its text and images are kept in Studio.",
  "/about-us/": "The page title banner stays at the top. Blocks you remove are only taken off this page.",
  "/services/": "The page title banner stays at the top. Blocks you remove are only taken off this page.",
  "/projects/": "The page title banner stays at the top. Blocks you remove are only taken off this page.",
  "/contact/": "The page title banner stays at the top. The map is shown with the Contact details block on this page.",
  "/blog/": "The list of blog posts stays where it is. These blocks appear below it.",
};

// Site settings: a tab list, the editor for the chosen tab, and a live preview of the real site.
export default async function SiteSettings({ searchParams }: { searchParams: Promise<{ tab?: string; page?: string; saved?: string; error?: string }> }) {
  const { tab: want = "layout", page: wantPage = "/", saved, error } = await searchParams;
  const tab = TABS.find((t) => t.id === want) ?? TABS[0];
  const path = PAGE_DEFAULTS[wantPage] ? wantPage : "/";
  const content = await loadContent();

  let editor: React.ReactNode;
  if (tab.id === "sections") {
    const blocks = ALL_KEYS.filter((k) => path !== "/" || HOME_KEYS.includes(k)).map((k) => ({ key: k, title: SECTION_BY_KEY[k].title, icon: SEC_ICON[k] ?? ("layers" as IconName), where: SECTION_BY_KEY[k].page }));
    editor = (
      <>
        <div className="pills pl-pages" role="group" aria-label="Choose a page">
          {Object.entries(PAGE_TITLES).map(([p, label]) => (
            <a key={p} className="pill" href={`/admin/settings?tab=sections&page=${encodeURIComponent(p)}`} aria-current={p === path ? "page" : undefined}>{label}</a>
          ))}
        </div>
        <PageLayoutEditor key={path} path={path} label={PAGE_TITLES[path]} note={NOTES[path]} initial={pageKeys(content, path)} defaults={PAGE_DEFAULTS[path]} blocks={blocks} save={savePageLayout} />
      </>
    );
  } else {
    const def = SETTINGS_TABS.find((t) => t.id === tab.id)!;
    const initial: Record<string, unknown> = {};
    for (const g of def.groups) initial[g.key] = g.key === "_site" ? siteOf(content) : { ...content[g.key] };
    if (def.id === "social") initial.footer = { ...content.footer, social: socialForEditor(content) };
    // the pages of the site, offered as links in the menu editor (the duplicate addresses that redirect elsewhere are left out)
    const links = def.id === "navigation"
      ? await db().prepare("SELECT path, title FROM pages WHERE kind!='template' AND status='published' ORDER BY path").all<{ path: string; title: string }>()
          .then((r) => r.results.filter((p) => !CANONICAL[p.path] && !p.path.startsWith("/__")).map((p) => ({ url: p.path, title: (p.path === "/" ? "Home" : p.title.split(/ [–|] /)[0]).slice(0, 60) })))
          .catch(() => [])
      : undefined;
    editor = <SettingsEditor key={def.id} tabId={def.id} groups={def.groups} initial={initial} save={saveSettings} reset={resetSettings} upload={uploadSectionFile} links={links} />;
  }

  const previewSrc = tab.id === "sections" ? path : tab.id === "footer" || tab.id === "social" ? "/#site-footer" : "/";
  return (
    <div className="studio">
      <aside className="outline sn" aria-label="Site settings">
        <div className="o-head">
          <div><h2>Site settings</h2><span>Applies to the whole website</span></div>
          <a className="btn sec sm" href="/" target="_blank" rel="noreferrer"><Icon name="external" size={15} />View<span className="sr-only"> site (opens in a new tab)</span></a>
        </div>
        <ol className="o-list">
          {TABS.map((t) => (
            <li key={t.id} className={"o-row" + (t.id === tab.id ? " on" : "")}>
              <a className="o-main" href={`/admin/settings?tab=${t.id}`} aria-current={t.id === tab.id ? "page" : undefined}>
                <span className="o-num" aria-hidden="true"><Icon name={TAB_ICON[t.id]} size={16} /></span>
                <span className="o-txt"><b>{t.label}</b><i>{t.sub}</i></span>
              </a>
            </li>
          ))}
        </ol>
      </aside>
      <section className="canvas" aria-live="polite">
        <div className="doc">
          <header className="doc-head">
            <div>
              <span className="eyebrow"><Icon name={TAB_ICON[tab.id]} size={14} />Site settings</span>
              <h1>{tab.label}</h1>
            </div>
          </header>
          {saved && <Toast text={saved === "reset" ? "Settings reset to the original" : saved === "layout" ? "Section order saved" : "Settings saved"} />}
          {error && <p className="alert" role="alert">The settings could not be saved. Please try again.</p>}
          <p className="alert info">{tab.sub}</p>
          {editor}
        </div>
      </section>
      <PreviewPanel key={tab.id + path} src={previewSrc} label={tab.id === "sections" ? `the ${PAGE_TITLES[path]} page` : "the site"} />
    </div>
  );
}
