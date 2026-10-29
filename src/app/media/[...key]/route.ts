import { cached } from "@/lib/cache";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: { params: Promise<{ key: string[] }> }) {
  const key = (await ctx.params).key.map(decodeURIComponent).join("/");
  if (key.startsWith("_snap/")) return new Response("Not found", { status: 404 });
  return cached(req, 86400, async () => {
    const obj = await env().MEDIA.get(key);
    if (!obj) return new Response("Not found", { status: 404 });
    const h = new Headers();
    obj.writeHttpMetadata(h);
    h.set("etag", obj.httpEtag);
    h.set("cache-control", "public, max-age=31536000, immutable");
    return new Response(obj.body, { headers: h });
  });
}
