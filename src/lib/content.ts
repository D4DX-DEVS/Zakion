// Editable content for the page sections. Every section has a schema (drives the admin editor) and defaults (the text and
// images from the ZaKion Energy deck). Saved edits live in D1 (table site_content) and are merged over the defaults, so the
// site keeps rendering if the table is empty or missing.
import { db } from "./env";

export type Field = {
  k: string;
  label: string;
  type: "text" | "textarea" | "lines" | "number" | "bool" | "select" | "image" | "video" | "file" | "list" | "color";
  help?: string;
  options?: string[];
  fields?: Field[]; // list item fields
  max?: number; // list: most items allowed
  itemLabel?: string; // list: "Add <itemLabel>"
  min?: number;
  editor?: "menu" | "links"; // list: edit it with the menu editor (add, edit, delete, reorder; "menu" also has submenu items)
  spec?: string; // image/video/file: the size and format to upload, shown in a highlighted note beside the upload button
};
export type SectionDef = { key: string; title: string; page: string; help: string; fields: Field[]; data: Record<string, unknown> };
export type Content = Record<string, any>;

export const ICONS = ["sun", "bolt", "house", "panel", "rupee", "chart", "bank", "doc", "bulb", "leaf", "shield", "gear", "battery", "ac", "fridge", "wash", "tv", "fan", "tube", "globe", "hardhat", "award", "clock", "headset", "wrench", "users", "trend", "swap", "ban", "search", "chat", "ruler", "truck", "gauge", "power", "cycle"];

const T = (k: string, label: string, help?: string): Field => ({ k, label, type: "text", help });
const TA = (k: string, label: string, help?: string): Field => ({ k, label, type: "textarea", help });
const LN = (k: string, label: string, help = "One item per line."): Field => ({ k, label, type: "lines", help });
const IMG = (k: string, label: string, help?: string): Field => ({ k, label, type: "image", help });
const LIST = (k: string, label: string, itemLabel: string, fields: Field[], max = 40, min = 0): Field => ({ k, label, type: "list", itemLabel, fields, max, min });
const NUM = (k: string, label: string, help?: string): Field => ({ k, label, type: "number", help });
const FILE = (k: string, label: string, help?: string): Field => ({ k, label, type: "file", help });
const BOOL = (k: string, label: string, help?: string): Field => ({ k, label, type: "bool", help });
const SEL = (k: string, label: string, options: string[], help?: string): Field => ({ k, label, type: "select", options, help });

// The home page sections in their default order (the page plan in home.ts uses this too). The admin can reorder or hide them.
export const HOME_KEYS = ["about", "track", "vision", "story", "why", "renewable", "onGrid", "hybrid", "bess", "solarHome", "components", "aesthetics", "roi", "process", "partners", "testimonials", "projects", "cta", "contact"];

// Which blocks each page shows by default, in order. The inner pages keep their own banner (page title and breadcrumb) on top.
// The admin can reorder, remove and add blocks on every page (Site settings > Section order); the result is kept in the layout below.
export const PAGE_DEFAULTS: Record<string, string[]> = {
  "/": HOME_KEYS,
  "/about-us/": ["about", "track", "vision", "story", "why", "process"],
  "/services/": ["onGrid", "hybrid", "bess", "components", "aesthetics", "process"],
  "/projects/": ["projects", "track", "testimonials"],
  "/contact/": ["contact"],
  "/blog/": [],
};
export const PAGE_TITLES: Record<string, string> = { "/": "Home", "/about-us/": "About Us", "/services/": "Solutions", "/projects/": "Projects", "/contact/": "Contact", "/blog/": "Blog" };

/** Home page layout kept by the admin in site_content under the key "_layout": section order, hidden sections, per-section settings,
 *  and (for the other pages) the blocks each one shows, in order. */
export const LAYOUT_KEY = "_layout";
/** Look and feel chosen under Site settings (theme colours, fonts, layout), kept under this key. Read it with siteOf() in site.ts. */
export const SITE_KEY = "_site";
export const SPACINGS = ["compact", "standard", "roomy"] as const;
export type Layout = { order: string[]; hidden: string[]; settings: Record<string, { spacing: (typeof SPACINGS)[number]; anim: "on" | "off" }>; pages: Record<string, string[]> };

export function cleanLayout(input: unknown): Layout {
  const src: any = input && typeof input === "object" ? input : {};
  const list = (v: unknown) => (Array.isArray(v) ? v.map(String) : []);
  const order = [...new Set([...list(src.order).filter((k) => HOME_KEYS.includes(k)), ...HOME_KEYS])];
  const hidden = [...new Set(list(src.hidden).filter((k) => HOME_KEYS.includes(k)))];
  const settings: Layout["settings"] = {};
  const st = src.settings && typeof src.settings === "object" ? src.settings : {};
  for (const k of [...HOME_KEYS, "hero"]) {
    const v = st[k] ?? {};
    const spacing = (SPACINGS as readonly string[]).includes(v.spacing) ? v.spacing : "standard";
    const anim = v.anim === "off" ? "off" : "on";
    if (spacing !== "standard" || anim !== "on") settings[k] = { spacing, anim };
  }
  const pages: Layout["pages"] = {};
  const pg = src.pages && typeof src.pages === "object" ? src.pages : {};
  for (const p of Object.keys(PAGE_DEFAULTS)) if (p !== "/" && Array.isArray(pg[p])) pages[p] = [...new Set(list(pg[p]).filter((k) => HOME_KEYS.includes(k)))];
  return { order, hidden, settings, pages };
}

export const MARKUP_HELP = "Use ==text== for the amber highlight and **text** for bold.";

// The picture behind the title at the top of each inner page. "where" says which pages use it (the matching is in banners.ts); "image" is the
// built-in picture, a photo from the media library, used until the admin picks another one (or empties the field).
export const BANNER_PAGES: { key: string; label: string; where: string; image: string }[] = [
  { key: "about", label: "About Us", where: "the About Us page", image: "/media/2024/03/post-1.jpg" },
  { key: "solutions", label: "Solutions (main page)", where: "the Solutions page and any other page under it", image: "/media/2024/03/hero-2.jpg" },
  { key: "pv", label: "Photovoltaic Solutions", where: "the Photovoltaic Solutions page", image: "/media/2024/03/header-banner.jpg" },
  { key: "solarHome", label: "Solar Home", where: "the Solar Home page", image: "/zk/solarhome-photo.jpg" },
  { key: "energy", label: "Energy Engineering", where: "the Energy Engineering page", image: "/media/2024/03/post-6.jpg" },
  { key: "emobility", label: "EV Charging Infrastructure", where: "the EV Charging Infrastructure page", image: "/media/2024/03/emobility.webp" },
  { key: "projects", label: "Projects", where: "the Projects page and every project page", image: "/media/2024/03/video-bg.jpg" },
  { key: "contact", label: "Contact", where: "the Contact page", image: "/media/2024/03/post-2.jpg" },
  { key: "blog", label: "Blog", where: "the Blog page, its categories and every article", image: "/media/2024/03/post-4.jpg" },
  { key: "other", label: "Any other page", where: "every page that is not listed above", image: "/zk/page-hero.jpg" },
];
const BANNER_SPEC = "Image size: 1920 × 600 px (width × height), a wide strip. Smallest that still looks sharp: 1600 × 500 px. JPG or WebP, ideally under 500 KB so the page opens fast (up to 15 MB is accepted). The picture fills the strip behind the page title, so only a band across the middle shows: keep the main subject in the middle. The left side is darkened so the white title stays easy to read.";

export const SECTIONS: SectionDef[] = [
  {
    key: "hero", title: "Home banner", page: "Home", help: "The banner at the top of the home page, full width and as tall as its picture. Add slides: each one is an image or a video. One slide is a still banner (or a looping video). Two or more make a slider: an image stays for a few seconds, a video plays to its end, then the next slide appears by itself, and visitors can use the arrows and dots.",
    fields: [
      T("eyebrow", "Small heading"), T("title", "Main heading", "Use ==text== to colour a word amber."), TA("subtitle", "Paragraph"),
      T("btn1Text", "Button 1 label", "A button only shows when both its label and its link are filled in."), T("btn1Link", "Button 1 link", "Leave the label or the link empty to hide this button."), T("btn2Text", "Button 2 label", "A button only shows when both its label and its link are filled in."), T("btn2Link", "Button 2 link", "Leave the label or the link empty to hide this button."),
      {
        k: "slides", label: "Banner slides (up to 8)", type: "list", itemLabel: "slide", max: 8,
        help: "Each slide is one image or one video: fill in the image or the video, not both (if both are filled in, the video is used). Use the up and down arrows to change the order. The banner is as wide as the page and as tall as the slide's own picture, so nothing is cropped; for a slider, give every slide the same shape (16:9 is best) so the banner does not change height.",
        fields: [
          {
            k: "image", label: "Image", type: "image",
            spec: "Image size: 1920 × 1080 px (width × height), landscape 16:9. Smallest that still looks sharp: 1600 × 900 px. JPG or WebP, ideally under 500 KB so the page opens fast (up to 15 MB is accepted).",
            help: "For an image slide. Leave the video below empty.",
          },
          {
            k: "video", label: "Video (MP4/WebM)", type: "video",
            spec: "Video size: 1920 × 1080 px (width × height), landscape 16:9 is the usual choice, but any shape works. Smallest that still looks sharp: 1280 × 720 px. MP4 (H.264), up to 25 MB.",
            help: "For a video slide. In a slider the video plays once to its end and then the next slide appears; a banner with only this one video plays it again and again. It plays with sound where the browser allows it, otherwise it starts muted and the sound switches on at the visitor's first click or tap. Visitors can pause it and turn the sound on or off.",
          },
          T("alt", "Description (for screen readers)", "Optional. A few words saying what the slide shows."),
        ],
      },
      NUM("slideSeconds", "Seconds on each image", "Only for image slides in a slider (2 or more slides). Between 3 and 20. A video slide plays to its end."),
      T("youtube", "YouTube video link", "Used only when there are no slides at all. It is looped with a cross-fade so there is no pause."),
    ],
    data: { eyebrow: "Welcome to Zakion Energy", title: "Powering the Future With ==Renewable.==", subtitle: "Premium renewable energy solutions for a sustainable tomorrow. Powering homes. Empowering businesses. Building a sustainable future.", btn1Text: "Our Services", btn1Link: "/services/", btn2Text: "Contact Now", btn2Link: "/contact/", slides: [], slideSeconds: 6, youtube: "https://www.youtube.com/watch?v=TzfnlPxCZv0" },
  },
  {
    key: "about", title: "About Zakion Energy", page: "Home, About Us", help: MARKUP_HELP,
    fields: [T("title", "Heading"), TA("tagline", "Tagline"), TA("body", "Paragraph"), LIST("features", "Highlights under the paragraph", "highlight", [SEL("icon", "Icon", ICONS), T("text", "Text")], 4), T("certTitle", "Certifications heading"), IMG("certImage", "Certifications image"), IMG("image", "Photo")],
    data: { title: "About ==Zakion Energy==", tagline: "Powering Homes. Empowering Businesses.\nBuilding a **Sustainable Future.**", body: "We are a team of social entrepreneurs and engineering professionals dedicated to enrich lifestyle experience and contribute infrastructure through renewable energy and sustainable concepts.", features: [{ icon: "leaf", text: "Renewable Energy Solutions" }, { icon: "house", text: "Energy for a Better Life" }, { icon: "globe", text: "A Greener Tomorrow" }], certTitle: "Approvals & Certifications", certImage: "/zk/cert-logos-clean.jpg", image: "/zk/about-team.jpg" },
  },
  {
    key: "vision", title: "Vision and Mission", page: "Home, About Us", help: "The amber Vision card and the navy Mission card.",
    fields: [IMG("bg", "Top background photo"), IMG("city", "Bottom city illustration"), T("visionTitle", "Vision heading"), TA("visionText", "Vision text"), T("missionTitle", "Mission heading"), TA("missionText", "Mission text")],
    data: { bg: "/zk/vision-bg.jpg", city: "/zk/city-strip.jpg", visionTitle: "Our Vision", visionText: "Make footprints in global march towards energy sustainability.", missionTitle: "Our Mission", missionText: "Since the inception of Zakion in 2015, our instinct is to contribute to the global sustainability initiative and enable access to affordable energy to people in every corner of the world. Our strength lies in the pool of experts and core industrial knowledge, with which we aim to become a pioneer in energy engineering." },
  },
  {
    key: "story", title: "Our Story timeline", page: "Home, About Us", help: "The year-by-year cards. Tick \"Present stage\" on the latest one.",
    fields: [T("eyebrow", "Small heading"), T("title", "Heading"), T("presentLabel", "Present stage label"),
      LIST("items", "Timeline cards", "card", [T("year", "Year"), T("title", "Title"), TA("text", "Text"), IMG("image", "Photo"), BOOL("present", "Present stage")], 8)],
    data: {
      eyebrow: "From Innovation to Renewable Energy", title: "Our Story", presentLabel: "Present Stage",
      items: [
        { year: "2015", title: "The Beginning", text: "Founded in 2015, with successfully delivered home automation system projects.", image: "/zk/story-2015.jpg", present: false },
        { year: "2017", title: "Expanding into Energy", text: "Expanded into ELV and Solar Energy, broadening Zakion's expertise into energy-related solutions.", image: "/zk/story-2017.jpg", present: false },
        { year: "2020", title: "Zakion Energy", text: "Started Zakion Energy, marking the beginning of a dedicated focus on the energy sector.", image: "/zk/story-2020.jpg", present: false },
        { year: "2026", title: "Growing with Renewable Energy", text: "Today, Zakion Energy is actively operating and growing in the renewable energy sector, continuing its journey towards delivering sustainable energy solutions.", image: "/zk/story-2026.jpg", present: true },
      ],
    },
  },
  {
    key: "why", title: "Why Choose Zakion", page: "Home, About Us", help: MARKUP_HELP,
    fields: [T("title", "Heading"), IMG("image", "Side photo"), LIST("items", "Reasons", "reason", [T("title", "Title"), SEL("icon", "Icon", ["auto", ...ICONS], "Auto picks an icon that suits the title."), TA("text", "Text")], 12)],
    data: {
      title: "Why Choose ==Zakion?==", image: "/zk/helmet.jpg",
      items: [
        { title: "Certified Engineers", icon: "hardhat", text: "Experienced professionals ensuring safe and high-quality installations." },
        { title: "Premium Components", icon: "award", text: "Trusted brands and certified equipments for reliable performance." },
        { title: "Subsidy Assistance", icon: "rupee", text: "Complete guidance for subsidy eligibility and documentation." },
        { title: "Complete EPC Solutions", icon: "gear", text: "Consultation, design, procurement, installation, and support." },
        { title: "Fast Installation", icon: "bolt", text: "Efficient project execution with timely completion and quality." },
        { title: "Dedicated Support", icon: "headset", text: "Ongoing customer support, maintenance guidance, and service." },
      ],
    },
  },
  {
    key: "renewable", title: "Why Renewable Energy", page: "Home", help: MARKUP_HELP,
    fields: [T("title", "Heading"), LIST("items", "Benefit cards", "benefit", [T("title", "Title", "Use **text** for bold."), TA("text", "Short description")], 12)],
    data: {
      title: "Why ==Renewable Energy?==",
      items: [
        { title: "Save on **Electricity Bills**", text: "Going solar can eliminate your electricity bills completely or reduce them." },
        { title: "One-Time Investment **for 25 Years**", text: "A one-time investment that pays itself back through zero electricity bills." },
        { title: "**Reduce** Carbon Footprint", text: "Solar instead of fossil fuels sharply cuts CO₂ and greenhouse gas emissions." },
        { title: "**Reduce** Global Warming", text: "Lower your dependence on fossil fuels and help limit global warming." },
        { title: "Eco-Friendly & **Sustainable Living**", text: "Reduce your use of the Earth's natural resources." },
        { title: "Limitless & **Everlasting Energy**", text: "The sun provides more than enough energy, and it won't run out." },
      ],
    },
  },
  {
    key: "onGrid", title: "On Grid System", page: "Home, Solutions", help: MARKUP_HELP,
    fields: [T("badge", "Small label above the heading"), T("title", "Heading"), TA("text", "Paragraph"), IMG("image", "Diagram photo"), LIST("features", "Benefits", "benefit", [SEL("icon", "Icon", ["auto", ...ICONS], "Auto picks an icon that suits the title."), T("title", "Title"), TA("text", "Text")], 8)],
    data: {
      badge: "01 · Grid connected", title: "==ON GRID== SYSTEM", text: "In On Grid System, the electricity generated by solar is used by the property. If a grid connected system is producing more power than the consumption, the surplus is fed on to the grid.", image: "/zk/ongrid-panel.jpg",
      features: [
        { icon: "trend", title: "Reduce Electricity Bills", text: "Generate your own clean energy and lower your monthly electricity costs." },
        { icon: "swap", title: "Net Metering Benefits", text: "Earn credits for surplus power sent to the grid through net metering." },
        { icon: "ban", title: "Zero Fuel Cost", text: "Solar energy is free and abundant - power your home or business at zero fuel cost." },
        { icon: "leaf", title: "Eco-Friendly Solution", text: "Reduce carbon footprint and contribute to a greener, sustainable future." },
      ],
    },
  },
  {
    key: "hybrid", title: "Hybrid System", page: "Home, Solutions", help: MARKUP_HELP,
    fields: [T("badge", "Small label above the heading"), T("title", "Heading"), TA("text", "Paragraph"), IMG("image", "Diagram photo"), LIST("features", "Benefits", "benefit", [SEL("icon", "Icon", ["auto", ...ICONS], "Auto picks an icon that suits the title."), T("title", "Title"), TA("text", "Text")], 8)],
    data: {
      badge: "02 · Grid + battery", title: "==HYBRID== SYSTEM", text: "In Hybrid system, both grid and battery is involved. Systems that are already connected to the electricity grid can start taking advantage of battery storage as well.", image: "/zk/hybrid-panel.jpg",
      features: [
        { icon: "bolt", title: "Uninterrupted Power", text: "Battery backup ensures power during outages and load shedding." },
        { icon: "sun", title: "Maximize Solar Usage", text: "Store excess solar energy and use it whenever you need." },
        { icon: "trend", title: "Smarter Savings", text: "Reduce reliance on the grid and lower electricity bills." },
        { icon: "shield", title: "Energy Independence", text: "Greater control, reliability and peace of mind for your home." },
      ],
    },
  },
  {
    key: "bess", title: "Battery Energy Storage (BESS)", page: "Home, Solutions", help: MARKUP_HELP,
    fields: [T("badge", "Small label above the heading"), T("title", "Heading"), TA("text", "Paragraph"), IMG("image", "Large photo"), IMG("image2", "Small photo"), LIST("features", "Benefits", "benefit", [SEL("icon", "Icon", ["auto", ...ICONS], "Auto picks an icon that suits the title."), T("title", "Title"), TA("text", "Text")], 8)],
    data: {
      badge: "03 · Storage", title: "==Battery Energy Storage System== (BESS)", text: "BESS stores excess solar energy or electricity from the grid and makes it available later—during the night, power cuts, or peak-demand periods. It helps you maximize solar usage, reduce grid dependence, and keep your home powered when you need it most.", image: "/zk/bess-home.jpg", image2: "/zk/bess-farm.jpg",
      features: [
        { icon: "bolt", title: "Backup Power", text: "Keeps essential appliances running during power cuts." },
        { icon: "battery", title: "Store Solar Energy", text: "Save excess solar power generated during the day for later use." },
        { icon: "trend", title: "Reduce Electricity Bills", text: "Use stored energy during high-tariff periods and reduce grid consumption." },
        { icon: "shield", title: "Energy Independence", text: "Less dependence on the grid with reliable, on-demand power for your home & business." },
      ],
    },
  },
  {
    key: "solarHome", title: "Solar Home (3 KW and 5 KW)", page: "Home", help: "Two plans are shown side by side. The table uses the same two plans.",
    fields: [T("title", "Heading"), TA("subtitle", "Subheading"), { ...IMG("photo", "House picture", "The picture on the right. The standard photo is animated: by day sunlight reaches the solar panels, then it turns to a dark night and the lights inside the house blink behind the windows. Any other picture is shown as it is. Clear it to show the drawn neon house instead."), spec: "Picture size: 1600 × 900 px (width × height), landscape 16:9, JPG or WebP, under 500 KB if you can. On a computer the middle of the picture is shown, so keep the house in the centre." },
      LIST("plans", "Plans (first two are shown)", "plan", [T("label", "Name (for example 3 KW)"), T("saving", "Bi-monthly saving"), T("units", "Daily units"), T("area", "Area needed")], 2, 2),
      T("powerTitle", "Table heading"),
      LIST("appliances", "What the system can power", "appliance", [T("name", "Appliance"), SEL("icon", "Icon", ICONS), T("v1", "Quantity for plan 1"), T("v2", "Quantity for plan 2")], 12),
      LIST("perks", "Bottom benefits", "benefit", [SEL("icon", "Icon", ICONS), T("text", "Text")], 6)],
    data: {
      title: "Solar ==Home==", subtitle: "Discover personalized On Grid solar solutions designed for your beautiful home's energy needs and budget.", photo: "/zk/solarhome-photo.jpg",
      plans: [{ label: "3 KW", saving: "₹6,000", units: "12 Units", area: "300 Sq.ft" }, { label: "5 KW", saving: "₹10,000", units: "20 Units", area: "500 Sq.ft" }],
      powerTitle: "What can your solar system ==power?==",
      appliances: [
        { name: "Air conditioner", icon: "ac", v1: "1", v2: "2" }, { name: "Refrigerator", icon: "fridge", v1: "1", v2: "1" }, { name: "Washing machine", icon: "wash", v1: "1", v2: "1" },
        { name: "TV", icon: "tv", v1: "1", v2: "1" }, { name: "Fan", icon: "fan", v1: "4 - 5", v2: "5 - 6" }, { name: "LED bulb", icon: "bulb", v1: "5 - 6", v2: "6 - 7" }, { name: "Tube light", icon: "tube", v1: "2 - 3", v2: "3 - 4" },
      ],
      perks: [{ icon: "leaf", text: "Reduce Electricity Bills" }, { icon: "globe", text: "Eco-Friendly Energy" }, { icon: "shield", text: "Reliable & Long Lasting" }, { icon: "gear", text: "Low Maintenance" }],
    },
  },
  {
    key: "components", title: "Smart Components", page: "Home, Solutions", help: "Product cards. \"Blend point\" is where the photo's own background colour starts (leave as is for the default photos).",
    fields: [T("title", "Heading", MARKUP_HELP),
      LIST("items", "Products", "product", [T("title", "Name"), IMG("image", "Photo"), LN("bullets", "Highlights"), SEL("color", "Header colour", ["navy", "amber"]), NUM("cut", "Blend point (% of photo height)")], 6)],
    data: {
      title: "==Smart Components.== Reliable Energy.",
      items: [
        { title: "Lithium Battery", image: "/zk/comp-battery.jpg", bullets: "High Energy Density\nAdvanced Safety\nReliable Backup Power\nZero Maintenance\nHigh Durability & Lifecycle", color: "navy", cut: 93 },
        { title: "TOPCon BiFacial Solar Panel", image: "/zk/comp-panel.jpg", bullets: "Higher Energy Yield\nBetter Performance in Low Light\nStrong Durability\nLower LID\nG12R Cell Packing", color: "amber", cut: 24 },
        { title: "Micro Inverter", image: "/zk/comp-inverter.jpg", bullets: "Panel-Level Optimization\nReduce power loss\nHigh Conversion Efficiency\nIndependent MPPT\nHigh Shade Tolerance", color: "navy", cut: 30 },
      ],
    },
  },
  {
    key: "aesthetics", title: "Solar Aesthetics", page: "Home, Solutions", help: "Items fill two panels, two per panel.",
    fields: [T("title", "Heading", MARKUP_HELP), T("subtitle", "Subheading"), LIST("items", "Items", "item", [T("title", "Title"), TA("text", "Text"), IMG("image", "Photo")], 8)],
    data: {
      title: "SOLAR ==AESTHETICS==", subtitle: "Where energy savings meet **timeless beauty**",
      items: [
        { title: "Power Roof", text: "Seamless solar integration for your home", image: "/zk/aes-roof.jpg" },
        { title: "Power EV Port", text: "Solar-powered parking with EV charging", image: "/zk/aes-ev.jpg" },
        { title: "Power Gazebo", text: "Turn outdoor spaces into energy-generating spaces", image: "/zk/aes-gazebo.jpg" },
        { title: "Power Canopy", text: "Smart shade that generates clean energy", image: "/zk/aes-canopy.jpg" },
      ],
    },
  },
  {
    key: "roi", title: "Return on Investment", page: "Home", help: MARKUP_HELP,
    fields: [TA("title", "Heading"), IMG("image", "Banner photo"), T("beforeTitle", "Before card heading"), LN("beforePoints", "Before card points"), T("afterTitle", "After card heading"), LN("afterPoints", "After card points"), T("conceptTitle", "Third card heading"), TA("conceptText", "Third card text"), T("note", "Note"),
      LIST("cards", "Benefit cards", "card", [SEL("icon", "Icon", ICONS), T("title", "Title"), TA("text", "Text")], 8)],
    data: {
      title: "Return on\nInvestment", image: "/zk/roi-house.jpg", beforeTitle: "Before Solar", beforePoints: "Higher grid reliance\nHigher electricity bills\nSubject to rate hikes", afterTitle: "After Solar", afterPoints: "Direct solar generation\nLower grid consumption\nReduced power bills",
      conceptTitle: "Illustrative Concept", conceptText: "Generating your own power directly offsets energy purchased from the utility, minimizing monthly grid outlays.", note: "Actual savings vary with system size, local solar irradiance, tariff structure and household consumption patterns.",
      cards: [
        { icon: "rupee", title: "Easy EMI Plans", text: "Get solar power with easy monthly installments, ranging from 6 to 60 months." },
        { icon: "chart", title: "Greater ROI", text: "Earn more with your solar investment, with returns ranging from 22% to 30% for On-Grid Solar systems." },
        { icon: "bank", title: "Government Subsidy", text: "Save big with a ₹78,000 subsidy for residential solar plants of 3KW and above." },
        { icon: "doc", title: "Tax Benefits", text: "Enjoy tax savings with income tax depreciation benefits for your solar plant." },
      ],
    },
  },
  {
    key: "process", title: "Our Work Process", page: "Home, About Us, Solutions", help: MARKUP_HELP,
    fields: [T("title", "Heading"), T("subtitle", "Subheading"), LIST("steps", "Steps", "step", [T("title", "Step name"), SEL("icon", "Icon", ["auto", ...ICONS], "Auto picks an icon that suits the step name.")], 16)],
    data: { title: "Our Work ==Process==", subtitle: "From First Assessment to Long-Term Performance in **8 Steps**", steps: ["Site Auditing", "Consulting", "Designing & Architecting", "Supply of Material", "Installation", "Testing", "Commissioning", "AMC"].map((title) => ({ title })) },
  },
  {
    key: "track", title: "Our Track Record", page: "Home, About Us, Projects", help: "Numbers count up when scrolled into view. A value such as 05+ or 500+ counts up; anything else (24/7) is shown as typed.",
    fields: [T("title", "Heading", MARKUP_HELP), T("subtitle", "Subheading"), IMG("image", "Panel background photo"), LIST("stats", "Numbers", "number", [T("value", "Value (for example 500+)"), T("label", "Label"), T("sub", "Small text")], 8)],
    data: {
      title: "Our ==Track Record==", subtitle: "Trusted Experience. Real Projects. Satisfied Customers.", image: "/zk/track-bg.jpg",
      stats: [{ value: "05+", label: "Years", sub: "Industry Experience" }, { value: "500+", label: "Projects Completed", sub: "Residential & Commercial" }, { value: "1000+", label: "Customers", sub: "Happy & Sustainable" }, { value: "24/7", label: "Support", sub: "Dedicated Assistance" }],
    },
  },
  {
    key: "partners", title: "Technology Partners (logo carousel)", page: "Home", help: "Scrolling logo carousel. Add, remove and reorder the logos here and choose how it moves.",
    fields: [T("title", "Heading", MARKUP_HELP), TA("subtitle", "Subheading"),
      NUM("rows", "Rows of logos (1 to 3)"), NUM("speed", "Seconds for one full loop", "Higher is slower. 30 is a calm pace."),
      SEL("direction", "Direction", ["left", "right"]), BOOL("pauseOnHover", "Pause when the mouse is over the carousel"),
      SEL("hoverEffect", "Logo colour", ["Colour, grayscale on hover", "Grayscale, colour on hover", "Always colour (no effect)"]),
      LIST("logos", "Logos", "logo", [T("name", "Company name"), IMG("image", "Logo image"), T("url", "Link (optional)")], 60)],
    data: {
      title: "Technology ==Partners==", subtitle: "**Trusted Technology Partners** for\nReliable Energy Solutions", rows: 2, speed: 34, direction: "left", pauseOnHover: true, hoverEffect: "Colour, grayscale on hover",
      logos: [["emmvee", "Emmvee"], ["waaree", "Waaree"], ["axitec", "Axitec"], ["renewsys", "RenewSys"], ["tata-power", "Tata Power Solaroof"], ["deye", "Deye"], ["solaire", "Solaire"], ["goodwe", "GoodWe"], ["sungrow", "Sungrow"], ["enphase", "Enphase"],
        ["tsun", "TSUN"], ["havells", "Havells"], ["v-guard", "V-Guard"], ["lauritz-knudsen", "Lauritz Knudsen"], ["mersen", "Mersen"], ["excelerthings", "Excelerthings"], ["ap-apollo", "APL Apollo"], ["lapp", "LAPP"], ["citel", "Citel"], ["legrand", "Legrand"]]
        .map(([f, name]) => ({ name, image: `/zk/logo-${f}.png`, url: "" })),
    },
  },
  {
    key: "testimonials", title: "Testimonials (carousel)", page: "Home, Projects", help: "Two testimonials show at a time on a computer, one on a phone. Add more and visitors can scroll through them. A testimonial can be a written quote, a video, or both: upload a video on the testimonial and it plays right in the card.",
    fields: [T("title", "Heading", MARKUP_HELP), TA("subtitle", "Subheading"), BOOL("autoplay", "Slide automatically"), NUM("interval", "Seconds between slides"),
      LIST("items", "Testimonials", "testimonial", [
      T("name", "Name"), T("role", "Job title"), T("company", "Company or place"), TA("quote", "Testimonial", "Use **text** for bold. Optional when you add a video."), IMG("avatar", "Photo"),
      { k: "video", label: "Video (optional)", type: "video", spec: "Video: MP4 (H.264) or WebM, up to 25 MB. Landscape 16:9 (1280 × 720 px) fits the card best; a portrait phone video also works and is shown with black bars.", help: "Visitors press play in the card; only one testimonial video plays at a time, and the carousel will not slide away while one is playing." },
      IMG("poster", "Video cover picture (optional)", "The picture shown before the video plays. Leave it empty to show the first frame of the video."),
    ], 40)],
    data: {
      title: "what our\n==clients say==", subtitle: "**Real Feedback** from\nOur Happy Customers", autoplay: true, interval: 7,
      items: [
        { name: "Rahees", role: "Managing Director", company: "Wins Autos, Calicut", quote: "Electricity costs were a major recurring expense that affected our monthly margins. We needed a reliable and sustainable power solution to reduce these costs effectively. Choosing **Zakion Energy** was the best decision we made. Their team handled everything seamlessly—from evaluating our energy needs to smooth installation and completing all the necessary paperwork without any hassle.", avatar: "/zk/avatar-rahees.jpg" },
        { name: "Mohammed Yousuf", role: "Admin Officer", company: "Markazul Uloom English School, Kondotty", quote: "Managing electricity costs was once a major struggle for our institution. By adopting Zakion Energy's solar system, our bill dropped by around 90%. From timely installation to handling all KSEB paperwork, Zakion Energy delivered outstanding service and true energy freedom.", avatar: "/zk/avatar-yousuf.jpg" },
      ],
    },
  },
  {
    key: "projects", title: "Projects We've Delivered", page: "Home, Projects", help: "The photo grid. Each photo can link to a page.",
    fields: [TA("title", "Heading", MARKUP_HELP), T("count", "Big number"), TA("caption", "Caption under the number"), LIST("photos", "Project photos", "photo", [IMG("image", "Photo"), T("alt", "Description"), T("url", "Link (optional)")], 24)],
    data: {
      title: "Projects\n==We've\nDelivered==", count: "500+", caption: "Installations in Residential,\nCommercial & Industrial sectors",
      photos: [1, 2, 3, 4, 5, 6].map((n) => ({ image: `/zk/proj-${n}.jpg?v=2`, alt: `Solar installation project ${n}`, url: "/projects/" })),
    },
  },
  {
    key: "cta", title: "Call to action (Power Your Future)", page: "Home", help: MARKUP_HELP,
    fields: [TA("title", "Heading"), T("sub", "Subheading"), TA("quote", "Quote"), T("btn1Text", "Button 1 label"), T("btn1Link", "Button 1 link"), T("btn2Text", "Button 2 label"), T("btn2Link", "Button 2 link"), IMG("image", "Photo")],
    data: { title: "Power Your Future\n==with Zakion==", sub: "Clean Energy Today. Sustainable Tomorrow.", quote: "\"Every solar installation is more than a project—it is a step towards energy independence, lower emissions, and a brighter future for generations to come. At Zakion Energy, we are proud to be your trusted partner in this journey.\"", btn1Text: "Book a free consultation", btn1Link: "/contact/", btn2Text: "Call +91 9188 944 337", btn2Link: "tel:+919188944337", image: "/zk/cta-worker.jpg" },
  },
  {
    key: "contact", title: "Contact details and enquiry form", page: "Home, Contact", help: "Contact information, the QR code and the enquiry form. Messages arrive under Messages.",
    fields: [T("eyebrow", "Small label above the heading"), TA("heading", "Heading"), LN("phones", "Phone numbers"), T("email", "Email"), T("website", "Website"), LN("addresses", "Addresses"), IMG("qr", "QR code image"), T("scanTitle", "QR heading"), TA("scanText", "QR text"),
      T("facebook", "Facebook link"), T("instagram", "Instagram link"), T("linkedin", "LinkedIn link"), T("whatsapp", "WhatsApp link"), T("scheduleTitle", "Consultation heading"), TA("scheduleText", "Consultation text"),
      LN("interests", "Enquiry form: options in the interest list"), T("button", "Form button label"), T("map", "Google Maps embed link", "Shown on the Contact page. Leave empty to hide the map.")],
    data: {
      eyebrow: "Contact us", heading: "Let's Power Your Future Together\nReady to Switch to Clean Solar Energy?", phones: "+91 9188 944 337\n+91 9188 944 338", email: "info@zakionenergy.com", website: "www.zakionenergy.com",
      addresses: "63/700, D Space, Sky Tower, Bank Road, Calicut- 673001\nKalathil Complex, opp. Federal Bank, Pulamanthole, Kerala 679323", qr: "/zk/qr.jpg", scanTitle: "Scan to Connect", scanText: "Scan to visit our website or contact us instantly.",
      facebook: "https://www.facebook.com/zakionenergy/", instagram: "https://www.instagram.com/zakionenergy/", linkedin: "https://in.linkedin.com/company/zakion-energy", whatsapp: "https://wa.me/919188944337",
      scheduleTitle: "Schedule Your Free Consultation Today", scheduleText: "Discover how solar can reduce your energy costs and power a sustainable future.",
      interests: "Residential solar\nCommercial solar\nIndustrial solar\nBattery storage (BESS)\nOther", button: "Get a free consultation", map: "https://maps.google.com/maps?q=D%20Space%2C%20Sky%20Tower%2C%20Bank%20road%2C%20Calicut%20-%20673001&t=m&z=14&output=embed",
    },
  },
  {
    key: "header", title: "Header menu and brochure", page: "Every page", help: "The menu at the top of every page, the Contact button and the Brochure button. Upload a PDF or an image and the Brochure button opens it in a new tab.",
    fields: [
      { ...LIST("menu", "Main menu", "menu item", [T("label", "Label"), T("url", "Link", "/about-us/ or https://…"), LIST("children", "Dropdown links", "dropdown link", [T("label", "Label"), T("url", "Link")], 12)], 10), editor: "menu" },
      T("topEmail", "Top bar email", "Shown at the very top of every page (and in the mobile menu). The link opens the visitor's email app. Leave empty to hide it."),
      T("topPhone", "Top bar phone number", "Shown as typed; the call link uses its digits. Leave empty to hide it."),
      T("contactLabel", "Contact button label"), T("contactUrl", "Contact button link"),
      BOOL("showBrochure", "Show the Brochure button"), T("brochureLabel", "Brochure button label"),
      FILE("brochurePdf", "Brochure file (PDF or image)", "Upload a PDF or an image (PNG, JPG, WebP). Visitors who click Brochure open it in a new tab. With no file the button goes to the Contact page."),
    ],
    data: {
      menu: [
        { label: "Home", url: "/", children: [] }, { label: "About Us", url: "/about-us/", children: [] },
        { label: "Solutions", url: "/services/", children: [] },
        { label: "Projects", url: "/projects/", children: [] }, { label: "Blog", url: "/blog/", children: [] },
      ],
      topEmail: "info@zakion.com", topPhone: "+91 9188 944 337", contactLabel: "Contact Us", contactUrl: "/contact/", showBrochure: true, brochureLabel: "Brochure", brochurePdf: "",
    },
  },
  {
    key: "banners", title: "Page banners", page: "Inner pages",
    help: "The picture behind the title at the top of each inner page (About Us, Solutions, Projects, Contact, Blog and the pages under them). Pick a different picture for each page. If you empty a field, that page goes back to its built-in picture.",
    fields: BANNER_PAGES.map((b): Field => ({ k: b.key, label: b.label, type: "image", spec: BANNER_SPEC, help: `Shown on ${b.where}.` })),
    data: Object.fromEntries(BANNER_PAGES.map((b) => [b.key, b.image])),
  },
  {
    key: "footer", title: "Site footer", page: "Every page", help: "The footer at the bottom of every page: description, contact cards, links, social icons, map and the credit line.",
    fields: [
      TA("about", "Text under the logo"), T("email", "Support email"), T("phone", "Support phone", "Shown as typed; the call link uses its digits."), TA("address", "Address (shown on the location card)"),
      T("mapQuery", "Map search", "What the map looks up, for example the street address and city."), NUM("mapZoom", "Map zoom", "1 (world) to 20 (street). 14 works well."),
      { ...LIST("links", "Quick links", "link", [T("label", "Label"), T("url", "Link", "/about-us/ or https://…")], 10), editor: "links" },
      LIST("social", "Social icons", "icon", [SEL("network", "Network", ["Facebook", "X (Twitter)", "LinkedIn", "Instagram", "YouTube", "WhatsApp"]), T("url", "Link")], 8),
      T("copyright", "Copyright line", "The word Copyright, the symbol and the year are added for you."),
      T("poweredLabel", "Credit text"), T("poweredName", "Credit name"), T("poweredUrl", "Credit link"),
    ],
    data: {
      about: "We are a team of social entrepreneurs and engineering professionals dedicated to enrich lifestyle experience and contribute infrastructure.",
      email: "info@zakion.com", phone: "+91 9188 944 337", address: "D Space, Sky Tower, Bank Road, Calicut, 673001", mapQuery: "D Space, Sky Tower, Bank Road, Calicut - 673001", mapZoom: 14,
      links: [{ label: "Home", url: "/" }, { label: "About Us", url: "/about-us/" }, { label: "Solutions", url: "/services/" }, { label: "Blog & News", url: "/blog/" }, { label: "Contact Us", url: "/contact/" }],
      social: [{ network: "Facebook", url: "https://www.facebook.com/zakionenergy/" }, { network: "X (Twitter)", url: "https://x.com/zakionenergy20" }, { network: "LinkedIn", url: "https://in.linkedin.com/company/zakion-energy" }, { network: "Instagram", url: "https://www.instagram.com/zakionenergy/" }],
      copyright: "Zakion Energy. All rights reserved.", poweredLabel: "Powered by", poweredName: "D4DX Innovations LLP", poweredUrl: "https://d4dx.co/",
    },
  },
];

export const SECTION_BY_KEY = Object.fromEntries(SECTIONS.map((s) => [s.key, s])) as Record<string, SectionDef>;

// Built-in images that ship with the site, offered next to the uploaded library in the editor.
export const BUILTIN_IMAGES = [
  "about-worker", "aes-canopy", "aes-ev", "aes-gazebo", "aes-roof", "avatar-rahees", "avatar-yousuf", "bess-farm", "bess-home", "cert-logos", "city-strip", "comp-battery", "comp-inverter", "comp-panel", "contact-worker", "cta-worker",
  "helmet", "hybrid-panel", "ongrid-panel", "proj-1", "proj-2", "proj-3", "proj-4", "proj-5", "proj-6", "qr", "roi-house", "solarhome-photo", "story-2015", "story-2017", "story-2020", "story-2026", "track-bg", "vision-bg", "page-hero",
].map((n) => `/zk/${n}.jpg`);

// ---- reading and cleaning saved content ----

const URLISH = /^(\/(?!\/)|https?:\/\/|mailto:|tel:|#)/i;
/** Only relative paths, http(s), mailto:, tel: and #anchors are allowed in links and image sources. */
export const safeUrl = (u: unknown) => { const s = String(u ?? "").trim(); return !s || URLISH.test(s) ? s : ""; };

export function clean(fields: Field[], input: any, defaults: any): any {
  const out: Record<string, unknown> = {};
  const src = input && typeof input === "object" ? input : {};
  for (const f of fields) {
    const v = src[f.k];
    switch (f.type) {
      case "list": {
        const arr = Array.isArray(v) ? v : Array.isArray(defaults?.[f.k]) ? defaults[f.k] : [];
        out[f.k] = arr.slice(0, f.max ?? 60).map((it: any) => clean(f.fields!, it, {}));
        break;
      }
      case "number": { const n = Number(v); out[f.k] = Number.isFinite(n) ? n : (defaults?.[f.k] ?? 0); break; }
      case "bool": out[f.k] = v === true || v === "true" || v === "on"; break;
      case "select": out[f.k] = f.options!.includes(String(v)) ? String(v) : (defaults?.[f.k] ?? f.options![0]); break;
      case "image": case "video": case "file": out[f.k] = safeUrl(v); break;
      case "color": { const c = String(v ?? "").trim().toLowerCase(); out[f.k] = /^#[0-9a-f]{6}$/.test(c) ? c : (defaults?.[f.k] ?? ""); break; }
      default: out[f.k] = String(v ?? "").replace(/\r\n?/g, "\n").slice(0, 8000);
    }
  }
  return out;
}
/** Used when saving: keeps only known fields, with the right types and sizes. */
export const sanitize = (key: string, input: unknown) => clean(SECTION_BY_KEY[key].fields, input, SECTION_BY_KEY[key].data);

/** Saved content wins; any field that was never saved falls back to the default. */
function merge(def: SectionDef, saved: any) {
  const base = structuredClone(def.data) as Record<string, any>;
  if (saved && typeof saved === "object") for (const f of def.fields) if (f.k in saved) base[f.k] = saved[f.k];
  if (def.key === "hero" && saved && typeof saved === "object") base.slides = heroSlides(saved, base.slides);
  return base;
}

/** The home banner used to keep "images" (a list) and "videoUrl" (one video) apart. Saved content in that form shows up as slides: the video
 *  first (if there was one), then the images. Saving the banner drops the old keys. */
function heroSlides(saved: any, slides: unknown): unknown {
  if (Array.isArray(saved.slides) && saved.slides.length) return slides;
  const v = safeUrl(saved.videoUrl);
  const imgs = (Array.isArray(saved.images) ? saved.images : []).filter((it: any) => it && it.image).map((it: any) => ({ image: String(it.image), video: "", alt: String(it.alt ?? "") }));
  const all = [...(v ? [{ image: "", video: v, alt: "" }] : []), ...imgs].slice(0, 8);
  return all.length ? all : slides;
}

export async function loadContent(): Promise<Content> {
  let rows: { key: string; data: string }[] = [];
  try { rows = (await db().prepare("SELECT key, data FROM site_content").all<{ key: string; data: string }>()).results; } catch { /* table not created yet: defaults */ }
  const saved: Record<string, unknown> = {};
  for (const r of rows) { try { saved[r.key] = JSON.parse(r.data); } catch { /* ignore a damaged row */ } }
  return { ...Object.fromEntries(SECTIONS.map((d) => [d.key, merge(d, saved[d.key])])), _layout: cleanLayout(saved[LAYOUT_KEY]), [SITE_KEY]: saved[SITE_KEY] ?? null };
}
export async function loadOne(key: string) { const d = SECTION_BY_KEY[key]; const r = await db().prepare("SELECT data FROM site_content WHERE key=?").bind(key).first<{ data: string }>().catch(() => null); let s: unknown = null; try { s = r ? JSON.parse(r.data) : null; } catch { /* default */ } return { def: d, data: merge(d, s), customised: !!r }; }
