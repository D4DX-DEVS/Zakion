import { db } from "@/lib/env";

export async function POST(req: Request) {
  const f = await req.formData();
  const g = (k: string) => String(f.get(k) || "").trim().slice(0, 2000);
  if (g("_wpcf7_ak_hp_textarea")) return Response.json({ ok: true, message: "Thank you for your message." });
  if (!g("FullName") || !/^\S+@\S+\.\S+$/.test(g("Email")) || !g("Phone"))
    return Response.json({ ok: false, message: "Please fill in name, a valid email and phone." }, { status: 422 });
  await db().prepare("INSERT INTO messages (name,email,phone,subject,message) VALUES (?,?,?,?,?)").bind(g("FullName"), g("Email"), g("Phone"), g("Subject"), g("Write")).run();
  return Response.json({ ok: true, message: "Thank you for your message. It has been sent." });
}
