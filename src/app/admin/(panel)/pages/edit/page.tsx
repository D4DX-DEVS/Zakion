import { notFound } from "next/navigation";
import { db } from "@/lib/env";
import { deletePage, savePage } from "../../../actions";

type P = { path: string; title: string; description: string; og_image: string; head_html: string; body_html: string; foot_html: string; kind: string; status: string };

export default async function EditPage({ searchParams }: { searchParams: Promise<{ path?: string; saved?: string }> }) {
  const { path = "", saved } = await searchParams;
  const p = await db().prepare("SELECT * FROM pages WHERE path=?").bind(path).first<P>();
  if (!p) notFound();
  return (
    <>
      <h1>Edit page</h1>
      {saved && <p className="badge published">Saved</p>}
      <form action={savePage} className="card">
        <input type="hidden" name="path" value={p.path} />
        <label>Title (browser tab / SEO)</label>
        <input type="text" name="title" defaultValue={p.title} />
        <label>Meta description</label>
        <input type="text" name="description" defaultValue={p.description} />
        <label>Social image URL</label>
        <input type="text" name="og_image" defaultValue={p.og_image} />
        <label>Status</label>
        <select name="status" defaultValue={p.status}><option>published</option><option>draft</option></select>
        <label>Page HTML (header, content and footer)</label>
        <textarea name="body_html" rows={26} defaultValue={p.body_html} />
        <details>
          <summary className="muted" style={{ marginTop: 12 }}>Advanced: head (CSS) and footer (JS)</summary>
          <label>Head HTML</label>
          <textarea name="head_html" rows={8} defaultValue={p.head_html} />
          <label>Footer scripts</label>
          <textarea name="foot_html" rows={8} defaultValue={p.foot_html} />
        </details>
        <p className="row">
          <button className="btn">Save</button>
          {p.kind !== "template" && <a className="btn sec" href={p.path} target="_blank">View</a>}
        </p>
      </form>
      {p.kind !== "template" && p.path !== "/" && (
        <form action={deletePage}>
          <input type="hidden" name="path" value={p.path} />
          <button className="btn del">Delete page</button>
        </form>
      )}
    </>
  );
}
