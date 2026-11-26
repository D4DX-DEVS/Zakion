import { loadOne } from "@/lib/content";
import { db, env } from "@/lib/env";
import { type Enquiry, enquiryMail, sendMail } from "@/lib/mail";

const FALLBACK_TO = "info@zakionenergy.com";

/** Emails an enquiry to the address set in the Contact block (Studio) and notes on its entry (Submissions, or Solar Calculator for a calculator lead) whether that worked (shown in the admin).
 *  Used by the contact form and by the Solar Calculator; run it in the background (waitUntil) so the visitor does not wait for the mail service. */
export async function notifyEnquiry(id: number, e: Enquiry, subject?: string, table: "messages" | "calculator_leads" = "messages") {
  let status: string;
  try {
    const to = String((await loadOne("contact")).data.notifyEmail ?? "").trim() || FALLBACK_TO;
    const r = await sendMail({ apiKey: env().RESEND_API_KEY, from: env().MAIL_FROM }, enquiryMail(e, to, subject));
    status = r.ok ? "sent" : r.status === "not configured" ? "not configured" : "failed: " + (r.detail ?? "");
    if (!r.ok) console.warn("Enquiry email not sent:", status);
  } catch (x) {
    status = "failed: " + String(x).slice(0, 200);
    console.warn("Enquiry email not sent:", status);
  }
  const sql = table === "calculator_leads" ? "UPDATE calculator_leads SET mail_status=? WHERE id=?" : "UPDATE messages SET mail_status=? WHERE id=?";
  await db().prepare(sql).bind(status.slice(0, 300), id).run().catch(() => { /* the column is added by migration 0012 */ });
}
