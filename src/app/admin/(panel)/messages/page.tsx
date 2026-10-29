import { db } from "@/lib/env";
import { deleteMessage } from "../../actions";

type M = { id: number; name: string; email: string; phone: string; subject: string; message: string; created_at: string };

export default async function Messages() {
  const rows = (await db().prepare("SELECT * FROM messages ORDER BY id DESC").all<M>()).results;
  return (
    <>
      <h1>Contact messages</h1>
      <div className="card">
        {rows.length === 0 && <p className="muted">No messages yet.</p>}
        <table>
          <tbody>
            {rows.map(m => (
              <tr key={m.id}>
                <td>
                  <strong>{m.name}</strong> · <a href={"mailto:" + m.email}>{m.email}</a> · {m.phone}
                  <div className="muted">{m.created_at} {m.subject && "· " + m.subject}</div>
                  <div style={{ whiteSpace: "pre-wrap" }}>{m.message}</div>
                </td>
                <td><form action={deleteMessage}><input type="hidden" name="id" value={m.id} /><button className="btn del">Delete</button></form></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
