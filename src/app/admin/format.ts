// Date and size helpers for the admin. D1 stores UTC strings like "2026-11-16 08:12:33" (some are date-only or
// datetime-local style "2024-03-19T10:00"), so everything is normalised to UTC before formatting.
function parse(s: string): number | null {
  if (!s) return null;
  let v = s.trim().replace(" ", "T");
  if (v.length === 10) v += "T00:00:00";
  if (!/(Z|[+-]\d\d:?\d\d)$/i.test(v)) v += "Z";
  const t = Date.parse(v);
  return Number.isNaN(t) ? null : t;
}

export function fmtDate(s: string) {
  const t = parse(s);
  return t === null ? (s || "").slice(0, 10) : new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export function ago(s: string) {
  const t = parse(s);
  if (t === null) return (s || "").slice(0, 10);
  const mins = Math.floor((Date.now() - t) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return fmtDate(s);
}

export const time = (s: string) => parse(s) ?? 0;

export function fmtBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

/** Rupees the Indian way: ₹23,301, ₹6.67 L (lakh), ₹1.25 Cr (crore). */
export const inr = (n: number) => (n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(2)} L` : `₹${Math.round(n).toLocaleString("en-IN")}`);
