import "../admin.css";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "../actions";
import { Shell } from "../ui";

export const dynamic = "force-dynamic";

export default async function Panel({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <Shell logout={logoutAction}>{children}</Shell>;
}
