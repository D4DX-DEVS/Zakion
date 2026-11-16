// HTML for the sections taken from the "ZaKion Energy" deck. Each builder returns a marker-wrapped block so apply.mjs can re-run safely.
export const PHONE1 = "+91 9188 944 337", PHONE2 = "+91 9188 944 338";
export const TEL1 = "tel:+919188944337", TEL2 = "tel:+919188944338";
export const EMAIL = "info@zakion.com";

const wrap = (name, inner) => `<!--zk:${name}-->${inner}<!--/zk:${name}-->`;
const ico = (n) => `<span class="zk-ico"><i class="fas fa-${n}" aria-hidden="true"></i></span>`;
const head = (eye, h2, sub, c = true) =>
  `<header class="zk-head${c ? " c" : ""}">${eye ? `<span class="zk-eye">${eye}</span>` : ""}<h2 class="zk-h2">${h2}</h2>${sub ? `<p class="zk-sub">${sub}</p>` : ""}<span class="zk-bar"></span></header>`;
const sec = (name, cls, inner, id) => wrap(name, `<section class="zk ${cls}"${id ? ` id="${id}"` : ""}><div class="zk-in">${inner}</div></section>`);
const img = (src, alt, extra = "") => `<img src="/zk/${src}" alt="${alt}" loading="lazy" decoding="async"${extra}>`;

// ---- about + approvals (slide 2)
export const about = () => sec("about", "", `
<div class="zk-split zk-split--rev">
  <div class="zk-split-media">${img("about-worker.jpg", "Zakion engineers installing a solar panel")}</div>
  <div>
    <span class="zk-eye">About Zakion Energy</span>
    <p class="zk-lead">Powering Homes. Empowering Businesses. Building a <b>Sustainable Future.</b></p>
    <p class="zk-copy">We are a team of social entrepreneurs and engineering professionals dedicated to enrich lifestyle experience and contribute infrastructure through renewable energy and sustainable concepts.</p>
    <div class="zk-cert"><h3>Approvals &amp; Certifications</h3>${img("cert-logos.jpg", "Approved by KSEB, PM Surya Ghar Muft Bijli Yojana and MNRE")}</div>
  </div>
</div>`, "about-zakion");

// ---- why choose Zakion (slide 5)
const WHY = [
  ["hard-hat", "Certified Engineers", "Experienced professionals ensuring safe and high-quality installations."],
  ["solar-panel", "Premium Components", "Trusted brands and certified equipments for reliable performance."],
  ["hand-holding-usd", "Subsidy Assistance", "Complete guidance for subsidy eligibility and documentation."],
  ["project-diagram", "Complete EPC Solutions", "Consultation, design, procurement, installation, and support."],
  ["bolt", "Fast Installation", "Efficient project execution with timely completion and quality."],
  ["headset", "Dedicated Support", "Ongoing customer support, maintenance guidance, and service."],
];
export const why = () => sec("why", "zk--tint", `${head("Our Promise", "Why Choose <em>Zakion?</em>")}
<div class="zk-why">${WHY.map(([i, t, p]) => `<article>${ico(i)}<div><h3>${t}</h3><p>${p}</p></div></article>`).join("")}</div>`);

// ---- track record (slide 15)
const STATS = [[5, "+", "Years", "Industry Experience", 2], [500, "+", "Projects Completed", "Residential & Commercial", 0], [1000, "+", "Customers", "Happy & Sustainable", 0]];
export const stats = () => sec("stats", "", `<div class="zk-stats-panel">
  <header class="zk-head" style="margin-bottom:0"><h2 class="zk-h2" style="color:#fff">Our <em>Track Record</em></h2><p class="zk-sub" style="color:#cfdcf5">Trusted Experience. Real Projects. Satisfied Customers.</p></header>
  <div class="zk-stats-grid">
    ${STATS.map(([n, s, t, d, pad]) => `<div class="zk-stat"><b data-zk-count="${n}" data-zk-pad="${pad}" data-zk-suffix="${s}">${String(n).padStart(pad, "0")}${s}</b><strong>${t}</strong><span>${d}</span></div>`).join("")}
    <div class="zk-stat"><b>24/7</b><strong>Support</strong><span>Dedicated Assistance</span></div>
  </div></div>`, "track-record");

// ---- vision / mission / values (slide 3)
export const vision = () => sec("vision", "zk--tint", `${head("Who We Are", "Our <em>Vision</em> &amp; Mission")}
<div class="zk-vm">
  <article class="v"><h3>Our Vision</h3><p>Make footprints in global march towards energy sustainability.</p></article>
  <article class="m"><h3>Our Mission</h3><p>Since the inception of Zakion in 2015, our instinct is to contribute to the global sustainability initiative and enable access to affordable energy to people in every corner of the world. Our strength lies in the pool of experts and core industrial knowledge, with which we aim to become a pioneer in energy engineering.</p></article>
</div>
<div class="zk-values"><h3>Our Values</h3><p>Zakion Energy is driven by teamwork, quality, and customer satisfaction. Guided by honesty, integrity, and innovation, we deliver reliable solutions that prioritize sustainability and exceed expectations.</p></div>
<div class="zk-city">${img("city-strip.jpg", "")}</div>`, "vision-mission");

// ---- our story (slide 4)
const STORY = [
  ["2015", "The Beginning", "Founded in 2015, with successfully delivered home automation system projects.", "story-2015.jpg"],
  ["2017", "Expanding into Energy", "Expanded into ELV and Solar Energy, broadening Zakion's expertise into energy-related solutions.", "story-2017.jpg"],
  ["2020", "Zakion Energy", "Started Zakion Energy, marking the beginning of a dedicated focus on the energy sector.", "story-2020.jpg"],
  ["2026", "Growing with Renewable Energy", "Today, Zakion Energy is actively operating and growing in the renewable energy sector, continuing its journey towards delivering sustainable energy solutions.", "story-2026.jpg"],
];
export const story = () => sec("story", "zk--navy", `${head("From Innovation to Renewable Energy", "Our <em>Story</em>", "", false)}
<div class="zk-story">${STORY.map(([y, t, p, i], k) => `<article>${k === 3 ? '<span class="tag">Present Stage</span>' : ""}${img(i, `${y} ${t}`)}<div class="b"><b>${y}</b><strong>${t}</strong><p>${p}</p></div></article>`).join("")}</div>`, "our-story");

// ---- why renewable (slide 6) — used on Solar Home / PV page
// ---- ROI (slide 11)
export const roi = () => sec("roi", "zk--tint", `<div class="zk-roi-hero" aria-hidden="true">${img("roi-house.jpg", "")}</div>
${head("Smart Investment", "Return on <em>Investment</em>", "", false)}
<div class="zk-roi-top">
  <article><h3><i class="fas fa-coins" aria-hidden="true"></i>Before Solar</h3><ul><li>Higher grid reliance</li><li>Higher electricity bills</li><li>Subject to rate hikes</li></ul></article>
  <article class="after"><h3><i class="fas fa-sun" aria-hidden="true"></i>After Solar</h3><ul><li>Direct solar generation</li><li>Lower grid consumption</li><li>Reduced power bills</li></ul></article>
  <article class="ill"><h3><i class="fas fa-lightbulb" aria-hidden="true"></i>Illustrative Concept</h3><p>Generating your own power directly offsets energy purchased from the utility, minimizing monthly grid outlays.</p></article>
</div>
<p class="zk-note">Note: Actual savings vary with system size, local solar irradiance, tariff structure and household consumption patterns.</p>
<div class="zk-roi-cards">
  <article>${ico("hand-holding-usd")}<h3>Easy EMI Plans</h3><p>Get solar power with easy monthly installments, ranging from 6 to 60 months.</p></article>
  <article>${ico("chart-line")}<h3>Greater ROI</h3><p>Earn more with your solar investment, with returns ranging from 22% to 30% for On-Grid Solar systems.</p></article>
  <article>${ico("landmark")}<h3>Government Subsidy</h3><p>Save big with a ₹78,000 subsidy for residential solar plants of 3KW and above.</p></article>
  <article>${ico("file-invoice-dollar")}<h3>Tax Benefits</h3><p>Enjoy tax savings with income tax depreciation benefits for your solar Plant.</p></article>
</div>`, "roi");

// ---- PV systems (slides 7, 8, 9)
const feats = (list) => `<div class="zk-feats">${list.map(([t, p]) => `<div><h4><i class="fas fa-circle" aria-hidden="true"></i>${t}</h4><p>${p}</p></div>`).join("")}</div>`;
const ONGRID = [["Reduce Electricity Bills", "Generate your own clean energy and lower your monthly electricity costs."], ["Net Metering Benefits", "Earn credits for surplus power sent to the grid through net metering."], ["Zero Fuel Cost", "Solar energy is free and abundant - power your home or business at zero fuel cost."], ["Eco-Friendly Solution", "Reduce carbon footprint and contribute to a greener, sustainable future."]];
const HYBRID = [["Uninterrupted Power", "Battery backup ensures power during outages and load shedding."], ["Maximize Solar Usage", "Store excess solar energy and use it whenever you need."], ["Smarter Savings", "Reduce reliance on the grid and lower electricity bills."], ["Energy Independence", "Greater control, reliability and peace of mind for your home."]];
const BESS = [["Backup Power", "Keeps essential appliances running during power cuts."], ["Store Solar Energy", "Save excess solar power generated during the day for later use."], ["Reduce Electricity Bills", "Use stored energy during high-tariff periods and reduce grid consumption."], ["Energy Independence", "Less dependence on the grid with reliable, on-demand power for your home & Business."]];
export const systems = () => sec("systems", "", `
<div class="zk-sys"><div class="zk-split">
  <div><h2 class="zk-sys-t"><em>ON GRID</em> SYSTEM</h2><p class="zk-copy">In On Grid System, the electricity generated by solar is used by the property. If a grid connected system is producing more power than the consumption, the surplus is fed on to the grid.</p>${feats(ONGRID)}</div>
  <div class="zk-media-panel">${img("ongrid-panel.jpg", "On grid solar system diagram: solar panels, grid tie inverter, net meter, grid")}</div>
</div></div>
<div class="zk-sys"><div class="zk-split zk-split--rev">
  <div><h2 class="zk-sys-t"><em>HYBRID</em> SYSTEM</h2><p class="zk-copy">In Hybrid system, both grid and battery is involved. Systems that are already connected to the electricity grid can start taking advantage of battery storage as well.</p>${feats(HYBRID)}</div>
  <div class="zk-media-panel">${img("hybrid-panel.jpg", "Hybrid solar system diagram: solar panels, hybrid inverter, net meter, battery storage, grid")}</div>
</div></div>
<div class="zk-sys"><div class="zk-split">
  <div><h2 class="zk-sys-t"><em>Battery Energy Storage System</em> (BESS)</h2><p class="zk-copy">BESS stores excess solar energy or electricity from the grid and makes it available later—during the night, power cuts, or peak-demand periods. It helps you maximize solar usage, reduce grid dependence, and keep your home powered when you need it most.</p>${feats(BESS)}</div>
  <div class="zk-media-pair">${img("bess-home.jpg", "Home with solar panels, battery storage and grid connection")}${img("bess-farm.jpg", "Utility scale battery storage connected to solar and wind")}</div>
</div></div>`, "pv-systems");

// ---- smart components (slide 12)
const COMP = [
  ["comp-battery.jpg", "Lithium Battery", ["High Energy Density", "Advanced Safety", "Reliable Backup Power", "Zero Maintenance", "High Durability & Lifecycle"]],
  ["comp-panel.jpg", "TOPCon BiFacial Solar Panel", ["Higher Energy Yield", "Better Performance in Low Light", "Strong Durability", "Lower LID", "G12R Cell Packing"]],
  ["comp-inverter.jpg", "Micro Inverter", ["Panel-Level Optimization", "Reduce power loss", "High Conversion Efficiency", "Independent MPPT", "High Shade Tolerance"]],
];
export const components = () => sec("components", "zk--tint", `${head("", "Smart Components. <em>Reliable Energy.</em>")}
<div class="zk-comp">${COMP.map(([i, t, l]) => `<article><div class="img">${img(i, t)}</div><h3>${t}</h3><ul>${l.map((x) => `<li>${x}</li>`).join("")}</ul></article>`).join("")}</div>`, "smart-components");

// ---- solar aesthetics (slide 13)
const AES = [["aes-roof.jpg", "Power Roof", "Seamless solar integration for your home"], ["aes-gazebo.jpg", "Power Gazebo", "Turn outdoor spaces into energy-generating spaces"], ["aes-ev.jpg", "Power EV Port", "Solar-powered parking with EV charging"], ["aes-canopy.jpg", "Power Canopy", "Smart shade that generates clean energy"]];
export const aesthetics = () => sec("aesthetics", "", `${head("", "SOLAR <em>AESTHETICS</em>", "Where energy savings meet <b>timeless beauty</b>")}
<div class="zk-aes">${AES.map(([i, t, p]) => `<article>${img(i, t)}<div><h3>${t}</h3><p>${p}</p></div></article>`).join("")}</div>`, "solar-aesthetics");

// ---- solar home (slide 10)
const POWERS = [["Air conditioner", "snowflake", "1", "2"], ["Refrigerator", "box", "1", "1"], ["Washing machine", "tshirt", "1", "1"], ["TV", "tv", "1", "1"], ["Fan", "fan", "4 - 5", "5 - 6"], ["LED bulb", "lightbulb", "5 - 6", "6 - 7"], ["Tube light", "minus", "2 - 3", "3 - 4"]];
const plan = (kw, bill, units, area, cls) => `<article class="zk-plan ${cls}"><span class="kw">${kw} KW</span><ul>
  <li>${ico("rupee-sign")}<div><small>Save up to</small><strong>₹${bill}</strong><small>on Bi-monthly Electricity Bills</small></div></li>
  <li>${ico("bolt")}<div><small>Produce an Average of</small><strong>${units} Units Daily</strong></div></li>
  <li>${ico("sun")}<div><small>Need Only</small><strong>${area} Sq.ft</strong><small>of Shade-Free Area</small></div></li></ul></article>`;
export const solarHome = () => sec("solar-home", "zk--tint", `<div class="zk-split zk-split--rev" style="margin-bottom:46px">
  <div class="zk-split-media">${img("solarhome-photo.jpg", "Home with a rooftop solar system")}</div>
  <div><span class="zk-eye">On Grid Solar</span><h2 class="zk-h2">Solar <em>Home</em></h2><span class="zk-bar"></span><p class="zk-lead" style="margin-top:20px">Discover personalized On Grid solar solutions designed for your beautiful home's energy needs and budget.</p>
  <div class="zk-bens two">
    <div>${ico("hand-holding-usd")}Reduce Electricity Bills</div><div>${ico("leaf")}Eco-Friendly Energy</div><div>${ico("shield-alt")}Reliable &amp; Long Lasting</div><div>${ico("tools")}Low Maintenance</div></div></div>
</div>
<div class="zk-plans">${plan(3, "6,000", 12, 300, "p3")}${plan(5, "10,000", 20, 500, "p5")}</div>
<div class="zk-powers"><h3>What can your <em>solar system power?</em></h3><div class="zk-table"><table>
<thead><tr><th></th>${POWERS.map(([n, i]) => `<th scope="col"><i class="fas fa-${i}" aria-hidden="true"></i>${n}</th>`).join("")}</tr></thead>
<tbody><tr><th scope="row">3 KW</th>${POWERS.map((p) => `<td>${p[2]}</td>`).join("")}</tr><tr><th scope="row">5 KW</th>${POWERS.map((p) => `<td>${p[3]}</td>`).join("")}</tr></tbody></table></div></div>`, "solar-home");

// ---- technology partners (slide 14)
const LOGOS = [["emmvee", "Emmvee"], ["waaree", "Waaree"], ["axitec", "Axitec"], ["renewsys", "RenewSys"], ["tata-power", "Tata Power Solaroof"], ["deye", "Deye"], ["solaire", "Solaire"], ["goodwe", "GoodWe"], ["sungrow", "Sungrow"], ["enphase", "Enphase"], ["tsun", "Tsun"], ["havells", "Havells"], ["v-guard", "V-Guard"], ["lauritz-knudsen", "Lauritz Knudsen"], ["mersen", "Mersen"], ["excelerthings", "Excelerthings"], ["ap-apollo", "APL Apollo"], ["lapp", "LAPP"], ["citel", "Citel"], ["legrand", "Legrand"]];
export const partners = () => sec("partners", "zk--tint", `${head("", "Technology <em>Partners</em>", "<b>Trusted Technology Partners</b> for Reliable Energy Solutions")}
<div class="zk-logos">${LOGOS.map(([f, n]) => `<div title="${n}"><img src="/zk/logo-${f}.png" alt="${n}" loading="lazy" decoding="async"></div>`).join("")}</div>`, "technology-partners");

// ---- testimonials (slide 16)
export const quotes = () => sec("quotes", "", `${head("Testimonials", "What Our <em>Clients Say</em>", "<b>Real Feedback</b> from Our Happy Customers")}
<div class="zk-quotes">
  <article class="zk-q"><header>${img("avatar-rahees.jpg", "Rahees")}<div><h3>Rahees</h3><span>Managing Director<br>Wins Autos, Calicut</span></div></header>
    <p>Electricity costs were a major recurring expense that affected our monthly margins. We needed a reliable and sustainable solar power solution to reduce these costs effectively. Choosing <b>Zakion Energy</b> was the best decision we made. Their team handled everything seamlessly—from evaluating our energy needs to smooth installation and completing all the necessary paperwork without any hassle.</p></article>
  <article class="zk-q"><header>${img("avatar-yousuf.jpg", "Mohammed Yousuf")}<div><h3>Mohammed Yousuf</h3><span>Admin Officer<br>Markazul Uloom English School, Kondotty</span></div></header>
    <p>Managing electricity costs was once a major struggle for our institution. By adopting Zakion Energy's solar system, our bill dropped by around 90%. From timely installation to handling KSEB paperwork, <b>Zakion Energy</b> delivered outstanding service and true energy freedom.</p></article>
</div>`, "client-feedback");

// ---- projects delivered (slide 17)
export const delivered = () => sec("delivered", "zk--tint", `<div class="zk-del">
  <div><h2 class="zk-h2">Projects We've <em>Delivered</em></h2><span class="zk-bar"></span><p class="zk-big" style="margin-top:22px">500<em>+</em></p><p class="zk-lead">Installations in Residential, Commercial &amp; Industrial sectors</p><p style="margin-top:24px"><a class="zk-btn" href="/projects/">View our projects</a></p></div>
  <div class="zk-gal">${[1, 2, 3, 4, 5, 6].map((n) => `<a href="/projects/" aria-label="View our projects">${img(`proj-${n}.jpg`, `Rooftop solar installation ${n}`)}</a>`).join("")}</div>
</div>`, "projects-delivered");

// ---- eMobility page: pair charging with solar (deck slide 13, "Power EV Port")
export const evSolar = () => sec("ev-solar", "zk--tint", `<div class="zk-split">
  <div><span class="zk-eye">Solar + EV</span><h2 class="zk-h2">Power your <em>EV Port</em> with the sun</h2><span class="zk-bar"></span>
  <p class="zk-lead" style="margin-top:20px">Solar-powered parking with EV charging.</p>
  <p class="zk-copy">Our Power EV Port turns a parking space into an energy-generating one: solar panels shade the vehicle and generate clean energy while it charges. It sits alongside our other solar aesthetics: Power Roof, Power Gazebo and Power Canopy.</p>
  <p style="margin-top:24px"><a class="zk-btn" href="/services/photovoltaic-solutions/">Explore solar solutions</a></p></div>
  <div class="zk-split-media">${img("aes-ev.jpg", "Solar-powered EV port with a car charging underneath")}</div>
</div>`, "ev-solar");

// ---- link from the PV page to the Solar Home plans
export const homeTeaser = () => sec("home-teaser", "", `<div class="zk-teaser"><div><h2 class="zk-h2" style="font-size:clamp(28px,3.4vw,40px)">Planning solar for <em>your home?</em></h2><p class="zk-sub">See our 3 kW and 5 kW On Grid plans: savings, daily units and the roof area you need.</p></div><a class="zk-btn" href="/services/solar-home/">Explore Solar Home</a></div>`, "solar-home-teaser");

// ---- closing call to action (slide 18)
export const cta = () => sec("cta", "", `<div class="zk-cta-box">
  <h2 class="zk-h2">Power Your Future <em>with Zakion</em></h2><p class="zk-sub" style="color:#cfdcf5;font-size:20px">Clean Energy Today. Sustainable Tomorrow.</p><span class="zk-wave"></span>
  <div class="zk-cta-row"><a class="zk-btn" href="/contact/">Schedule Your Free Consultation</a><a class="zk-btn zk-btn--line" href="${TEL1}">Call ${PHONE1}</a></div>
  <q>Every solar installation is more than a project—it is a step towards energy independence, lower emissions, and a brighter future for generations to come. At Zakion Energy, we are proud to be your trusted partner in this journey.</q>
</div>`, "power-your-future");

// ---- contact (slide 19)
export const connect = () => sec("connect", "", `<div class="zk-connect">
  <div><span class="zk-eye">Let's Talk</span><h2 class="zk-h2">Let's Power Your Future Together</h2><p class="zk-sub">Ready to Switch to Clean Solar Energy?</p><span class="zk-bar"></span>
  <ul class="zk-clist">
    <li>${ico("phone")}<div><b>Call us</b><a href="${TEL1}">${PHONE1}</a><br><a href="${TEL2}">${PHONE2}</a></div></li>
    <li>${ico("envelope")}<div><b>Email</b><a href="mailto:${EMAIL}">${EMAIL}</a></div></li>
    <li>${ico("globe")}<div><b>Website</b><a href="https://www.zakionenergy.com">www.zakionenergy.com</a></div></li>
    <li>${ico("map-marker-alt")}<div><b>Calicut office</b><span>63/700, D Space, Sky Tower, Bank Road, Calicut - 673001</span></div></li>
    <li>${ico("map-marker-alt")}<div><b>Pulamanthole office</b><span>Kalathil Complex, opp. Federal Bank, Pulamanthole, Kerala 679323</span></div></li>
  </ul></div>
  <div><div class="zk-consult"><h3>Schedule Your Free Consultation Today</h3><p>Discover how solar can reduce your energy costs and power a sustainable future.</p><a class="zk-btn" href="${TEL1}">Call ${PHONE1}</a></div>
  <div class="zk-qr">${img("qr.jpg", "QR code to visit the Zakion Energy website")}<div><h3>Scan to Connect</h3><p>Scan to visit our website or contact us instantly.</p><div class="zk-soc">
    <a href="https://www.facebook.com/zakionenergy/" aria-label="Facebook" rel="noopener"><i class="fab fa-facebook-f" aria-hidden="true"></i></a>
    <a href="https://www.instagram.com/zakionenergy/" aria-label="Instagram" rel="noopener"><i class="fab fa-instagram" aria-hidden="true"></i></a>
    <a href="https://in.linkedin.com/company/zakion-energy" aria-label="LinkedIn" rel="noopener"><i class="fab fa-linkedin-in" aria-hidden="true"></i></a>
    <a href="https://wa.me/919188944337" aria-label="WhatsApp" rel="noopener"><i class="fab fa-whatsapp" aria-hidden="true"></i></a></div></div></div></div>
</div>`, "get-in-touch");

// ---- Solar Home page extras
export const sectionNames = ["about", "why", "stats", "vision", "story", "roi", "systems", "components", "aesthetics", "solar-home", "partners", "quotes", "delivered", "cta", "connect"];
