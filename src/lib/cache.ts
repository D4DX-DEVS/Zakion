import { getCloudflareContext } from "@opennextjs/cloudflare";

// Edge cache (per data-center). Undefined under `next dev`, so dev always renders fresh.
const store = () => (globalThis as { caches?: { default?: Cache } }).caches?.default;
const keyFor = (origin: string, path: string) => new Request(origin + path);

export async function cached(req: Request, ttl: number, render: () => Promise<Response>): Promise<Response> {
  const c = store();
  if (!c) return render();
  const { pathname, origin } = new URL(req.url);
  const key = keyFor(origin, pathname);
  const hit = await c.match(key);
  if (hit) return hit;
  const res = await render();
  if (res.status !== 200) return res;
  const out = new Response(res.body, res);
  if (!out.headers.has("cache-control")) out.headers.set("cache-control", `public, max-age=60, s-maxage=${ttl}`);
  getCloudflareContext().ctx.waitUntil(c.put(key, out.clone()));
  return out;
}

// shortcut: clears this data-center only, other edges expire within the page ttl (5 min).
export async function purge(origin: string, paths: string[]) {
  const c = store();
  if (c) await Promise.all(paths.map(p => c.delete(keyFor(origin, p))));
}
