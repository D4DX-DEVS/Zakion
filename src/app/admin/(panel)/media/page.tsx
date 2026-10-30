import { env } from "@/lib/env";
import { deleteMedia, uploadMedia } from "../../actions";
import { ConfirmButton, CopyButton, SubmitButton } from "../../ui";

export default async function Media({ searchParams }: { searchParams: Promise<{ all?: string }> }) {
  const { all } = await searchParams;
  const list = await env().MEDIA.list({ limit: 1000 });
  const objs = list.objects
    .filter(o => !o.key.startsWith("_snap/") && (all || !/-\d+x\d+\.\w+$/.test(o.key)))
    .sort((a, b) => b.uploaded.getTime() - a.uploaded.getTime());
  return (
    <>
      <h1>Media</h1>
      <form action={uploadMedia} className="card row">
        <label className="field" style={{ margin: 0, flex: "1 1 280px" }}><span>Upload images, video or PDF</span><input type="file" name="files" multiple accept="image/*,video/*,.pdf" required /></label>
        <SubmitButton pending="Uploading…">Upload</SubmitButton>
        <a href={all ? "/admin/media" : "/admin/media?all=1"} className="muted">{all ? "Hide resized copies" : "Show resized copies"}</a>
      </form>
      {objs.length === 0 && <p className="empty">No files yet.</p>}
      <div className="grid">
        {objs.map(o => (
          <div className="tile" key={o.key}>
            {/\.(png|jpe?g|gif|webp|svg)$/i.test(o.key) ? <img src={"/media/" + o.key} loading="lazy" alt={o.key.split("/").pop()} /> : <div className="ph" />}
            <div>{o.key}</div>
            <div className="row" style={{ marginTop: 8 }}>
              <CopyButton text={"/media/" + o.key} />
              <form action={deleteMedia}>
                <input type="hidden" name="key" value={o.key} />
                <ConfirmButton className="btn del sm" message={`Delete ${o.key}? Pages using it will show a broken image.`}>Delete</ConfirmButton>
              </form>
            </div>
          </div>
        ))}
      </div>
      {list.truncated && <p className="muted">Showing the first 1000 files.</p>}
    </>
  );
}
