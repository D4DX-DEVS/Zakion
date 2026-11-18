import { db } from "@/lib/env";
import type { Post } from "@/lib/render";
import { fmtDate } from "../../format";
import { Icon } from "../../icons";
import { TableTools } from "../../ui";

export default async function Posts() {
  const rows = (await db().prepare("SELECT * FROM posts ORDER BY published_at DESC").all<Post>()).results;
  const count = (s: string) => rows.filter(r => r.status === s).length;
  return (
    <section className="card" aria-labelledby="posts-h">
      <div className="card-h">
        <h2 id="posts-h"><Icon name="pen" size={22} />All posts</h2>
        <a className="btn" href="/admin/posts/new"><Icon name="plus" size={18} />Write a post</a>
      </div>
      {rows.length === 0 ? (
        <div className="empty">
          <span className="eico"><Icon name="pen" size={28} /></span>
          <h3>No posts yet</h3>
          <p>Write your first blog post to share news with visitors.</p>
          <a className="btn" href="/admin/posts/new"><Icon name="plus" size={18} />Write a post</a>
        </div>
      ) : (
        <>
          <TableTools
            target="posts-table" label="Search posts" noun="posts" total={rows.length}
            filters={[{ value: "all", label: "All", count: rows.length }, { value: "published", label: "Published", count: count("published") }, { value: "draft", label: "Draft", count: count("draft") }]}
          />
          <div className="tablewrap" id="posts-table">
            <table className="rt">
              <thead><tr><th>Title</th><th>URL</th><th>Status</th><th>Date</th><th className="act"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} data-q={(r.title + " " + r.slug + " " + r.status + " " + r.category).toLowerCase()} data-s={r.status}>
                    <td className="t">{r.title}{r.category && <span className="s">{r.category}</span>}</td>
                    <td data-l="URL"><a href={`/${r.slug}/`} target="_blank" rel="noreferrer">/{r.slug}/</a></td>
                    <td data-l="Status"><span className={"chip " + r.status}>{r.status}</span></td>
                    <td data-l="Date" className="muted nw">{fmtDate(r.published_at)}</td>
                    <td className="act"><a className="btn sec sm" href={"/admin/posts/" + r.id}><Icon name="pencil" size={16} />Edit<span className="sr-only"> {r.title}</span></a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="empty" id="posts-table-none" hidden>
            <span className="eico"><Icon name="search" size={28} /></span>
            <h3>No posts match</h3>
            <p>Try a different word, or switch the filter back to All.</p>
          </div>
        </>
      )}
    </section>
  );
}
