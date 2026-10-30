import { db } from "@/lib/env";
import { deleteMessage } from "../../actions";
import { ConfirmButton } from "../../ui";

type M = { id: number; name: string; email: string; phone: string; subject: string; message: string; created_at: string };

export default async function Messages() {
  const rows = (await db().prepare("SELECT * FROM messages ORDER BY id DESC").all<M>()).results;
  return (
    <>
      <h1>Messages</h1>
      {rows.length === 0 && <div className="card empty">No messages yet. Contact form submissions will appear here.</div>}
      {rows.map(m => (
        <article className="card row between" key={m.id} style={{ alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 420px" }}>
            <h3>{m.name}{m.subject && <span className="muted"> · {m.subject}</span>}</h3>
            <p className="muted" style={{ margin: "2px 0 10px" }}><a href={"mailto:" + m.email}>{m.email}</a> · {m.phone} · {m.created_at}</p>
            <div style={{ whiteSpace: "pre-wrap" }}>{m.message}</div>
          </div>
          <form action={deleteMessage}>
            <input type="hidden" name="id" value={m.id} />
            <ConfirmButton className="btn del sm" message={`Delete the message from ${m.name}?`}>Delete</ConfirmButton>
          </form>
        </article>
      ))}
    </>
  );
}
