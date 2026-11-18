import { redirect } from "next/navigation";

// Section editing moved into Studio; old links and bookmarks still work.
export default async function EditSection({ searchParams }: { searchParams: Promise<{ key?: string }> }) {
  const { key = "" } = await searchParams;
  redirect("/admin/studio" + (key ? "?key=" + encodeURIComponent(key) : ""));
}
