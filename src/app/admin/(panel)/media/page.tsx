import { env } from "@/lib/env";
import { deleteMedia, uploadMedia } from "../../actions";
import { fmtBytes, fmtDate } from "../../format";
import { Icon } from "../../icons";
import { ConfirmButton, CopyButton, SubmitButton, TableTools } from "../../ui";
import { HIDDEN } from "@/lib/media";
import { IMAGE_LABEL, LIMITS_TEXT, VIDEO_LABEL } from "@/lib/upload";

const IMG = /\.(png|jpe?g|gif|webp|svg)$/i;
const kind = (k: string) => (IMG.test(k) ? "image" : /\.(mp4|webm|mov)$/i.test(k) ? "video" : /\.pdf$/i.test(k) ? "pdf" : "other");

export default async function Media({ searchParams }: { searchParams: Promise<{ all?: string; rejected?: string; big?: string }> }) {
  const { all, rejected, big } = await searchParams;
  const list = await env().MEDIA.list({ limit: 1000 });
  const objs = list.objects
    .filter(o => !HIDDEN.test(o.key) && (all || !/-\d+x\d+\.\w+$/.test(o.key)))
    .sort((a, b) => b.uploaded.getTime() - a.uploaded.getTime());
  const count = (t: string) => objs.filter(o => kind(o.key) === t).length;
  return (
    <>
      {rejected && <p className="alert" role="alert">Not uploaded: {rejected}. Only images, MP4/WebM video and PDF files are allowed.</p>}
      {big && <p className="alert" role="alert">Not uploaded, too large: {big}. {LIMITS_TEXT}</p>}
      <form action={uploadMedia} className="card drop">
        <span className="big"><Icon name="upload" size={28} /></span>
        <label className="field"><span>Upload images, video or PDF <small className="muted">(images and PDF up to {IMAGE_LABEL}, video up to {VIDEO_LABEL})</small></span><input type="file" name="files" multiple accept="image/*,video/*,.pdf" required /></label>
        <SubmitButton pending="Uploading…"><Icon name="upload" size={18} />Upload</SubmitButton>
      </form>

      {objs.length === 0 ? (
        <div className="card empty">
          <span className="eico"><Icon name="image" size={28} /></span>
          <h3>No files yet</h3>
          <p>Upload your first image, video or PDF above.</p>
        </div>
      ) : (
        <section className="card" aria-labelledby="media-h">
          <div className="card-h">
            <h2 id="media-h"><Icon name="image" size={22} />Library</h2>
            <a className="btn sec sm" href={all ? "/admin/media" : "/admin/media?all=1"}>{all ? "Hide resized copies" : "Show resized copies"}</a>
          </div>
          <TableTools
            target="media-grid" label="Search files" noun="files" total={objs.length}
            filters={[{ value: "all", label: "All", count: objs.length }, { value: "image", label: "Images", count: count("image") }, { value: "video", label: "Video", count: count("video") }, { value: "pdf", label: "PDF", count: count("pdf") }]}
          />
          <div className="grid" id="media-grid">
            {objs.map(o => {
              const k = kind(o.key);
              const name = o.key.split("/").pop() || o.key;
              return (
                <div className="tile" key={o.key} data-q={o.key.toLowerCase()} data-s={k}>
                  <div className="thumb">
                    {k === "image"
                      ? <img className={/\.(png|svg|gif)$/i.test(o.key) ? "fit" : undefined} src={"/media/" + o.key} loading="lazy" alt={name} />
                      : <Icon name={k === "video" ? "video" : "file"} size={44} />}
                  </div>
                  <div className="meta">
                    <div className="name" title={o.key}>{name}</div>
                    <div className="info">{fmtBytes(o.size)} · {fmtDate(o.uploaded.toISOString())}</div>
                  </div>
                  <div className="acts">
                    <CopyButton text={"/media/" + o.key} />
                    <form action={deleteMedia}>
                      <input type="hidden" name="key" value={o.key} />
                      <ConfirmButton className="btn del sm ico" message={`Delete ${o.key}? Pages using it will show a broken image.`}><Icon name="trash" size={16} /><span className="sr-only">Delete {name}</span></ConfirmButton>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="empty" id="media-grid-none" hidden>
            <span className="eico"><Icon name="search" size={28} /></span>
            <h3>No files match</h3>
            <p>Try a different word, or switch the filter back to All.</p>
          </div>
          {list.truncated && <p className="muted" style={{ marginTop: 16 }}>Showing the first 1000 files.</p>}
        </section>
      )}
    </>
  );
}
