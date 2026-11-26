-- Submissions (the contact form's enquiries, table "messages"): whether the email to the team went out.
-- "sent", "not configured" (no mail service key is set yet) or "failed: <reason>". Empty for enquiries from before this was recorded.
ALTER TABLE messages ADD COLUMN mail_status TEXT NOT NULL DEFAULT '';
