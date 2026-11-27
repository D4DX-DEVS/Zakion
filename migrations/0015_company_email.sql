-- The company email is now zakionenergy20@gmail.com: it replaces info@zakionenergy.com and info@zakion.com wherever the site shows or uses one.
-- Saved settings (top bar and mobile menu, footer, Contact block and where enquiries are emailed) are changed only while they still hold one of the old
-- addresses, so an address typed in the admin since is left alone. The stored page text is updated too, so no page keeps the old address.
UPDATE site_content SET data = json_set(data, '$.topEmail', 'zakionenergy20@gmail.com'), updated_at = datetime('now')
WHERE key = 'header' AND json_valid(data) AND json_extract(data, '$.topEmail') IN ('info@zakionenergy.com', 'info@zakion.com');

UPDATE site_content SET data = json_set(data, '$.email', 'zakionenergy20@gmail.com'), updated_at = datetime('now')
WHERE key = 'footer' AND json_valid(data) AND json_extract(data, '$.email') IN ('info@zakionenergy.com', 'info@zakion.com');

UPDATE site_content SET data = json_set(data, '$.email', 'zakionenergy20@gmail.com'), updated_at = datetime('now')
WHERE key = 'contact' AND json_valid(data) AND json_extract(data, '$.email') IN ('info@zakionenergy.com', 'info@zakion.com');

UPDATE site_content SET data = json_set(data, '$.notifyEmail', 'zakionenergy20@gmail.com'), updated_at = datetime('now')
WHERE key = 'contact' AND json_valid(data) AND json_extract(data, '$.notifyEmail') IN ('info@zakionenergy.com', 'info@zakion.com');

UPDATE pages
SET body_html = REPLACE(REPLACE(body_html, 'info@zakionenergy.com', 'zakionenergy20@gmail.com'), 'info@zakion.com', 'zakionenergy20@gmail.com')
WHERE instr(body_html, 'info@zakion') > 0;

UPDATE pages
SET description = REPLACE(REPLACE(description, 'info@zakionenergy.com', 'zakionenergy20@gmail.com'), 'info@zakion.com', 'zakionenergy20@gmail.com')
WHERE instr(description, 'info@zakion') > 0;
