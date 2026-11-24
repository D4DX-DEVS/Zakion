import { db } from "@/lib/env";
import type { System } from "@/lib/content";
import { deleteSystem, moveSystem, reorderSystems, toggleSystem } from "../../actions";
import { Icon } from "../../icons";
import { SortRows } from "../../sort-rows";
import { ConfirmButton, TableTools, Toast } from "../../ui";

// Admin > Systems: the system types on the Solutions page (a card each, with its own page). Add, edit, show or hide, reorder (drag the grip or
// use the arrows) and delete them here. The order here is the order of the cards on the website.
export default async function Systems({ searchParams }: { searchParams: Promise<{ deleted?: string; toggled?: string }> }) {
  const { deleted, toggled } = await searchParams;
  const rows = await db().prepare("SELECT * FROM systems ORDER BY sort, id").all<System>().then((r) => r.results).catch(() => [] as System[]);
  const count = (s: string) => rows.filter((r) => r.status === s).length;
  return (
    <section className="card" aria-labelledby="systems-h">
      {deleted && <Toast text="System deleted" />}
      {toggled && <Toast text={toggled === "hidden" ? "System hidden from the website" : "System is now shown on the website"} />}
      <div className="card-h">
        <h2 id="systems-h"><Icon name="sun" size={22} />All systems</h2>
        <a className="btn" href="/admin/systems/new"><Icon name="plus" size={18} />Add a system</a>
      </div>
      {rows.length === 0 ? (
        <div className="empty">
          <span className="eico"><Icon name="sun" size={28} /></span>
          <h3>No systems yet</h3>
          <p>Add your first system: it shows as a card on the Solutions page, with its own page for the details.</p>
          <a className="btn" href="/admin/systems/new"><Icon name="plus" size={18} />Add a system</a>
        </div>
      ) : (
        <>
          <TableTools
            target="systems-table" label="Search systems" noun="systems" total={rows.length}
            filters={[{ value: "all", label: "All", count: rows.length }, { value: "published", label: "Shown", count: count("published") }, { value: "draft", label: "Hidden", count: count("draft") }]}
          />
          <p className="muted" style={{ margin: "0 0 10px" }}>Drag a row by its handle, or use the arrows, to change the order of the cards on the Solutions page.</p>
          <form id="systems-sort" action={reorderSystems} hidden><input type="hidden" name="keys" /></form>
          <div className="tablewrap" id="systems-table">
            <table className="rt">
              <thead><tr><th className="grip"><span className="sr-only">Move</span></th><th>System</th><th>Page address</th><th>On website</th><th>Order</th><th className="act"><span className="sr-only">Actions</span></th></tr></thead>
              <SortRows formId="systems-sort">
                {rows.map((r, i) => (
                  <tr key={r.id} data-sort="" data-key={r.id} draggable data-q={(r.title + " " + r.slug).toLowerCase()} data-s={r.status}>
                    <td className="grip" aria-hidden="true" title="Drag to move"><Icon name="grip" size={18} /></td>
                    <td className="t">{r.title}</td>
                    <td data-l="Page address" className="muted">/services/{r.slug}/</td>
                    <td data-l="On website"><span className={"chip " + r.status}>{r.status === "published" ? "Shown" : "Hidden"}</span></td>
                    <td data-l="Order" className="ord">
                      <span className="muted nw">{i + 1}</span>
                      <form action={moveSystem}><input type="hidden" name="key" value={r.id} /><input type="hidden" name="dir" value="up" />
                        <button className="o-btn" disabled={i === 0} aria-label={`Move ${r.title} up`} title="Move up"><Icon name="up" size={15} /></button></form>
                      <form action={moveSystem}><input type="hidden" name="key" value={r.id} /><input type="hidden" name="dir" value="down" />
                        <button className="o-btn" disabled={i === rows.length - 1} aria-label={`Move ${r.title} down`} title="Move down"><Icon name="down" size={15} /></button></form>
                    </td>
                    <td className="act">
                      <span className="acts">
                        {r.status === "published"
                          ? <a className="btn sec sm ico" href={`/services/${r.slug}/`} target="_blank" rel="noreferrer" title="View on the website" draggable={false}><Icon name="external" size={16} /><span className="sr-only">View {r.title} (opens in a new tab)</span></a>
                          : <span className="btn sec sm ico is-off" title="Hidden systems have no page on the website"><Icon name="external" size={16} /><span className="sr-only">{r.title} is hidden</span></span>}
                        <form action={toggleSystem}><input type="hidden" name="key" value={r.id} />
                          <button className="btn sec sm ico" title={r.status === "published" ? "Hide from the website" : "Show on the website"}><Icon name={r.status === "published" ? "eyeOff" : "eye"} size={16} /><span className="sr-only">{r.status === "published" ? "Hide" : "Show"} {r.title}</span></button></form>
                        <a className="btn sec sm ico" href={"/admin/systems/" + r.id} title="Edit" draggable={false}><Icon name="pencil" size={16} /><span className="sr-only">Edit {r.title}</span></a>
                        <form action={deleteSystem}><input type="hidden" name="key" value={r.id} />
                          <ConfirmButton className="btn del sm ico" message={`Delete "${r.title}"? Its card and page are removed from the website and this cannot be undone.`}><Icon name="trash" size={16} /><span className="sr-only">Delete {r.title}</span></ConfirmButton></form>
                      </span>
                    </td>
                  </tr>
                ))}
              </SortRows>
            </table>
          </div>
          <div className="empty" id="systems-table-none" hidden>
            <span className="eico"><Icon name="search" size={28} /></span>
            <h3>No systems match</h3>
            <p>Try a different word, or switch the filter back to All.</p>
          </div>
        </>
      )}
    </section>
  );
}
