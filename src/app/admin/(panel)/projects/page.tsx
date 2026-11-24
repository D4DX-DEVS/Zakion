import { db } from "@/lib/env";
import type { Project } from "@/lib/content";
import { Icon } from "../../icons";
import { TableTools, Toast } from "../../ui";

// Admin > Projects: every project on the Projects page (cards, filter tabs) and its own page. Add, edit, publish or delete them here.
export default async function Projects({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const { deleted } = await searchParams;
  const rows = await db().prepare("SELECT * FROM projects ORDER BY sort, id DESC").all<Project>().then((r) => r.results).catch(() => [] as Project[]);
  const count = (s: string) => rows.filter((r) => r.status === s).length;
  return (
    <section className="card" aria-labelledby="projects-h">
      {deleted && <Toast text="Project deleted" />}
      <div className="card-h">
        <h2 id="projects-h"><Icon name="grid" size={22} />All projects</h2>
        <a className="btn" href="/admin/projects/new"><Icon name="plus" size={18} />Add a project</a>
      </div>
      {rows.length === 0 ? (
        <div className="empty">
          <span className="eico"><Icon name="grid" size={28} /></span>
          <h3>No projects yet</h3>
          <p>Add your first project: it shows as a card on the Projects page, with its own page for the details and the gallery.</p>
          <a className="btn" href="/admin/projects/new"><Icon name="plus" size={18} />Add a project</a>
        </div>
      ) : (
        <>
          <TableTools
            target="projects-table" label="Search projects" noun="projects" total={rows.length}
            filters={[{ value: "all", label: "All", count: rows.length }, { value: "published", label: "Published", count: count("published") }, { value: "draft", label: "Draft", count: count("draft") }]}
          />
          <div className="tablewrap" id="projects-table">
            <table className="rt">
              <thead><tr><th>Project</th><th>Category</th><th>Status</th><th>Order</th><th>Page</th><th className="act"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} data-q={(r.title + " " + r.category + " " + r.location + " " + r.status).toLowerCase()} data-s={r.status}>
                    <td className="t">{r.title}{r.location && <span className="s">{r.location}</span>}</td>
                    <td data-l="Category">{r.category}</td>
                    <td data-l="Status"><span className={"chip " + r.status}>{r.status}</span></td>
                    <td data-l="Order" className="muted nw">{r.sort}</td>
                    <td data-l="Page">{r.status === "published" ? <a href={`/projects/${r.slug}/`} target="_blank" rel="noreferrer">/projects/{r.slug}/</a> : <span className="muted">Not shown</span>}</td>
                    <td className="act"><a className="btn sec sm" href={"/admin/projects/" + r.id}><Icon name="pencil" size={16} />Edit<span className="sr-only"> {r.title}</span></a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="empty" id="projects-table-none" hidden>
            <span className="eico"><Icon name="search" size={28} /></span>
            <h3>No projects match</h3>
            <p>Try a different word, or switch the filter back to All.</p>
          </div>
        </>
      )}
    </section>
  );
}
