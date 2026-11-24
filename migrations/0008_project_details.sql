-- More about each project, shown on the project's page: the equipment (PV and PCU details), when it was finished, what it produces and saves,
-- a client testimonial (a video and/or a picture) and the environmental benefits (tonnes of CO2 and coal saved, trees equal to that).
-- Every value is optional text; an empty one is not shown. The numbers (co2, trees, coal) are kept as text like `capacity`.
ALTER TABLE projects ADD COLUMN pv_details TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN pcu_details TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN completion TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN generation TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN savings TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN payback TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN testimonial_video TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN testimonial_image TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN co2 TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN trees TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN coal TEXT NOT NULL DEFAULT '';
