import { db } from "@/lib/env";
import type { Testimonial } from "@/lib/content";
import { deleteTestimonial, toggleTestimonial } from "../../actions";
import { fmtDate } from "../../format";
import { Icon } from "../../icons";
import { ConfirmButton, TableTools, Toast } from "../../ui";

// Admin > Testimonials: what customers say. The newest comes first; the latest few show in the Home page carousel and all of them on the
// Testimonials page. Add, edit, show or hide and delete them here.
export default async function Testimonials({ searchParams }: { searchParams: Promise<{ deleted?: string; toggled?: string }> }) {
  const { deleted, toggled } = await searchParams;
  const rows = await db().prepare("SELECT * FROM testimonials ORDER BY created_at DESC, id DESC").all<Testimonial>().then((r) => r.results).catch(() => [] as Testimonial[]);
  const count = (s: string) => rows.filter((r) => r.status === s).length;
  const kind = (r: Testimonial) => (r.video && r.quote ? "Text + video" : r.video ? "Video" : "Text");
  return (
    <section className="card" aria-labelledby="testimonials-h">
      {deleted && <Toast text="Testimonial deleted" />}
      {toggled && <Toast text={toggled === "hidden" ? "Testimonial hidden from the website" : "Testimonial is now shown on the website"} />}
      <div className="card-h">
        <h2 id="testimonials-h"><Icon name="quote" size={22} />All testimonials</h2>
        <a className="btn" href="/admin/testimonials/new"><Icon name="plus" size={18} />Add a testimonial</a>
      </div>
      {rows.length === 0 ? (
        <div className="empty">
          <span className="eico"><Icon name="quote" size={28} /></span>
          <h3>No testimonials yet</h3>
          <p>Add your first testimonial: a written quote, a video, or both. It shows in the carousel on the Home page and on the Testimonials page.</p>
          <a className="btn" href="/admin/testimonials/new"><Icon name="plus" size={18} />Add a testimonial</a>
        </div>
      ) : (
        <>
          <TableTools
            target="testimonials-table" label="Search testimonials" noun="testimonials" total={rows.length}
            filters={[{ value: "all", label: "All", count: rows.length }, { value: "published", label: "Shown", count: count("published") }, { value: "draft", label: "Hidden", count: count("draft") }]}
          />
          <p className="muted" style={{ margin: "0 0 10px" }}>The newest testimonial comes first. The latest six show in the carousel on the Home page.</p>
          <div className="tablewrap" id="testimonials-table">
            <table className="rt">
              <thead><tr><th>Name</th><th>Type</th><th>On website</th><th>Added</th><th className="act"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} data-q={(r.name + " " + r.role + " " + r.company + " " + r.quote).toLowerCase()} data-s={r.status}>
                    <td className="t">{r.name}{(r.role || r.company) && <span className="s">{[r.role, r.company].filter(Boolean).join(", ")}</span>}</td>
                    <td data-l="Type"><span className="chip">{kind(r)}</span></td>
                    <td data-l="On website"><span className={"chip " + r.status}>{r.status === "published" ? "Shown" : "Hidden"}</span></td>
                    <td data-l="Added" className="muted nw">{fmtDate(r.created_at)}</td>
                    <td className="act">
                      <span className="acts">
                        {r.status === "published"
                          ? <a className="btn sec sm ico" href={`/testimonials/#testimonial-${r.id}`} target="_blank" rel="noreferrer" title="View on the website"><Icon name="external" size={16} /><span className="sr-only">View {r.name} (opens in a new tab)</span></a>
                          : <span className="btn sec sm ico is-off" title="Hidden testimonials are not on the website"><Icon name="external" size={16} /><span className="sr-only">{r.name} is hidden</span></span>}
                        <form action={toggleTestimonial}><input type="hidden" name="key" value={r.id} />
                          <button className="btn sec sm ico" title={r.status === "published" ? "Hide from the website" : "Show on the website"}><Icon name={r.status === "published" ? "eyeOff" : "eye"} size={16} /><span className="sr-only">{r.status === "published" ? "Hide" : "Show"} {r.name}</span></button></form>
                        <a className="btn sec sm ico" href={"/admin/testimonials/" + r.id} title="Edit"><Icon name="pencil" size={16} /><span className="sr-only">Edit {r.name}</span></a>
                        <form action={deleteTestimonial}><input type="hidden" name="key" value={r.id} />
                          <ConfirmButton className="btn del sm ico" message={`Delete the testimonial from ${r.name}? It is removed from the website and this cannot be undone.`}><Icon name="trash" size={16} /><span className="sr-only">Delete {r.name}</span></ConfirmButton></form>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="empty" id="testimonials-table-none" hidden>
            <span className="eico"><Icon name="search" size={28} /></span>
            <h3>No testimonials match</h3>
            <p>Try a different word, or switch the filter back to All.</p>
          </div>
        </>
      )}
    </section>
  );
}
