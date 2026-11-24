import { db } from "@/lib/env";
import type { Project } from "@/lib/content";
import { deleteProject, moveProject, reorderProjects, toggleProject } from "../../actions";
import { Icon } from "../../icons";
import { SortRows } from "../../sort-rows";
import { ConfirmButton, TableTools, Toast } from "../../ui";

// Admin > Projects: every project on the Projects page (cards, filter tabs) and its own page. Add, edit, show or hide, reorder (drag the grip
// or use the arrows) and delete them here. The order here is the order on the website.
export default async function Projects({ searchParams }: { searchParams: Promise<{ deleted?: string; toggled?: string }> }) {
  const { deleted, toggled } = await searchParams;
  const rows = await db().prepare("SELECT * FROM projects ORDER BY sort, id DESC").all<Project>().then((r) => r.results).catch(() => [] as Project[]);
  const count = (s: string) => rows.filter((r) => r.status === s).length;
  return (
    <section className="card" aria-labelledby="projects-h">
      {deleted && <Toast text="Project deleted" />}
      {toggled && <Toast text={toggled === "hidden" ? "Project hidden from the website" : "Project is now shown on the website"} />}
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
            filters={[{ value: "all", label: "All", count: rows.length }, { value: "published", label: "Shown", count: count("published") }, { value: "draft", label: "Hidden", count: count("draft") }]}
          />
          <p className="muted" style={{ margin: "0 0 10px" }}>Drag a row by its handle, or use the arrows, to change the order on the website.</p>
          <form id="projects-sort" action={reorderProjects} hidden><input type="hidden" name="keys" /></form>
          <div className="tablewrap" id="projects-table">
            <table className="rt">
              <thead><tr><th className="grip"><span className="sr-only">Move</span></th><th>Project</th><th>Category</th><th>Status</th><th>On website</th><th>Order</th><th className="act"><span className="sr-only">Actions</span></th></tr></thead>
              <SortRows formId="projects-sort">
                {rows.map((r, i) => (
                  <tr key={r.id} data-sort="" data-key={r.id} draggable data-q={(r.title + " " + r.category + " " + r.location + " " + r.stage).toLowerCase()} data-s={r.status}>
                    <td className="grip" aria-hidden="true" title="Drag to move"><Icon name="grip" size={18} /></td>
                    <td className="t">{r.title}{r.location && <span className="s">{r.location}</span>}</td>
                    <td data-l="Category">{r.category}</td>
                    <td data-l="Status"><span className={"chip " + (r.stage === "ongoing" ? "draft" : "published")}>{r.stage === "ongoing" ? "Ongoing" : "Completed"}</span></td>
                    <td data-l="On website"><span className={"chip " + r.status}>{r.status === "published" ? "Shown" : "Hidden"}</span></td>
                    <td data-l="Order" className="ord">
                      <span className="muted nw">{i + 1}</span>
                      <form action={moveProject}><input type="hidden" name="key" value={r.id} /><input type="hidden" name="dir" value="up" />
                        <button className="o-btn" disabled={i === 0} aria-label={`Move ${r.title} up`} title="Move up"><Icon name="up" size={15} /></button></form>
                      <form action={moveProject}><input type="hidden" name="key" value={r.id} /><input type="hidden" name="dir" value="down" />
                        <button className="o-btn" disabled={i === rows.length - 1} aria-label={`Move ${r.title} down`} title="Move down"><Icon name="down" size={15} /></button></form>
                    </td>
                    <td className="act">
                      <span className="acts">
                        {r.status === "published"
                          ? <a className="btn sec sm ico" href={`/projects/${r.slug}/`} target="_blank" rel="noreferrer" title="View on the website" draggable={false}><Icon name="external" size={16} /><span className="sr-only">View {r.title} (opens in a new tab)</span></a>
                          : <span className="btn sec sm ico is-off" title="Hidden projects have no page on the website"><Icon name="external" size={16} /><span className="sr-only">{r.title} is hidden</span></span>}
                        <form action={toggleProject}><input type="hidden" name="key" value={r.id} />
                          <button className="btn sec sm ico" title={r.status === "published" ? "Hide from the website" : "Show on the website"}><Icon name={r.status === "published" ? "eyeOff" : "eye"} size={16} /><span className="sr-only">{r.status === "published" ? "Hide" : "Show"} {r.title}</span></button></form>
                        <a className="btn sec sm ico" href={"/admin/projects/" + r.id} title="Edit" draggable={false}><Icon name="pencil" size={16} /><span className="sr-only">Edit {r.title}</span></a>
                        <form action={deleteProject}><input type="hidden" name="key" value={r.id} />
                          <ConfirmButton className="btn del sm ico" message={`Delete "${r.title}"? Its page is removed from the website and this cannot be undone.`}><Icon name="trash" size={16} /><span className="sr-only">Delete {r.title}</span></ConfirmButton></form>
                      </span>
                    </td>
                  </tr>
                ))}
              </SortRows>
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
