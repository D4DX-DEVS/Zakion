// Sends the email that tells the team about a new enquiry. It uses Resend (https://resend.com) over plain HTTP, so it needs no library:
//   RESEND_API_KEY  the API key (a Worker secret: npx wrangler secret put RESEND_API_KEY; for local testing put it in .dev.vars)
//   MAIL_FROM       the sender, for example  Zakion Energy <enquiries@zakionenergy.com>  (the address must be on a domain verified at Resend).
//                   Without it the mail is sent from Resend's test sender, which only delivers to the Resend account owner's own address.
// Without a key nothing is sent; the enquiry is still saved under Submissions in the admin, which shows whether each one was emailed.

export type MailConfig = { apiKey?: string; from?: string };
export type Mail = { to: string; subject: string; text: string; html: string; replyTo?: string };
export type MailResult = { ok: boolean; status: "sent" | "not configured" | "failed"; detail?: string };

export async function sendMail(cfg: MailConfig, m: Mail, doFetch: typeof fetch = fetch): Promise<MailResult> {
  if (!cfg.apiKey) return { ok: false, status: "not configured" };
  try {
    const r = await doFetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${cfg.apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({ from: cfg.from || "Zakion Energy <onboarding@resend.dev>", to: [m.to], subject: m.subject, text: m.text, html: m.html, ...(m.replyTo ? { reply_to: m.replyTo } : {}) }),
    });
    if (r.ok) return { ok: true, status: "sent" };
    return { ok: false, status: "failed", detail: `${r.status} ${(await r.text()).slice(0, 200)}` };
  } catch (e) {
    return { ok: false, status: "failed", detail: String(e).slice(0, 200) };
  }
}

export type Enquiry = { name: string; email: string; phone: string; interest: string; message: string };
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

/** The notification for one enquiry: who wrote, how to reach them, what they are interested in and their message. Replying goes to the visitor (when they gave an email).
 *  "subject" replaces the default subject line. */
export function enquiryMail(e: Enquiry, to: string, subject?: string): Mail {
  const rows: [string, string][] = [["Name", e.name], ["Phone", e.phone], ["Email", e.email], ["Interested in", e.interest], ["Message", e.message]].map(([k, v]) => [k, v || "-"]);
  return {
    to,
    replyTo: e.email,
    subject: subject ? oneLine(subject) : `New enquiry from ${oneLine(e.name)}${e.interest ? " - " + oneLine(e.interest) : ""}`,
    text: "New enquiry from the Zakion Energy website\n\n" + rows.map(([k, v]) => `${k}: ${v}`).join("\n") + "\n",
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;color:#0d3d7b"><h2 style="margin:0 0 12px">New enquiry from the website</h2><table style="border-collapse:collapse;width:100%">` +
      rows.map(([k, v]) => `<tr><td style="padding:8px 12px;border:1px solid #dbe5f5;background:#f1f4fb;font-weight:bold;width:130px;vertical-align:top">${k}</td><td style="padding:8px 12px;border:1px solid #dbe5f5;white-space:pre-wrap">${esc(v)}</td></tr>`).join("") +
      `</table><p style="color:#3d5a86;font-size:13px">Saved under Submissions in the admin. Reply to this email to answer ${esc(oneLine(e.name))}.</p></div>`,
  };
}
