import { db, env } from "@/lib/env";
import { BUILTIN_IMAGES, HOME_KEYS, loadContent, loadOne, SECTION_BY_KEY, type Layout } from "@/lib/content";
import { ANCHORS } from "@/lib/home";
import { moveSection, resetSection, saveSection, saveSectionSettings, toggleSection, uploadSectionFile } from "../../actions";
import { fmtDate } from "../../format";
import { Icon } from "../../icons";
import { SectionEditor } from "../../section-editor";
import { SEC_ICON } from "../../section-meta";
import { PreviewPanel } from "../../studio-parts";
import { SubmitButton, Toast } from "../../ui";

const SPACING_LABEL = { compact: "Compact", standard: "Standard", roomy: "Roomy" } as const;

// Studio: the home page as an outline (order, show/hide) next to the editor for the picked section and a live preview.
export default async function Studio({ searchParams }: { searchParams: Promise<{ key?: string; saved?: string; error?: string }> }) {
  const { key = "", saved, error } = await searchParams;
  const content = await loadContent();
  const layout: Layout = content._layout;
  const rows = await db().prepare("SELECT key, updated_at FROM site_content").all<{ key: string; updated_at: string }>().then((r) => r.results).catch(() => []);
  const edited = new Map(rows.map((r) => [r.key, r.updated_at]));
  const hidden = new Set(layout.hidden);
  const sel = SECTION_BY_KEY[key] && (key === "hero" || key === "header" || key === "footer" || HOME_KEYS.includes(key)) ? key : "";
  const live = layout.order.length - hidden.size;

  const status = (k: string) => {
    const bits = [edited.has(k) ? "Edited" : "Original"];
    if (hidden.has(k)) bits.push("Hidden");
    const st = layout.settings[k];
    if (st?.spacing && st.spacing !== "standard") bits.push(SPACING_LABEL[st.spacing]);
    if (st?.anim === "off") bits.push("No animation");
    return bits.join(" · ");
  };
  const item = (k: string, i?: number) => {
    const def = SECTION_BY_KEY[k];
    const movable = i !== undefined;
    return (
      <li key={k} className={"o-row" + (k === sel ? " on" : "") + (hidden.has(k) ? " off" : "")}>
        <a className="o-main" href={`/admin/studio?key=${k}`} aria-current={k === sel ? "page" : undefined}>
          <span className="o-num" aria-hidden="true">{movable ? String(i + 1).padStart(2, "0") : <Icon name={SEC_ICON[k]} size={16} />}</span>
          <span className="o-txt"><b>{def.title}</b><i>{status(k)}</i></span>
          {edited.has(k) && <span className="o-dot" title="Edited" aria-hidden="true" />}
        </a>
        {movable && (
          <div className="o-ctl">
            <form action={moveSection}><input type="hidden" name="key" value={k} /><input type="hidden" name="dir" value="up" /><input type="hidden" name="back" value={sel} />
              <button className="o-btn" disabled={i === 0} aria-label={`Move ${def.title} up`} title="Move up"><Icon name="up" size={15} /></button></form>
            <form action={moveSection}><input type="hidden" name="key" value={k} /><input type="hidden" name="dir" value="down" /><input type="hidden" name="back" value={sel} />
              <button className="o-btn" disabled={i === layout.order.length - 1} aria-label={`Move ${def.title} down`} title="Move down"><Icon name="down" size={15} /></button></form>
            <form action={toggleSection}><input type="hidden" name="key" value={k} /><input type="hidden" name="back" value={sel} />
              <button className={"o-btn eye" + (hidden.has(k) ? " is-off" : "")} aria-label={hidden.has(k) ? `Show ${def.title}` : `Hide ${def.title}`} title={hidden.has(k) ? "Hidden: click to show" : "Shown: click to hide"}><Icon name={hidden.has(k) ? "eyeOff" : "eye"} size={15} /></button></form>
          </div>
        )}
      </li>
    );
  };

  // Editor column
  let editor: React.ReactNode = (
    <div className="doc-empty">
      <span className="de-ico"><Icon name="layers" size={34} /></span>
      <h1>Home page studio</h1>
      <p>Pick a block on the left to edit its text, images and settings. Use the arrows to reorder blocks and the eye to hide one without deleting it.</p>
      <div className="de-tips">
        <span><Icon name="up" size={16} />Reorder</span><span><Icon name="eyeOff" size={16} />Hide or show</span><span><Icon name="sliders" size={16} />Spacing and animation</span><span><Icon name="monitor" size={16} />Live preview</span>
      </div>
      <a className="btn" href="/admin/studio?key=hero"><Icon name="pencil" size={18} />Start with the home banner</a>
    </div>
  );
  if (sel) {
    const { def, data, customised } = await loadOne(sel);
    const uploaded = (await env().MEDIA.list({ limit: 1000 })).objects
      .filter((o) => /\.(png|jpe?g|webp|gif|svg)$/i.test(o.key) && !/-\d+x\d+\.\w+$/.test(o.key) && !o.key.startsWith("_snap/") && !o.key.startsWith("elementor/"))
      .sort((a, b) => b.uploaded.getTime() - a.uploaded.getTime()).slice(0, 150).map((o) => "/media/" + o.key);
    const onHome = HOME_KEYS.includes(sel);
    const st = layout.settings[sel] ?? { spacing: "standard", anim: "on" };
    const pos = layout.order.indexOf(sel) + 1;
    const when = sel === "hero" ? "Top of the home page" : sel === "header" ? "Top of every page" : sel === "footer" ? "Bottom of every page" : `Block ${pos} of ${layout.order.length}`;
    const seg = (name: string, cur: string, opts: [string, string][]) => (
      <div className="seg" role="radiogroup">{opts.map(([v, l]) => <label key={v}><input type="radio" name={name} value={v} defaultChecked={cur === v} /><span>{l}</span></label>)}</div>
    );
    editor = (
      <div className="doc">
        <header className="doc-head">
          <div>
            <span className="eyebrow"><Icon name={SEC_ICON[sel]} size={14} />{when}</span>
            <h1>{def.title}</h1>
          </div>
          <span className="doc-chips">
            <span className={"chip " + (customised ? "published" : "")}>{customised ? `Edited ${fmtDate(edited.get(sel)!)}` : "Original"}</span>
            {onHome && hidden.has(sel) && <span className="chip draft">Hidden on home page</span>}
          </span>
        </header>
        {saved && <Toast text={saved === "reset" ? "Section reset to the original" : saved === "layout" ? "Home page layout updated" : saved === "settings" ? "Settings saved" : "Section saved"} />}
        {error && <p className="alert" role="alert">The section could not be saved. Please try again.</p>}
        {onHome && (
          <form action={saveSectionSettings} className="card settings">
            <input type="hidden" name="key" value={sel} />
            <div className="card-h"><h2><Icon name="sliders" size={20} />Section settings</h2></div>
            <div className="set-grid">
              <fieldset><legend>On the home page</legend>{seg("visible", hidden.has(sel) ? "hide" : "show", [["show", "Shown"], ["hide", "Hidden"]])}</fieldset>
              <fieldset><legend>Spacing above and below</legend>{seg("spacing", st.spacing, [["compact", "Compact"], ["standard", "Standard"], ["roomy", "Roomy"]])}</fieldset>
              <fieldset><legend>Scroll animation</legend>{seg("anim", st.anim, [["on", "On"], ["off", "Off"]])}</fieldset>
            </div>
            <div className="set-foot"><span className="muted">Spacing and animation also apply if this block shows on other pages.</span><SubmitButton className="btn sm"><Icon name="save" size={16} />Save settings</SubmitButton></div>
          </form>
        )}
        <p className="alert info">{def.help} {customised ? "This section has been edited." : "This section still shows the original content."}</p>
        <SectionEditor sectionKey={sel} fields={def.fields} initial={data} images={[...uploaded, ...BUILTIN_IMAGES]} save={saveSection} reset={resetSection} upload={uploadSectionFile} />
      </div>
    );
  }
  const anchor = sel ? ANCHORS[sel] ?? "" : "";
  return (
    <div className="studio">
      <aside className="outline" aria-label="Home page outline">
        <div className="o-head">
          <div><h2>Home page</h2><span>{live} of {layout.order.length} blocks shown</span></div>
          <a className="btn sec sm" href="/" target="_blank" rel="noreferrer"><Icon name="external" size={15} />View<span className="sr-only"> home page (opens in a new tab)</span></a>
        </div>
        <ol className="o-list">
          <li className="o-cap">Top</li>
          {item("hero")}
          <li className="o-cap">Blocks <small>top to bottom</small></li>
          {layout.order.map((k, i) => item(k, i))}
          <li className="o-cap">Every page</li>
          {item("header")}
          {item("footer")}
        </ol>
      </aside>
      <section className="canvas" aria-live="polite">{editor}</section>
      {sel ? <PreviewPanel key={sel} src={"/" + (anchor ? "#" + anchor : "")} label={SECTION_BY_KEY[sel].title} /> : <div className="pv-ghost" aria-hidden="true" />}
    </div>
  );
}
