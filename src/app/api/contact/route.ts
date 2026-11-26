import { getCloudflareContext } from "@opennextjs/cloudflare";
import { loadOne } from "@/lib/content";
import { db, env } from "@/lib/env";
import { type Enquiry, enquiryMail, sendMail } from "@/lib/mail";

const THANKS = "Thank you! We will connect with you as soon as possible.";
const FALLBACK_TO = "info@zakionenergy.com";

export async function POST(req: Request) {
  const f = await req.formData();
  const g = (k: string) => String(f.get(k) || "").trim().slice(0, 2000);
  if (g("_wpcf7_ak_hp_textarea")) return Response.json({ ok: true, message: THANKS }); // a bot filled the hidden field: pretend it worked, save nothing
  if (!g("FullName") || !/^\S+@\S+\.\S+$/.test(g("Email")) || !g("Phone"))
    return Response.json({ ok: false, message: "Please fill in name, a valid email and phone." }, { status: 422 });
  const e: Enquiry = { name: g("FullName"), email: g("Email"), phone: g("Phone"), interest: g("Subject"), message: g("Write") };
  // 1. saved under Submissions in the admin
  const saved = await db().prepare("INSERT INTO messages (name,email,phone,subject,message) VALUES (?,?,?,?,?)").bind(e.name, e.email, e.phone, e.interest, e.message).run();
  // 2. emailed to the address set in the Contact block (Studio), in the background so the visitor does not wait for the mail service
  getCloudflareContext().ctx.waitUntil(notify(Number(saved.meta.last_row_id), e));
  return Response.json({ ok: true, message: THANKS });
}

/** Emails the enquiry and notes on its Submissions entry whether that worked (shown in the admin). */
async function notify(id: number, e: Enquiry) {
  let status: string;
  try {
    const to = String((await loadOne("contact")).data.notifyEmail ?? "").trim() || FALLBACK_TO;
    const r = await sendMail({ apiKey: env().RESEND_API_KEY, from: env().MAIL_FROM }, enquiryMail(e, to));
    status = r.ok ? "sent" : r.status === "not configured" ? "not configured" : "failed: " + (r.detail ?? "");
    if (!r.ok) console.warn("Enquiry email not sent:", status);
  } catch (x) {
    status = "failed: " + String(x).slice(0, 200);
    console.warn("Enquiry email not sent:", status);
  }
  await db().prepare("UPDATE messages SET mail_status=? WHERE id=?").bind(status.slice(0, 300), id).run().catch(() => { /* the column is added by migration 0012 */ });
}
