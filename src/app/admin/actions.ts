"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { purge } from "@/lib/cache";
import { HIDDEN } from "@/lib/media";
import { db, env } from "@/lib/env";
import { login, logout, requireAdmin } from "@/lib/auth";

const s = (f: FormData, k: string) => String(f.get(k) ?? "");
const purgeSite = async (paths: string[]) => purge(`https://${(await headers()).get("host")}`, paths);
const LISTS = ["/blog/", "/category/uncategorized/"];
const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export async function loginAction(_: unknown, f: FormData) {
  if (await login(s(f, "user"), s(f, "pass"))) redirect("/admin");
  return { error: "Invalid username or password" };
}
export async function logoutAction() {
  await logout();
  redirect("/admin/login");
}

async function uploadFile(file: File) {
  const d = new Date();
  const base = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
  let key = `${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${base}`;
  if (await env().MEDIA.head(key)) key = key.replace(/(\.[^.]+)?$/, `-${Date.now()}$1`);
  await env().MEDIA.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type || "application/octet-stream" } });
  return "/media/" + key;
}

export async function uploadMedia(f: FormData) {
  await requireAdmin();
  for (const file of f.getAll("files")) if (file instanceof File && file.size) await uploadFile(file);
  revalidatePath("/admin/media");
}
export async function deleteMedia(f: FormData) {
  await requireAdmin();
  const key = s(f, "key");
  if (HIDDEN.test(key)) return;
  await env().MEDIA.delete(key);
  revalidatePath("/admin/media");
}

export async function savePage(f: FormData) {
  await requireAdmin();
  const path = s(f, "path");
  await db()
    .prepare("UPDATE pages SET title=?,description=?,og_image=?,status=?,body_html=?,head_html=?,foot_html=?,updated_at=datetime('now') WHERE path=?")
    .bind(s(f, "title"), s(f, "description"), s(f, "og_image"), s(f, "status"), s(f, "body_html"), s(f, "head_html"), s(f, "foot_html"), path)
    .run();
  await purgeSite([path]);
  redirect("/admin/pages/edit?path=" + encodeURIComponent(path) + "&saved=1");
}
export async function duplicatePage(f: FormData) {
  await requireAdmin();
  const slug = slugify(s(f, "slug"));
  if (!slug) redirect("/admin/pages");
  const path = `/${slug}/`;
  await db()
    .prepare("INSERT INTO pages (path,title,description,og_image,body_class,head_html,body_html,foot_html,kind,status) SELECT ?,?,description,og_image,body_class,head_html,body_html,foot_html,'page','draft' FROM pages WHERE path=?")
    .bind(path, s(f, "title") || slug, s(f, "from"))
    .run();
  redirect("/admin/pages/edit?path=" + encodeURIComponent(path));
}
export async function deletePage(f: FormData) {
  await requireAdmin();
  await db().prepare("DELETE FROM pages WHERE path=? AND kind!='template' AND path!='/'").bind(s(f, "path")).run();
  await purgeSite([s(f, "path")]);
  redirect("/admin/pages");
}

export async function savePost(f: FormData) {
  await requireAdmin();
  const id = s(f, "id");
  const title = s(f, "title").trim() || "Untitled";
  const slug = slugify(s(f, "slug") || title);
  let image = s(f, "image");
  const up = f.get("image_file");
  if (up instanceof File && up.size) image = await uploadFile(up);
  const when = s(f, "published_at").replace("T", " ") || new Date().toISOString().slice(0, 16).replace("T", " ");
  const v = [slug, title, s(f, "excerpt"), s(f, "content"), image, s(f, "category") || "Uncategorized", s(f, "author") || "Amjad", s(f, "status"), when];
  if (id === "new") {
    const r = await db()
      .prepare("INSERT INTO posts (slug,title,excerpt,content,image,category,author,status,published_at) VALUES (?,?,?,?,?,?,?,?,?)")
      .bind(...v)
      .run();
    await purgeSite([`/${slug}/`, ...LISTS]);
    redirect("/admin/posts/" + r.meta.last_row_id + "?saved=1");
  }
  await db()
    .prepare("UPDATE posts SET slug=?,title=?,excerpt=?,content=?,image=?,category=?,author=?,status=?,published_at=?,updated_at=datetime('now') WHERE id=?")
    .bind(...v, id)
    .run();
  await purgeSite([`/${slug}/`, ...LISTS]);
  redirect("/admin/posts/" + id + "?saved=1");
}
export async function deletePost(f: FormData) {
  await requireAdmin();
  const old = await db().prepare("SELECT slug FROM posts WHERE id=?").bind(s(f, "id")).first<{ slug: string }>();
  await db().prepare("DELETE FROM posts WHERE id=?").bind(s(f, "id")).run();
  await purgeSite([`/${old?.slug}/`, ...LISTS]);
  redirect("/admin/posts");
}
export async function deleteMessage(f: FormData) {
  await requireAdmin();
  await db().prepare("DELETE FROM messages WHERE id=?").bind(s(f, "id")).run();
  revalidatePath("/admin/messages");
}
