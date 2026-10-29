import { db } from "@/lib/env";
import { duplicatePage } from "../../actions";

type Row = { path: string; title: string; kind: string; status: string; updated_at: string };

export default async function Pages() {
  const rows = (await db().prepare("SELECT path,title,kind,status,updated_at FROM pages ORDER BY kind, path").all<Row>()).results;
  return (
    <>
      <h1>Pages</h1>
      <div className="card">
        <table>
          <thead><tr><th>Title</th><th>URL</th><th>Type</th><th>Status</th><th>Updated</th><th /></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.path}>
                <td>{r.title}</td>
                <td>{r.kind === "template" ? <span className="muted">{r.path}</span> : <a href={r.path} target="_blank">{r.path}</a>}</td>
                <td>{r.kind}</td>
                <td><span className={"badge " + r.status}>{r.status}</span></td>
                <td className="muted">{r.updated_at}</td>
                <td><a className="btn sec" href={"/admin/pages/edit?path=" + encodeURIComponent(r.path)}>Edit</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form action={duplicatePage} className="card">
        <h3 style={{ marginTop: 0 }}>New page (copy of an existing one)</h3>
        <div className="row">
          <select name="from" style={{ width: 260 }}>
            {rows.filter(r => r.kind !== "template").map(r => <option key={r.path} value={r.path}>{r.title} ({r.path})</option>)}
          </select>
          <input type="text" name="title" placeholder="Title" style={{ width: 220 }} />
          <input type="text" name="slug" placeholder="url-slug" style={{ width: 180 }} required />
          <button className="btn">Create draft</button>
        </div>
      </form>
    </>
  );
}
