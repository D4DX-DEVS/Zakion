"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useFormStatus } from "react-dom";

const NAV: [string, string][] = [["/admin", "Dashboard"], ["/admin/pages", "Pages"], ["/admin/posts", "Blog posts"], ["/admin/media", "Media"], ["/admin/messages", "Messages"]];

export function Shell({ logout, children }: { logout: () => Promise<void>; children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  const active = (h: string) => (h === "/admin" ? path === h : path.startsWith(h));
  return (
    <div className={"shell" + (open ? " open" : "")}>
      <aside className="side" id="sidebar">
        <a className="brand" href="/admin"><img src="/media/2024/03/zak-logo.png" alt="Zakion Energy admin" /></a>
        <nav aria-label="Admin">
          {NAV.map(([h, l]) => <a key={h} href={h} aria-current={active(h) ? "page" : undefined}>{l}</a>)}
        </nav>
      </aside>
      <div className="scrim" onClick={() => setOpen(false)} />
      <div>
        <div className="top">
          <button className="btn sec sm burger" aria-expanded={open} aria-controls="sidebar" onClick={() => setOpen(o => !o)}>Menu</button>
          <a className="btn sec sm" href="/" target="_blank" rel="noreferrer">View site</a>
          <form action={logout}><SubmitButton className="btn sm" pending="Signing out…">Log out</SubmitButton></form>
        </div>
        <main className="main">{children}</main>
      </div>
    </div>
  );
}

export function SubmitButton({ children, pending = "Saving…", className = "btn" }: { children: React.ReactNode; pending?: string; className?: string }) {
  const { pending: busy } = useFormStatus();
  return <button className={className} disabled={busy}>{busy ? pending : children}</button>;
}

// Native confirm keeps this tiny; the form only submits if the person agrees.
export function ConfirmButton({ children, message, className = "btn del" }: { children: React.ReactNode; message: string; className?: string }) {
  return <button className={className} onClick={e => { if (!confirm(message)) e.preventDefault(); }}>{children}</button>;
}

export function Toast({ text, error }: { text: string; error?: boolean }) {
  const [show, setShow] = useState(true);
  useEffect(() => { const t = setTimeout(() => setShow(false), 3500); return () => clearTimeout(t); }, []);
  return show ? <div className={"toast" + (error ? " err" : "")} role="status">{text}</div> : null;
}

export function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return <button type="button" className="btn sec sm" onClick={() => { navigator.clipboard?.writeText(location.origin + text); setDone(true); setTimeout(() => setDone(false), 1500); }}>{done ? "Copied" : "Copy URL"}</button>;
}

export function TableSearch({ target, label = "Search" }: { target: string; label?: string }) {
  return (
    <input type="search" aria-label={label} placeholder={label} onInput={e => {
      const q = e.currentTarget.value.toLowerCase();
      document.querySelectorAll<HTMLElement>(`#${target} [data-q]`).forEach(r => { r.hidden = !r.dataset.q!.includes(q); });
    }} />
  );
}

export function ImagePicker({ name, initial, options }: { name: string; initial: string; options: string[] }) {
  const [value, setValue] = useState(initial);
  const dlg = useRef<HTMLDialogElement>(null);
  return (
    <div>
      {value ? <img className="preview" src={value} alt="Selected featured image" /> : <p className="muted">No image selected.</p>}
      <input type="hidden" name={name} value={value} />
      <div className="row">
        <button type="button" className="btn sec sm" onClick={() => dlg.current?.showModal()}>Choose from library</button>
        {value && <button type="button" className="btn sec sm" onClick={() => setValue("")}>Remove</button>}
      </div>
      <dialog ref={dlg} className="picker-dlg" aria-label="Media library">
        <div className="row between"><h3>Media library</h3><button type="button" className="btn sec sm" onClick={() => dlg.current?.close()}>Close</button></div>
        <div className="pgrid">
          {options.map(o => (
            <button type="button" key={o} title={o} onClick={() => { setValue(o); dlg.current?.close(); }}>
              <img src={o} alt={o.split("/").pop()} loading="lazy" />
            </button>
          ))}
        </div>
      </dialog>
    </div>
  );
}
