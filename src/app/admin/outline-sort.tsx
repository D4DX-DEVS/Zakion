"use client";
// Studio's block list with drag and drop: grab a block by its handle (or anywhere on its row) and drop it where it should go; a line shows where
// it will land. The rows themselves are drawn on the server (they carry data-sort and data-key); this wrapper only watches the drag events,
// works out the new order and sends it to the server in one go. The up and down buttons stay for touch screens and keyboards.
import { useRef } from "react";

export function OutlineList({ children, action, back }: { children: React.ReactNode; action: (f: FormData) => Promise<void>; back: string }) {
  const list = useRef<HTMLOListElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const keys = useRef<HTMLInputElement>(null);
  const drag = useRef<HTMLElement | null>(null);

  const rows = () => Array.from(list.current?.querySelectorAll<HTMLElement>("li[data-sort]") ?? []);
  const rowOf = (t: EventTarget | null) => (t instanceof Element ? (t.closest("li[data-sort]") as HTMLElement | null) : null);
  const clear = () => rows().forEach((r) => r.classList.remove("drag", "over-a", "over-b"));
  // on narrow screens the list becomes a row of chips, so "after" means to the right instead of below
  const sideways = () => { const o = list.current; if (!o) return false; const cs = getComputedStyle(o); return cs.display === "flex" && !cs.flexDirection.startsWith("column"); };

  return (
    <>
      <ol
        className="o-list"
        ref={list}
        onDragStart={(e) => {
          const r = rowOf(e.target);
          if (!r) return;
          drag.current = r;
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", r.dataset.key ?? "");
          requestAnimationFrame(() => r.classList.add("drag")); // after the browser has taken its drag picture
        }}
        onDragOver={(e) => {
          const from = drag.current;
          const r = rowOf(e.target);
          if (!from || !r || r === from) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          const b = r.getBoundingClientRect();
          const after = sideways() ? e.clientX > b.left + b.width / 2 : e.clientY > b.top + b.height / 2;
          rows().forEach((x) => x.classList.remove("over-a", "over-b"));
          r.classList.add(after ? "over-b" : "over-a");
        }}
        onDrop={(e) => {
          const from = drag.current;
          const r = rowOf(e.target);
          drag.current = null;
          if (!from || !r || r === from) { clear(); return; }
          e.preventDefault();
          const after = r.classList.contains("over-b");
          const order = rows().filter((x) => x !== from);
          order.splice(order.indexOf(r) + (after ? 1 : 0), 0, from);
          if (keys.current) keys.current.value = JSON.stringify(order.map((x) => x.dataset.key));
          clear();
          form.current?.requestSubmit();
        }}
        onDragEnd={() => { drag.current = null; clear(); }}
      >
        {children}
      </ol>
      <form ref={form} action={action} hidden>
        <input type="hidden" name="back" value={back} />
        <input type="hidden" name="keys" ref={keys} />
      </form>
    </>
  );
}
