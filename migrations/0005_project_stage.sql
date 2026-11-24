-- A project's progress: 'completed' or 'ongoing' (shown as a label on its card and its page). Whether the project is shown on the website at all
-- stays in `status` ('published' or 'draft'), which the Projects list in the admin switches with Hide / Show.
ALTER TABLE projects ADD COLUMN stage TEXT NOT NULL DEFAULT 'completed';
