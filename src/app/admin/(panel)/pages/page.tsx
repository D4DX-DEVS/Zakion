import { db } from "@/lib/env";
import { PAGE_DEFAULTS, PAGE_TITLES } from "@/lib/content";
import { duplicatePage } from "../../actions";
import { fmtDate } from "../../format";
import { Icon } from "../../icons";
import { SubmitButton, TableTools } from "../../ui";

type Row = { path: string; title: string; kind: string; status: string; updated_at: string };

export default async function Pages() {
  const rows = (await db().prepare("SELECT path,title,kind,status,updated_at FROM pages ORDER BY kind, path").all<Row>()).results;
  const count = (s: string) => rows.filter(r => r.status === s).length;
  // the pages that are built from sections: each opens its own section editor (Home is edited in Studio)
  const built = Object.keys(PAGE_DEFAULTS).map((p) => ({ path: p, title: PAGE_TITLES[p] ?? p, href: p === "/" ? "/admin/studio" : "/admin/pages/sections?page=" + encodeURIComponent(p) }));
  return (
    <>
      <section className="card" aria-labelledby="built-h">
        <div className="card-h"><h2 id="built-h"><Icon name="layers" size={22} />Edit a page's sections</h2></div>
        <p className="lead">Open a page to edit its sections, drag them into a new order, take off the ones you do not want and add others.</p>
        <ul className="pg-tiles">
          {built.map((b) => (
            <li key={b.path}>
              <a href={b.href}><span className="pg-ic" aria-hidden="true"><Icon name={b.path === "/" ? "home" : "file"} size={20} /></span><span className="pg-t"><b>{b.title}</b><i>{b.path === "/" ? "Opens Studio" : `${b.path}`}</i></span><Icon name="arrowRight" size={16} /></a>
            </li>
          ))}
        </ul>
      </section>

      <section className="card" aria-labelledby="pages-h">
        <div className="card-h"><h2 id="pages-h"><Icon name="file" size={22} />All pages</h2></div>
        <TableTools
          target="pages-table" label="Search pages" noun="pages" total={rows.length}
          filters={[{ value: "all", label: "All", count: rows.length }, { value: "published", label: "Published", count: count("published") }, { value: "draft", label: "Draft", count: count("draft") }]}
        />
        <div className="tablewrap" id="pages-table">
          <table className="rt">
            <thead><tr><th>Title</th><th>URL</th><th>Status</th><th>Updated</th><th className="act"><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.path} data-q={(r.title + " " + r.path + " " + r.kind).toLowerCase()} data-s={r.status}>
                  <td className="t">{r.title || r.path}{r.kind !== "page" && <span className="s">{r.kind}</span>}</td>
                  <td data-l="URL">{r.kind === "template" ? <span className="muted">{r.path}</span> : <a href={r.path} target="_blank" rel="noreferrer">{r.path}</a>}</td>
                  <td data-l="Status"><span className={"chip " + r.status}>{r.status}</span></td>
                  <td data-l="Updated" className="muted nw">{fmtDate(r.updated_at)}</td>
                  <td className="act">
                    {r.kind !== "template" && r.path !== "/" && PAGE_DEFAULTS[r.path] && <a className="btn sec sm" href={"/admin/pages/sections?page=" + encodeURIComponent(r.path)}><Icon name="layers" size={16} />Sections<span className="sr-only"> of {r.title || r.path}</span></a>}{" "}
                    <a className="btn sec sm" href={"/admin/pages/edit?path=" + encodeURIComponent(r.path)}><Icon name="pencil" size={16} />Edit<span className="sr-only"> {r.title || r.path}</span></a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="empty" id="pages-table-none" hidden>
          <span className="eico"><Icon name="search" size={28} /></span>
          <h3>No pages match</h3>
          <p>Try a different word, or switch the filter back to All.</p>
        </div>
      </section>

      <form action={duplicatePage} className="card">
        <div className="card-h"><h2><Icon name="plus" size={22} />Add a page</h2></div>
        <p className="lead">Starts as a draft copy of an existing page, so it keeps the same header, footer and styling.</p>
        <div className="row" style={{ alignItems: "flex-start" }}>
          <label className="field" style={{ flex: "1 1 240px" }}><span>Copy from</span>
            <select name="from">{rows.filter(r => r.kind !== "template").map(r => <option key={r.path} value={r.path}>{r.title || r.path}</option>)}</select>
          </label>
          <label className="field" style={{ flex: "1 1 200px" }}><span>Title</span><input type="text" name="title" placeholder="e.g. Careers" /></label>
          <label className="field" style={{ flex: "1 1 180px" }}><span>URL slug</span><input type="text" name="slug" placeholder="new-page" required /></label>
        </div>
        <SubmitButton pending="Creating…"><Icon name="plus" size={18} />Create draft</SubmitButton>
      </form>
    </>
  );
}
