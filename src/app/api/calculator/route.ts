import { getCloudflareContext } from "@opennextjs/cloudflare";
import { db } from "@/lib/env";
import type { Enquiry } from "@/lib/mail";
import { notifyEnquiry } from "@/lib/notify";

// The Solar Calculator sends the visitor's mobile number (and email, if given) with what they calculated, so the team can follow up.
// It lands under Submissions in the admin like any enquiry (interest "Solar Calculator") and is emailed to the address set in the Contact block.
export async function POST(req: Request) {
  const f = await req.formData();
  const g = (k: string, n: number) => String(f.get(k) || "").trim().slice(0, n);
  if (g("_hp", 200)) return Response.json({ ok: true }); // a bot filled the hidden field: save nothing
  const phone = g("phone", 40), email = g("email", 200), details = g("details", 1500), digits = phone.replace(/\D/g, "");
  if (!/^\+?[0-9\s\-()]{10,20}$/.test(phone) || digits.length < 10 || digits.length > 13)
    return Response.json({ ok: false, message: "Please enter a valid mobile number." }, { status: 422 });
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return Response.json({ ok: false, message: "Please enter a valid email or leave it empty." }, { status: 422 });
  const e: Enquiry = { name: "Solar Calculator user", email, phone, interest: "Solar Calculator", message: details };
  const saved = await db().prepare("INSERT INTO messages (name,email,phone,subject,message) VALUES (?,?,?,?,?)").bind(e.name, e.email, e.phone, e.interest, e.message).run();
  getCloudflareContext().ctx.waitUntil(notifyEnquiry(Number(saved.meta.last_row_id), e, `New Solar Calculator lead - ${phone}`));
  return Response.json({ ok: true });
}
