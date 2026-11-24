-- Customer testimonials: the carousel on the Home page (the latest six) and the Testimonials page (all of them).
-- Managed in the admin under Testimonials. A testimonial is a written quote, a video, or both. The newest one comes first.
CREATE TABLE testimonials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT '',
  company TEXT NOT NULL DEFAULT '',
  quote TEXT NOT NULL DEFAULT '',
  avatar TEXT NOT NULL DEFAULT '',
  video TEXT NOT NULL DEFAULT '',
  poster TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'published',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX testimonials_status_created ON testimonials (status, created_at);

-- The two testimonials the Home page already showed, so nothing is lost. Rahees is added last, so it is the newest and comes first.
INSERT INTO testimonials (name, role, company, quote, avatar) VALUES
('Mohammed Yousuf', 'Admin Officer', 'Markazul Uloom English School, Kondotty',
 'Managing electricity costs was once a major struggle for our institution. By adopting Zakion Energy''s solar system, our bill dropped by around 90%. From timely installation to handling all KSEB paperwork, Zakion Energy delivered outstanding service and true energy freedom.',
 '/zk/avatar-yousuf.jpg'),
('Rahees', 'Managing Director', 'Wins Autos, Calicut',
 'Electricity costs were a major recurring expense that affected our monthly margins. We needed a reliable and sustainable power solution to reduce these costs effectively. Choosing **Zakion Energy** was the best decision we made. Their team handled everything seamlessly—from evaluating our energy needs to smooth installation and completing all the necessary paperwork without any hassle.',
 '/zk/avatar-rahees.jpg');

-- The Testimonials page ("View more" on the Home page goes here): a copy of the Projects page, which keeps the same header, footer and page-title banner.
-- Its contents come from the page's block list (Admin > Pages > Testimonials), so only the title in the banner is changed here.
INSERT OR IGNORE INTO pages (path, title, description, og_image, body_class, head_html, body_html, foot_html, kind, status, updated_at)
SELECT '/testimonials/', 'Customer Testimonials | Zakion Energy', 'Read and watch what our customers say about their solar installations with Zakion Energy.', og_image, body_class, head_html,
  REPLACE(body_html, '<h1 class="elementor-heading-title elementor-size-default">Projects</h1>', '<h1 class="elementor-heading-title elementor-size-default">Testimonials</h1>'),
  foot_html, kind, 'published', datetime('now')
FROM pages WHERE path = '/projects/';
