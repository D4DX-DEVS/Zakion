import { notFound } from "next/navigation";
import { db, env } from "@/lib/env";
import type { Post } from "@/lib/render";
import { IMAGE_LABEL, LIMITS_TEXT } from "@/lib/upload";
import { deletePost, savePost } from "../../../actions";
import { Icon } from "../../../icons";
import { ConfirmButton, ImagePicker, SubmitButton, Toast } from "../../../ui";

export default async function EditPost({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; badimage?: string; bigimage?: string }> }) {
  const { id } = await params;
  const { saved, badimage, bigimage } = await searchParams;
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
      <div className="pagehead">
        <a className="back" href="/admin/posts"><Icon name="arrowLeft" size={16} />All posts</a>
        <h2>{isNew ? "Write a post" : p.title || "Edit post"}</h2>
        {!isNew && <span className={"chip " + p.status}>{p.status}</span>}
      </div>
      {saved && <Toast text="Post saved" />}
      {badimage && <p className="alert" role="alert">The post was saved, but "{badimage}" was not uploaded: only image files are allowed.</p>}
      {bigimage && <p className="alert" role="alert">The post was saved, but {bigimage} was not uploaded. {LIMITS_TEXT}</p>}
      <form action={savePost}>
        <input type="hidden" name="id" value={id} />
        <div className="editor">
          <div>
            <section className="card">
              <div className="card-h"><h3><Icon name="pen" size={20} />Post details</h3></div>
              <label className="field"><span>Title</span><input type="text" name="title" defaultValue={p.title} required /></label>
              <label className="field"><span>URL slug</span><input type="text" name="slug" defaultValue={p.slug} placeholder="Created from the title if empty" /></label>
              <label className="field" style={{ marginBottom: 0 }}><span>Excerpt (search result description)</span><textarea className="plain" name="excerpt" rows={3} defaultValue={p.excerpt} /></label>
            </section>
            <section className="card">
              <div className="card-h"><h3><Icon name="file" size={20} />Content</h3></div>
              <label className="field" style={{ marginBottom: 0 }}><span>Content (HTML)</span><textarea name="content" rows={22} defaultValue={p.content} spellCheck={false} /></label>
            </section>
          </div>
          <aside className="aside">
            <section className="card">
              <div className="card-h"><h3><Icon name="eye" size={20} />Publish</h3></div>
              <label className="field"><span>Status</span><select name="status" defaultValue={p.status}><option>published</option><option>draft</option></select><small className="hint">Drafts are hidden from visitors.</small></label>
              <label className="field"><span>Date</span><input type="datetime-local" name="published_at" defaultValue={p.published_at.replace(" ", "T").slice(0, 16)} /></label>
              <label className="field"><span>Category</span><input type="text" name="category" defaultValue={p.category} /></label>
              <label className="field" style={{ marginBottom: 0 }}><span>Author</span><input type="text" name="author" defaultValue={p.author} /></label>
            </section>
            <section className="card">
              <div className="card-h"><h3><Icon name="image" size={20} />Featured image</h3></div>
              <ImagePicker name="image" initial={p.image} options={library} />
              <label className="field" style={{ marginTop: 16, marginBottom: 0 }}><span>Or upload a new image <small className="muted">(up to {IMAGE_LABEL})</small></span><input type="file" name="image_file" accept="image/*" /></label>
            </section>
          </aside>
        </div>
        <div className="stickybar">
          <span className="grow">Don’t forget to save your changes.</span>
          {!isNew && <a className="btn sec" href={`/${p.slug}/`} target="_blank" rel="noreferrer"><Icon name="external" size={18} />View post</a>}
          <SubmitButton><Icon name="save" size={18} />Save changes</SubmitButton>
        </div>
      </form>
      {!isNew && (
        <section className="card danger">
          <div><h3>Delete this post</h3><p className="muted">It disappears from the blog. This cannot be undone.</p></div>
          <form action={deletePost}>
            <input type="hidden" name="id" value={id} />
            <ConfirmButton message={`Delete "${p.title}"? This cannot be undone.`}><Icon name="trash" size={18} />Delete post</ConfirmButton>
          </form>
        </section>
      )}
    </>
  );
}
