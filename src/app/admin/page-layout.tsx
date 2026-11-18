"use client";
// Section order for one page: the blocks it shows, top to bottom. Drag a block by its handle (or use the arrows, which also work on touch
// screens and with a keyboard) to move it, remove it to take it off this page, or add one of the blocks that are not on the page yet.
// Removing never deletes content: a block's text and images stay in Studio and it can be added back at any time.
import { useState } from "react";
import { Icon, type IconName } from "./icons";
import { SubmitButton } from "./ui";

export type Block = { key: string; title: string; icon: IconName; where: string };

export function PageLayoutEditor({ path, label, note, initial, defaults, blocks, save }: {
  path: string; label: string; note: string; initial: string[]; defaults: string[]; blocks: Block[]; save: (f: FormData) => Promise<void>;
}) {
  const [keys, setKeys] = useState<string[]>(initial);
  const [from, setFrom] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const by = Object.fromEntries(blocks.map((b) => [b.key, b]));
  const spare = blocks.filter((b) => !keys.includes(b.key));
  const isDefault = JSON.stringify(keys) === JSON.stringify(defaults);

  const move = (i: number, j: number) => {
    if (j < 0 || j >= keys.length || i === j) return;
    const n = keys.slice(); const [k] = n.splice(i, 1); n.splice(j, 0, k); setKeys(n);
  };
  const end = () => { setFrom(null); setOver(null); };

  return (
    <form action={save} className="editor-one">
      <input type="hidden" name="path" value={path} />
      <input type="hidden" name="keys" value={JSON.stringify(keys)} />
      <div className="card">
        <div className="card-h">
          <h2><Icon name="listOrdered" size={20} />Blocks on the {label} page</h2>
          <span className="muted">{keys.length} {keys.length === 1 ? "block" : "blocks"}, top to bottom</span>
        </div>
        <p className="lead">{note}</p>
        {keys.length === 0 && <p className="alert info">No blocks on this page. Add one below.</p>}
        <ol className="pl-list">
          {keys.map((k, i) => {
            const b = by[k];
            if (!b) return null;
            return (
              <li key={k} className={"pl-row" + (from === i ? " drag" : "") + (over === i && from !== null && from !== i ? (from < i ? " over-b" : " over-a") : "")}
                draggable onDragStart={(e) => { setFrom(i); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", k); }}
                onDragOver={(e) => { if (from === null) return; e.preventDefault(); setOver(i); }}
                onDrop={(e) => { e.preventDefault(); if (from !== null) move(from, i); end(); }} onDragEnd={end}>
                <span className="pl-grip" aria-hidden="true" title="Drag to move"><Icon name="grip" size={18} /></span>
                <span className="pl-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <span className="pl-ic" aria-hidden="true"><Icon name={b.icon} size={18} /></span>
                <span className="pl-txt"><b>{b.title}</b><i>Usually on: {b.where}</i></span>
                <span className="pl-ctl">
                  <a className="btn sec sm ico" href={`/admin/studio?key=${k}`} aria-label={`Edit the content of ${b.title}`} title="Edit content"><Icon name="pencil" size={16} /></a>
                  <button type="button" className="btn sec sm ico" disabled={i === 0} aria-label={`Move ${b.title} up`} title="Move up" onClick={() => move(i, i - 1)}><Icon name="up" size={16} /></button>
                  <button type="button" className="btn sec sm ico" disabled={i === keys.length - 1} aria-label={`Move ${b.title} down`} title="Move down" onClick={() => move(i, i + 1)}><Icon name="down" size={16} /></button>
                  <button type="button" className="btn del sm ico" aria-label={`Remove ${b.title} from this page`} title="Remove from this page" onClick={() => setKeys(keys.filter((x) => x !== k))}><Icon name="close" size={16} /></button>
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="card">
        <div className="card-h"><h2><Icon name="plus" size={20} />Add a block</h2><span className="muted">{spare.length} available</span></div>
        {spare.length === 0 ? <p className="muted">Every block is already on this page.</p> : (
          <ul className="pl-add">
            {spare.map((b) => (
              <li key={b.key}>
                <button type="button" onClick={() => setKeys([...keys, b.key])}><span className="pl-ic" aria-hidden="true"><Icon name={b.icon} size={18} /></span><span>{b.title}</span><Icon name="plus" size={16} /></button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="stickybar">
        <span className="grow">Changes apply to the {label} page only.</span>
        <button type="button" className="btn sec" disabled={isDefault} onClick={() => setKeys(defaults)}><Icon name="reset" size={18} />Default order</button>
        <SubmitButton><Icon name="save" size={18} />Save section order</SubmitButton>
      </div>
    </form>
  );
}
