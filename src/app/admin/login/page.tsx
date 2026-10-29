"use client";
import "../admin.css";
import { useActionState } from "react";
import { loginAction } from "../actions";

export default function Login() {
  const [st, act, pending] = useActionState(loginAction, null);
  return (
    <form action={act} className="login card">
      <h1>Zakion Admin</h1>
      <label>Username</label>
      <input type="text" name="user" defaultValue="admin" autoComplete="username" />
      <label>Password</label>
      <input type="password" name="pass" autoComplete="current-password" autoFocus />
      {st?.error && <p className="err">{st.error}</p>}
      <p>
        <button className="btn" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
      </p>
    </form>
  );
}
