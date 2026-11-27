import { cached } from "@/lib/cache";
import { llmsText } from "@/lib/llms";

export const dynamic = "force-dynamic";

export function GET(req: Request) {
  return cached(req, 3600, async () => new Response(await llmsText(true), { headers: { "content-type": "text/plain; charset=utf-8" } }));
}
