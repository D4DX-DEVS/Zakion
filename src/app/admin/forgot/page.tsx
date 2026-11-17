import "../admin.css";
import { ForgotPasswordForm } from "../account-forms";

export const dynamic = "force-dynamic";

export default function Forgot() {
  return (
    <div className="auth">
      <section className="hero" aria-hidden="true">
        <img src="/media/2024/03/zak-logo-w.png" alt="" />
        <div>
          <h2>For a sustainable tomorrow</h2>
          <p>Manage pages, blog posts and media for Zakion Energy.</p>
        </div>
      </section>
      <div className="panel">
        <img className="mlogo" src="/media/2024/03/zak-logo.png" alt="Zakion Energy" />
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
