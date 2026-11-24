-- Projects shown on the Projects page (filter tabs and cards) and on their own detail pages (/projects/<slug>/).
-- Managed in the admin under Projects. `gallery` is a JSON list of picture addresses.
CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Residential',
  location TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  capacity TEXT NOT NULL DEFAULT '',
  system_type TEXT NOT NULL DEFAULT '',
  system_note TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  gallery TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'published',
  sort INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX projects_status_sort ON projects (status, sort);

-- Starter entries so the page is not empty: edit, replace or delete them under Projects in the admin.
INSERT INTO projects (slug, title, category, location, summary, capacity, system_type, system_note, image, gallery, status, sort) VALUES
('home-solar-project', 'Home Solar Project', 'Residential', 'Kozhikode, Kerala',
 'A 10 kW on-grid solar system installed at a residential home in Kozhikode, Kerala, helping the family reduce electricity bills and contribute to a greener planet.',
 '10 KW', 'On Grid System', 'Connected to Utility Grid',
 '/zk/solarhome-photo.jpg', '["/media/2024/03/post-3.jpg","/media/2024/03/post-5.jpg","/media/2024/03/post-6.jpg","/media/2024/03/post-2.jpg","/media/2024/03/hero.jpg"]', 'published', 1),
('corporate-office-solar', 'Corporate Office Solar', 'Commercial', 'Calicut, Kerala',
 'A rooftop solar installation for a corporate office in Calicut, Kerala, reducing the building''s daytime electricity costs.',
 '', '', '',
 '/media/2024/03/post-1.jpg', '["/media/2024/03/post-3.jpg","/media/2024/03/post-5.jpg","/media/2024/03/post-6.jpg"]', 'published', 2),
('ground-mounted-solar', 'Ground Mounted Solar', 'Industrial', 'Thrissur, Kerala',
 'A ground-mounted solar installation in Thrissur, Kerala.',
 '', '', '',
 '/media/2024/03/header-banner.jpg', '["/media/2024/03/post-4.jpg","/media/2024/03/hero-2.jpg"]', 'published', 3),
('industrial-solar-plant', 'Industrial Solar Plant', 'Industrial', 'Malappuram, Kerala',
 'A rooftop solar plant for an industrial site in Malappuram, Kerala.',
 '', '', '',
 '/media/2024/03/video-bg.jpg', '["/media/2024/03/post-3.jpg","/media/2024/03/post-5.jpg"]', 'published', 4);
