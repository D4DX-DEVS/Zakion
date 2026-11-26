"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { purge } from "@/lib/cache";
import { HIDDEN } from "@/lib/media";
import { db, env } from "@/lib/env";
import { siteUrl } from "@/lib/seo";
import { changePassword, login, logout, requireAdmin, resetWithRecovery } from "@/lib/auth";
import { passwordProblem } from "@/lib/password";
import { htmlToText } from "@/lib/html";
import { maxUpload, maxUploadLabel } from "@/lib/upload";
import { fmtBytes } from "./format";
import { type Field, ALL_KEYS, BANNER_PAGES, clean, cleanLayout, HOME_KEYS, CATEGORIES, NO_SYSTEM, FAQ_FIELDS, PROJECT_FIELDS, SYSTEM_FIELDS, TESTIMONIAL_FIELDS, LAYOUT_KEY, loadContent, loadOne, PAGE_DEFAULTS, SECTION_BY_KEY, SITE_KEY, SPACINGS, sanitize, type Layout } from "@/lib/content";
import { PAGE_PLAN } from "@/lib/home";
import { bannerKey } from "@/lib/banners";
import { CONTACT_NETS, cleanSite, SITE_DEFAULTS, siteOf, TAB_BY_ID } from "@/lib/site";

// Browsers submit textarea newlines as \r\n; store \n so saves don't alter the HTML.
const s = (f: FormData, k: string) => String(f.get(k) ?? "").replace(/\r\n?/g, "\n");
// Purge both the host the admin used and the public SITE_URL host: they differ behind a forwarder.
const purgeSite = async (paths: string[]) => {
  const origins = new Set([`https://${(await headers()).get("host")}`, siteUrl()].filter(Boolean));
  await Promise.all([...origins].map(o => purge(o, paths)));
};
const LISTS = ["/blog/", "/category/uncategorized/"];
const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const slow = () => new Promise(r => setTimeout(r, 600)); // every wrong guess costs time
const raw = (f: FormData, k: string) => String(f.get(k) ?? ""); // passwords are used exactly as typed

export async function loginAction(_: unknown, f: FormData) {
  if (await login(s(f, "user"), s(f, "pass"))) redirect("/admin");
  await slow();
  return { error: "Invalid username or password" };
}

type PwResult = { error?: string; code?: string } | null;
const newPasswordError = (f: FormData) => (raw(f, "next") !== raw(f, "confirm") ? "The new passwords don't match" : passwordProblem(raw(f, "next")));

export async function changePasswordAction(_: PwResult, f: FormData): Promise<PwResult> {
  await requireAdmin();
  const bad = newPasswordError(f);
  if (bad) return { error: bad };
  const code = await changePassword(raw(f, "current"), raw(f, "next"));
  if (!code) { await slow(); return { error: "The current password is incorrect" }; }
  return { code };
}
export async function forgotPasswordAction(_: PwResult, f: FormData): Promise<PwResult> {
  const bad = newPasswordError(f);
  if (bad) return { error: bad };
  const code = await resetWithRecovery(raw(f, "recovery"), raw(f, "next"));
  if (!code) { await slow(); return { error: "That recovery code isn't right" }; }
  return { code };
}
export async function logoutAction() {
  await logout();
  redirect("/admin/login");
}

// Server-side allowlist: the file input's accept="" only guides people, it does not stop a crafted request.
const UPLOADABLE = /^(image\/(png|jpe?g|webp|gif|avif|svg\+xml)|video\/(mp4|webm)|application\/pdf)$/;

async function uploadFile(file: File) {
  if (!UPLOADABLE.test(file.type)) throw new Error(`"${file.name}" is not an image, MP4/WebM video or PDF`);
  const d = new Date();
  const base = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
  let key = `${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${base}`;
  if (await env().MEDIA.head(key)) key = key.replace(/(\.[^.]+)?$/, `-${Date.now()}$1`);
  await env().MEDIA.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type || "application/octet-stream" } });
  return "/media/" + key;
}

export async function uploadMedia(f: FormData) {
  await requireAdmin();
  const rejected: string[] = [], big: string[] = [];
  for (const file of f.getAll("files")) {
    if (!(file instanceof File) || !file.size) continue;
    if (!UPLOADABLE.test(file.type)) rejected.push(file.name);
    else if (file.size > maxUpload(file.type)) big.push(`${file.name} (${fmtBytes(file.size)})`);
    else await uploadFile(file);
  }
  revalidatePath("/admin/media");
  if (rejected.length || big.length) redirect("/admin/media?" + [rejected.length && "rejected=" + encodeURIComponent(rejected.join(", ")), big.length && "big=" + encodeURIComponent(big.join(", "))].filter(Boolean).join("&"));
}
export async function deleteMedia(f: FormData) {
  await requireAdmin();
  const key = s(f, "key");
  if (HIDDEN.test(key)) return;
  await env().MEDIA.delete(key);
  await purgeSite(["/media/" + key.split("/").map(encodeURIComponent).join("/")]); // else the edge keeps serving it for up to a day
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
  let bad = ""; // a wrong file type is skipped, the rest of the post still saves
  if (up instanceof File && up.size) {
    if (!UPLOADABLE.test(up.type)) bad = "&badimage=" + encodeURIComponent(up.name);
    else if (up.size > maxUpload(up.type)) bad = "&bigimage=" + encodeURIComponent(`${up.name} (${fmtBytes(up.size)})`);
    else image = await uploadFile(up);
  }
  const when = s(f, "published_at").replace("T", " ") || new Date().toISOString().slice(0, 16).replace("T", " ");
  const v = [slug, title, s(f, "excerpt"), s(f, "content"), image, s(f, "category") || "Uncategorized", s(f, "author") || "Amjad", s(f, "status"), when];
  if (id === "new") {
    const r = await db()
      .prepare("INSERT INTO posts (slug,title,excerpt,content,image,category,author,status,published_at) VALUES (?,?,?,?,?,?,?,?,?)")
      .bind(...v)
      .run();
    await purgeSite([`/${slug}/`, ...LISTS]);
    redirect("/admin/posts/" + r.meta.last_row_id + "?saved=1" + bad);
  }
  await db()
    .prepare("UPDATE posts SET slug=?,title=?,excerpt=?,content=?,image=?,category=?,author=?,status=?,published_at=?,updated_at=datetime('now') WHERE id=?")
    .bind(...v, id)
    .run();
  await purgeSite([`/${slug}/`, ...LISTS]);
  redirect("/admin/posts/" + id + "?saved=1" + bad);
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

// ---- projects (table "projects"): the cards on the Projects page and each project's own page ----

/** The editor sends the project as one JSON field (see PROJECT_FIELDS in lib/content.ts); "key" is the project's id, or "new". */
export async function saveProject(f: FormData) {
  await requireAdmin();
  const id = s(f, "key");
  let raw: unknown;
  try { raw = JSON.parse(String(f.get("data") ?? "{}")); } catch { redirect("/admin/projects/" + encodeURIComponent(id) + "?error=1"); }
  const d = clean(PROJECT_FIELDS, raw, {}) as Record<string, any>;
  const title = String(d.title).trim().slice(0, 160) || "Unnamed client";
  const base = slugify(String(d.slug) || title) || "project";
  let slug = base;
  for (let n = 2; await db().prepare("SELECT id FROM projects WHERE slug=? AND id IS NOT ?").bind(slug, id === "new" ? null : Number(id)).first(); n++) slug = `${base}-${n}`;
  const category = (CATEGORIES as readonly string[]).includes(d.category) ? d.category : "Residential";
  const gallery = JSON.stringify((Array.isArray(d.gallery) ? d.gallery : []).map((g: { image?: string }) => g.image).filter(Boolean).slice(0, 12));
  const num = (x: unknown) => { const n = Number(x); return n > 0 ? String(Math.round(n * 100) / 100) : ""; }; // a number above 0, or empty (nothing is shown)
  const capacity = num(d.capacity); // kilowatts; 0 or empty leaves the line out
  const systemType = d.systemType === NO_SYSTEM ? "" : String(d.systemType).trim();
  const summary = htmlToText(d.summary) || /<(img|table)\b/i.test(d.summary) ? String(d.summary).trim() : ""; // an editor left with only empty lines is no description
  const t = (x: unknown, n = 300) => String(x ?? "").trim().slice(0, n);
  const v = [slug, title, category, t(d.location, 160), summary, capacity, systemType, String(d.image), gallery, d.visible === "Hidden" ? "draft" : "published", d.stage === "Ongoing" ? "ongoing" : "completed", Math.round(Number(d.sort)) || 0,
    t(d.pvDetails), t(d.pcuDetails), t(d.completion, 120), t(d.generation, 160), t(d.savings, 160), t(d.payback, 120), String(d.testimonialVideo), String(d.testimonialImage), t(d.testimonialQuote, 2000), num(d.co2), num(d.trees), num(d.coal)];
  const cols = ["slug", "title", "category", "location", "summary", "capacity", "system_type", "image", "gallery", "status", "stage", "sort", "pv_details", "pcu_details", "completion", "generation", "savings", "payback", "testimonial_video", "testimonial_image", "testimonial_quote", "co2", "trees", "coal"];
  let oldSlug = "";
  if (id === "new") {
    const r = await db().prepare(`INSERT INTO projects (${cols.join(",")}) VALUES (${cols.map(() => "?").join(",")})`).bind(...v).run();
    const newId = r.meta.last_row_id;
    await purgeSite(["/projects/", `/projects/${slug}/`]);
    redirect("/admin/projects/" + newId + "?saved=1");
  }
  const old = await db().prepare("SELECT slug FROM projects WHERE id=?").bind(id).first<{ slug: string }>();
  if (!old) redirect("/admin/projects");
  oldSlug = old.slug;
  await db().prepare(`UPDATE projects SET ${cols.map((c) => c + "=?").join(",")},updated_at=datetime('now') WHERE id=?`).bind(...v, id).run();
  await purgeSite(await projectPaths([slug, oldSlug]));
  redirect("/admin/projects/" + id + "?saved=1");
}
export async function deleteProject(f: FormData) {
  await requireAdmin();
  const id = s(f, "key");
  const old = await db().prepare("SELECT slug FROM projects WHERE id=?").bind(id).first<{ slug: string }>();
  await db().prepare("DELETE FROM projects WHERE id=?").bind(id).run();
  await purgeSite(await projectPaths(old ? [old.slug] : []));
  redirect("/admin/projects?deleted=1");
}
/** Renumbers the projects 1, 2, 3 ... in the given order; any project not listed keeps its place at the end. */
async function renumberProjects(first: number[]) {
  const all = await db().prepare("SELECT id FROM projects ORDER BY sort, id DESC").all<{ id: number }>().then((r) => r.results.map((x) => x.id));
  const order = [...first.filter((id) => all.includes(id)), ...all.filter((id) => !first.includes(id))];
  if (order.length) await db().batch(order.map((id, i) => db().prepare("UPDATE projects SET sort=? WHERE id=?").bind(i + 1, id)));
  return order;
}
/** Moves a project one place up or down the Projects page (the up and down arrows in the list). */
export async function moveProject(f: FormData) {
  await requireAdmin();
  const id = Number(s(f, "key")), step = s(f, "dir") === "up" ? -1 : 1;
  const order = await db().prepare("SELECT id FROM projects ORDER BY sort, id DESC").all<{ id: number }>().then((r) => r.results.map((x) => x.id));
  const i = order.indexOf(id), j = i + step;
  if (i >= 0 && j >= 0 && j < order.length) { [order[i], order[j]] = [order[j], order[i]]; await renumberProjects(order); await purgeSite(await projectPaths([])); }
  redirect("/admin/projects");
}
/** Sets the whole order in one go (a row dragged to a new place in the list). */
export async function reorderProjects(f: FormData) {
  await requireAdmin();
  let raw: unknown;
  try { raw = JSON.parse(String(f.get("keys") ?? "[]")); } catch { raw = []; }
  await renumberProjects((Array.isArray(raw) ? raw : []).map(Number).filter((n) => Number.isInteger(n)));
  await purgeSite(await projectPaths([]));
  redirect("/admin/projects");
}
/** Hides a shown project or shows a hidden one (the project is kept either way). */
export async function toggleProject(f: FormData) {
  await requireAdmin();
  const id = s(f, "key");
  const p = await db().prepare("SELECT slug, status FROM projects WHERE id=?").bind(id).first<{ slug: string; status: string }>();
  if (p) {
    await db().prepare("UPDATE projects SET status=?, updated_at=datetime('now') WHERE id=?").bind(p.status === "published" ? "draft" : "published", id).run();
    await purgeSite(await projectPaths([p.slug]));
  }
  redirect("/admin/projects?toggled=" + (p?.status === "published" ? "hidden" : "shown"));
}

/** Every page a change to a project can show on: the Projects page, the project's own page, and every other project's page (the related list). */
async function projectPaths(slugs: string[]) {
  const all = await db().prepare("SELECT slug FROM projects").all<{ slug: string }>().then((r) => r.results.map((x) => x.slug)).catch(() => []);
  return [...new Set(["/projects/", ...slugs, ...all].map((x) => (x === "/projects/" ? x : `/projects/${x}/`)))];
}

// ---- systems (table "systems"): the cards on the Solutions page and each system's own page (/services/<slug>/) ----

/** The editor sends the system as one JSON field (see SYSTEM_FIELDS in lib/content.ts); "key" is the system's id, or "new". */
export async function saveSystem(f: FormData) {
  await requireAdmin();
  const id = s(f, "key");
  let raw: unknown;
  try { raw = JSON.parse(String(f.get("data") ?? "{}")); } catch { redirect("/admin/systems/" + encodeURIComponent(id) + "?error=1"); }
  const d = clean(SYSTEM_FIELDS, raw, {}) as Record<string, any>;
  const title = String(d.title).trim().slice(0, 160) || "Untitled system";
  const base = slugify(String(d.slug) || title) || "system";
  // the address must be free among the systems and must not be one of the stored pages under /services/ (those are shown first)
  const taken = async (x: string) =>
    !!(await db().prepare("SELECT id FROM systems WHERE slug=? AND id IS NOT ?").bind(x, id === "new" ? null : Number(id)).first()) ||
    !!(await db().prepare("SELECT path FROM pages WHERE path=?").bind(`/services/${x}/`).first());
  let slug = base;
  for (let n = 2; await taken(slug); n++) slug = `${base}-${n}`;
  const features = JSON.stringify((Array.isArray(d.features) ? d.features : []).filter((x: { title: string; text: string }) => x.title.trim() || x.text.trim()).slice(0, 8));
  const details = htmlToText(d.details) || /<(img|table)\b/i.test(d.details) ? String(d.details).trim() : ""; // an editor left with only empty lines is no text
  const v = [slug, title, String(d.thumb), String(d.badge).trim(), String(d.heading).trim(), String(d.text).trim(), String(d.image), String(d.image2), features, details, d.visible === "Hidden" ? "draft" : "published", Math.round(Number(d.sort)) || 0];
  if (id === "new") {
    const r = await db().prepare("INSERT INTO systems (slug,title,thumb,badge,heading,text,image,image2,features,details,status,sort) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)").bind(...v).run();
    await purgeSite(await systemPaths([slug]));
    redirect("/admin/systems/" + r.meta.last_row_id + "?saved=1");
  }
  const old = await db().prepare("SELECT slug FROM systems WHERE id=?").bind(id).first<{ slug: string }>();
  if (!old) redirect("/admin/systems");
  await db().prepare("UPDATE systems SET slug=?,title=?,thumb=?,badge=?,heading=?,text=?,image=?,image2=?,features=?,details=?,status=?,sort=?,updated_at=datetime('now') WHERE id=?").bind(...v, id).run();
  await purgeSite(await systemPaths([slug, old.slug]));
  redirect("/admin/systems/" + id + "?saved=1");
}
export async function deleteSystem(f: FormData) {
  await requireAdmin();
  const id = s(f, "key");
  const old = await db().prepare("SELECT slug FROM systems WHERE id=?").bind(id).first<{ slug: string }>();
  await db().prepare("DELETE FROM systems WHERE id=?").bind(id).run();
  await purgeSite(await systemPaths(old ? [old.slug] : []));
  redirect("/admin/systems?deleted=1");
}
const systemIds = () => db().prepare("SELECT id FROM systems ORDER BY sort, id").all<{ id: number }>().then((r) => r.results.map((x) => x.id));
/** Renumbers the systems 1, 2, 3 ... in the given order; any system not listed keeps its place at the end. */
async function renumberSystems(first: number[]) {
  const all = await systemIds();
  const order = [...first.filter((id) => all.includes(id)), ...all.filter((id) => !first.includes(id))];
  if (order.length) await db().batch(order.map((id, i) => db().prepare("UPDATE systems SET sort=? WHERE id=?").bind(i + 1, id)));
}
/** Moves a system one place up or down the Solutions page (the arrows in the list). */
export async function moveSystem(f: FormData) {
  await requireAdmin();
  const id = Number(s(f, "key")), step = s(f, "dir") === "up" ? -1 : 1;
  const order = await systemIds();
  const i = order.indexOf(id), j = i + step;
  if (i >= 0 && j >= 0 && j < order.length) { [order[i], order[j]] = [order[j], order[i]]; await renumberSystems(order); await purgeSite(await systemPaths([])); }
  redirect("/admin/systems");
}
/** Sets the whole order in one go (a row dragged to a new place in the list). */
export async function reorderSystems(f: FormData) {
  await requireAdmin();
  let raw: unknown;
  try { raw = JSON.parse(String(f.get("keys") ?? "[]")); } catch { raw = []; }
  await renumberSystems((Array.isArray(raw) ? raw : []).map(Number).filter((n) => Number.isInteger(n)));
  await purgeSite(await systemPaths([]));
  redirect("/admin/systems");
}
/** Hides a shown system or shows a hidden one (the system is kept either way). */
export async function toggleSystem(f: FormData) {
  await requireAdmin();
  const id = s(f, "key");
  const x = await db().prepare("SELECT slug, status FROM systems WHERE id=?").bind(id).first<{ slug: string; status: string }>();
  if (x) {
    await db().prepare("UPDATE systems SET status=?, updated_at=datetime('now') WHERE id=?").bind(x.status === "published" ? "draft" : "published", id).run();
    await purgeSite(await systemPaths([x.slug]));
  }
  redirect("/admin/systems?toggled=" + (x?.status === "published" ? "hidden" : "shown"));
}
/** Every page a change to a system can show on: the Solutions page, the system's own page, and every other system's page (the "other solutions" cards). */
async function systemPaths(slugs: string[]) {
  const all = await db().prepare("SELECT slug FROM systems").all<{ slug: string }>().then((r) => r.results.map((x) => x.slug)).catch(() => []);
  return [...new Set(["/services/", ...[...slugs, ...all].map((x) => `/services/${x}/`)])];
}

// ---- testimonials (table "testimonials"): the Home page carousel and the Testimonials page ----

/** The pages a testimonial shows on. */
const testimonialPaths = () => ["/", "/testimonials/"];
/** The editor sends the testimonial as one JSON field (see TESTIMONIAL_FIELDS in lib/content.ts); "key" is its id, or "new". */
export async function saveTestimonial(f: FormData) {
  await requireAdmin();
  const id = s(f, "key");
  let raw: unknown;
  try { raw = JSON.parse(String(f.get("data") ?? "{}")); } catch { redirect("/admin/testimonials/" + encodeURIComponent(id) + "?error=1"); }
  const d = clean(TESTIMONIAL_FIELDS, raw, {}) as Record<string, any>;
  const v = [String(d.name).trim().slice(0, 120) || "Customer", String(d.role).trim(), String(d.company).trim(), String(d.quote).trim(), String(d.avatar), String(d.video), String(d.poster), d.visible === "Hidden" ? "draft" : "published"];
  if (id === "new") {
    const r = await db().prepare("INSERT INTO testimonials (name,role,company,quote,avatar,video,poster,status) VALUES (?,?,?,?,?,?,?,?)").bind(...v).run();
    await purgeSite(testimonialPaths());
    redirect("/admin/testimonials/" + r.meta.last_row_id + "?saved=1");
  }
  const old = await db().prepare("SELECT id FROM testimonials WHERE id=?").bind(id).first();
  if (!old) redirect("/admin/testimonials");
  await db().prepare("UPDATE testimonials SET name=?,role=?,company=?,quote=?,avatar=?,video=?,poster=?,status=?,updated_at=datetime('now') WHERE id=?").bind(...v, id).run();
  await purgeSite(testimonialPaths());
  redirect("/admin/testimonials/" + id + "?saved=1");
}
export async function deleteTestimonial(f: FormData) {
  await requireAdmin();
  await db().prepare("DELETE FROM testimonials WHERE id=?").bind(s(f, "key")).run();
  await purgeSite(testimonialPaths());
  redirect("/admin/testimonials?deleted=1");
}
/** Hides a shown testimonial or shows a hidden one (the testimonial is kept either way). */
export async function toggleTestimonial(f: FormData) {
  await requireAdmin();
  const id = s(f, "key");
  const x = await db().prepare("SELECT status FROM testimonials WHERE id=?").bind(id).first<{ status: string }>();
  if (x) {
    await db().prepare("UPDATE testimonials SET status=?, updated_at=datetime('now') WHERE id=?").bind(x.status === "published" ? "draft" : "published", id).run();
    await purgeSite(testimonialPaths());
  }
  redirect("/admin/testimonials?toggled=" + (x?.status === "published" ? "hidden" : "shown"));
}

// ---- FAQs (table "faqs"): the questions and answers on the FAQ page ----

/** The page the questions show on. */
const faqPaths = () => ["/faq/"];
/** The editor sends the question as one JSON field (see FAQ_FIELDS in lib/content.ts); "key" is its id, or "new". */
export async function saveFaq(f: FormData) {
  await requireAdmin();
  const id = s(f, "key");
  let raw: unknown;
  try { raw = JSON.parse(String(f.get("data") ?? "{}")); } catch { redirect("/admin/faqs/" + encodeURIComponent(id) + "?error=1"); }
  const d = clean(FAQ_FIELDS, raw, {}) as Record<string, any>;
  const question = String(d.question).trim().slice(0, 300);
  if (!question) redirect("/admin/faqs/" + encodeURIComponent(id) + "?error=empty");
  const answer = String(d.answer).trim().slice(0, 6000);
  const category = String(d.category).trim().slice(0, 60) || "General";
  const status = d.visible === "Hidden" ? "draft" : "published";
  let sort = Math.round(Number(d.sort)) || 0;
  if (id === "new") {
    if (sort < 1) sort = ((await db().prepare("SELECT MAX(sort) AS m FROM faqs").first<{ m: number | null }>())?.m ?? 0) + 1; // no position given: last
    const r = await db().prepare("INSERT INTO faqs (question,answer,category,sort,status) VALUES (?,?,?,?,?)").bind(question, answer, category, sort, status).run();
    await renumberFaqs([], Number(r.meta.last_row_id), sort);
    await purgeSite(faqPaths());
    redirect("/admin/faqs/" + r.meta.last_row_id + "?saved=1");
  }
  const old = await db().prepare("SELECT id, sort FROM faqs WHERE id=?").bind(id).first<{ id: number; sort: number }>();
  if (!old) redirect("/admin/faqs");
  if (sort < 1) sort = old.sort;
  await db().prepare("UPDATE faqs SET question=?,answer=?,category=?,sort=?,status=?,updated_at=datetime('now') WHERE id=?").bind(question, answer, category, sort, status, id).run();
  await renumberFaqs([], Number(id), sort);
  await purgeSite(faqPaths());
  redirect("/admin/faqs/" + id + "?saved=1");
}
export async function deleteFaq(f: FormData) {
  await requireAdmin();
  await db().prepare("DELETE FROM faqs WHERE id=?").bind(s(f, "key")).run();
  await renumberFaqs([]);
  await purgeSite(faqPaths());
  redirect("/admin/faqs?deleted=1");
}
/** Renumbers the questions 1, 2, 3 ... : first the ids in "first" in that order, or (with "pin") the question "pin" at position "at" among the others; the rest keep their order. */
async function renumberFaqs(first: number[], pin?: number, at?: number) {
  const all = await db().prepare("SELECT id FROM faqs ORDER BY sort, id").all<{ id: number }>().then((r) => r.results.map((x) => x.id));
  let order = [...first.filter((id) => all.includes(id)), ...all.filter((id) => !first.includes(id))];
  if (pin !== undefined && at !== undefined && order.includes(pin)) { order = order.filter((id) => id !== pin); order.splice(Math.max(0, Math.min(order.length, at - 1)), 0, pin); }
  if (order.length) await db().batch(order.map((id, i) => db().prepare("UPDATE faqs SET sort=? WHERE id=?").bind(i + 1, id)));
  return order;
}
/** Moves a question one place up or down the FAQ page (the up and down arrows in the list). */
export async function moveFaq(f: FormData) {
  await requireAdmin();
  const id = Number(s(f, "key")), step = s(f, "dir") === "up" ? -1 : 1;
  const order = await db().prepare("SELECT id FROM faqs ORDER BY sort, id").all<{ id: number }>().then((r) => r.results.map((x) => x.id));
  const i = order.indexOf(id), j = i + step;
  if (i >= 0 && j >= 0 && j < order.length) { [order[i], order[j]] = [order[j], order[i]]; await renumberFaqs(order); await purgeSite(faqPaths()); }
  redirect("/admin/faqs");
}
/** Sets the whole order in one go (a row dragged to a new place in the list). */
export async function reorderFaqs(f: FormData) {
  await requireAdmin();
  let raw: unknown;
  try { raw = JSON.parse(String(f.get("keys") ?? "[]")); } catch { raw = []; }
  await renumberFaqs((Array.isArray(raw) ? raw : []).map(Number).filter((n) => Number.isInteger(n)));
  await purgeSite(faqPaths());
  redirect("/admin/faqs");
}
/** Hides a shown question or shows a hidden one (the question is kept either way). */
export async function toggleFaq(f: FormData) {
  await requireAdmin();
  const id = s(f, "key");
  const x = await db().prepare("SELECT status FROM faqs WHERE id=?").bind(id).first<{ status: string }>();
  if (x) {
    await db().prepare("UPDATE faqs SET status=?, updated_at=datetime('now') WHERE id=?").bind(x.status === "published" ? "draft" : "published", id).run();
    await purgeSite(faqPaths());
  }
  redirect("/admin/faqs?toggled=" + (x?.status === "published" ? "hidden" : "shown"));
}

// ---- page sections (src/lib/content.ts): one JSON document per section, merged over the built-in defaults ----

/** Called from the section editor to upload an image or video; returns the public URL. */
export async function uploadSectionFile(f: FormData): Promise<{ url?: string; error?: string }> {
  await requireAdmin();
  const file = f.get("file");
  if (!(file instanceof File) || !file.size) return { error: "Choose a file first." };
  if (!UPLOADABLE.test(file.type)) return { error: `"${file.name}" is not an image, MP4/WebM video or PDF.` };
  if (file.size > maxUpload(file.type)) return { error: `"${file.name}" is ${fmtBytes(file.size)}. ${file.type.startsWith("video/") ? "Videos" : "Images and PDFs"} can be up to ${maxUploadLabel(file.type)}.` };
  return { url: await uploadFile(file) };
}

const allPages = () => ["/", ...Object.keys(PAGE_PLAN).filter(p => p !== "/")];
/** A page whose blocks are edited under Pages > that page: every page with its own block list except Home (Studio edits Home). */
const blockPage = (p: string) => p !== "/" && !!PAGE_DEFAULTS[p];
/** The address of a page's block editor, optionally with one block picked and a query note ("saved=1", "error=1" ...). */
const pageUrl = (path: string, key = "", q = "") => `/admin/pages/sections?page=${encodeURIComponent(path)}${key ? "&key=" + encodeURIComponent(key) : ""}${q ? "&" + q : ""}`;
/** Every page and article on the site: a page banner can change any inner page, not only the ones with sections. */
const everyPage = async () => {
  const pages = await db().prepare("SELECT path FROM pages WHERE kind!='template'").all<{ path: string }>().then((r) => r.results.map((x) => x.path)).catch(() => []);
  const posts = await db().prepare("SELECT slug FROM posts WHERE status='published'").all<{ slug: string }>().then((r) => r.results.map((x) => `/${x.slug}/`)).catch(() => []);
  return [...new Set([...allPages(), ...pages, ...posts])];
};

/** The pages to refresh after a section changes: the banners show on every page, and the system cards' text also shows on each system's own page. */
const sectionPaths = async (key: string) => (key === "banners" ? await everyPage() : key === "systems" ? [...allPages(), ...(await systemPaths([]))] : allPages());
/** Where to go after saving or resetting a section: back to the page it was opened from (Pages > a page), else to Studio. */
const sectionUrl = (f: FormData, key: string, q: string) => {
  const page = s(f, "page");
  return blockPage(page) ? pageUrl(page, key, q) : `/admin/studio?key=${key}&${q}`;
};
export async function saveSection(f: FormData) {
  await requireAdmin();
  const key = s(f, "key");
  if (!SECTION_BY_KEY[key]) redirect(blockPage(s(f, "page")) ? pageUrl(s(f, "page")) : "/admin/studio");
  let data: unknown;
  try { data = JSON.parse(String(f.get("data") ?? "{}")); } catch { redirect(sectionUrl(f, key, "error=1")); }
  await db()
    .prepare("INSERT INTO site_content (key,data,updated_at) VALUES (?,?,datetime('now')) ON CONFLICT(key) DO UPDATE SET data=excluded.data,updated_at=datetime('now')")
    .bind(key, JSON.stringify(sanitize(key, data)))
    .run();
  await purgeSite(await sectionPaths(key));
  redirect(sectionUrl(f, key, "saved=1"));
}
export async function resetSection(f: FormData) {
  await requireAdmin();
  const key = s(f, "key");
  if (!SECTION_BY_KEY[key]) redirect(blockPage(s(f, "page")) ? pageUrl(s(f, "page")) : "/admin/studio");
  await db().prepare("DELETE FROM site_content WHERE key=?").bind(key).run();
  await purgeSite(await sectionPaths(key));
  redirect(sectionUrl(f, key, "saved=reset"));
}

// ---- home page layout (order, hidden sections, per-section settings), kept in site_content under "_layout" ----

async function readLayout(): Promise<Layout> {
  const r = await db().prepare("SELECT data FROM site_content WHERE key=?").bind(LAYOUT_KEY).first<{ data: string }>().catch(() => null);
  let v: unknown = null;
  try { v = r ? JSON.parse(r.data) : null; } catch { /* a damaged row falls back to the defaults */ }
  return cleanLayout(v);
}
async function writeLayout(l: Layout) {
  await db()
    .prepare("INSERT INTO site_content (key,data,updated_at) VALUES (?,?,datetime('now')) ON CONFLICT(key) DO UPDATE SET data=excluded.data,updated_at=datetime('now')")
    .bind(LAYOUT_KEY, JSON.stringify(cleanLayout(l)))
    .run();
  await purgeSite(allPages());
}
const studioUrl = (key: string, note: string) => "/admin/studio?" + (key && SECTION_BY_KEY[key] ? "key=" + encodeURIComponent(key) + "&" : "") + "saved=" + note;

/** Moves a home page section one place up or down. */
export async function moveSection(f: FormData) {
  await requireAdmin();
  const key = s(f, "key"), step = s(f, "dir") === "up" ? -1 : 1, back = s(f, "back");
  const l = await readLayout();
  const i = l.order.indexOf(key), j = i + step;
  if (i >= 0 && j >= 0 && j < l.order.length) { [l.order[i], l.order[j]] = [l.order[j], l.order[i]]; await writeLayout(l); }
  redirect(studioUrl(back, "layout"));
}
/** Sets the whole order of the home page sections in one go (a block dragged to a new place in Studio). Unknown keys are ignored and any
 *  section the request leaves out keeps its place at the end, so a damaged request can never lose a section. */
export async function reorderSections(f: FormData) {
  await requireAdmin();
  const back = s(f, "back");
  let raw: unknown;
  try { raw = JSON.parse(String(f.get("keys") ?? "[]")); } catch { raw = []; }
  const l = await readLayout();
  const keys = [...new Set((Array.isArray(raw) ? raw.map(String) : []).filter((k) => l.order.includes(k)))];
  const next = [...keys, ...l.order.filter((k) => !keys.includes(k))];
  if (next.join() !== l.order.join()) { l.order = next; await writeLayout(l); }
  redirect(studioUrl(back, "layout"));
}
/** Shows or hides a home page section (the section stays editable while hidden). */
export async function toggleSection(f: FormData) {
  await requireAdmin();
  const key = s(f, "key"), back = s(f, "back");
  const l = await readLayout();
  if (l.order.includes(key)) { l.hidden = l.hidden.includes(key) ? l.hidden.filter((k) => k !== key) : [...l.hidden, key]; await writeLayout(l); }
  redirect(studioUrl(back, "layout"));
}
/** Visibility, spacing and animation for one section, saved from its settings card. */
export async function saveSectionSettings(f: FormData) {
  await requireAdmin();
  const key = s(f, "key");
  if (!SECTION_BY_KEY[key]) redirect("/admin/studio");
  const l = await readLayout();
  const spacing = s(f, "spacing"), anim = s(f, "anim");
  l.settings[key] = { spacing: (SPACINGS as readonly string[]).includes(spacing) ? (spacing as Layout["settings"][string]["spacing"]) : "standard", anim: anim === "off" ? "off" : "on" };
  if (l.order.includes(key)) l.hidden = s(f, "visible") === "hide" ? [...new Set([...l.hidden, key])] : l.hidden.filter((k) => k !== key);
  await writeLayout(l);
  redirect(studioUrl(key, "settings"));
}

// ---- Site settings (theme, fonts, layout, header, navigation, footer, social links, section order) ----
// Header, menu, footer and social links stay in their own sections (so Studio edits the same data); the look and feel is one
// document under SITE_KEY. A tab only ever touches the fields it lists (lib/site.ts), whatever the request says.

const upsert = (key: string, data: unknown) =>
  db()
    .prepare("INSERT INTO site_content (key,data,updated_at) VALUES (?,?,datetime('now')) ON CONFLICT(key) DO UPDATE SET data=excluded.data,updated_at=datetime('now')")
    .bind(key, JSON.stringify(data))
    .run();

/** The header, footer and theme are on every page, so every public page (and the blog posts) is purged, not just the ones with blocks. */
async function purgeEverywhere() {
  const pages = await db().prepare("SELECT path FROM pages WHERE kind!='template' AND status='published'").all<{ path: string }>().then(r => r.results.map(x => x.path)).catch(() => [] as string[]);
  const posts = await db().prepare("SELECT slug FROM posts WHERE status='published'").all<{ slug: string }>().then(r => r.results.map(x => `/${x.slug}/`)).catch(() => [] as string[]);
  await purgeSite([...new Set(["/", ...allPages(), ...pages, ...posts, ...LISTS])]);
}

/** A tab can have several cards that edit the same section; this gathers each section's fields from all of its cards. */
const groupsByKey = (groups: { key: string; fields: Field[] }[]) => {
  const m = new Map<string, Field[]>();
  for (const g of groups) m.set(g.key, [...(m.get(g.key) ?? []), ...g.fields]);
  return m;
};

const settingsUrl = (tab: string, note: string) => `/admin/settings?tab=${encodeURIComponent(tab)}&saved=${note}`;

/** Keeps the Contact block's four social links in step with the social list (the Contact block still reads its own fields). */
async function syncContactSocial(social: { network: string; url: string }[]) {
  const cur = (await loadContent()).contact as Record<string, unknown>;
  const next = { ...cur };
  let changed = false;
  for (const [k, network] of Object.entries(CONTACT_NETS)) {
    const url = social.find(x => x.network === network)?.url ?? "";
    if (String(cur[k] ?? "") !== url) { next[k] = url; changed = true; }
  }
  if (changed) await upsert("contact", sanitize("contact", next));
}

export async function saveSettings(f: FormData) {
  await requireAdmin();
  const tab = TAB_BY_ID[s(f, "tab")];
  if (!tab) redirect("/admin/settings");
  let input: any;
  try { input = JSON.parse(String(f.get("data") ?? "{}")); } catch { redirect(`/admin/settings?tab=${tab.id}&error=1`); }
  const content = await loadContent();
  for (const [key, fields] of groupsByKey(tab.groups)) {
    const incoming = input?.[key];
    if (!incoming || typeof incoming !== "object") continue;
    const merged: Record<string, unknown> = { ...(key === SITE_KEY ? siteOf(content) : content[key]) };
    for (const fld of fields) if (fld.k in incoming) merged[fld.k] = incoming[fld.k];
    const data = key === SITE_KEY ? cleanSite(merged) : sanitize(key, merged);
    await upsert(key, data);
    if (tab.id === "social") await syncContactSocial((data.social as { network: string; url: string }[]).filter(x => x.network && x.url));
  }
  await purgeEverywhere();
  redirect(settingsUrl(tab.id, "1"));
}

/** Puts this tab's fields back to the original values; every other setting stays as it is. */
export async function resetSettings(f: FormData) {
  await requireAdmin();
  const tab = TAB_BY_ID[s(f, "tab")];
  if (!tab) redirect("/admin/settings");
  const content = await loadContent();
  for (const [key, fields] of groupsByKey(tab.groups)) {
    const merged: Record<string, unknown> = { ...(key === SITE_KEY ? siteOf(content) : content[key]) };
    for (const fld of fields) merged[fld.k] = key === SITE_KEY ? (SITE_DEFAULTS as Record<string, unknown>)[fld.k] : structuredClone(SECTION_BY_KEY[key].data[fld.k]);
    await upsert(key, key === SITE_KEY ? cleanSite(merged) : sanitize(key, merged));
  }
  await purgeEverywhere();
  redirect(settingsUrl(tab.id, "reset"));
}

/** Writes the list of blocks a page shows. Home keeps its order and hidden list (Studio reads those); the other pages keep their list. */
async function setPageKeys(path: string, list: string[]) {
  const keys = [...new Set(list.filter(k => (path === "/" ? HOME_KEYS : ALL_KEYS).includes(k)))];
  const l = await readLayout();
  if (path === "/") {
    l.order = [...keys, ...HOME_KEYS.filter(k => !keys.includes(k))];
    l.hidden = HOME_KEYS.filter(k => !keys.includes(k));
  } else {
    l.pages[path] = keys;
  }
  await writeLayout(l);
}
/** The blocks a page shows right now, in order (its own list, or the built-in plan until the admin changes it). */
async function pageKeysNow(path: string) { return [...((await readLayout()).pages[path] ?? PAGE_DEFAULTS[path] ?? [])]; } // a copy: callers reorder it

/** Which blocks a page shows and in which order (Site settings > Section order). */
export async function savePageLayout(f: FormData) {
  await requireAdmin();
  const path = s(f, "path");
  if (!PAGE_DEFAULTS[path]) redirect("/admin/settings?tab=sections");
  let raw: unknown;
  try { raw = JSON.parse(String(f.get("keys") ?? "[]")); } catch { redirect(`/admin/settings?tab=sections&page=${encodeURIComponent(path)}&error=1`); }
  await setPageKeys(path, Array.isArray(raw) ? raw.map(String) : []);
  redirect(`/admin/settings?tab=sections&page=${encodeURIComponent(path)}&saved=layout`);
}

// ---- Pages > a page: its blocks one change at a time (move, drag, remove, add) and its banner ----
// "back" is the block that was open in the editor (or "banner"); it stays open after the change. Removing a block only takes it off this page:
// its text and images stay in Studio and it can be added again.

const openKey = (k: string, path: string) => (k === "banner" ? (bannerKey(path) ? "banner" : "") : ALL_KEYS.includes(k) ? k : "");
function pageForm(f: FormData) {
  const path = s(f, "page");
  if (!blockPage(path)) redirect("/admin/pages");
  return { path, back: openKey(s(f, "back"), path) };
}

/** Moves a block one place up or down on a page. */
export async function movePageSection(f: FormData) {
  await requireAdmin();
  const { path, back } = pageForm(f);
  const key = s(f, "key"), step = s(f, "dir") === "up" ? -1 : 1;
  const keys = await pageKeysNow(path);
  const i = keys.indexOf(key), j = i + step;
  if (i >= 0 && j >= 0 && j < keys.length) { [keys[i], keys[j]] = [keys[j], keys[i]]; await setPageKeys(path, keys); }
  redirect(pageUrl(path, back, "saved=layout"));
}
/** Sets the whole order of a page's blocks (a block dragged to a new place). Unknown keys are ignored and a block the request leaves out
 *  keeps its place at the end, so a damaged request can never take a block off the page. */
export async function reorderPageSections(f: FormData) {
  await requireAdmin();
  const { path, back } = pageForm(f);
  let raw: unknown;
  try { raw = JSON.parse(String(f.get("keys") ?? "[]")); } catch { raw = []; }
  const now = await pageKeysNow(path);
  const keys = [...new Set((Array.isArray(raw) ? raw.map(String) : []).filter(k => now.includes(k)))];
  const next = [...keys, ...now.filter(k => !keys.includes(k))];
  if (next.join() !== now.join()) await setPageKeys(path, next);
  redirect(pageUrl(path, back, "saved=layout"));
}
/** Takes a block off a page. */
export async function removePageSection(f: FormData) {
  await requireAdmin();
  const { path, back } = pageForm(f);
  const key = s(f, "key");
  await setPageKeys(path, (await pageKeysNow(path)).filter(k => k !== key));
  redirect(pageUrl(path, back === key ? "" : back, "saved=removed"));
}
/** Adds a block to the end of a page and opens it for editing. */
export async function addPageSection(f: FormData) {
  await requireAdmin();
  const { path } = pageForm(f);
  const key = s(f, "key");
  const now = await pageKeysNow(path);
  if (!ALL_KEYS.includes(key)) redirect(pageUrl(path));
  if (!now.includes(key)) await setPageKeys(path, [...now, key]);
  redirect(pageUrl(path, key, "saved=added"));
}

/** Saves the banner picture of one page (the picture behind its title). The other pages' banners are kept as they are. */
async function putBanner(f: FormData, reset: boolean) {
  await requireAdmin();
  const path = s(f, "page"), key = s(f, "key");
  if (!blockPage(path) || key !== bannerKey(path)) redirect("/admin/pages");
  let data: Record<string, unknown> = {};
  try { const v = JSON.parse(String(f.get("data") ?? "{}")); if (v && typeof v === "object") data = v; } catch { redirect(pageUrl(path, "banner", "error=1")); }
  const fallback = BANNER_PAGES.find(b => b.key === key)?.image ?? "";
  const now = (await loadOne("banners")).data as Record<string, unknown>;
  const merged = { ...now, [key]: reset ? fallback : typeof data[key] === "string" ? data[key] : "" };
  await upsert("banners", sanitize("banners", merged));
  await purgeSite(await everyPage());
  redirect(pageUrl(path, "banner", reset ? "saved=reset" : "saved=1"));
}
export async function savePageBanner(f: FormData) { await putBanner(f, false); }
export async function resetPageBanner(f: FormData) { await putBanner(f, true); }
