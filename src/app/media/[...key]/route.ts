import { cached } from "@/lib/cache";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

const HEADERS = { "x-content-type-options": "nosniff", "cache-control": "public, max-age=31536000, immutable", "accept-ranges": "bytes" };

// Byte ranges ("Range: bytes=0-"): browsers need them to seek in a video, and Safari will not play an MP4 without them. A range
// answer is a 206 straight from R2 and is never put in the edge cache (the cache keeps the whole file, see cached()).
async function ranged(key: string, range: string): Promise<Response> {
  const head = await env().MEDIA.head(key);
  if (!head) return new Response("Not found", { status: 404 });
  const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  const size = head.size;
  let start = NaN, end = NaN;
  if (m && (m[1] || m[2])) {
    if (!m[1]) { start = Math.max(0, size - Number(m[2])); end = size - 1; } // the last N bytes
    else { start = Number(m[1]); end = m[2] ? Math.min(Number(m[2]), size - 1) : size - 1; }
  }
  if (!(start <= end) || start >= size) return new Response(null, { status: 416, headers: { "content-range": `bytes */${size}` } });
  const obj = await env().MEDIA.get(key, { range: { offset: start, length: end - start + 1 } });
  if (!obj) return new Response("Not found", { status: 404 });
  const h = new Headers(HEADERS);
  obj.writeHttpMetadata(h);
  h.set("etag", obj.httpEtag);
  h.set("content-range", `bytes ${start}-${end}/${size}`);
  h.set("content-length", String(end - start + 1));
  return new Response((obj as R2ObjectBody).body, { status: 206, headers: h });
}

export async function GET(req: Request, ctx: { params: Promise<{ key: string[] }> }) {
  const key = (await ctx.params).key.map(decodeURIComponent).join("/");
  if (key.startsWith("_snap/")) return new Response("Not found", { status: 404 });
  const range = req.headers.get("range");
  if (range) return ranged(key, range);
  return cached(req, 86400, async () => {
    const obj = await env().MEDIA.get(key);
    if (!obj) return new Response("Not found", { status: 404 });
    const h = new Headers(HEADERS);
    obj.writeHttpMetadata(h);
    h.set("etag", obj.httpEtag);
    return new Response(obj.body, { headers: h });
  });
}
