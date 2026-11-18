import { db, env } from "@/lib/env";
import { loadContent, SECTION_BY_KEY, type Layout } from "@/lib/content";
import { HIDDEN } from "@/lib/media";
import { Icon, type IconName } from "../icons";
import { ago, time } from "../format";
import { SEC_ICON } from "../section-meta";

type Act = { icon: IconName; title: string; note: string; href: string; at: string };

// Overview: the home page as a map of blocks, a one-line pulse of the site, the latest activity and the launcher.
export default async function Overview() {
  const d = db();
  const n = async (q: string) => (await d.prepare(q).first<{ c: number }>())?.c ?? 0;
  const [pages, posts, drafts, msgs, pg, ps, ms, rows, content] = await Promise.all([
    n("SELECT COUNT(*) c FROM pages WHERE kind!='template'"),
    n("SELECT COUNT(*) c FROM posts"),
    n("SELECT COUNT(*) c FROM posts WHERE status='draft'"),
    n("SELECT COUNT(*) c FROM messages"),
    d.prepare("SELECT path,title,updated_at FROM pages WHERE kind!='template' ORDER BY updated_at DESC LIMIT 5").all<{ path: string; title: string; updated_at: string }>(),
    d.prepare("SELECT id,title,status,updated_at FROM posts ORDER BY updated_at DESC LIMIT 5").all<{ id: number; title: string; status: string; updated_at: string }>(),
    d.prepare("SELECT id,name,subject,created_at FROM messages ORDER BY id DESC LIMIT 5").all<{ id: number; name: string; subject: string; created_at: string }>(),
    d.prepare("SELECT key, updated_at FROM site_content").all<{ key: string; updated_at: string }>().then((r) => r.results).catch(() => []),
    loadContent(),
  ]);
  const media = (await env().MEDIA.list({ limit: 1000 })).objects.filter((o) => !HIDDEN.test(o.key)).length;
  const layout: Layout = content._layout;
  const edited = new Map(rows.map((r) => [r.key, r.updated_at]));
  const hidden = new Set(layout.hidden);
  const live = layout.order.length - hidden.size;
  const editedCount = layout.order.filter((k) => edited.has(k)).length;

  const feed: Act[] = [
    ...rows.filter((r) => SECTION_BY_KEY[r.key]).map((r): Act => ({ icon: SEC_ICON[r.key] ?? "layers", title: SECTION_BY_KEY[r.key].title, note: "Studio block edited", href: "/admin/studio?key=" + r.key, at: r.updated_at })),
    ...pg.results.map((r): Act => ({ icon: "file", title: r.title || r.path, note: "Page updated", href: "/admin/pages/edit?path=" + encodeURIComponent(r.path), at: r.updated_at })),
    ...ps.results.map((r): Act => ({ icon: "pen", title: r.title, note: r.status === "draft" ? "Draft saved" : "Blog post updated", href: "/admin/posts/" + r.id, at: r.updated_at })),
    ...ms.results.map((r): Act => ({ icon: "inbox", title: r.name || "New message", note: "New message" + (r.subject ? ` · ${r.subject}` : ""), href: "/admin/messages", at: r.created_at })),
  ].sort((a, b) => time(b.at) - time(a.at)).slice(0, 7);

  const pulse: [IconName, string, number, string][] = [
    ["file", "Pages", pages, "/admin/pages"], ["pen", drafts ? `Posts · ${drafts} draft${drafts > 1 ? "s" : ""}` : "Posts", posts, "/admin/posts"],
    ["image", "Library files", media, "/admin/media"], ["inbox", "Messages", msgs, "/admin/messages"],
  ];
  const launch: [IconName, string, string, string][] = [
    ["layers", "Edit the home page", "Studio", "/admin/studio"], ["pen", "Write a post", "Blog", "/admin/posts/new"],
    ["upload", "Upload media", "Library", "/admin/media"], ["layers", "Edit the footer", "Every page", "/admin/studio?key=footer"],
  ];

  return (
    <>
      <section className="mapcard" aria-labelledby="map-h">
        <div className="mc-text">
          <span className="eyebrow">Home page</span>
          <h2 id="map-h"><b>{live}</b> blocks live</h2>
          <p>{editedCount} edited · {hidden.size} hidden · {layout.order.length - editedCount} still original</p>
          <a className="btn amber" href="/admin/studio"><Icon name="layers" size={18} />Open Studio</a>
        </div>
        <ol className="pmap" aria-label="Home page blocks, top to bottom">
          {layout.order.map((k, i) => (
            <li key={k} className={hidden.has(k) ? "off" : edited.has(k) ? "ed" : ""} style={{ ["--i" as string]: i }}>
              <a href={`/admin/studio?key=${k}`} title={`${SECTION_BY_KEY[k].title}${hidden.has(k) ? " (hidden)" : edited.has(k) ? " (edited)" : ""}`}>
                <Icon name={SEC_ICON[k]} size={16} /><span>{SECTION_BY_KEY[k].title}</span>
              </a>
            </li>
          ))}
        </ol>
        <ul className="legend"><li className="ed">Edited</li><li>Original</li><li className="off">Hidden</li></ul>
      </section>

      <ul className="pulse" aria-label="Site at a glance">
        {pulse.map(([ic, l, v, h]) => (
          <li key={l}><a href={h}><Icon name={ic} size={18} /><b>{v}</b><span>{l}</span></a></li>
        ))}
      </ul>

      <div className="duo">
        <section className="card" aria-labelledby="act-h">
          <div className="card-h"><h2 id="act-h"><Icon name="clock" size={20} />Latest activity</h2></div>
          {feed.length === 0 ? (
            <p className="muted">Nothing yet. Edits, new posts and contact messages will show up here.</p>
          ) : (
            <ol className="tl">
              {feed.map((a, i) => (
                <li key={i}>
                  <a href={a.href}><span className="tl-dot"><Icon name={a.icon} size={15} /></span><span className="tl-text"><b>{a.title}</b><i>{a.note}</i></span><time>{ago(a.at)}</time></a>
                </li>
              ))}
            </ol>
          )}
        </section>
        <section className="card launcher" aria-labelledby="go-h">
          <div className="card-h"><h2 id="go-h"><Icon name="bolt" size={20} />Jump in</h2></div>
          <div className="lg">
            {launch.map(([ic, l, tag, h]) => (
              <a key={l} href={h}><span className="lg-ico"><Icon name={ic} size={22} /></span><b>{l}</b><i>{tag}</i></a>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
