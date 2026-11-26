import { db } from "@/lib/env";
import type { Faq } from "@/lib/content";
import { deleteFaq, moveFaq, reorderFaqs, toggleFaq } from "../../actions";
import { Icon } from "../../icons";
import { SortRows } from "../../sort-rows";
import { ConfirmButton, TableTools, Toast } from "../../ui";

// Admin > FAQs: the questions and answers on the FAQ page. Add, edit, show or hide, reorder (drag the grip or use the arrows) and delete them here.
// The order here is the order on the website; questions with the same category are grouped under one tab.
export default async function Faqs({ searchParams }: { searchParams: Promise<{ deleted?: string; toggled?: string }> }) {
  const { deleted, toggled } = await searchParams;
  const rows = await db().prepare("SELECT * FROM faqs ORDER BY sort, id").all<Faq>().then((r) => r.results).catch(() => [] as Faq[]);
  const count = (s: string) => rows.filter((r) => r.status === s).length;
  return (
    <section className="card" aria-labelledby="faqs-h">
      {deleted && <Toast text="Question deleted" />}
      {toggled && <Toast text={toggled === "hidden" ? "Question hidden from the website" : "Question is now shown on the website"} />}
      <div className="card-h">
        <h2 id="faqs-h"><Icon name="help" size={22} />All questions</h2>
        <a className="btn" href="/admin/faqs/new"><Icon name="plus" size={18} />Add a question</a>
      </div>
      {rows.length === 0 ? (
        <div className="empty">
          <span className="eico"><Icon name="help" size={28} /></span>
          <h3>No questions yet</h3>
          <p>Add your first question and answer. It shows on the FAQ page, grouped under its category.</p>
          <a className="btn" href="/admin/faqs/new"><Icon name="plus" size={18} />Add a question</a>
        </div>
      ) : (
        <>
          <TableTools
            target="faqs-table" label="Search questions" noun="questions" total={rows.length}
            filters={[{ value: "all", label: "All", count: rows.length }, { value: "published", label: "Shown", count: count("published") }, { value: "draft", label: "Hidden", count: count("draft") }]}
          />
          <p className="muted" style={{ margin: "0 0 10px" }}>Drag a row by its handle, or use the arrows, to change the order on the FAQ page.</p>
          <form id="faqs-sort" action={reorderFaqs} hidden><input type="hidden" name="keys" /></form>
          <div className="tablewrap" id="faqs-table">
            <table className="rt">
              <thead><tr><th className="grip"><span className="sr-only">Move</span></th><th>Question</th><th>Category</th><th>On website</th><th>Order</th><th className="act"><span className="sr-only">Actions</span></th></tr></thead>
              <SortRows formId="faqs-sort">
                {rows.map((r, i) => (
                  <tr key={r.id} data-sort="" data-key={r.id} draggable data-q={(r.question + " " + r.answer + " " + r.category).toLowerCase()} data-s={r.status}>
                    <td className="grip" aria-hidden="true" title="Drag to move"><Icon name="grip" size={18} /></td>
                    <td className="t">{r.question}<span className="s">{r.answer.replace(/\*\*|==/g, "").replace(/\s+/g, " ").slice(0, 110)}{r.answer.length > 110 ? "…" : ""}</span></td>
                    <td data-l="Category"><span className="chip">{r.category || "General"}</span></td>
                    <td data-l="On website"><span className={"chip " + r.status}>{r.status === "published" ? "Shown" : "Hidden"}</span></td>
                    <td data-l="Order" className="ord">
                      <span className="muted nw">{i + 1}</span>
                      <form action={moveFaq}><input type="hidden" name="key" value={r.id} /><input type="hidden" name="dir" value="up" />
                        <button className="o-btn" disabled={i === 0} aria-label={`Move question ${i + 1} up`} title="Move up"><Icon name="up" size={15} /></button></form>
                      <form action={moveFaq}><input type="hidden" name="key" value={r.id} /><input type="hidden" name="dir" value="down" />
                        <button className="o-btn" disabled={i === rows.length - 1} aria-label={`Move question ${i + 1} down`} title="Move down"><Icon name="down" size={15} /></button></form>
                    </td>
                    <td className="act">
                      <span className="acts">
                        {r.status === "published"
                          ? <a className="btn sec sm ico" href={`/faq/#faq-${r.id}`} target="_blank" rel="noreferrer" title="View on the website" draggable={false}><Icon name="external" size={16} /><span className="sr-only">View question {i + 1} (opens in a new tab)</span></a>
                          : <span className="btn sec sm ico is-off" title="Hidden questions are not on the website"><Icon name="external" size={16} /><span className="sr-only">Question {i + 1} is hidden</span></span>}
                        <form action={toggleFaq}><input type="hidden" name="key" value={r.id} />
                          <button className="btn sec sm ico" title={r.status === "published" ? "Hide from the website" : "Show on the website"}><Icon name={r.status === "published" ? "eyeOff" : "eye"} size={16} /><span className="sr-only">{r.status === "published" ? "Hide" : "Show"} question {i + 1}</span></button></form>
                        <a className="btn sec sm ico" href={"/admin/faqs/" + r.id} title="Edit" draggable={false}><Icon name="pencil" size={16} /><span className="sr-only">Edit question {i + 1}</span></a>
                        <form action={deleteFaq}><input type="hidden" name="key" value={r.id} />
                          <ConfirmButton className="btn del sm ico" message={`Delete the question "${r.question}"? It is removed from the website and this cannot be undone.`}><Icon name="trash" size={16} /><span className="sr-only">Delete question {i + 1}</span></ConfirmButton></form>
                      </span>
                    </td>
                  </tr>
                ))}
              </SortRows>
            </table>
          </div>
          <div className="empty" id="faqs-table-none" hidden>
            <span className="eico"><Icon name="search" size={28} /></span>
            <h3>No questions match</h3>
            <p>Try a different word, or switch the filter back to All.</p>
          </div>
        </>
      )}
    </section>
  );
}
