"use client";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Icon, type IconName } from "./icons";

import { SEC_ICON } from "./section-meta";

type Nav = { href: string; label: string; icon: IconName; group: string; sub: string; bare?: boolean };
const NAV: Nav[] = [
  { href: "/admin", label: "Overview", icon: "home", group: "Start", sub: "Your site at a glance and the quickest ways in." },
  { href: "/admin/studio", label: "Studio", icon: "layers", group: "Home page", sub: "Arrange, edit and tune every block of the home page.", bare: true },
  { href: "/admin/settings", label: "Site settings", icon: "settings", group: "Site", sub: "Layout, colours, fonts, header, footer, navigation and social links for the whole website.", bare: true },
  { href: "/admin/pages", label: "Pages", icon: "file", group: "Content", sub: "Edit the text, images and settings of every page." },
  { href: "/admin/projects", label: "Projects", icon: "grid", group: "Content", sub: "Add and edit the projects on the Projects page: the cards, the filter tabs and each project's own page." },
  { href: "/admin/systems", label: "Systems", icon: "sun", group: "Content", sub: "Add and edit the system types on the Solutions page: each has a card with a picture and a Read More button, and its own page." },
  { href: "/admin/testimonials", label: "Testimonials", icon: "quote", group: "Content", sub: "Add and edit what customers say: written quotes and videos. The latest show in the Home page carousel; all of them are on the Testimonials page." },
  { href: "/admin/posts", label: "Blog posts", icon: "pen", group: "Content", sub: "Write, edit and publish your articles." },
  { href: "/admin/media", label: "Library", icon: "image", group: "Library", sub: "Upload and manage images, videos and PDFs." },
  { href: "/admin/messages", label: "Inbox", icon: "inbox", group: "Inbox", sub: "Enquiries sent through your contact form." },
  { href: "/admin/account", label: "Account", icon: "user", group: "Account", sub: "Change your password and recovery code." },
];

const isCur = (path: string, href: string) => (href === "/admin" ? path === "/admin" : path === href || path.startsWith(href + "/"));

type Section = { key: string; title: string };
type SitePage = { path: string; title: string };
/** Where a page is edited: Home in Studio, every other page in its own section editor. */
const pageHref = (p: SitePage) => (p.path === "/" ? "/admin/studio" : "/admin/pages/sections?page=" + encodeURIComponent(p.path));
type SettingsTab = { id: string; label: string };
type Cmd = { label: string; hint: string; href: string; icon: IconName };

// Command palette: Ctrl/Cmd+K (or the search button) opens it; type to filter, arrows to move, Enter to go.
function Palette({ open, onClose, sections, tabs, pages }: { open: boolean; onClose: () => void; sections: Section[]; tabs: SettingsTab[]; pages: SitePage[] }) {
  const dlg = useRef<HTMLDialogElement>(null);
  const [q, setQ] = useState("");
  const [at, setAt] = useState(0);
  const all = useMemo<Cmd[]>(() => [
    ...NAV.map((n): Cmd => ({ label: n.label, hint: n.group, href: n.href, icon: n.icon })),
    { label: "Write a new blog post", hint: "Action", href: "/admin/posts/new", icon: "pen" },
    { label: "Add a project", hint: "Action", href: "/admin/projects/new", icon: "plus" },
    { label: "Add a system", hint: "Action", href: "/admin/systems/new", icon: "plus" },
    { label: "Add a testimonial", hint: "Action", href: "/admin/testimonials/new", icon: "plus" },
    { label: "Upload to the library", hint: "Action", href: "/admin/media", icon: "upload" },
    ...pages.map((p): Cmd => ({ label: `${p.title} page`, hint: "Pages: edit sections", href: pageHref(p), icon: "file" })),
    ...tabs.map((t): Cmd => ({ label: t.label, hint: "Site settings", href: "/admin/settings?tab=" + t.id, icon: "settings" })),
    ...sections.map((s): Cmd => ({ label: s.title, hint: "Studio section", href: "/admin/studio?key=" + s.key, icon: SEC_ICON[s.key] ?? "layers" })),
  ], [sections, tabs, pages]);
  const shown = useMemo(() => { const w = q.toLowerCase().split(/\s+/).filter(Boolean); return all.filter((c) => w.every((x) => (c.label + " " + c.hint).toLowerCase().includes(x))).slice(0, 12); }, [all, q]);
  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (open && !d.open) { setQ(""); setAt(0); d.showModal(); }
    if (!open && d.open) d.close();
  }, [open]);
  const go = (c?: Cmd) => { if (c) location.href = c.href; };
  return (
    <dialog ref={dlg} className="palette" aria-label="Search and jump" onClose={onClose} onClick={(e) => { if (e.target === dlg.current) onClose(); }}>
      <div className="pal-in">
        <label className="pal-q"><Icon name="search" size={20} /><span className="sr-only">Search</span>
          <input type="text" autoFocus value={q} placeholder="Search sections, pages and actions…" onChange={(e) => { setQ(e.target.value); setAt(0); }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setAt((i) => Math.min(i + 1, shown.length - 1)); }
              else if (e.key === "ArrowUp") { e.preventDefault(); setAt((i) => Math.max(i - 1, 0)); }
              else if (e.key === "Enter") { e.preventDefault(); go(shown[at]); }
            }} />
          <kbd>esc</kbd>
        </label>
        <ul className="pal-list" role="listbox">
          {shown.length === 0 && <li className="pal-none">Nothing matches “{q}”.</li>}
          {shown.map((c, i) => (
            <li key={c.href + c.label} role="option" aria-selected={i === at}>
              <a href={c.href} className={i === at ? "on" : ""} onMouseMove={() => setAt(i)}><Icon name={c.icon} size={18} /><span>{c.label}</span><i>{c.hint}</i></a>
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  );
}

// "Pages" in the left menu opens a list of the site's pages: each one goes straight to that page's section editor. The list is open while
// you are anywhere under Pages and can be opened or closed with its arrow; it is left out when the menu is collapsed to icons and on phones
// (the Pages screen itself lists the same pages there).
function PagesMenu({ item, path, pages }: { item: Nav; path: string; pages: SitePage[] }) {
  const sp = useSearchParams();
  const inside = path === item.href || path.startsWith(item.href + "/");
  const [open, setOpen] = useState(inside);
  useEffect(() => { if (inside) setOpen(true); }, [inside]);
  const onPage = path === "/admin/pages/sections" ? sp.get("page") : null;
  const all = inside && onPage === null;
  const cls = (on: boolean) => (on ? "page" : undefined);
  return (
    <li className={"dock-group" + (inside ? " has-cur" : "")}>
      <div className="dock-row">
        <a href={item.href} title={item.label} aria-current={cls(inside && !open)}><Icon name={item.icon} size={22} /><span>{item.label}</span></a>
        <button type="button" className="dock-chev" aria-expanded={open} aria-controls="dock-pages" aria-label={open ? "Hide the list of pages" : "Show the list of pages"} title={open ? "Hide the list of pages" : "Show the list of pages"} onClick={() => setOpen((o) => !o)}><Icon name="chevron" size={16} /></button>
      </div>
      <ul className="dock-sub" id="dock-pages" hidden={!open} aria-label="Pages">
        <li><a href={item.href} aria-current={cls(all)}><span>All pages</span></a></li>
        {pages.map((p) => (
          <li key={p.path}><a href={pageHref(p)} aria-current={cls(p.path !== "/" && onPage === p.path)}><span>{p.title}</span></a></li>
        ))}
      </ul>
    </li>
  );
}

export function Shell({ logout, user, sections, tabs, pages, children }: { logout: () => Promise<void>; user: string; sections: Section[]; tabs: SettingsTab[]; pages: SitePage[]; children: React.ReactNode }) {
  const path = usePathname();
  const cur = NAV.find((n) => isCur(path, n.href) && n.href !== "/admin") ?? NAV[0];
  const [cmd, setCmd] = useState(false);
  // the left menu is open (labels shown) or collapsed to icons; the choice is remembered in this browser
  const [open, setOpen] = useState(true);
  useEffect(() => { try { if (localStorage.getItem("zk-dock") === "closed") setOpen(false); } catch { /* storage blocked: stays open */ } }, []);
  const toggle = () => setOpen((o) => { try { localStorage.setItem("zk-dock", o ? "closed" : "open"); } catch { /* ignore */ } return !o; });
  // on a phone the dock scrolls sideways: bring the current page's icon into view
  useEffect(() => { document.querySelector(".dock [aria-current=page]")?.scrollIntoView({ inline: "center", block: "nearest" }); }, [path]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setCmd(true); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);
  return (
    <div className="app" data-dock={open ? "open" : "closed"}>
      <nav className="dock" id="dock" aria-label="Admin">
        <button type="button" className="dock-toggle" aria-expanded={open} aria-controls="dock" aria-label={open ? "Collapse menu" : "Expand menu"} title={open ? "Collapse menu" : "Expand menu"} onClick={toggle}><Icon name="chevron" size={16} /></button>
        <a className="dock-brand" href="/admin" aria-label="Zakion Studio home"><span className="dock-bolt"><Icon name="bolt" size={22} /></span><span className="dock-name">Zakion <b>Studio</b></span></a>
        <ul>
          {NAV.map((n) => n.href === "/admin/pages" ? (
            <Suspense key={n.href} fallback={<li><a href={n.href} title={n.label}><Icon name={n.icon} size={22} /><span>{n.label}</span></a></li>}><PagesMenu item={n} path={path} pages={pages} /></Suspense>
          ) : (
            <li key={n.href}><a href={n.href} aria-current={n === cur && (path !== "/admin" || n.href === "/admin") ? "page" : undefined} title={n.label}><Icon name={n.icon} size={22} /><span>{n.label}</span></a></li>
          ))}
        </ul>
        <div className="dock-foot">
          <a href="/" target="_blank" rel="noreferrer" title="View site"><Icon name="external" size={20} /><span>View site<span className="sr-only"> (opens in a new tab)</span></span></a>
          <form action={logout}><SubmitButton className="dock-btn" pending="…"><Icon name="logout" size={20} /><span>Log out</span></SubmitButton></form>
        </div>
      </nav>
      <div className="stage">
        <header className="bar">
          <div className="trail" aria-label="You are here"><span>Studio</span><Icon name="chevron" size={14} /><span>{cur.group}</span>{cur.label !== cur.group && <><Icon name="chevron" size={14} /><b>{cur.label}</b></>}</div>
          <button type="button" className="cmdk" onClick={() => setCmd(true)}><Icon name="search" size={18} /><span>Search or jump to…</span><kbd>Ctrl K</kbd></button>
          <a className="avatar" href="/admin/account" aria-label={`Account (${user})`} title={`Signed in as ${user}`}>{user.charAt(0)}</a>
        </header>
        <main className="page">
          {!cur.bare && path !== "/admin/pages/sections" && <div className="phead"><span className="eyebrow">{cur.group}</span><h1>{cur.label}</h1><p>{cur.sub}</p></div>}
          {children}
        </main>
      </div>
      <Palette open={cmd} onClose={() => setCmd(false)} sections={sections} tabs={tabs} pages={pages} />
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
  return show ? <div className={"toast" + (error ? " err" : "")} role="status"><Icon name={error ? "alert" : "check"} size={18} />{text}</div> : null;
}

export function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" className="btn sec sm" onClick={() => { navigator.clipboard?.writeText(location.origin + text); setDone(true); setTimeout(() => setDone(false), 1500); }}>
      <Icon name={done ? "check" : "copy"} size={16} /><span className="lbl">{done ? "Copied" : "Copy URL"}</span>
    </button>
  );
}

// Search box plus optional status pills for a list on the page. Rows carry data-q (lowercase searchable text) and data-s (status);
// they sit inside #target. An element with id "<target>-none" is shown when nothing matches.
export function TableTools({ target, label = "Search", noun = "items", total, filters }: {
  target: string; label?: string; noun?: string; total: number; filters?: { value: string; label: string; count: number }[];
}) {
  const [q, setQ] = useState("");
  const [f, setF] = useState("all");
  const [shown, setShown] = useState(total);
  useEffect(() => {
    const needle = q.trim().toLowerCase();
    let n = 0;
    document.querySelectorAll<HTMLElement>(`#${target} [data-q]`).forEach(r => {
      const ok = r.dataset.q!.includes(needle) && (f === "all" || r.dataset.s === f);
      r.hidden = !ok;
      if (ok) n++;
    });
    setShown(n);
    const none = document.getElementById(`${target}-none`);
    if (none) none.hidden = n > 0 || total === 0;
  }, [q, f, target, total]);
  return (
    <div className="tools">
      <label className="search">
        <span className="sr-only">{label}</span>
        <Icon name="search" size={18} />
        <input type="search" placeholder={label} value={q} onChange={e => setQ(e.target.value)} />
      </label>
      {filters && (
        <div className="pills" role="group" aria-label="Filter by status">
          {filters.map(x => (
            <button type="button" key={x.value} className="pill" aria-pressed={f === x.value} onClick={() => setF(x.value)}>{x.label} <i>{x.count}</i></button>
          ))}
        </div>
      )}
      <span className="count" aria-live="polite">{shown === total ? `${total} ${noun}` : `${shown} of ${total} ${noun}`}</span>
    </div>
  );
}

export function PickerDialog({ dlg, title, options, onPick }: { dlg: React.RefObject<HTMLDialogElement | null>; title: string; options: string[]; onPick: (url: string) => void }) {
  return (
    <dialog ref={dlg} className="picker-dlg" aria-label={title} onClick={e => { if (e.target === dlg.current) dlg.current?.close(); }}>
      <div className="picker-in">
        <div className="row between">
          <h3>{title}</h3>
          <button type="button" className="btn sec sm" onClick={() => dlg.current?.close()}><Icon name="close" size={16} />Close</button>
        </div>
        {options.length === 0 ? <p className="muted" style={{ marginTop: 16 }}>No images yet. Upload one in Media first.</p> : (
          <div className="pgrid">
            {options.map(o => (
              <button type="button" key={o} title={o} onClick={() => { onPick(o); dlg.current?.close(); }}>
                <img src={o} alt={o.split("/").pop()} loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>
    </dialog>
  );
}

export function ImagePicker({ name, initial, options }: { name: string; initial: string; options: string[] }) {
  const [value, setValue] = useState(initial);
  const dlg = useRef<HTMLDialogElement>(null);
  return (
    <div>
      {value ? <img className="preview" src={value} alt="Selected featured image" /> : <div className="thumb" style={{ borderRadius: 12, marginBottom: 12 }}><Icon name="image" size={32} /></div>}
      <input type="hidden" name={name} value={value} />
      <div className="row">
        <button type="button" className="btn sec sm" onClick={() => dlg.current?.showModal()}><Icon name="image" size={16} />Choose from library</button>
        {value && <button type="button" className="btn sec sm" onClick={() => setValue("")}><Icon name="close" size={16} />Remove</button>}
      </div>
      <PickerDialog dlg={dlg} title="Media library" options={options} onPick={setValue} />
    </div>
  );
}
