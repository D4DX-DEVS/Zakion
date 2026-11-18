"use client";
// Menu editor: one row per menu item (name and link side by side), with add, edit, delete and reorder. The main menu can also have
// submenu items under each item; the footer's quick links use the same editor without submenus. Reorder by dragging the handle or with
// the arrows (which also work on touch screens and with a keyboard). The link box suggests the site's pages; any /path/ or https:// link works.
// Rows with no name or no link are ignored when the menu is shown on the site.
import { useId, useState } from "react";
import type { Field } from "@/lib/content";
import { Icon } from "./icons";

type Link = { label: string; url: string };
type Item = Link & { children?: Link[] };
export type LinkOption = { url: string; title: string };
type Pos = { scope: string; i: number };

const reorder = <T,>(arr: T[], from: number, to: number) => {
  if (from === to || to < 0 || to >= arr.length) return arr;
  const n = arr.slice(); const [x] = n.splice(from, 1); n.splice(to, 0, x); return n;
};

export function MenuEditor({ field, value, onChange, links = [] }: { field: Field; value: Item[]; onChange: (v: Item[]) => void; links?: LinkOption[] }) {
  const nested = field.editor === "menu";
  const maxMain = field.max ?? 10;
  const maxSub = field.fields?.find((f) => f.k === "children")?.max ?? 12;
  const noun = nested ? "menu item" : "link";
  const list = useId();
  const [drag, setDrag] = useState<Pos | null>(null);
  const [over, setOver] = useState<Pos | null>(null);
  const items: Item[] = Array.isArray(value) ? value : [];
  const subsOf = (it: Item) => (Array.isArray(it.children) ? it.children : []);
  const patch = (i: number, p: Partial<Item>) => onChange(items.map((it, j) => (j === i ? { ...it, ...p } : it)));
  const setSubs = (i: number, children: Link[]) => patch(i, { children });
  const end = () => { setDrag(null); setOver(null); };

  // one row: used for a main item and for a submenu item
  const row = (scope: string, i: number, len: number, it: Link, o: { sub?: boolean; set: (p: Partial<Link>) => void; del: () => void; reorderTo: (from: number, to: number) => void; extra?: React.ReactNode }) => {
    const incomplete = !it.label.trim() || !it.url.trim();
    const cls = "me-row" + (o.sub ? " sub" : "") + (drag && drag.scope === scope && drag.i === i ? " drag" : "") +
      (over && drag && over.scope === scope && over.i === i && drag.i !== i ? (drag.i < i ? " over-b" : " over-a") : "") + (incomplete ? " incomplete" : "");
    return (
      <div className={cls} key={scope + i}
        onDragOver={(e) => { if (drag && drag.scope === scope) { e.preventDefault(); setOver({ scope, i }); } }}
        onDrop={(e) => { e.preventDefault(); if (drag && drag.scope === scope) o.reorderTo(drag.i, i); end(); }}>
        <span className="me-grip" draggable title="Drag to move" aria-hidden="true"
          onDragStart={(e) => { setDrag({ scope, i }); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", String(i)); const r = e.currentTarget.closest(".me-row"); if (r) e.dataTransfer.setDragImage(r, 16, 16); }}
          onDragEnd={end}><Icon name="grip" size={18} /></span>
        <span className="me-n" aria-hidden="true">{o.sub ? "↳" : i + 1}</span>
        <label className="me-f"><span className="sr-only">{o.sub ? "Submenu name" : "Name"} {i + 1}</span>
          <input type="text" value={it.label} placeholder={o.sub ? "Submenu name" : nested ? "Menu name" : "Link name"} onChange={(e) => o.set({ label: e.target.value })} /></label>
        <label className="me-f me-url"><span className="sr-only">Link {i + 1}</span>
          <input type="text" list={list} value={it.url} placeholder="/page/ or https://…" spellCheck={false} onChange={(e) => o.set({ url: e.target.value })} /></label>
        <span className="me-ctl">
          {o.extra}
          <button type="button" className="btn sec sm ico" disabled={i === 0} aria-label={`Move ${it.label || noun} up`} title="Move up" onClick={() => o.reorderTo(i, i - 1)}><Icon name="up" size={16} /></button>
          <button type="button" className="btn sec sm ico" disabled={i === len - 1} aria-label={`Move ${it.label || noun} down`} title="Move down" onClick={() => o.reorderTo(i, i + 1)}><Icon name="down" size={16} /></button>
          <button type="button" className="btn del sm ico" aria-label={`Delete ${it.label || noun}`} title="Delete" onClick={o.del}><Icon name="trash" size={16} /></button>
        </span>
        {incomplete && <span className="me-warn" role="status">Needs a name and a link, or it will not be shown.</span>}
      </div>
    );
  };

  const addPage = (url: string) => {
    const p = links.find((l) => l.url === url);
    if (p && items.length < maxMain) onChange([...items, nested ? { label: p.title, url: p.url, children: [] } : { label: p.title, url: p.url }]);
  };

  return (
    <div className="me">
      <div className="me-head">
        <strong>{field.label} <span className="muted">({items.length} of {maxMain})</span></strong>
        <span className="row">
          {links.length > 0 && (
            <select className="me-pick" value="" aria-label={`Add a page as a ${noun}`} disabled={items.length >= maxMain} onChange={(e) => { addPage(e.target.value); }}>
              <option value="">Add a page…</option>
              {links.map((l) => <option key={l.url} value={l.url}>{l.title}</option>)}
            </select>
          )}
          <button type="button" className="btn sm" disabled={items.length >= maxMain} onClick={() => onChange([...items, nested ? { label: "", url: "", children: [] } : { label: "", url: "" }])}><Icon name="plus" size={16} />Add {noun}</button>
        </span>
      </div>
      {field.help && <small className="muted">{field.help}</small>}
      {items.length === 0 && <p className="me-empty">No {noun}s yet. Use “Add {noun}” to create the first one.</p>}
      <ol className="me-list">
        {items.map((it, i) => {
          const subs = subsOf(it);
          return (
            <li className="me-item" key={i}>
              {row("m", i, items.length, it, {
                set: (p) => patch(i, p),
                reorderTo: (a, b) => onChange(reorder(items, a, b)),
                del: () => { if (subs.length && !confirm(`Delete “${it.label || "this item"}” and its ${subs.length} submenu ${subs.length === 1 ? "item" : "items"}?`)) return; onChange(items.filter((_, j) => j !== i)); },
                extra: nested ? (
                  <button type="button" className="btn sec sm" disabled={subs.length >= maxSub} title="Add a link that drops down under this item" onClick={() => setSubs(i, [...subs, { label: "", url: "" }])}><Icon name="plus" size={16} />Submenu</button>
                ) : undefined,
              })}
              {nested && subs.length > 0 && (
                <div className="me-subs" aria-label={`Submenu of ${it.label || "this item"}`}>
                  {subs.map((c, j) => row("s" + i, j, subs.length, c, {
                    sub: true,
                    set: (p) => setSubs(i, subs.map((x, k) => (k === j ? { ...x, ...p } : x))),
                    reorderTo: (a, b) => setSubs(i, reorder(subs, a, b)),
                    del: () => setSubs(i, subs.filter((_, k) => k !== j)),
                  }))}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <datalist id={list}>{links.map((l) => <option key={l.url} value={l.url}>{l.title}</option>)}</datalist>
    </div>
  );
}
