import { notFound } from "next/navigation";
import { db } from "@/lib/env";
import { deletePage, savePage } from "../../../actions";
import { Icon } from "../../../icons";
import { ConfirmButton, SubmitButton, Toast } from "../../../ui";

type P = { path: string; title: string; description: string; og_image: string; head_html: string; body_html: string; foot_html: string; kind: string; status: string };

export default async function EditPage({ searchParams }: { searchParams: Promise<{ path?: string; saved?: string }> }) {
  const { path = "", saved } = await searchParams;
  const p = await db().prepare("SELECT * FROM pages WHERE path=?").bind(path).first<P>();
  if (!p) notFound();
  const removable = p.kind !== "template" && p.path !== "/";
  return (
    <>
      <div className="pagehead">
        <a className="back" href="/admin/pages"><Icon name="arrowLeft" size={16} />All pages</a>
        <h2>{p.title || "Edit page"}</h2>
        <span className={"chip " + p.status}>{p.status}</span>
      </div>
      {saved && <Toast text="Page saved" />}
      <form action={savePage}>
        <input type="hidden" name="path" value={p.path} />
        <div className="editor">
          <div>
            <section className="card">
              <div className="card-h"><h3><Icon name="search" size={20} />Search engines</h3></div>
              <label className="field"><span>Title (browser tab and search results)</span><input type="text" name="title" defaultValue={p.title} /></label>
              <label className="field"><span>Meta description</span><input type="text" name="description" defaultValue={p.description} maxLength={200} /><small className="hint">Up to 200 characters. Shown under the title in Google.</small></label>
              <label className="field" style={{ marginBottom: 0 }}><span>Social image URL</span><input type="text" name="og_image" defaultValue={p.og_image} placeholder="/media/…" /><small className="hint">The picture shown when the page is shared on social media.</small></label>
            </section>
            <section className="card">
              <div className="card-h"><h3><Icon name="file" size={20} />Page content</h3></div>
              <label className="field"><span>Page HTML (header, content and footer)</span><textarea name="body_html" rows={24} defaultValue={p.body_html} spellCheck={false} /></label>
              <details className="hint" style={{ marginTop: 0 }}>
                <summary>Advanced: head styles and footer scripts</summary>
                <label className="field" style={{ marginTop: 16 }}><span>Head HTML</span><textarea name="head_html" rows={8} defaultValue={p.head_html} spellCheck={false} /></label>
                <label className="field"><span>Footer scripts</span><textarea name="foot_html" rows={8} defaultValue={p.foot_html} spellCheck={false} /></label>
              </details>
            </section>
          </div>
          <aside className="aside">
            <section className="card">
              <div className="card-h"><h3><Icon name="eye" size={20} />Visibility</h3></div>
              <label className="field" style={{ marginBottom: 0 }}><span>Status</span><select name="status" defaultValue={p.status}><option>published</option><option>draft</option></select><small className="hint">Drafts are hidden from visitors.</small></label>
            </section>
          </aside>
        </div>
        <div className="stickybar">
          <span className="grow">Don’t forget to save your changes.</span>
          {p.kind !== "template" && <a className="btn sec" href={p.path} target="_blank" rel="noreferrer"><Icon name="external" size={18} />View page</a>}
          <SubmitButton><Icon name="save" size={18} />Save changes</SubmitButton>
        </div>
      </form>
      {removable && (
        <section className="card danger">
          <div><h3>Delete this page</h3><p className="muted">It disappears from the website. This cannot be undone.</p></div>
          <form action={deletePage}>
            <input type="hidden" name="path" value={p.path} />
            <ConfirmButton message={`Delete "${p.title}"? This cannot be undone.`}><Icon name="trash" size={18} />Delete page</ConfirmButton>
          </form>
        </section>
      )}
    </>
  );
}
