import { notFound } from "next/navigation";
import { db } from "@/lib/env";
import type { Post } from "@/lib/render";
import { deletePost, savePost } from "../../../actions";

export default async function EditPost({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const { saved } = await searchParams;
  const isNew = id === "new";
  const p = isNew
    ? ({ id: 0, slug: "", title: "", excerpt: "", content: "<p></p>", image: "", category: "Uncategorized", author: "Amjad", status: "draft", published_at: new Date().toISOString().slice(0, 16).replace("T", " ") } as Post)
    : await db().prepare("SELECT * FROM posts WHERE id=?").bind(id).first<Post>();
  if (!p) notFound();
  return (
    <>
      <h1>{isNew ? "New post" : "Edit post"}</h1>
      {saved && <p className="badge published">Saved</p>}
      <form action={savePost} className="card">
        <input type="hidden" name="id" value={id} />
        <label>Title</label>
        <input type="text" name="title" defaultValue={p.title} required />
        <label>Slug (URL: /slug/)</label>
        <input type="text" name="slug" defaultValue={p.slug} placeholder="auto from title" />
        <div className="row">
          <div style={{ flex: 1 }}><label>Status</label><select name="status" defaultValue={p.status}><option>published</option><option>draft</option></select></div>
          <div style={{ flex: 1 }}><label>Date</label><input type="datetime-local" name="published_at" defaultValue={p.published_at.replace(" ", "T").slice(0, 16)} /></div>
          <div style={{ flex: 1 }}><label>Category</label><input type="text" name="category" defaultValue={p.category} /></div>
          <div style={{ flex: 1 }}><label>Author</label><input type="text" name="author" defaultValue={p.author} /></div>
        </div>
        <label>Featured image</label>
        {p.image && <p><img src={p.image} alt="" style={{ maxWidth: 260, borderRadius: 6 }} /></p>}
        <input type="text" name="image" defaultValue={p.image} placeholder="/media/… or paste a URL" />
        <p className="muted">…or upload a new one (stored in R2):</p>
        <input type="file" name="image_file" accept="image/*" />
        <label>Excerpt (SEO description)</label>
        <textarea name="excerpt" rows={3} defaultValue={p.excerpt} style={{ fontFamily: "inherit" }} />
        <label>Content (HTML)</label>
        <textarea name="content" rows={22} defaultValue={p.content} />
        <p className="row">
          <button className="btn">Save</button>
          {!isNew && <a className="btn sec" href={`/${p.slug}/`} target="_blank">View</a>}
        </p>
      </form>
      {!isNew && (
        <form action={deletePost}>
          <input type="hidden" name="id" value={id} />
          <button className="btn del">Delete post</button>
        </form>
      )}
    </>
  );
}
