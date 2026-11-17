-- Admin password set from the admin itself. One row at most. Until it exists, login uses the ADMIN_PASSWORD secret.
-- session_ver goes up on every password change, which signs out all other sessions.
CREATE TABLE admin_auth (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  pass_hash TEXT NOT NULL,
  pass_salt TEXT NOT NULL,
  recovery_hash TEXT NOT NULL,
  recovery_salt TEXT NOT NULL,
  session_ver INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
