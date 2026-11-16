// Replacement copy for the lorem-ipsum blog posts and project pages. General renewable-energy explainers plus figures already
// in the deck; nothing here states a fact about a specific customer project.
const p = (t) => `<p class="wp-block-paragraph">${t}</p>`;
const h = (t) => `<h2 class="wp-block-heading">${t}</h2>`;
const ul = (items) => `<ul class="wp-block-list">${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
const post = (...parts) => "\n" + parts.join("\n") + "\n";

export const POSTS = {
  "exploring-the-latest-innovations-in-solar-technology": {
    excerpt: "From high-efficiency TOPCon and bifacial panels to micro inverters, lithium storage and building-integrated designs, here are the solar technologies changing how homes and businesses generate power.",
    content: post(
      p("Solar technology has moved a long way from the first bulky rooftop panels. Today's modules convert more sunlight into power, last longer and fit into buildings far more gracefully than before. Here is a look at the ideas shaping solar installations right now."),
      h("Better panels"),
      p("TOPCon and other n-type cell designs lose less power to degradation and perform better in low light. Bifacial modules add to that by collecting light on both faces, so reflected light from the roof, the ground or the surroundings becomes extra energy. Larger, more tightly packed cells raise the output of each module, which means fewer panels for the same capacity."),
      h("Smarter electronics"),
      p("Micro inverters convert power at each panel rather than for the whole array, so a shaded or dusty panel no longer drags down its neighbours. Monitoring apps let owners see generation and consumption in real time and spot problems early."),
      h("Storage and design"),
      ul(["Lithium batteries store daytime surplus for evenings and power cuts", "Hybrid inverters manage solar, battery and grid together", "Building-integrated solar turns roofs, canopies and gazebos into generators"]),
      p("Together these advances make solar easier to design around a home or business, and more dependable once it is running. If you are considering a system, a site audit is the best way to see which options suit your roof and your energy use."),
    ),
  },
  "solar-solutions-for-a-sustainable-tomorrow": {
    excerpt: "On-grid, hybrid or off-grid? A plain-language guide to choosing the right solar system for your home or business, and what good planning looks like.",
    content: post(
      p("Choosing solar is not one decision but several. The right system depends on how much power you use, whether the grid is reliable where you are, and what you want the system to do for you."),
      h("Three ways to go solar"),
      ul(["On-grid: powers the property directly and sends any surplus to the grid through net metering", "Hybrid: adds battery storage, so you keep power during outages and use more of your own solar energy", "Off-grid: runs independently of the grid, suited to places without a reliable supply"]),
      p("Most homes and businesses in cities start with on-grid because it is the most economical. Hybrid makes sense where outages are frequent or where you want to use solar energy after sunset."),
      h("Planning your system"),
      p("A good installer begins with a site audit, then designs the system around your consumption, the shade-free area available and your budget. Roof strength, orientation and local rules for grid connection all matter. After installation come testing, commissioning and an annual maintenance plan to keep output steady for years."),
      p("Every unit of electricity you generate from the sun is a unit that does not have to be produced from fossil fuel, which is how a rooftop system contributes to a more sustainable tomorrow."),
    ),
  },
  "advancements-and-breakthroughs-in-renewable-power": {
    excerpt: "Better storage, smarter grids and wider uses such as EV charging are making renewable power more dependable. Here is what is moving the field forward.",
    content: post(
      p("Renewable power is no longer a niche. Solar and wind now sit at the centre of how many countries plan their energy supply, and steady engineering progress keeps improving what they can deliver."),
      h("Making variable power dependable"),
      p("Sun and wind come and go, so storage and smarter grids are where much of the progress is happening. Battery costs have fallen and capacities have grown, allowing energy collected at midday to be used in the evening. Software that forecasts generation and demand helps grid operators keep the two in balance."),
      h("Wider uses"),
      ul(["Electric vehicles can be charged directly from solar canopies", "Heat pumps and efficient appliances reduce the electricity needed in the first place", "Combining solar, wind and storage makes projects more reliable than any single source alone"]),
      p("None of this removes the need for careful planning, but it does mean clean power is increasingly practical at every scale, from a single home to a whole city."),
    ),
  },
  "biomass-energy-demystified-fueling-a-future": {
    excerpt: "Biomass turns plant material and organic waste into heat, electricity and fuel. Here is where it comes from, how it works and when it counts as clean energy.",
    content: post(
      p("Biomass sounds technical, but the idea is simple: the energy stored in plants and organic waste can be released and used as heat, electricity or fuel."),
      h("Where biomass comes from"),
      p("Typical sources include agricultural residues such as husks and straw, wood waste, animal manure and food waste. Because these materials are often by-products, using them for energy can reduce waste as well as fuel use."),
      h("How it becomes energy"),
      ul(["Direct combustion to produce heat or steam for power", "Anaerobic digestion, which turns wet organic waste into biogas", "Pellets and briquettes as a fuel for industry and cooking"]),
      p("Biomass is often described as carbon neutral because the carbon released was recently absorbed by the plants. That holds only when the material is sourced sustainably, so supply chains matter. Used well, biomass is a useful partner to solar and wind, since it can provide power on demand."),
    ),
  },
  "beneath-the-surface-geothermal-energy-explored": {
    excerpt: "Geothermal energy uses the Earth's own heat for round-the-clock power and efficient building heating and cooling. Here is how it works and where it fits.",
    content: post(
      p("Beneath our feet, the Earth holds a vast amount of heat. Geothermal energy taps that heat for electricity and for heating and cooling buildings."),
      h("Two ways to use it"),
      ul(["Geothermal power plants use steam or hot water from deep wells to drive turbines", "Geothermal heat pumps use the steady temperature just below the surface to heat and cool buildings efficiently"]),
      p("Geothermal power runs day and night, which makes it a dependable partner for variable sources such as solar and wind."),
      h("Where it works"),
      p("Large power plants need strong underground heat, usually found near volcanic or tectonically active regions. Heat pumps are different: they work almost anywhere because they rely on ordinary ground temperature. Drilling costs and site surveys are the main hurdles, and every location needs careful study before a project goes ahead."),
    ),
  },
  "investing-in-a-sustainable-energy-future": {
    excerpt: "What does solar really return? A look at bill savings, subsidy, tax benefits and EMI plans, so you can judge a rooftop system as an investment.",
    content: post(
      p("Switching to solar is an investment, and like any investment it should be judged on what you put in and what you get back."),
      h("What you gain"),
      ul(["Lower electricity bills for the life of the system", "Protection against future tariff increases", "Government subsidy and tax depreciation benefits where eligible"]),
      p("Zakion's estimates put returns for on-grid systems at roughly 22% to 30%, and a ₹78,000 subsidy is available for residential plants of 3 kW and above. Actual savings depend on system size, sunlight at the site, your tariff and how much electricity you use."),
      h("Making it affordable"),
      p("Easy EMI plans spread the cost over 6 to 60 months, so many customers start saving from the first month. A site audit and a clear quotation help you compare options before you commit."),
    ),
  },
};

// Project pages: same process-based copy for each, using the project name only.
export const projectInfo = (name) =>
  `<p>${name} is one of the solar installations delivered by Zakion Energy. Like every Zakion project, it follows our eight-step process: site auditing, consulting, designing and architecting, supply of material, installation, testing, commissioning and AMC.</p>` +
  `<p>Every system is designed around the customer's energy use, the shade-free area available and the budget, and is supported after commissioning through our annual maintenance contract.</p>`;
export const PROJECT_SCOPE = "Zakion delivers solar projects end to end. The scope of a typical project covers:";
export const PROJECT_LIST = ["Site auditing, consulting and system design", "Supply of material, installation, testing and commissioning", "Annual maintenance contract (AMC) and ongoing support"];
