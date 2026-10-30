import { db } from "@/lib/env";
import { duplicatePage } from "../../actions";
import { SubmitButton, TableSearch } from "../../ui";

type Row = { path: string; title: string; kind: string; status: string; updated_at: string };

export default async function Pages() {
  const rows = (await db().prepare("SELECT path,title,kind,status,updated_at FROM pages ORDER BY kind, path").all<Row>()).results;
  return (
    <>
      <h1>Pages</h1>
      <div className="card">
        <div className="tools"><TableSearch target="pages-table" label="Search pages" /><span className="muted">{rows.length} pages</span></div>
        <div className="tablewrap" id="pages-table">
          <table>
            <thead><tr><th>Title</th><th>URL</th><th>Status</th><th>Updated</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.path} data-q={(r.title + " " + r.path + " " + r.kind).toLowerCase()}>
                  <td className="t">{r.title}{r.kind !== "page" && <span className="muted"> · {r.kind}</span>}</td>
                  <td>{r.kind === "template" ? <span className="muted">{r.path}</span> : <a href={r.path} target="_blank" rel="noreferrer">{r.path}</a>}</td>
                  <td><span className={"chip " + r.status}>{r.status}</span></td>
                  <td className="muted">{r.updated_at.slice(0, 10)}</td>
                  <td><a className="btn sec sm" href={"/admin/pages/edit?path=" + encodeURIComponent(r.path)}>Edit</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <form action={duplicatePage} className="card">
        <h2>Add a page</h2>
        <p className="muted">Starts as a draft copy of an existing page, so it keeps the same header, footer and styling.</p>
        <div className="row">
          <label className="field" style={{ flex: "1 1 240px" }}><span>Copy from</span>
            <select name="from">{rows.filter(r => r.kind !== "template").map(r => <option key={r.path} value={r.path}>{r.title}</option>)}</select>
          </label>
          <label className="field" style={{ flex: "1 1 200px" }}><span>Title</span><input type="text" name="title" /></label>
          <label className="field" style={{ flex: "1 1 180px" }}><span>URL slug</span><input type="text" name="slug" placeholder="new-page" required /></label>
        </div>
        <SubmitButton pending="Creating…">Create draft</SubmitButton>
      </form>
    </>
  );
}
