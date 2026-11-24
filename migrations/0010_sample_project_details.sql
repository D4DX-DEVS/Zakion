-- Sample details for the first project (Home Solar Project), so its page shows every part: the details table, About the Project, the client
-- testimonial (video, picture and text) and the environmental benefits. These are placeholder values for the admin to replace or clear under
-- Projects. A value is only filled where it is still empty, so anything already written in the admin is kept.
UPDATE projects SET
  pv_details        = CASE WHEN pv_details = ''        THEN '24 x 440 Wp mono PERC modules' ELSE pv_details END,
  pcu_details       = CASE WHEN pcu_details = ''       THEN '10 kW on-grid string inverter' ELSE pcu_details END,
  completion        = CASE WHEN completion = ''        THEN 'March 2025' ELSE completion END,
  generation        = CASE WHEN generation = ''        THEN '14,600 units (kWh)' ELSE generation END,
  savings           = CASE WHEN savings = ''           THEN 'Rs. 1,02,000' ELSE savings END,
  payback           = CASE WHEN payback = ''           THEN '4.5 years' ELSE payback END,
  summary           = CASE WHEN summary = ''           THEN '<p>A 10 kW on-grid rooftop solar system on a two-storey home in Kozhikode, Kerala. It powers the house through the day and sends the surplus to the KSEB grid under net metering.</p><p>Zakion Energy handled the site survey, design, KSEB approvals, installation and commissioning, and the owner can follow the daily generation from a phone.</p>' ELSE summary END,
  testimonial_video = CASE WHEN testimonial_video = '' THEN '/media/2026/11/lv_0_20261119163511-1-.mp4' ELSE testimonial_video END,
  testimonial_image = CASE WHEN testimonial_image = '' THEN '/media/2024/03/hero.jpg' ELSE testimonial_image END,
  testimonial_quote = CASE WHEN testimonial_quote = '' THEN 'Zakion Energy looked after everything, from the design and the KSEB approvals to the installation. Our monthly electricity bill has dropped to almost nothing, and the team was professional, on time and always ready to answer our questions.' ELSE testimonial_quote END,
  co2               = CASE WHEN co2 = ''               THEN '12' ELSE co2 END,
  trees             = CASE WHEN trees = ''             THEN '570' ELSE trees END,
  coal              = CASE WHEN coal = ''              THEN '6.6' ELSE coal END
WHERE slug = 'home-solar-project';
