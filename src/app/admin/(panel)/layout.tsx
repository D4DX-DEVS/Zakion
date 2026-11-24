import "../admin.css";
import { requireAdmin } from "@/lib/auth";
import { env } from "@/lib/env";
import { PAGE_TITLES, SECTIONS } from "@/lib/content";
import { SETTINGS_TABS } from "@/lib/site";
import { logoutAction } from "../actions";
import { Shell } from "../ui";

export const dynamic = "force-dynamic";

export default async function Panel({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <Shell logout={logoutAction} user={env().ADMIN_USER || "admin"} sections={SECTIONS.map(s => ({ key: s.key, title: s.title }))} pages={Object.entries(PAGE_TITLES).map(([path, title]) => ({ path, title }))} tabs={[...SETTINGS_TABS, { id: "sections", label: "Section order" }].map(t => ({ id: t.id, label: t.label }))}>{children}</Shell>;
}
