import { db } from "@/lib/env";
import { deleteCalcLead, toggleCalcLead } from "../../actions";
import { ago, fmtDate, inr } from "../../format";
import { Icon } from "../../icons";
import { MailChip } from "../../mail-chip";
import { ConfirmButton, TableTools, Toast } from "../../ui";

type Lead = {
  id: number; phone: string; email: string; customer_type: string; state: string; basis: string; amount: number; rate: number; plant_size: number;
  yearly_units: number; yearly_savings: number; lifetime_savings: number; payback: number; details: string; status: string; mail_status: string; created_at: string;
};

// Admin > Solar Calculator: everyone who used the calculator on the website and left their mobile number (and email, if they gave one), with what they
// calculated and the result they saw. Newest first. Call or email them from here, mark each one as contacted, or delete it.
export default async function CalculatorLeads({ searchParams }: { searchParams: Promise<{ deleted?: string; toggled?: string }> }) {
  const { deleted, toggled } = await searchParams;
  const rows = await db().prepare("SELECT * FROM calculator_leads ORDER BY id DESC").all<Lead>().then((r) => r.results).catch(() => [] as Lead[]);
  const count = (s: string) => rows.filter((r) => r.status === s).length;
  const typed = (r: Lead) => (r.basis === "units" ? `${Math.round(r.amount).toLocaleString("en-IN")} units a month` : `Monthly bill ${inr(r.amount)}`) + ` at ₹${+Number(r.rate).toFixed(2)} a unit`;
  const result = (r: Lead) => `${Number(r.plant_size).toFixed(2)} kWp · ${inr(r.yearly_savings)} a year · ${inr(r.lifetime_savings)} in 30 years`;
  return (
    <section className="card" aria-labelledby="calc-h">
      {deleted && <Toast text="Lead deleted" />}
      {toggled && <Toast text={toggled === "contacted" ? "Marked as contacted" : "Marked as new"} />}
      <div className="card-h">
        <h2 id="calc-h"><Icon name="calculator" size={22} />Solar Calculator leads</h2>
      </div>
      {rows.length === 0 ? (
        <div className="empty">
          <span className="eico"><Icon name="calculator" size={28} /></span>
          <h3>No leads yet</h3>
          <p>When someone uses the Solar Calculator on the website, their mobile number, email and result appear here.</p>
        </div>
      ) : (
        <>
          <TableTools
            target="calc-table" label="Search leads" noun="leads" total={rows.length}
            filters={[{ value: "all", label: "All", count: rows.length }, { value: "new", label: "New", count: count("new") }, { value: "contacted", label: "Contacted", count: count("contacted") }]}
          />
          <p className="muted" style={{ margin: "0 0 10px" }}>{rows.length} {rows.length === 1 ? "lead" : "leads"}, newest first. Tap a number to call.</p>
          <div className="tablewrap" id="calc-table">
            <table className="rt">
              <thead><tr><th>Contact</th><th>Customer</th><th>Calculated</th><th>Result</th><th>When</th><th>Status</th><th className="act"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {rows.map((r) => {
                  const structured = r.plant_size > 0;
                  return (
                    <tr key={r.id} data-q={(r.phone + " " + r.email + " " + r.state + " " + r.customer_type + " " + r.details).toLowerCase()} data-s={r.status}>
                      <td className="t">
                        <a href={"tel:" + r.phone.replace(/[^\d+]/g, "")}>{r.phone}</a>
                        {r.email ? <span className="s"><a href={"mailto:" + r.email}>{r.email}</a></span> : <span className="s">No email given</span>}
                      </td>
                      <td data-l="Customer">{r.customer_type || "–"}{r.state && <span className="s">{r.state}</span>}</td>
                      <td data-l="Calculated">{structured ? typed(r) : r.details || "–"}</td>
                      <td data-l="Result">{structured ? result(r) : "–"}</td>
                      <td data-l="When" className="muted nw" title={fmtDate(r.created_at)}>{ago(r.created_at)}</td>
                      <td data-l="Status"><span className={"chip " + (r.status === "contacted" ? "published" : "blue")}>{r.status === "contacted" ? "Contacted" : "New"}</span> <MailChip status={r.mail_status} /></td>
                      <td className="act">
                        <span className="acts">
                          <a className="btn sec sm ico" href={"tel:" + r.phone.replace(/[^\d+]/g, "")} title="Call"><Icon name="phone" size={16} /><span className="sr-only">Call {r.phone}</span></a>
                          {r.email && <a className="btn sec sm ico" href={`mailto:${r.email}?subject=${encodeURIComponent("Your solar report from Zakion Energy")}`} title="Email"><Icon name="mail" size={16} /><span className="sr-only">Email {r.email}</span></a>}
                          <form action={toggleCalcLead}><input type="hidden" name="id" value={r.id} />
                            <button className="btn sec sm ico" title={r.status === "contacted" ? "Mark as new" : "Mark as contacted"}><Icon name="check" size={16} /><span className="sr-only">{r.status === "contacted" ? "Mark as new" : "Mark as contacted"}: {r.phone}</span></button></form>
                          <form action={deleteCalcLead}><input type="hidden" name="id" value={r.id} />
                            <ConfirmButton className="btn del sm ico" message={`Delete the lead from ${r.phone}? This cannot be undone.`}><Icon name="trash" size={16} /><span className="sr-only">Delete {r.phone}</span></ConfirmButton></form>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="empty" id="calc-table-none" hidden>
            <span className="eico"><Icon name="search" size={28} /></span>
            <h3>No leads match</h3>
            <p>Try a different word, or switch the filter back to All.</p>
          </div>
        </>
      )}
    </section>
  );
}
