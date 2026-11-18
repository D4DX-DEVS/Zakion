import { cached } from "@/lib/cache";
import { env } from "@/lib/env";
import { themeFromKey, themeText } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: { params: Promise<{ key: string[] }> }) {
  const key = (await ctx.params).key.map(decodeURIComponent).join("/");
  if (key.startsWith("_snap/")) return new Response("Not found", { status: 404 });
  // Elementor stylesheets are recoloured for the site's theme when the page asks for it (?th=<primary>-<accent>). The link carries the
  // theme, so each theme is its own URL and can be cached for good. Not edge-cached here: that cache ignores the query string.
  const theme = /^elementor\/css\/[\w.-]+\.css$/.test(key) ? themeFromKey(new URL(req.url).searchParams.get("th") ?? "") : null;
  if (theme) {
    const obj = await env().MEDIA.get(key);
    if (!obj) return new Response("Not found", { status: 404 });
    return new Response(themeText(await obj.text(), theme), { headers: { "content-type": "text/css; charset=utf-8", "x-content-type-options": "nosniff", "cache-control": "public, max-age=31536000, immutable" } });
  }
  return cached(req, 86400, async () => {
    const obj = await env().MEDIA.get(key);
    if (!obj) return new Response("Not found", { status: 404 });
    const h = new Headers();
    obj.writeHttpMetadata(h);
    h.set("etag", obj.httpEtag);
    h.set("x-content-type-options", "nosniff");
    h.set("cache-control", "public, max-age=31536000, immutable");
    return new Response(obj.body, { headers: h });
  });
}
