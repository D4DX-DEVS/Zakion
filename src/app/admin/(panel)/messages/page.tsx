import { db } from "@/lib/env";
import { deleteMessage } from "../../actions";
import { ago, fmtDate } from "../../format";
import { Icon } from "../../icons";
import { MailChip } from "../../mail-chip";
import { ConfirmButton } from "../../ui";

type M = { id: number; name: string; email: string; phone: string; subject: string; message: string; mail_status?: string; created_at: string };

// Admin > Submissions: every enquiry sent through the website's contact form (the Contact page and the Home page), newest first.
export default async function Messages() {
  const rows = (await db().prepare("SELECT * FROM messages ORDER BY id DESC").all<M>()).results;
  if (rows.length === 0) {
    return (
      <div className="card empty">
        <span className="eico"><Icon name="inbox" size={28} /></span>
        <h3>No submissions yet</h3>
        <p>Enquiries sent through the contact form will appear here, and are emailed to the team.</p>
      </div>
    );
  }
  return (
    <>
      <p className="lead page">{rows.length} {rows.length === 1 ? "submission" : "submissions"}, newest first.</p>
      {rows.map(m => (
        <article className="card msg" key={m.id}>
          <span className="av" aria-hidden="true">{(m.name || "?").charAt(0)}</span>
          <div className="body">
            <h3>{m.name || "Unknown sender"}{m.subject && <span className="chip blue" title="Interested in">{m.subject}</span>}<MailChip status={m.mail_status} /></h3>
            <div className="meta">
              {m.email && <a href={"mailto:" + m.email}><Icon name="mail" size={16} />{m.email}</a>}
              {m.phone && <a href={"tel:" + m.phone.replace(/[^\d+]/g, "")}><Icon name="phone" size={16} />{m.phone}</a>}
              <span title={fmtDate(m.created_at)}><Icon name="clock" size={16} />{ago(m.created_at)}</span>
            </div>
            <div className="text">{m.message}</div>
            <div className="acts">
              {m.email && <a className="btn sm" href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + (m.subject || "Your enquiry"))}`}><Icon name="mail" size={16} />Reply by email</a>}
              <form action={deleteMessage}>
                <input type="hidden" name="id" value={m.id} />
                <ConfirmButton className="btn del sm" message={`Delete the submission from ${m.name}?`}><Icon name="trash" size={16} />Delete</ConfirmButton>
              </form>
            </div>
          </div>
        </article>
      ))}
    </>
  );
}
