import { db, env } from "@/lib/env";

export default async function Dashboard() {
  const d = db();
  const n = async (q: string) => (await d.prepare(q).first<{ c: number }>())?.c ?? 0;
  const [pages, posts, drafts, msgs] = await Promise.all([
    n("SELECT COUNT(*) c FROM pages WHERE kind!='template'"),
    n("SELECT COUNT(*) c FROM posts"),
    n("SELECT COUNT(*) c FROM posts WHERE status='draft'"),
    n("SELECT COUNT(*) c FROM messages"),
  ]);
  const media = (await env().MEDIA.list({ limit: 1000 })).objects.length;
  const stats: [string, number, string][] = [["Pages", pages, "/admin/pages"], ["Posts", posts, "/admin/posts"], ["Drafts", drafts, "/admin/posts"], ["Media files", media, "/admin/media"], ["Messages", msgs, "/admin/messages"]];
  return (
    <>
      <h1>Dashboard</h1>
      <div className="grid">
        {stats.map(([l, v, h]) => (
          <a key={l} href={h} className="card" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="muted">{l}</div>
            <div className="stat">{v}</div>
          </a>
        ))}
      </div>
    </>
  );
}
