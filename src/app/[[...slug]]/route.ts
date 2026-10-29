import { renderPath } from "@/lib/render";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await ctx.params;
  return renderPath("/" + (slug || []).join("/"));
}
