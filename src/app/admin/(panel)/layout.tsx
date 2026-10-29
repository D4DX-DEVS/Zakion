import "../admin.css";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function Panel({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="shell">
      <nav className="side">
        <h2>Zakion Admin</h2>
        <a href="/admin">Dashboard</a>
        <a href="/admin/pages">Pages</a>
        <a href="/admin/posts">Blog posts</a>
        <a href="/admin/media">Media (R2)</a>
        <a href="/admin/messages">Messages</a>
        <a href="/" target="_blank">View site ↗</a>
        <form action={logoutAction}>
          <button className="btn sec">Log out</button>
        </form>
      </nav>
      <main className="main">{children}</main>
    </div>
  );
}
