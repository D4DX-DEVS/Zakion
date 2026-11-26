-- FAQ page and Solar Calculator page.
--
-- faqs: the questions and answers on the FAQ page (/faq/). Managed in the admin under FAQs: add, edit, show or hide, reorder, delete.
--   "sort" is the position on the page (smallest first); "category" groups the questions under filter tabs.
-- /faq/ and /solar-calculator/: two inner pages. Like the Testimonials page they are copies of the Testimonials page, which keeps the
--   same header, footer and page-title banner; their contents come from the page's block list (Admin > Pages), so only the title in the banner changes here.
-- The main menu gets a FAQ item right after Blog.
CREATE TABLE faqs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'General',
  sort INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX faqs_status_sort ON faqs (status, sort);

INSERT INTO faqs (question, answer, category, sort) VALUES
('How does a rooftop solar system work?',
 'Solar panels on your roof turn sunlight into direct current (DC) electricity. An inverter converts it into the alternating current (AC) your home or business uses. The solar power runs your appliances first; on an on-grid system any extra goes to the grid and is credited to you through net metering, and when the sun is down you draw from the grid as usual.',
 'Getting started', 1),
('How much roof space do I need for solar?',
 'As a rule of thumb, every 1 kW of solar needs about 100 square feet (around 10 square metres) of shadow-free roof. A 3 kW home system therefore needs roughly 300 square feet. Our team visits your site, checks the roof, the shade and the direction it faces, and designs the layout that fits.',
 'Getting started', 2),
('How many units of electricity will a 1 kW system generate?',
 'In Kerala a 1 kW system typically generates about 3.5 to 4.5 units (kWh) a day, which is around 1,200 to 1,400 units a year. The exact figure depends on your location, the tilt and direction of the panels, shade and how clean the panels are. Use our Solar Calculator for an estimate based on your own bill.',
 'Getting started', 3),
('What are the different types of solar systems?',
 'There are three main types. An **On Grid** system is connected to the grid and has no battery, which makes it the most affordable and the quickest to pay back. A **Hybrid** system is also grid connected and adds a battery, so essential loads keep running during a power cut. A **Battery Energy Storage System (BESS)** stores solar energy for use at night or at peak tariff hours. We will help you choose the one that matches your usage and budget.',
 'Getting started', 4),
('How much does a solar system cost?',
 'The cost depends on the size and type of the system, the make of the panels and inverter, and the roof. Residential on-grid systems are priced per kW, and larger systems cost less per kW. Send us your electricity bill and we will give you a clear written quotation with no hidden charges. The Solar Calculator gives a quick indicative figure.',
 'Cost and subsidy', 5),
('Is there a government subsidy for home solar?',
 'Yes. Under the PM Surya Ghar Muft Bijli Yojana, residential consumers can receive a central subsidy of Rs. 30,000 per kW for the first 2 kW and Rs. 18,000 for the third kW, up to a maximum of Rs. 78,000, when the system uses domestic content (DCR) panels. The scheme and its amounts are set by the government and can change, so we check the current rules for you.',
 'Cost and subsidy', 6),
('Can I get a loan to install solar?',
 'Many banks offer finance for residential rooftop solar, often at concessional rates under the PM Surya Ghar scheme. We can guide you through the documents. Because your electricity bill drops once the plant is running, the savings often cover a large part of the monthly instalment.',
 'Cost and subsidy', 7),
('What is the payback period of solar?',
 'Most homes in Kerala recover the cost of an on-grid system in about 3 to 5 years, after subsidy. Commercial and industrial users with high daytime consumption often recover it sooner. After that your solar power is practically free for the remaining life of the system, which is 25 years or more.',
 'Cost and subsidy', 8),
('What is net metering and do you handle the paperwork?',
 'Net metering lets you export the extra solar power you do not use to the KSEB grid and receive credit for it on your bill. It needs approval and a bi-directional meter from the utility. Zakion Energy handles the full process for you: the application, the technical feasibility, the inspection and the commissioning.',
 'Installation and approvals', 9),
('How long does the installation take?',
 'A typical home system is installed in a few days once the material is at your site. Including the survey, the design, the approvals and the net meter, the whole process usually takes two to four weeks. Larger commercial and industrial projects take longer, and we share a clear schedule before we start.',
 'Installation and approvals', 10),
('Will solar work on cloudy or rainy days?',
 'Yes, but the output is lower. Panels still produce electricity from diffused light, usually a fraction of what they make on a clear day. Over a full year the sunny months make up for the rainy ones, and the generation figures in our calculator already account for typical weather.',
 'Performance', 11),
('What happens to my solar system during a power cut?',
 'A standard on-grid system switches off during a grid outage. This is a safety rule so that no power is pushed into lines that workers may be repairing. If you want power during outages, choose a hybrid system with a battery, which keeps your selected loads running.',
 'Performance', 12),
('How much maintenance does a solar system need?',
 'Very little. The panels have no moving parts. We recommend cleaning them with plain water every few weeks, more often in dusty places, and having the system checked once or twice a year. Our Annual Maintenance Contract (AMC) covers cleaning, inspection, performance checks and repairs, so you do not have to worry about it.',
 'Maintenance and warranty', 13),
('How long do solar panels last and what is the warranty?',
 'Good solar panels last 25 years or more. Manufacturers typically give a performance warranty of 25 years or longer, guaranteeing that the panels still produce a high share of their rated power at the end of that time, along with a product warranty against defects. Inverters usually carry a shorter warranty of 5 to 10 years. The exact terms depend on the brand, and we put them in your quotation.',
 'Maintenance and warranty', 14),
('Is solar worth it for a business or factory?',
 'Often yes. Businesses use most of their power during the day, exactly when solar generates, so almost all of the solar power is used on site and the electricity bill falls straight away. Many commercial and industrial customers also benefit from tax advantages for renewable energy investment; please check the current rules with your tax adviser.',
 'Commercial and industrial', 15);

-- The FAQ page and the Solar Calculator page: copies of the Testimonials page with their own banner title.
INSERT OR IGNORE INTO pages (path, title, description, og_image, body_class, head_html, body_html, foot_html, kind, status, updated_at)
SELECT '/faq/', 'Solar FAQs | Zakion Energy', 'Answers to common questions about rooftop solar: cost, PM Surya Ghar subsidy, net metering, installation, maintenance and warranty.', og_image, body_class, head_html,
  REPLACE(body_html, '<h1 class="elementor-heading-title elementor-size-default">Testimonials</h1>', '<h1 class="elementor-heading-title elementor-size-default">FAQ</h1>'),
  foot_html, kind, 'published', datetime('now')
FROM pages WHERE path = '/testimonials/';

INSERT OR IGNORE INTO pages (path, title, description, og_image, body_class, head_html, body_html, foot_html, kind, status, updated_at)
SELECT '/solar-calculator/', 'Solar Calculator | Zakion Energy', 'Estimate your rooftop solar plant size, yearly savings, subsidy, payback and environmental impact from your monthly electricity bill or units. Free solar calculator by Zakion Energy.', og_image, body_class, head_html,
  REPLACE(body_html, '<h1 class="elementor-heading-title elementor-size-default">Testimonials</h1>', '<h1 class="elementor-heading-title elementor-size-default">Solar Calculator</h1>'),
  foot_html, kind, 'published', datetime('now')
FROM pages WHERE path = '/testimonials/';

-- Menu: a FAQ item right after Blog (only when the menu has been saved in the admin, has a Blog item and has no FAQ item yet;
-- otherwise the built-in menu in lib/content.ts already has it).
UPDATE site_content SET data = json_set(data, '$.menu', (
  SELECT json_group_array(json(v)) FROM (
    SELECT value AS v, CAST(key AS INTEGER) * 2 AS o FROM json_each(json_extract(site_content.data, '$.menu'))
    UNION ALL
    SELECT '{"label":"FAQ","url":"/faq/","children":[]}', CAST(key AS INTEGER) * 2 + 1 FROM json_each(json_extract(site_content.data, '$.menu')) WHERE json_extract(value, '$.url') = '/blog/'
    ORDER BY o
  )
)), updated_at = datetime('now')
WHERE key = 'header' AND json_valid(data) AND json_type(data, '$.menu') = 'array'
  AND data NOT LIKE '%"/faq/"%'
  AND EXISTS (SELECT 1 FROM json_each(json_extract(site_content.data, '$.menu')) WHERE json_extract(value, '$.url') = '/blog/');
