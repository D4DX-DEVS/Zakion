import { notFound } from "next/navigation";
import { db, env } from "@/lib/env";
import type { Post } from "@/lib/render";
import { deletePost, savePost } from "../../../actions";
import { ConfirmButton, ImagePicker, SubmitButton, Toast } from "../../../ui";

export default async function EditPost({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const { saved } = await searchParams;
  const isNew = id === "new";
  const p = isNew
    ? ({ id: 0, slug: "", title: "", excerpt: "", content: "<p></p>", image: "", category: "Uncategorized", author: "Amjad", status: "draft", published_at: new Date().toISOString().slice(0, 16).replace("T", " ") } as Post)
    : await db().prepare("SELECT * FROM posts WHERE id=?").bind(id).first<Post>();
  if (!p) notFound();
  const library = (await env().MEDIA.list({ limit: 1000 })).objects
    .filter(o => /\.(png|jpe?g|webp|gif|svg)$/i.test(o.key) && !/-\d+x\d+\.\w+$/.test(o.key) && !o.key.startsWith("_snap/") && !o.key.startsWith("elementor/"))
    .sort((a, b) => b.uploaded.getTime() - a.uploaded.getTime()).slice(0, 150).map(o => "/media/" + o.key);
  return (
    <>
      <p className="muted crumb"><a href="/admin/posts">Blog posts</a> / {isNew ? "New" : p.title}</p>
      <h1>{isNew ? "Write a post" : "Edit post"}</h1>
      {saved && <Toast text="Post saved" />}
      <form action={savePost} className="editor">
        <input type="hidden" name="id" value={id} />
        <div>
          <div className="card">
            <label className="field"><span>Title</span><input type="text" name="title" defaultValue={p.title} required /></label>
            <label className="field"><span>URL slug</span><input type="text" name="slug" defaultValue={p.slug} placeholder="Created from the title if empty" /></label>
            <label className="field"><span>Excerpt (search result description)</span><textarea name="excerpt" rows={3} defaultValue={p.excerpt} style={{ fontFamily: "inherit", fontSize: 15 }} /></label>
          </div>
          <div className="card">
            <label className="field"><span>Content (HTML)</span><textarea name="content" rows={22} defaultValue={p.content} spellCheck={false} /></label>
          </div>
        </div>
        <aside className="aside">
          <div className="card">
            <h3>Publish</h3>
            <label className="field"><span>Status</span><select name="status" defaultValue={p.status}><option>published</option><option>draft</option></select></label>
            <label className="field"><span>Date</span><input type="datetime-local" name="published_at" defaultValue={p.published_at.replace(" ", "T").slice(0, 16)} /></label>
            <label className="field"><span>Category</span><input type="text" name="category" defaultValue={p.category} /></label>
            <label className="field"><span>Author</span><input type="text" name="author" defaultValue={p.author} /></label>
            <div className="row">
              <SubmitButton>Save changes</SubmitButton>
              {!isNew && <a className="btn sec" href={`/${p.slug}/`} target="_blank" rel="noreferrer">View post</a>}
            </div>
          </div>
          <div className="card">
            <h3>Featured image</h3>
            <ImagePicker name="image" initial={p.image} options={library} />
            <label className="field" style={{ marginTop: 16 }}><span>Or upload a new image</span><input type="file" name="image_file" accept="image/*" /></label>
          </div>
        </aside>
      </form>
      {!isNew && (
        <form action={deletePost}>
          <input type="hidden" name="id" value={id} />
          <ConfirmButton message={`Delete "${p.title}"? This cannot be undone.`}>Delete post</ConfirmButton>
        </form>
      )}
    </>
  );
}
