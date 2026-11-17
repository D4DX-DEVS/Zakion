import { recoverySetOn } from "@/lib/auth";
import { ChangePasswordForm } from "../../account-forms";

export default async function Account() {
  const setOn = await recoverySetOn();
  return (
    <>
      <h1>Account</h1>
      <ChangePasswordForm firstTime={!setOn} />
      <section className="card" style={{ maxWidth: 520 }}>
        <h2>Recovery code</h2>
        {setOn ? (
          <p className="muted" style={{ marginTop: 6 }}>A recovery code was created on <strong>{setOn.slice(0, 10)}</strong>. It is the only way to reset a forgotten password from the website. Lost it? Change your password above to get a new one.</p>
        ) : (
          <p className="alert" style={{ marginTop: 10 }}>No recovery code exists yet. Change your password above to create one, then save it: without a code, a forgotten password cannot be reset from the website.</p>
        )}
        <details className="hint">
          <summary>If you lose both the code and the password</summary>
          <p>Someone with access to the Cloudflare account can clear the saved password, which makes the original Cloudflare password work again:</p>
          <code className="cmd">npx wrangler d1 execute zakion-db --remote --command &quot;DELETE FROM admin_auth&quot;</code>
        </details>
      </section>
    </>
  );
}
