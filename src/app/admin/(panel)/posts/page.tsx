import { db } from "@/lib/env";
import type { Post } from "@/lib/render";
import { TableSearch } from "../../ui";

export default async function Posts() {
  const rows = (await db().prepare("SELECT * FROM posts ORDER BY published_at DESC").all<Post>()).results;
  return (
    <>
      <div className="row between">
        <h1>Blog posts</h1>
        <a className="btn amber" href="/admin/posts/new">Write a post</a>
      </div>
      <div className="card">
        <div className="tools"><TableSearch target="posts-table" label="Search posts" /><span className="muted">{rows.length} posts</span></div>
        {rows.length === 0 && <p className="empty">No posts yet. Write your first one.</p>}
        <div className="tablewrap" id="posts-table">
          <table>
            <thead><tr><th>Title</th><th>URL</th><th>Status</th><th>Date</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} data-q={(r.title + " " + r.slug + " " + r.status).toLowerCase()}>
                  <td className="t">{r.title}</td>
                  <td><a href={`/${r.slug}/`} target="_blank" rel="noreferrer">/{r.slug}/</a></td>
                  <td><span className={"chip " + r.status}>{r.status}</span></td>
                  <td className="muted">{r.published_at.slice(0, 10)}</td>
                  <td><a className="btn sec sm" href={"/admin/posts/" + r.id}>Edit</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
