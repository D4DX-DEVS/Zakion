import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/env";
import { ALL_KEYS, loadContent, loadOne, PAGE_DEFAULTS, PAGE_TITLES, SECTION_BY_KEY } from "@/lib/content";
import { bannerKey } from "@/lib/banners";
import { pageKeys } from "@/lib/home";
import { addPageSection, movePageSection, removePageSection, reorderPageSections, resetPageBanner, resetSection, saveSection, savePageBanner, uploadSectionFile } from "../../../actions";
import { fmtDate } from "../../../format";
import { Icon } from "../../../icons";
import { libraryImages } from "../../../library-images";
import { OutlineList } from "../../../outline-sort";
import { SectionEditor } from "../../../section-editor";
import { SEC_ICON } from "../../../section-meta";
import { PreviewPanel } from "../../../studio-parts";
import { ConfirmButton, Toast } from "../../../ui";

const TOAST: Record<string, string> = {
  "1": "Saved", reset: "Reset to the original", layout: "Section order saved", added: "Section added to this page", removed: "Section taken off this page",
};

// Pages > a page: the page's sections as an outline (drag to reorder, remove, add) beside the editor for the one picked, and a live preview.
export default async function PageSections({ searchParams }: { searchParams: Promise<{ page?: string; key?: string; saved?: string; error?: string }> }) {
  const { page = "", key = "", saved, error } = await searchParams;
  if (page === "/") redirect("/admin/studio"); // Studio is the home page's editor
  if (!PAGE_DEFAULTS[page]) notFound();
  const title = PAGE_TITLES[page] ?? page;
  const content = await loadContent();
  const keys = pageKeys(content, page);
  const spare = ALL_KEYS.filter((k) => !keys.includes(k));
  const bk = bannerKey(page);
  const sel = key === "banner" && bk ? "banner" : keys.includes(key) ? key : "";
  const rows = await db().prepare("SELECT key, updated_at FROM site_content").all<{ key: string; updated_at: string }>().then((r) => r.results).catch(() => []);
  const edited = new Map(rows.map((r) => [r.key, r.updated_at]));
  const here = (k: string) => `/admin/pages/sections?page=${encodeURIComponent(page)}${k ? "&key=" + encodeURIComponent(k) : ""}`;
  const hid = (k: string, v: string) => <input type="hidden" name={k} value={v} />;

  const item = (k: string, i: number) => {
    const def = SECTION_BY_KEY[k];
    return (
      <li key={k} className={"o-row" + (k === sel ? " on" : "")} draggable data-sort="" data-key={k}>
        <span className="o-grip" aria-hidden="true" title="Drag to move"><Icon name="grip" size={16} /></span>
        <a className="o-main" draggable={false} href={here(k)} aria-current={k === sel ? "page" : undefined}>
          <span className="o-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
          <span className="o-txt"><b>{def.title}</b><i>{edited.has(k) ? "Edited" : "Original"}</i></span>
          {edited.has(k) && <span className="o-dot" title="Edited" aria-hidden="true" />}
        </a>
        <div className="o-ctl">
          <form action={movePageSection}>{hid("page", page)}{hid("key", k)}{hid("dir", "up")}{hid("back", sel)}
            <button className="o-btn" disabled={i === 0} aria-label={`Move ${def.title} up`} title="Move up"><Icon name="up" size={15} /></button></form>
          <form action={movePageSection}>{hid("page", page)}{hid("key", k)}{hid("dir", "down")}{hid("back", sel)}
            <button className="o-btn" disabled={i === keys.length - 1} aria-label={`Move ${def.title} down`} title="Move down"><Icon name="down" size={15} /></button></form>
          <form action={removePageSection}>{hid("page", page)}{hid("key", k)}{hid("back", sel)}
            <button className="o-btn rm" aria-label={`Take ${def.title} off this page`} title="Take off this page"><Icon name="close" size={15} /></button></form>
        </div>
      </li>
    );
  };

  let editor: React.ReactNode = (
    <div className="doc-empty">
      <span className="de-ico"><Icon name="file" size={34} /></span>
      <h1>{title} page</h1>
      <p>Pick a section on the left to edit its text and images. Drag a section, or use its arrows, to change the order. Take off a section you do not want here, or add one from the list under the sections.</p>
      <div className="de-tips">
        <span><Icon name="grip" size={16} />Drag to reorder</span><span><Icon name="close" size={16} />Take off or add</span><span><Icon name="pencil" size={16} />Edit text and images</span><span><Icon name="monitor" size={16} />Live preview</span>
      </div>
      <div className="row">
        {keys[0] && <a className="btn" href={here(keys[0])}><Icon name="pencil" size={18} />Start with {SECTION_BY_KEY[keys[0]].title}</a>}
        <a className="btn sec" href={`/admin/pages/edit?path=${encodeURIComponent(page)}`}><Icon name="search" size={18} />Page title, search text and status</a>
      </div>
    </div>
  );
  if (sel) {
    const images = await libraryImages();
    if (sel === "banner" && bk) {
      const { def, data, customised } = await loadOne("banners");
      const field = def.fields.find((f) => f.k === bk)!;
      editor = (
        <div className="doc">
          <header className="doc-head">
            <div><span className="eyebrow"><Icon name="image" size={14} />Top of the {title} page</span><h1>Page banner</h1></div>
            <span className="doc-chips"><span className={"chip " + (customised ? "published" : "")}>{customised ? `Edited ${fmtDate(edited.get("banners")!)}` : "Original"}</span></span>
          </header>
          {saved && <Toast text={TOAST[saved] ?? "Saved"} />}
          {error && <p className="alert" role="alert">The banner could not be saved. Please try again.</p>}
          <p className="alert info">The picture behind the title at the top of the {title} page. It always stays at the top, so it is not part of the section order.</p>
          <SectionEditor key={"banner" + page} sectionKey={bk} fields={[field]} initial={{ [bk]: String(data[bk] ?? "") }} images={images} save={savePageBanner} reset={resetPageBanner} upload={uploadSectionFile} extra={{ page }} resetConfirm="Go back to the original banner picture of this page?" />
        </div>
      );
    } else {
      const { def, data, customised } = await loadOne(sel);
      editor = (
        <div className="doc">
          <header className="doc-head">
            <div><span className="eyebrow"><Icon name={SEC_ICON[sel] ?? "layers"} size={14} />Section {keys.indexOf(sel) + 1} of {keys.length} on the {title} page</span><h1>{def.title}</h1></div>
            <span className="doc-chips">
              <span className={"chip " + (customised ? "published" : "")}>{customised ? `Edited ${fmtDate(edited.get(sel)!)}` : "Original"}</span>
              <form action={removePageSection} className="inl">{hid("page", page)}{hid("key", sel)}{hid("back", sel)}
                <ConfirmButton className="btn sec sm" message={`Take "${def.title}" off the ${title} page? Its text and images are kept, and you can add it back at any time.`}><Icon name="close" size={16} />Take off this page</ConfirmButton></form>
            </span>
          </header>
          {saved && <Toast text={TOAST[saved] ?? "Saved"} />}
          {error && <p className="alert" role="alert">The section could not be saved. Please try again.</p>}
          <p className="alert info">{def.help} {customised ? "This section has been edited." : "This section still shows the original content."} Changes to its text and images show on every page that uses this section.</p>
          <SectionEditor key={sel} sectionKey={sel} fields={def.fields} initial={data} images={images} save={saveSection} reset={resetSection} upload={uploadSectionFile} extra={{ page }} />
        </div>
      );
    }
  } else if (saved) {
    editor = <><Toast text={TOAST[saved] ?? "Saved"} />{editor}</>;
  }

  return (
    <div className="studio pg">
      <aside className="outline" aria-label={`${title} page outline`}>
        <div className="o-head">
          <div><h2>{title}</h2><span>{keys.length} {keys.length === 1 ? "section" : "sections"}</span></div>
          <a className="btn sec sm" href={page} target="_blank" rel="noreferrer"><Icon name="external" size={15} />View<span className="sr-only"> {title} page (opens in a new tab)</span></a>
        </div>
        <OutlineList action={reorderPageSections} back={sel} extra={{ page }}>
          {bk && (
            <>
              <li className="o-cap">Top</li>
              <li className={"o-row" + (sel === "banner" ? " on" : "")}>
                <a className="o-main" draggable={false} href={here("banner")} aria-current={sel === "banner" ? "page" : undefined}>
                  <span className="o-num" aria-hidden="true"><Icon name="image" size={16} /></span>
                  <span className="o-txt"><b>Page banner</b><i>{edited.has("banners") ? "Edited" : "Original"}</i></span>
                </a>
              </li>
            </>
          )}
          <li className="o-cap">Sections <small>drag to reorder</small></li>
          {keys.length === 0 && <li className="o-none">No sections yet. Add one below.</li>}
          {keys.map((k, i) => item(k, i))}
        </OutlineList>
        <details className="o-add" open={keys.length === 0}>
          <summary><Icon name="plus" size={16} />Add a section <small>{spare.length} available</small></summary>
          {spare.length === 0 ? <p className="muted">Every section is already on this page.</p> : (
            <ul>
              {spare.map((k) => (
                <li key={k}>
                  <form action={addPageSection}>{hid("page", page)}{hid("key", k)}
                    <button aria-label={`Add ${SECTION_BY_KEY[k].title} to this page`}><span className="o-ic" aria-hidden="true"><Icon name={SEC_ICON[k] ?? "layers"} size={16} /></span><span>{SECTION_BY_KEY[k].title}</span><Icon name="plus" size={15} /></button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </details>
        <a className="o-link" href={`/admin/pages/edit?path=${encodeURIComponent(page)}`}><Icon name="search" size={16} />Page title, search text and status</a>
      </aside>
      <section className="canvas" aria-live="polite">{editor}</section>
      <PreviewPanel key={page + sel} src={page} label={`the ${title} page`} />
    </div>
  );
}
