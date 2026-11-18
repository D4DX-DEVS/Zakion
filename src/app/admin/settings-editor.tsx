"use client";
// Editor for one Site settings tab. The form is built from the tab's groups (lib/site.ts): every group is a card of the same schema-driven
// fields the Studio editor uses. All values live in React state and are sent as one JSON field; the server only applies the fields the
// tab lists. Theme colours and Fonts add a preset row / a live sample on top.
import { useEffect, useState } from "react";
import type { Field } from "@/lib/content";
import { Icon } from "./icons";
import type { LinkOption } from "./menu-editor";
import { Fields } from "./section-editor";
import { SubmitButton } from "./ui";

type Obj = Record<string, any>;
type Upload = (f: FormData) => Promise<{ url?: string; error?: string }>;
export type Group = { key: string; title: string; help?: string; fields: Field[] };

const PRESETS = [
  { name: "Zakion", primary: "#0d3d7b", accent: "#f5a800" },
  { name: "Forest", primary: "#14532d", accent: "#facc15" },
  { name: "Ocean", primary: "#0b5c7a", accent: "#ff9f1c" },
  { name: "Teal", primary: "#0f5f5a", accent: "#fcd34d" },
  { name: "Royal", primary: "#4c1d95", accent: "#f59e0b" },
  { name: "Crimson", primary: "#7f1d1d", accent: "#fbbf24" },
  { name: "Slate", primary: "#1e293b", accent: "#f97316" },
];

/** Contrast of white text on a colour (WCAG), to warn about a primary colour that is too light for the white text on it. */
function whiteContrast(color: string) {
  if (!/^#[0-9a-f]{6}$/i.test(color)) return 21;
  const lin = (v: number) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  const [r, g, b] = [1, 3, 5].map((i) => lin(parseInt(color.slice(i, i + 2), 16) / 255));
  return 1.05 / (0.2126 * r + 0.7152 * g + 0.0722 * b + 0.05);
}
const valid = (c: unknown) => /^#[0-9a-f]{6}$/i.test(String(c ?? ""));

function ThemeExtras({ site, set }: { site: Obj; set: (v: Obj) => void }) {
  const primary = valid(site.primary) ? site.primary : "#0d3d7b";
  const accent = valid(site.accent) ? site.accent : "#f5a800";
  const weak = whiteContrast(primary) < 4.5;
  return (
    <div className="card">
      <div className="card-h"><h2><Icon name="palette" size={20} />Start from a palette</h2></div>
      <div className="presets" role="group" aria-label="Colour palettes">
        {PRESETS.map((p) => {
          const on = p.primary === String(site.primary).toLowerCase() && p.accent === String(site.accent).toLowerCase();
          return (
            <button type="button" key={p.name} className="preset" aria-pressed={on} onClick={() => set({ ...site, primary: p.primary, accent: p.accent })}>
              <span className="pr-sw"><i style={{ background: p.primary }} /><i style={{ background: p.accent }} /></span>{p.name}
            </button>
          );
        })}
      </div>
      <div className="theme-pv" style={{ ["--p" as string]: primary, ["--a" as string]: accent }} aria-label="Colour preview">
        <div className="tp-bar"><b>Zakion</b><span>Home</span><span>About</span><span>Solutions</span><u>Contact</u></div>
        <div className="tp-body">
          <small>Welcome</small>
          <h3>Powering the future with <em>renewable.</em></h3>
          <p>Premium solar solutions for homes and businesses.</p>
          <span className="tp-btn">Our services</span><span className="tp-btn tp-line">Learn more</span>
        </div>
      </div>
      {weak && <p className="alert warn" role="status" style={{ marginTop: 16, marginBottom: 0 }}>This primary colour is quite light, so white text on it may be hard to read. A darker colour works better.</p>}
      <p className="hint">The preview is a sketch. Save, then open the live preview to see the real pages.</p>
    </div>
  );
}

function FontExtras({ site }: { site: Obj }) {
  const head = site.headingFont && site.headingFont !== "Default" ? String(site.headingFont) : "Rajdhani";
  const body = site.bodyFont && site.bodyFont !== "Default" ? String(site.bodyFont) : "Rubik";
  useEffect(() => {
    const id = "zk-font-sample";
    let link = document.getElementById(id) as HTMLLinkElement | null;
    if (!link) { link = document.createElement("link"); link.id = id; link.rel = "stylesheet"; document.head.appendChild(link); }
    link.href = "https://fonts.googleapis.com/css2?" + [head, body].map((n) => `family=${n.replace(/ /g, "+")}:wght@400;700`).join("&") + "&display=swap";
  }, [head, body]);
  return (
    <div className="card">
      <div className="card-h"><h2><Icon name="type" size={20} />Sample</h2></div>
      <div className="font-pv">
        <h3 style={{ fontFamily: `"${head}", sans-serif` }}>Powering the future with renewable energy</h3>
        <p style={{ fontFamily: `"${body}", sans-serif` }}>Premium renewable energy solutions for a sustainable tomorrow. Powering homes, empowering businesses and building a sustainable future for generations to come.</p>
      </div>
      <p className="hint">Fonts are loaded from Google Fonts when visitors open the site.</p>
    </div>
  );
}

export function SettingsEditor({ tabId, groups, initial, save, reset, upload, links }: {
  tabId: string; groups: Group[]; initial: Obj; save: (f: FormData) => Promise<void>; reset: (f: FormData) => Promise<void>; upload: Upload; links?: LinkOption[];
}) {
  const [data, setData] = useState<Obj>(initial);
  const site = data._site ?? {};
  return (
    <form action={save} className="editor-one">
      <input type="hidden" name="tab" value={tabId} />
      <input type="hidden" name="data" value={JSON.stringify(data)} />
      {tabId === "theme" && <ThemeExtras site={site} set={(v) => setData((d) => ({ ...d, _site: v }))} />}
      {groups.map((g) => (
        <div className="card" key={g.key + g.title}>
          <div className="card-h"><h2>{g.title}</h2></div>
          {g.help && <p className="lead">{g.help}</p>}
          <Fields fields={g.fields} value={data[g.key] ?? {}} onChange={(v) => setData((d) => ({ ...d, [g.key]: v }))} pick={() => {}} upload={upload} links={links} />
        </div>
      ))}
      {tabId === "fonts" && <FontExtras site={site} />}
      <div className="stickybar">
        <span className="grow">Don’t forget to save your changes.</span>
        <button type="submit" className="btn del" formAction={reset} onClick={(e) => { if (!confirm("Put this page of settings back to the original values?")) e.preventDefault(); }}><Icon name="reset" size={18} />Reset to original</button>
        <SubmitButton><Icon name="save" size={18} />Save changes</SubmitButton>
      </div>
    </form>
  );
}
