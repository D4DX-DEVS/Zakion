-- Solar Calculator leads: the visitors who used the calculator and left their mobile number (and email, if they gave one),
-- with what they calculated. Shown in the admin under Solar Calculator. Until now they were saved as enquiries under Submissions
-- (name "Solar Calculator user", interest "Solar Calculator"); those are moved here below.
--   basis: "bill" or "units" (what was typed), amount: that bill in rupees or those units a month, rate: the unit charge used,
--   plant_size in kWp, yearly_units in kWh, savings in rupees, payback in years; details: the same summary as text.
--   status: "new", or "contacted" once the team has called.
CREATE TABLE calculator_leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  customer_type TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  basis TEXT NOT NULL DEFAULT '',
  amount REAL NOT NULL DEFAULT 0,
  rate REAL NOT NULL DEFAULT 0,
  plant_size REAL NOT NULL DEFAULT 0,
  yearly_units REAL NOT NULL DEFAULT 0,
  yearly_savings REAL NOT NULL DEFAULT 0,
  lifetime_savings REAL NOT NULL DEFAULT 0,
  payback REAL NOT NULL DEFAULT 0,
  details TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  mail_status TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX calculator_leads_created ON calculator_leads (created_at);

INSERT INTO calculator_leads (phone, email, details, mail_status, created_at)
SELECT COALESCE(phone, ''), COALESCE(email, ''), COALESCE(message, ''), COALESCE(mail_status, ''), created_at
FROM messages WHERE subject = 'Solar Calculator' AND name = 'Solar Calculator user';
DELETE FROM messages WHERE subject = 'Solar Calculator' AND name = 'Solar Calculator user';
