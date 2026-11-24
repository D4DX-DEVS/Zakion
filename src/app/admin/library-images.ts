import { env } from "@/lib/env";
import { BUILTIN_IMAGES } from "@/lib/content";

/** The pictures the image picker offers: the newest uploads in the library first, then the ones that ship with the site. */
export async function libraryImages(): Promise<string[]> {
  const uploaded = (await env().MEDIA.list({ limit: 1000 })).objects
    .filter((o) => /\.(png|jpe?g|webp|gif|svg)$/i.test(o.key) && !/-\d+x\d+\.\w+$/.test(o.key) && !o.key.startsWith("_snap/") && !o.key.startsWith("elementor/"))
    .sort((a, b) => b.uploaded.getTime() - a.uploaded.getTime()).slice(0, 150).map((o) => "/media/" + o.key);
  return [...uploaded, ...BUILTIN_IMAGES];
}
