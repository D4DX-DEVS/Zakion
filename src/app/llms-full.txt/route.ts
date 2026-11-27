import { cached } from "@/lib/cache";
import { llmsText } from "@/lib/llms";
import { canonicalRedirect } from "@/lib/seo";

export const dynamic = "force-dynamic";

export function GET(req: Request) {
  const moved = canonicalRedirect(req);
  if (moved) return moved;
  return cached(req, 3600, async () => new Response(await llmsText(true), { headers: { "content-type": "text/plain; charset=utf-8" } }));
}
