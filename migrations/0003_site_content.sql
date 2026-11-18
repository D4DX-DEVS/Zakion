-- Editable content for the redesigned page sections (src/lib/content.ts holds the defaults).
-- One row per section; `data` is JSON. A missing row means "use the defaults from the code".
CREATE TABLE site_content (
  key TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
