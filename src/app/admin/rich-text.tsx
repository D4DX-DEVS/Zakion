"use client";
// A rich text editor for the admin (a project's Description): headings, bold, italic, underline, lists, quotes, links, tables and images, plus a
// plain HTML view. The text is edited in place and sent on as HTML; the server cleans it (src/lib/html.ts) before it is saved.
// It uses the browser's own editing commands, so it needs no extra library.
import { useEffect, useRef, useState } from "react";
import { cleanHtml } from "@/lib/html";

type Upload = (f: FormData) => Promise<{ url?: string; error?: string }>;

export function RichText({ value, onChange, pick, upload, label }: {
  value: string; onChange: (v: string) => void; pick: (done: (url: string) => void) => void; upload: Upload; label: string;
}) {
  const area = useRef<HTMLDivElement>(null);
  const src = useRef<HTMLTextAreaElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const saved = useRef<Range | null>(null);
  const [code, setCode] = useState(false);
  const [inTable, setInTable] = useState(false);
  const [tbl, setTbl] = useState<{ rows: number; cols: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // the editor owns its content after the first paint (the parent only ever receives it)
  useEffect(() => { if (area.current) area.current.innerHTML = value; }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const emit = () => onChange(area.current?.innerHTML ?? "");
  const cell = () => {
    const n = getSelection()?.anchorNode;
    const el = n instanceof Element ? n : n?.parentElement;
    return el && area.current?.contains(el) ? (el.closest("td,th") as HTMLTableCellElement | null) : null;
  };
  const remember = () => {
    const s = getSelection();
    if (s && s.rangeCount && area.current?.contains(s.anchorNode)) saved.current = s.getRangeAt(0).cloneRange();
    setInTable(!!cell());
  };
  const restore = () => {
    area.current?.focus();
    const s = getSelection();
    if (s && saved.current) { s.removeAllRanges(); s.addRange(saved.current); }
  };
  const run = (cmd: string, arg?: string) => { restore(); document.execCommand(cmd, false, arg); emit(); remember(); };
  const insert = (html: string) => run("insertHTML", html);

  // ---- tables ----
  const row = () => cell()?.parentElement as HTMLTableRowElement | null;
  const table = () => cell()?.closest("table") as HTMLTableElement | null;
  const mutate = (fn: () => void) => { restore(); fn(); emit(); remember(); };
  const addRow = () => mutate(() => {
    const tr = row(); if (!tr) return;
    const n = tr.cloneNode(true) as HTMLTableRowElement;
    n.querySelectorAll("th").forEach((h) => { const d = document.createElement("td"); d.innerHTML = "<br>"; h.replaceWith(d); });
    n.querySelectorAll("td").forEach((d) => { d.innerHTML = "<br>"; });
    const head = tr.parentElement?.tagName === "THEAD";
    if (head) { const body = table()?.tBodies[0] ?? table()?.createTBody(); body?.insertBefore(n, body.firstChild); } else tr.parentNode?.insertBefore(n, tr.nextSibling);
  });
  const addCol = () => mutate(() => {
    const c = cell(), t = table(); if (!c || !t) return;
    const at = c.cellIndex;
    [...t.rows].forEach((r) => { const head = r.cells[0]?.tagName === "TH" && r.parentElement?.tagName === "THEAD"; const n = document.createElement(head ? "th" : "td"); n.innerHTML = "<br>"; r.insertBefore(n, r.cells[at]?.nextSibling ?? null); });
  });
  const delRow = () => mutate(() => { const tr = row(), t = table(); if (!tr || !t) return; if (t.rows.length <= 1) t.remove(); else tr.remove(); });
  const delCol = () => mutate(() => { const c = cell(), t = table(); if (!c || !t) return; const at = c.cellIndex; if ((t.rows[0]?.cells.length ?? 0) <= 1) { t.remove(); return; } [...t.rows].forEach((r) => r.cells[at]?.remove()); });
  const delTable = () => mutate(() => { table()?.remove(); });
  const toggleHeader = () => mutate(() => {
    const t = table(); const first = t?.rows[0]; if (!t || !first) return;
    const toTh = first.cells[0]?.tagName !== "TH";
    [...first.cells].forEach((c) => { const n = document.createElement(toTh ? "th" : "td"); n.innerHTML = c.innerHTML; if (c.getAttribute("colspan")) n.setAttribute("colspan", c.getAttribute("colspan")!); c.replaceWith(n); });
  });
  const makeTable = () => {
    if (!tbl) return;
    const r = Math.min(20, Math.max(1, tbl.rows)), c = Math.min(8, Math.max(1, tbl.cols));
    const cells = (tag: string) => Array.from({ length: c }, () => `<${tag}><br></${tag}>`).join("");
    const body = Array.from({ length: Math.max(0, r - 1) }, () => `<tr>${cells("td")}</tr>`).join("");
    setTbl(null);
    insert(`<table><thead><tr>${cells("th")}</tr></thead><tbody>${body}</tbody></table><p><br></p>`);
  };

  // ---- links and images ----
  const link = () => {
    remember();
    const url = window.prompt("Link address (for example https://… or /contact/). Leave empty to remove the link.", "https://");
    if (url === null) return;
    if (!url.trim() || url.trim() === "https://") run("unlink"); else run("createLink", url.trim());
  };
  const addImage = (url: string) => {
    const alt = window.prompt("Short description of the image, for people who cannot see it (optional)", "") ?? "";
    insert(`<img src="${url.replace(/"/g, "&quot;")}" alt="${alt.replace(/"/g, "&quot;").replace(/</g, "&lt;")}">`);
  };
  // the library dialog is still open (and the page behind it cannot take focus) when it reports the choice, so the image goes in a moment later
  const fromLibrary = () => { remember(); pick((u) => { setTimeout(() => addImage(u), 60); }); };
  const fromFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setBusy(true); setErr("");
    const fd = new FormData(); fd.set("file", f);
    try { const r = await upload(fd); if (r.url) addImage(r.url); else setErr(r.error || "Upload failed."); } catch { setErr("Upload failed. Check your connection and try again."); }
    setBusy(false); e.target.value = "";
  };

  const toggleCode = () => {
    if (code) { if (area.current && src.current) { area.current.innerHTML = cleanHtml(src.current.value); emit(); } setCode(false); } // cleaned, so nothing unsafe is ever put into the editor
    else { if (src.current) src.current.value = area.current?.innerHTML ?? ""; setCode(true); }
  };

  const B = ({ t, title, on, wide }: { t: string; title: string; on: () => void; wide?: boolean }) => (
    <button type="button" className={"rte-btn" + (wide ? " wide" : "")} title={title} aria-label={title} onMouseDown={(e) => e.preventDefault()} onClick={on}>{t}</button>
  );

  return (
    <div className="rte">
      <div className="rte-bar" role="toolbar" aria-label={`${label}: formatting`}>
        <B t="P" title="Normal text" on={() => run("formatBlock", "<p>")} />
        <B t="H2" title="Large heading" on={() => run("formatBlock", "<h2>")} />
        <B t="H3" title="Medium heading" on={() => run("formatBlock", "<h3>")} />
        <B t="H4" title="Small heading" on={() => run("formatBlock", "<h4>")} />
        <span className="rte-sep" aria-hidden="true" />
        <B t="B" title="Bold" on={() => run("bold")} />
        <B t="I" title="Italic" on={() => run("italic")} />
        <B t="U" title="Underline" on={() => run("underline")} />
        <B t="S" title="Strikethrough" on={() => run("strikeThrough")} />
        <span className="rte-sep" aria-hidden="true" />
        <B t="• List" title="Bulleted list" on={() => run("insertUnorderedList")} wide />
        <B t="1. List" title="Numbered list" on={() => run("insertOrderedList")} wide />
        <B t="❝" title="Quote" on={() => run("formatBlock", "<blockquote>")} />
        <span className="rte-sep" aria-hidden="true" />
        <B t="Left" title="Align left" on={() => run("justifyLeft")} wide />
        <B t="Centre" title="Align centre" on={() => run("justifyCenter")} wide />
        <span className="rte-sep" aria-hidden="true" />
        <B t="Link" title="Add or remove a link" on={link} wide />
        <B t="Table" title="Insert a table" on={() => { remember(); setTbl(tbl ? null : { rows: 3, cols: 3 }); }} wide />
        <B t="Image" title="Insert an image from the library" on={fromLibrary} wide />
        <button type="button" className="rte-btn wide" title="Upload an image from your computer and insert it" disabled={busy} onMouseDown={(e) => e.preventDefault()} onClick={() => { remember(); file.current?.click(); }}>{busy ? "Uploading…" : "Upload"}</button>
        <span className="rte-sep" aria-hidden="true" />
        <B t="―" title="Horizontal line" on={() => run("insertHorizontalRule")} />
        <B t="Clear" title="Remove formatting" on={() => run("removeFormat")} wide />
        <B t="↶" title="Undo" on={() => run("undo")} />
        <B t="↷" title="Redo" on={() => run("redo")} />
        <button type="button" className={"rte-btn wide" + (code ? " on" : "")} aria-pressed={code} title="Show or edit the HTML" onClick={toggleCode}>HTML</button>
        <input ref={file} type="file" hidden accept="image/*" onChange={fromFile} />
      </div>
      {tbl && (
        <div className="rte-sub" role="group" aria-label="Insert a table">
          <label>Rows <input type="number" min={1} max={20} value={tbl.rows} onChange={(e) => setTbl({ ...tbl, rows: Number(e.target.value) })} /></label>
          <label>Columns <input type="number" min={1} max={8} value={tbl.cols} onChange={(e) => setTbl({ ...tbl, cols: Number(e.target.value) })} /></label>
          <button type="button" className="btn sm" onMouseDown={(e) => e.preventDefault()} onClick={makeTable}>Insert table</button>
          <button type="button" className="btn sec sm" onClick={() => setTbl(null)}>Cancel</button>
          <span className="muted">The first row is the heading row.</span>
        </div>
      )}
      {inTable && !code && (
        <div className="rte-sub" role="group" aria-label="Table tools">
          <strong>Table:</strong>
          <button type="button" className="btn sec sm" onMouseDown={(e) => e.preventDefault()} onClick={addRow}>Add row</button>
          <button type="button" className="btn sec sm" onMouseDown={(e) => e.preventDefault()} onClick={addCol}>Add column</button>
          <button type="button" className="btn sec sm" onMouseDown={(e) => e.preventDefault()} onClick={delRow}>Delete row</button>
          <button type="button" className="btn sec sm" onMouseDown={(e) => e.preventDefault()} onClick={delCol}>Delete column</button>
          <button type="button" className="btn sec sm" onMouseDown={(e) => e.preventDefault()} onClick={toggleHeader}>Heading row on/off</button>
          <button type="button" className="btn del sm" onMouseDown={(e) => e.preventDefault()} onClick={delTable}>Delete table</button>
        </div>
      )}
      <div
        ref={area}
        className="rte-area"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label={label}
        hidden={code}
        onInput={emit}
        onKeyUp={remember}
        onMouseUp={remember}
        onBlur={() => { remember(); emit(); }}
      />
      <textarea ref={src} className="rte-src" spellCheck={false} aria-label={`${label}: HTML`} hidden={!code} onChange={(e) => onChange(e.target.value)} />
      {err && <p className="alert" role="alert">{err}</p>}
    </div>
  );
}
