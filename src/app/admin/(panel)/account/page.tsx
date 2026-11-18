import { recoverySetOn } from "@/lib/auth";
import { ChangePasswordForm } from "../../account-forms";
import { fmtDate } from "../../format";
import { Icon } from "../../icons";

export default async function Account() {
  const setOn = await recoverySetOn();
  return (
    <div className="two">
      <ChangePasswordForm firstTime={!setOn} />
      <section className="card" aria-labelledby="rec-h">
        <div className="card-h"><h2 id="rec-h"><Icon name="shield" size={22} />Recovery code</h2></div>
        {setOn ? (
          <p className="alert ok">A recovery code was created on <strong>{fmtDate(setOn)}</strong>. It is the only way to reset a forgotten password from the website. Lost it? Change your password to get a new one.</p>
        ) : (
          <p className="alert warn">No recovery code exists yet. Change your password to create one, then save it: without a code, a forgotten password cannot be reset from the website.</p>
        )}
        <details className="hint">
          <summary>If you lose both the code and the password</summary>
          <p style={{ marginTop: 8 }}>Someone with access to the Cloudflare account can clear the saved password, which makes the original Cloudflare password work again:</p>
          <code className="cmd">npx wrangler d1 execute zakion-db --remote --command &quot;DELETE FROM admin_auth&quot;</code>
        </details>
      </section>
    </div>
  );
}
