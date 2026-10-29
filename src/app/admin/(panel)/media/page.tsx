import { env } from "@/lib/env";
import { deleteMedia, uploadMedia } from "../../actions";

export default async function Media({ searchParams }: { searchParams: Promise<{ all?: string }> }) {
  const { all } = await searchParams;
  const list = await env().MEDIA.list({ limit: 1000 });
  const objs = list.objects
    .filter(o => all || !/-\d+x\d+\.\w+$/.test(o.key))
    .sort((a, b) => b.uploaded.getTime() - a.uploaded.getTime());
  return (
    <>
      <h1>Media (Cloudflare R2)</h1>
      <form action={uploadMedia} className="card row">
        <input type="file" name="files" multiple accept="image/*,video/*,.pdf" required />
        <button className="btn">Upload</button>
        <a href={all ? "/admin/media" : "/admin/media?all=1"} className="muted">{all ? "Hide resized copies" : "Show resized copies"}</a>
      </form>
      <div className="grid">
        {objs.map(o => (
          <div className="tile" key={o.key}>
            {/\.(png|jpe?g|gif|webp|svg)$/i.test(o.key) ? <img src={"/media/" + o.key} loading="lazy" alt="" /> : <div style={{ height: 110 }} />}
            <div>/media/{o.key}</div>
            <div className="row" style={{ marginTop: 6 }}>
              <a href={"/media/" + o.key} target="_blank">Open</a>
              <form action={deleteMedia}><input type="hidden" name="key" value={o.key} /><button className="btn del" style={{ padding: "2px 8px" }}>Delete</button></form>
            </div>
          </div>
        ))}
      </div>
      {list.truncated && <p className="muted">Showing first 1000 files.</p>}
    </>
  );
}
