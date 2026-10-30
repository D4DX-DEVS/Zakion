import { notFound } from "next/navigation";
import { db } from "@/lib/env";
import { deletePage, savePage } from "../../../actions";
import { ConfirmButton, SubmitButton, Toast } from "../../../ui";

type P = { path: string; title: string; description: string; og_image: string; head_html: string; body_html: string; foot_html: string; kind: string; status: string };

export default async function EditPage({ searchParams }: { searchParams: Promise<{ path?: string; saved?: string }> }) {
  const { path = "", saved } = await searchParams;
  const p = await db().prepare("SELECT * FROM pages WHERE path=?").bind(path).first<P>();
  if (!p) notFound();
  const removable = p.kind !== "template" && p.path !== "/";
  return (
    <>
      <p className="muted crumb"><a href="/admin/pages">Pages</a> / {p.path}</p>
      <h1>{p.title || "Edit page"}</h1>
      {saved && <Toast text="Page saved" />}
      <form action={savePage} className="editor">
        <input type="hidden" name="path" value={p.path} />
        <div>
          <div className="card">
            <label className="field"><span>Title (browser tab and search results)</span><input type="text" name="title" defaultValue={p.title} /></label>
            <label className="field"><span>Meta description</span><input type="text" name="description" defaultValue={p.description} maxLength={200} /></label>
            <label className="field"><span>Social image URL</span><input type="text" name="og_image" defaultValue={p.og_image} /></label>
          </div>
          <div className="card">
            <label className="field"><span>Page HTML (header, content and footer)</span><textarea name="body_html" rows={24} defaultValue={p.body_html} spellCheck={false} /></label>
            <details>
              <summary className="muted">Advanced: head styles and footer scripts</summary>
              <label className="field"><span>Head HTML</span><textarea name="head_html" rows={8} defaultValue={p.head_html} spellCheck={false} /></label>
              <label className="field"><span>Footer scripts</span><textarea name="foot_html" rows={8} defaultValue={p.foot_html} spellCheck={false} /></label>
            </details>
          </div>
        </div>
        <aside className="aside card">
          <h3>Publish</h3>
          <label className="field"><span>Status</span><select name="status" defaultValue={p.status}><option>published</option><option>draft</option></select></label>
          <div className="row">
            <SubmitButton>Save changes</SubmitButton>
            {p.kind !== "template" && <a className="btn sec" href={p.path} target="_blank" rel="noreferrer">View page</a>}
          </div>
        </aside>
      </form>
      {removable && (
        <form action={deletePage}>
          <input type="hidden" name="path" value={p.path} />
          <ConfirmButton message={`Delete "${p.title}"? This cannot be undone.`}>Delete page</ConfirmButton>
        </form>
      )}
    </>
  );
}
