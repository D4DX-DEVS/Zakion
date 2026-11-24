"use client";
// The body of a table whose rows can be dragged into a new order (the Projects list). The rows are drawn on the server and carry data-sort and
// data-key; this only watches the drag, works out the new order and submits it through a hidden form that sits next to the table (formId).
// The up and down buttons in each row do the same for touch screens and keyboards.
import { useRef } from "react";

export function SortRows({ children, formId }: { children: React.ReactNode; formId: string }) {
  const body = useRef<HTMLTableSectionElement>(null);
  const drag = useRef<HTMLElement | null>(null);
  const rows = () => Array.from(body.current?.querySelectorAll<HTMLElement>("tr[data-sort]") ?? []);
  const rowOf = (t: EventTarget | null) => (t instanceof Element ? (t.closest("tr[data-sort]") as HTMLElement | null) : null);
  const clear = () => rows().forEach((r) => r.classList.remove("drag", "over-a", "over-b"));
  return (
    <tbody
      ref={body}
      onDragStart={(e) => {
        const r = rowOf(e.target);
        if (!r) return;
        drag.current = r;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", r.dataset.key ?? "");
        requestAnimationFrame(() => r.classList.add("drag"));
      }}
      onDragOver={(e) => {
        const from = drag.current, r = rowOf(e.target);
        if (!from || !r || r === from) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        const b = r.getBoundingClientRect();
        rows().forEach((x) => x.classList.remove("over-a", "over-b"));
        r.classList.add(e.clientY > b.top + b.height / 2 ? "over-b" : "over-a");
      }}
      onDrop={(e) => {
        const from = drag.current, r = rowOf(e.target);
        drag.current = null;
        if (!from || !r || r === from) { clear(); return; }
        e.preventDefault();
        const after = r.classList.contains("over-b");
        const order = rows().filter((x) => x !== from);
        order.splice(order.indexOf(r) + (after ? 1 : 0), 0, from);
        const form = document.getElementById(formId) as HTMLFormElement | null;
        const keys = form?.querySelector<HTMLInputElement>('input[name="keys"]');
        clear();
        if (form && keys) { keys.value = JSON.stringify(order.map((x) => Number(x.dataset.key))); form.requestSubmit(); }
      }}
      onDragEnd={() => { drag.current = null; clear(); }}
    >
      {children}
    </tbody>
  );
}
