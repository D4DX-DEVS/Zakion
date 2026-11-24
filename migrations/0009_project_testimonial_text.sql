-- A project's client testimonial can also have written text (next to the video and/or picture added in 0008).
ALTER TABLE projects ADD COLUMN testimonial_quote TEXT NOT NULL DEFAULT '';

-- The four starter projects came with a one-line description, which showed as "About the Project" on every project page. That part should only
-- appear when a description is written for the project, so these starter lines are cleared (only where they are still exactly the starter text).
UPDATE projects SET summary = '' WHERE
     (slug = 'home-solar-project' AND instr(summary, 'A 10 kW on-grid solar system installed at a residential home in Kozhikode, Kerala') > 0)
  OR (slug = 'corporate-office-solar' AND instr(summary, 'A rooftop solar installation for a corporate office in Calicut, Kerala') > 0)
  OR (slug = 'ground-mounted-solar' AND instr(summary, 'A ground-mounted solar installation in Thrissur, Kerala.') > 0)
  OR (slug = 'industrial-solar-plant' AND instr(summary, 'A rooftop solar plant for an industrial site in Malappuram, Kerala.') > 0);
