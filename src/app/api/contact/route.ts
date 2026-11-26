import { getCloudflareContext } from "@opennextjs/cloudflare";
import { db } from "@/lib/env";
import type { Enquiry } from "@/lib/mail";
import { notifyEnquiry } from "@/lib/notify";

const THANKS = "Thank you! We will connect with you as soon as possible.";

export async function POST(req: Request) {
  const f = await req.formData();
  const g = (k: string) => String(f.get(k) || "").trim().slice(0, 2000);
  if (g("_wpcf7_ak_hp_textarea")) return Response.json({ ok: true, message: THANKS }); // a bot filled the hidden field: pretend it worked, save nothing
  if (!g("FullName") || !/^\S+@\S+\.\S+$/.test(g("Email")) || !g("Phone"))
    return Response.json({ ok: false, message: "Please fill in name, a valid email and phone." }, { status: 422 });
  const e: Enquiry = { name: g("FullName"), email: g("Email"), phone: g("Phone"), interest: g("Subject"), message: g("Write") };
  // 1. saved under Submissions in the admin
  const saved = await db().prepare("INSERT INTO messages (name,email,phone,subject,message) VALUES (?,?,?,?,?)").bind(e.name, e.email, e.phone, e.interest, e.message).run();
  // 2. emailed to the address set in the Contact block (Studio), in the background
  getCloudflareContext().ctx.waitUntil(notifyEnquiry(Number(saved.meta.last_row_id), e));
  return Response.json({ ok: true, message: THANKS });
}
