-- Wording that mentioned what the Solar Calculator no longer shows (the system cost and the subsidy).
-- Each change only applies while the text is still the one from migration 0011, so anything edited in the admin since is left alone.
-- (instr() rather than LIKE: the database refuses LIKE patterns longer than 50 bytes.)
UPDATE pages
SET description = 'Estimate your rooftop solar plant size, yearly savings, payback and environmental impact from your monthly electricity bill or units. Free solar calculator by Zakion Energy.',
    updated_at = datetime('now')
WHERE path = '/solar-calculator/' AND instr(description, 'yearly savings, subsidy, payback') > 0;

UPDATE faqs
SET answer = REPLACE(answer, 'The Solar Calculator gives a quick indicative figure.', 'The Solar Calculator shows your plant size and savings.'),
    updated_at = datetime('now')
WHERE instr(answer, 'The Solar Calculator gives a quick indicative figure.') > 0;
