import { getCloudflareContext } from "@opennextjs/cloudflare";
import { db } from "@/lib/env";
import type { Enquiry } from "@/lib/mail";
import { notifyEnquiry } from "@/lib/notify";

// The Solar Calculator sends the visitor's mobile number (and email, if given) with what they calculated, so the team can follow up.
// It is saved in table calculator_leads (Admin > Solar Calculator) and emailed to the address set in the Contact block.
export async function POST(req: Request) {
  const f = await req.formData();
  const g = (k: string, n: number) => String(f.get(k) || "").trim().slice(0, n);
  const num = (k: string, max: number) => { const n = Number(f.get(k)); return Number.isFinite(n) && n >= 0 ? Math.min(n, max) : 0; };
  if (g("_hp", 200)) return Response.json({ ok: true }); // a bot filled the hidden field: save nothing
  const phone = g("phone", 40), email = g("email", 200), details = g("details", 1500), digits = phone.replace(/\D/g, "");
  if (!/^\+?[0-9\s\-()]{10,20}$/.test(phone) || digits.length < 10 || digits.length > 13)
    return Response.json({ ok: false, message: "Please enter a valid mobile number." }, { status: 422 });
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return Response.json({ ok: false, message: "Please enter a valid email or leave it empty." }, { status: 422 });
  const e: Enquiry = { name: "Solar Calculator user", email, phone, interest: "Solar Calculator", message: details };
  const subject = `New Solar Calculator lead - ${phone}`;
  let id: number, table: "messages" | "calculator_leads" = "calculator_leads";
  try {
    const r = await db().prepare("INSERT INTO calculator_leads (phone,email,customer_type,state,basis,amount,rate,plant_size,yearly_units,yearly_savings,lifetime_savings,payback,details) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)")
      .bind(phone, email, g("type", 40), g("state", 60), g("mode", 10) === "units" ? "units" : "bill", num("amount", 1e9), num("rate", 1000), num("size", 1e6), num("units", 1e10), num("yearly", 1e12), num("life", 1e13), num("payback", 1000), details).run();
    id = Number(r.meta.last_row_id);
  } catch {
    // the table is not there yet (a moment between deploying and migrating): keep the lead as an enquiry rather than lose it; the migration moves it
    table = "messages";
    const r = await db().prepare("INSERT INTO messages (name,email,phone,subject,message) VALUES (?,?,?,?,?)").bind(e.name, e.email, e.phone, e.interest, e.message).run();
    id = Number(r.meta.last_row_id);
  }
  getCloudflareContext().ctx.waitUntil(notifyEnquiry(id, e, subject, table));
  return Response.json({ ok: true });
}
