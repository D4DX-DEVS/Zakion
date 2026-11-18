"use client";
// Generic editor for a page section. The form is built from the section's schema (lib/content.ts); all values live in React
// state and are sent as one JSON field. Lists get add, delete and move up/down; image and video fields can pick from the
// library or upload a new file.
import { useRef, useState } from "react";
import type { Field } from "@/lib/content";
import { Icon } from "./icons";
import { MAX_UPLOAD, MAX_UPLOAD_LABEL } from "@/lib/upload";
import { fmtBytes } from "./format";
import { MenuEditor, type LinkOption } from "./menu-editor";
import { PickerDialog, SubmitButton } from "./ui";

type Obj = Record<string, any>;
type Upload = (f: FormData) => Promise<{ url?: string; error?: string }>;
type Pick = (done: (url: string) => void) => void;

const blank = (fields: Field[]): Obj =>
  Object.fromEntries(fields.map((f) => [f.k, f.type === "list" ? [] : f.type === "bool" ? false : f.type === "number" ? 0 : f.type === "select" ? f.options![0] : ""]));

const isImg = (u: string) => /\.(png|jpe?g|webp|gif|avif|svg)(\?.*)?$/i.test(u);

function MediaField({ f, value, set, pick, upload }: { f: Field; value: string; set: (v: string) => void; pick: Pick; upload: Upload }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const file = useRef<HTMLInputElement>(null);
  const isVideo = f.type === "video";
  const isFile = f.type === "file";
  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const chosen = e.target.files?.[0];
    if (!chosen) return;
    if (chosen.size > MAX_UPLOAD) { setErr(`"${chosen.name}" is ${fmtBytes(chosen.size)}. Files can be up to ${MAX_UPLOAD_LABEL}.`); e.target.value = ""; return; }
    setBusy(true); setErr("");
    const fd = new FormData(); fd.set("file", chosen);
    try { const r = await upload(fd); if (r.url) set(r.url); else setErr(r.error || "Upload failed."); } catch { setErr(`Upload failed. Check your connection and try again (files can be up to ${MAX_UPLOAD_LABEL}).`); }
    setBusy(false); e.target.value = "";
  }
  return (
    <div className="mf">
      {value && !isVideo && !isFile && <img className="mf-prev" src={value} alt="" />}
      {value && isFile && isImg(value) && <img className="mf-prev" src={value} alt="" />}
      {value && isFile && <a className="mf-file" href={value} target="_blank" rel="noreferrer"><Icon name="file" size={18} />{isImg(value) ? "Open the current image" : "Open the current file"}<span className="sr-only"> (opens in a new tab)</span></a>}
      {value && isVideo && <video className="mf-prev" src={value} muted controls preload="metadata" />}
      <input type="text" value={value} onChange={(e) => set(e.target.value)} placeholder={isVideo ? "/media/…mp4 (optional)" : isFile ? "/media/…pdf or /media/…jpg (optional)" : "/media/… or /zk/…"} aria-label={f.label} />
      <div className="row">
        {!isVideo && !isFile && <button type="button" className="btn sec sm" onClick={() => pick(set)}><Icon name="image" size={16} />Choose from library</button>}
        <button type="button" className="btn sec sm" disabled={busy} onClick={() => file.current?.click()}><Icon name="upload" size={16} />{busy ? "Uploading…" : "Upload new"}</button>
        {value && <button type="button" className="btn sec sm" onClick={() => set("")}><Icon name="close" size={16} />Remove</button>}
        <input ref={file} type="file" hidden accept={isVideo ? "video/mp4,video/webm" : isFile ? "application/pdf,image/*" : "image/*"} onChange={onFile} />
      </div>
      {err && <p className="alert" role="alert">{err}</p>}
    </div>
  );
}

export function Fields({ fields, value, onChange, pick, upload, links }: { fields: Field[]; value: Obj; onChange: (v: Obj) => void; pick: Pick; upload: Upload; links?: LinkOption[] }) {
  const set = (k: string, v: unknown) => onChange({ ...value, [k]: v });
  return (
    <>
      {fields.map((f) => {
        const v = value[f.k];
        const help = f.help && <small className="muted">{f.help}</small>;
        switch (f.type) {
          case "text":
            return <label className="field" key={f.k}><span>{f.label}</span><input type="text" value={v ?? ""} onChange={(e) => set(f.k, e.target.value)} />{help}</label>;
          case "textarea":
          case "lines":
            return <label className="field" key={f.k}><span>{f.label}</span><textarea className="plain" rows={f.type === "lines" ? 5 : 3} value={v ?? ""} onChange={(e) => set(f.k, e.target.value)} />{help}</label>;
          case "number":
            return <label className="field" key={f.k}><span>{f.label}</span><input type="number" value={v ?? 0} onChange={(e) => set(f.k, e.target.value === "" ? 0 : Number(e.target.value))} />{help}</label>;
          case "color": {
            const hex = /^#[0-9a-f]{6}$/i.test(String(v ?? "")) ? String(v) : "#000000";
            return (
              <div className="field" key={f.k}><span>{f.label}</span>
                <div className="colorfield">
                  <input type="color" value={hex} onChange={(e) => set(f.k, e.target.value)} aria-label={`${f.label}: colour picker`} />
                  <input type="text" value={v ?? ""} maxLength={7} spellCheck={false} onChange={(e) => set(f.k, e.target.value)} onBlur={(e) => { const t = e.target.value.trim(); if (/^[0-9a-f]{6}$/i.test(t)) set(f.k, "#" + t); }} aria-label={`${f.label}: hex code`} placeholder="#0d3d7b" />
                </div>
                {help}
              </div>
            );
          }
          case "bool":
            return <label className="field check" key={f.k}><input type="checkbox" checked={!!v} onChange={(e) => set(f.k, e.target.checked)} /><span>{f.label}</span>{help}</label>;
          case "select":
            return <label className="field" key={f.k}><span>{f.label}</span><select value={v ?? ""} onChange={(e) => set(f.k, e.target.value)}>{f.options!.map((o) => <option key={o}>{o}</option>)}</select>{help}</label>;
          case "image":
          case "video":
          case "file":
            return <div className="field" key={f.k}><span>{f.label}</span><MediaField f={f} value={v ?? ""} set={(x) => set(f.k, x)} pick={pick} upload={upload} />{help}</div>;
          case "list": {
            if (f.editor) return <div className="field" key={f.k}><MenuEditor field={f} value={v as never} onChange={(n) => set(f.k, n)} links={links} /></div>;
            const items: Obj[] = Array.isArray(v) ? v : [];
            const max = f.max ?? 60, min = f.min ?? 0;
            const update = (next: Obj[]) => set(f.k, next);
            const move = (i: number, d: number) => { const j = i + d; if (j < 0 || j >= items.length) return; const n = items.slice(); [n[i], n[j]] = [n[j], n[i]]; update(n); };
            return (
              <fieldset className="list" key={f.k}>
                <legend>{f.label} <span className="muted">({items.length})</span></legend>
                {help}
                {items.map((it, i) => (
                  <div className="item" key={i}>
                    <div className="item-h">
                      <strong><span className="n" aria-hidden="true">{i + 1}</span>{f.itemLabel ? f.itemLabel[0].toUpperCase() + f.itemLabel.slice(1) : "Item"}<span className="sr-only"> {i + 1}</span></strong>
                      <span className="row">
                        <button type="button" className="btn sec sm ico" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}><Icon name="up" size={16} /></button>
                        <button type="button" className="btn sec sm ico" aria-label="Move down" disabled={i === items.length - 1} onClick={() => move(i, 1)}><Icon name="down" size={16} /></button>
                        <button type="button" className="btn del sm" disabled={items.length <= min} onClick={() => { if (confirm("Remove this item?")) update(items.filter((_, j) => j !== i)); }}><Icon name="trash" size={16} />Delete</button>
                      </span>
                    </div>
                    <div className="item-b"><Fields fields={f.fields!} value={it} onChange={(nv) => update(items.map((x, j) => (j === i ? nv : x)))} pick={pick} upload={upload} links={links} /></div>
                  </div>
                ))}
                <button type="button" className="btn sm" disabled={items.length >= max} onClick={() => update([...items, blank(f.fields!)])}><Icon name="plus" size={16} />Add {f.itemLabel || "item"}</button>
                {items.length >= max && <span className="muted"> Limit of {max} reached.</span>}
              </fieldset>
            );
          }
        }
      })}
    </>
  );
}

export function SectionEditor({ sectionKey, fields, initial, images, save, reset, upload }: {
  sectionKey: string; fields: Field[]; initial: Obj; images: string[];
  save: (f: FormData) => Promise<void>; reset: (f: FormData) => Promise<void>; upload: Upload;
}) {
  const [data, setData] = useState<Obj>(initial);
  const dlg = useRef<HTMLDialogElement>(null);
  const cb = useRef<(u: string) => void>(() => {});
  const pick: Pick = (done) => { cb.current = done; dlg.current?.showModal(); };
  return (
    <>
      <form action={save} className="editor-one">
        <input type="hidden" name="key" value={sectionKey} />
        <input type="hidden" name="data" value={JSON.stringify(data)} />
        <div className="card"><Fields fields={fields} value={data} onChange={setData} pick={pick} upload={upload} /></div>
        <div className="stickybar">
          <span className="grow">Don’t forget to save your changes.</span>
          <button type="submit" className="btn del" formAction={reset} onClick={(e) => { if (!confirm("Discard all edits to this section and go back to the original text and images?")) e.preventDefault(); }}><Icon name="reset" size={18} />Reset to original</button>
          <SubmitButton><Icon name="save" size={18} />Save changes</SubmitButton>
        </div>
      </form>
      <PickerDialog dlg={dlg} title="Image library" options={images} onPick={(u) => cb.current(u)} />
    </>
  );
}
