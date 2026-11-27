-- Meta descriptions for three pages. Each UPDATE only matches the old text, so it never overwrites a description edited in the admin.
-- Home: the old text named offices (Cochin, Palakkad) that disagree with the company profile (Calicut, Pulamanthole).
UPDATE pages SET description='Zakion Energy: solar EPC, energy engineering and eMobility company in Calicut, Kerala. Rooftop and commercial solar, storage, energy audits, EV charging.' WHERE path='/' AND description LIKE '%Cochin%';
-- Blog: the old text was 58 characters.
UPDATE pages SET description='Articles on rooftop solar, hybrid systems, battery storage, biomass, geothermal and the economics of going solar, from the Zakion Energy team in Kerala.' WHERE path='/blog/' AND length(description) < 70;
-- Solar Calculator: the old text was over 160 characters and is cut off in search results.
UPDATE pages SET description='Estimate your rooftop solar plant size, yearly savings, payback and environmental impact from your monthly bill or units. Free calculator by Zakion Energy.' WHERE path='/solar-calculator/' AND length(description) > 160;
