import { db, env } from "@/lib/env";
import { HIDDEN } from "@/lib/media";

export default async function Dashboard() {
  const d = db();
  const n = async (q: string) => (await d.prepare(q).first<{ c: number }>())?.c ?? 0;
  const [pages, posts, drafts, msgs] = await Promise.all([
    n("SELECT COUNT(*) c FROM pages WHERE kind!='template'"),
    n("SELECT COUNT(*) c FROM posts"),
    n("SELECT COUNT(*) c FROM posts WHERE status='draft'"),
    n("SELECT COUNT(*) c FROM messages"),
  ]);
  const media = (await env().MEDIA.list({ limit: 1000 })).objects.filter(o => !HIDDEN.test(o.key)).length;
  const stats: [string, number, string][] = [["Pages", pages, "/admin/pages"], ["Blog posts", posts, "/admin/posts"], ["Drafts", drafts, "/admin/posts"], ["Media files", media, "/admin/media"], ["Messages", msgs, "/admin/messages"]];
  return (
    <>
      <h1>Dashboard</h1>
      <div className="stats">
        {stats.map(([l, v, h]) => (
          <a key={l} href={h} className="stat"><span className="muted">{l}</span><b>{v}</b></a>
        ))}
      </div>
      <div className="card row">
        <a className="btn amber" href="/admin/posts/new">Write a post</a>
        <a className="btn sec" href="/admin/media">Upload media</a>
        <a className="btn sec" href="/admin/pages">Edit pages</a>
      </div>
    </>
  );
}
