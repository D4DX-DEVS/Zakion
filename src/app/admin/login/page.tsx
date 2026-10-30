"use client";
import "../admin.css";
import { useActionState, useState } from "react";
import { loginAction } from "../actions";
import { SubmitButton } from "../ui";

export default function Login() {
  const [st, act] = useActionState(loginAction, null);
  const [show, setShow] = useState(false);
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
        <form action={act}>
          <h1>Sign in</h1>
          <p className="sub">Use your admin account to edit the website.</p>
          {st?.error && <p className="alert" role="alert">{st.error}</p>}
          <label className="field"><span>Username</span><input type="text" name="user" defaultValue="admin" autoComplete="username" required /></label>
          <label className="field">
            <span>Password</span>
            <span className="pw">
              <input type={show ? "text" : "password"} name="pass" autoComplete="current-password" autoFocus required />
              <button type="button" aria-pressed={show} onClick={() => setShow(s => !s)}>{show ? "Hide" : "Show"}</button>
            </span>
          </label>
          <SubmitButton pending="Signing in…">Sign in</SubmitButton>
        </form>
      </div>
    </div>
  );
}
