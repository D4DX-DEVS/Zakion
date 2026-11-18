"use client";
// Studio's live preview: the real public page in a frame, jumped to the section being edited. It loads only when asked, because
// the home page is heavy (banner video and all).
import { useEffect, useRef, useState } from "react";
import { Icon } from "./icons";

export function PreviewPanel({ src, label }: { src: string; label: string }) {
  const [open, setOpen] = useState(false);
  const [wide, setWide] = useState(false);
  const [n, setN] = useState(0);
  const [scale, setScale] = useState(1);
  const box = useRef<HTMLDivElement>(null);
  const W = wide ? 1280 : 390, H = 720;
  useEffect(() => {
    const el = box.current;
    if (!el || !open) return;
    const fit = () => setScale(Math.min(1, el.clientWidth / W));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open, W]);
  return (
    <aside className="pv" aria-label="Live preview">
      <div className="pv-head">
        <h2><Icon name="monitor" size={18} />Live preview</h2>
        {open && (
          <span className="pv-tools">
            <button type="button" className="pv-btn" aria-pressed={!wide} onClick={() => setWide(false)} title="Phone width"><Icon name="phoneUp" size={16} /><span className="sr-only">Phone</span></button>
            <button type="button" className="pv-btn" aria-pressed={wide} onClick={() => setWide(true)} title="Desktop width"><Icon name="monitor" size={16} /><span className="sr-only">Desktop</span></button>
            <button type="button" className="pv-btn" onClick={() => setN((x) => x + 1)} title="Reload"><Icon name="refresh" size={16} /><span className="sr-only">Reload preview</span></button>
          </span>
        )}
      </div>
      {!open ? (
        <div className="pv-idle">
          <span className="pv-ico"><Icon name="eye" size={26} /></span>
          <p>See <b>{label}</b> on the real page, exactly as visitors do.</p>
          <button type="button" className="btn sm" onClick={() => setOpen(true)}>Load preview</button>
          <small>Shows what is saved. Save first, then reload.</small>
        </div>
      ) : (
        <div className="pv-box" ref={box} style={{ height: H * scale }}>
          <iframe key={n + (wide ? "w" : "p")} src={src} title={`Preview of ${label}`} style={{ width: W, height: H, transform: `scale(${scale})` }} />
        </div>
      )}
    </aside>
  );
}
