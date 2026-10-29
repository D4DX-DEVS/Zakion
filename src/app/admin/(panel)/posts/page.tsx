import { db } from "@/lib/env";
import type { Post } from "@/lib/render";

export default async function Posts() {
  const rows = (await db().prepare("SELECT * FROM posts ORDER BY published_at DESC").all<Post>()).results;
  return (
    <>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1>Blog posts</h1>
        <a className="btn" href="/admin/posts/new">+ New post</a>
      </div>
      <div className="card">
        <table>
          <thead><tr><th>Title</th><th>Slug</th><th>Status</th><th>Date</th><th /></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>{r.title}</td>
                <td><a href={`/${r.slug}/`} target="_blank">/{r.slug}/</a></td>
                <td><span className={"badge " + r.status}>{r.status}</span></td>
                <td className="muted">{r.published_at}</td>
                <td><a className="btn sec" href={"/admin/posts/" + r.id}>Edit</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
