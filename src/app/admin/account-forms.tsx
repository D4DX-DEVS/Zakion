"use client";
import { useActionState, useEffect, useState } from "react";
import { changePasswordAction, forgotPasswordAction } from "./actions";
import { Icon } from "./icons";
import { SubmitButton } from "./ui";

function PasswordField({ name, label, autoComplete, hint }: { name: string; label: string; autoComplete: string; hint?: string }) {
  const [show, setShow] = useState(false);
  return (
    <label className="field">
      <span>{label}</span>
      <span className="pw">
        <input type={show ? "text" : "password"} name={name} autoComplete={autoComplete} required />
        <button type="button" aria-pressed={show} onClick={() => setShow(s => !s)}>{show ? "Hide" : "Show"}</button>
      </span>
      {hint && <small className="hint">{hint}</small>}
    </label>
  );
}

// Shown once, right after a password is saved: only a hash of the code is kept, so it cannot be shown again.
// "Continue" stays disabled until the person ticks that they saved it, and leaving the page first asks for confirmation.
function RecoveryCode({ code, title, doneLabel, doneHref }: { code: string; title: string; doneLabel: string; doneHref: string }) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (saved) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [saved]);
  const download = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([`Zakion Energy admin recovery code

${code}

Keep this file private (a password manager is best).
Use it at /admin/forgot to reset a forgotten password. It works once; a new code is made after every reset or password change.
`], { type: "text/plain" }));
    a.download = "zakion-admin-recovery-code.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <div className="recovery">
      <h2>{title}</h2>
      <p className="alert" role="alert"><strong>Save this recovery code now. It is shown only once.</strong> If you lose it and then forget your password, the website cannot reset it for you.</p>
      <code aria-label="Recovery code">{code}</code>
      <div className="row">
        <button type="button" className="btn sec sm" onClick={() => { navigator.clipboard?.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}><Icon name={copied ? "check" : "copy"} size={16} />{copied ? "Copied" : "Copy code"}</button>
        <button type="button" className="btn sec sm" onClick={download}><Icon name="save" size={16} />Download as file</button>
      </div>
      <p className="hint">Best place for it: a password manager. Any older recovery code no longer works.</p>
      <label className="ack"><input type="checkbox" checked={saved} onChange={e => setSaved(e.target.checked)} /> I have saved my recovery code</label>
      <button type="button" className="btn" disabled={!saved} onClick={() => window.location.assign(doneHref)}>{doneLabel}</button>
    </div>
  );
}

export function ChangePasswordForm({ firstTime }: { firstTime: boolean }) {
  const [st, act] = useActionState(changePasswordAction, null);
  if (st?.code) return <RecoveryCode code={st.code} title="Password changed" doneLabel="Done" doneHref="/admin/account" />;
  return (
    <form action={act} className="card">
      <div className="card-h"><h2><Icon name="lock" size={22} />Change password</h2></div>
      <p className="lead">
        {firstTime
          ? "You are still using the password set in Cloudflare. Change it here to manage it from the admin and to get a recovery code for “Forgot password?”."
          : "Changing it signs out every other device and gives you a new recovery code."}
      </p>
      {st?.error && <p className="alert" role="alert">{st.error}</p>}
      <PasswordField name="current" label="Current password" autoComplete="current-password" />
      <PasswordField name="next" label="New password" autoComplete="new-password" hint="At least 12 characters. A few random words with numbers works well." />
      <PasswordField name="confirm" label="Confirm new password" autoComplete="new-password" />
      <SubmitButton pending="Changing…"><Icon name="lock" size={18} />Change password</SubmitButton>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [st, act] = useActionState(forgotPasswordAction, null);
  if (st?.code) return <RecoveryCode code={st.code} title="Password reset" doneLabel="Continue to the admin" doneHref="/admin" />;
  return (
    <form action={act}>
      <h1>Forgot password</h1>
      <p className="sub">Enter your recovery code and choose a new password.</p>
      {st?.error && <p className="alert" role="alert">{st.error}</p>}
      <label className="field"><span>Recovery code</span><input type="text" name="recovery" placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX" autoComplete="off" autoCapitalize="characters" spellCheck={false} required autoFocus /></label>
      <PasswordField name="next" label="New password" autoComplete="new-password" hint="At least 12 characters." />
      <PasswordField name="confirm" label="Confirm new password" autoComplete="new-password" />
      <SubmitButton pending="Resetting…">Reset password</SubmitButton>
      <p className="sub" style={{ margin: "18px 0 0" }}><a href="/admin/login">Back to sign in</a></p>
      <details className="hint">
        <summary>Lost your recovery code too?</summary>
        <p>Someone with access to the Cloudflare account can clear the saved password, which makes the original Cloudflare password work again:</p>
        <code className="cmd">npx wrangler d1 execute zakion-db --remote --command &quot;DELETE FROM admin_auth&quot;</code>
      </details>
    </form>
  );
}
