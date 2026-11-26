/* Solar Calculator (Solar Calculator page). The form and the settings (#zc-cfg) are drawn by src/lib/sections.ts; styles are in zk-tools.css.
   This script validates the form, works out the result, draws the report, builds the share links and writes the PDF (no libraries). */
(function () {
  "use strict";
  var cfgEl = document.getElementById("zc-cfg"), root = document.getElementById("zc"), form = document.getElementById("zc-form"), out = document.getElementById("zc-res");
  if (!cfgEl || !root || !form || !out) return;
  var cfg;
  try { cfg = JSON.parse(cfgEl.textContent); } catch (e) { return; }
  var $ = function (id) { return document.getElementById(id); };
  var elAmount = $("zc-amount"), elPhone = $("zc-phone"), elEmail = $("zc-email"), elState = $("zc-state"), elCat = $("zc-cat"), elRate = $("zc-rate"), elRange = $("zc-range"), elRateT = $("zc-rate-t");
  var hero = root.querySelector(".zc-hero");
  var CATS = ["Residential", "Commercial", "Industrial"];

  /* What the estimate assumes (listed on the page and in the PDF). */
  var A = {
    perKw: cfg.perKw || 4,   // units (kWh) one kW of panels generates in a day (Solar Calculator block in Studio)
    peak: cfg.peak || 5,     // peak sun hours a day, the same for every state (Solar Calculator block in Studio)
    yearDiv: 1.03,           // yearly generation = monthly generation x 12 / 1.03
    deg1: 0.004,             // panel output lost in the first year
    degN: 0.003,             // panel output lost in each of the 2nd to 30th years
    payback: cfg.payback || 2.5, // simple payback period shown in every result (years); the annual return shown is 100 / this
    years: 30,               // system life used for the lifetime figures
    co2: 0.82,               // kg of CO2 mitigated per unit (kWh) generated: 0.82 tonnes for every 1,000 units
    treeUnits: 750           // units generated that are equivalent to planting one tree
  };
  var RATE_MIN = 1, RATE_MAX = 30;

  /* ---------- formatting ---------- */
  var n0 = function (v) { return Math.round(v).toLocaleString("en-IN"); };
  var inr = function (v) {
    if (v >= 1e7) return "₹" + (v / 1e7).toFixed(2) + " Cr";
    if (v >= 1e5) return "₹" + (v / 1e5).toFixed(2) + " L";
    return "₹" + n0(v);
  };
  var rs = function (v) { // the PDF's standard fonts have no rupee sign
    if (v >= 1e7) return "Rs. " + (v / 1e7).toFixed(2) + " Cr";
    if (v >= 1e5) return "Rs. " + (v / 1e5).toFixed(2) + " L";
    return "Rs. " + n0(v);
  };
  var esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); };
  var ico = function (n) { return '<svg class="zi" aria-hidden="true" focusable="false"><use href="#zi-' + n + '"/></svg>'; };
  var stateOf = function (name) { for (var i = 0; i < cfg.states.length; i++) if (cfg.states[i].n === name) return cfg.states[i]; return null; }; // a state only supplies the electricity rate (t)

  /* ---------- the form ---------- */
  function mode() { return form.querySelector("input[name=mode]:checked").value; }

  function setMode() {
    var bill = mode() === "bill";
    $("zc-amt-l").textContent = bill ? "Your average monthly electricity bill" : "Your average monthly electricity units";
    $("zc-pre").hidden = !bill;
    $("zc-suf").hidden = bill;
    elAmount.placeholder = bill ? "e.g. 2000" : "e.g. 250";
    elAmount.setAttribute("aria-label", bill ? "Monthly electricity bill in rupees" : "Monthly electricity units in kWh");
    fail("amount", "");
  }

  function setRate(v, fromRange) {
    v = Math.min(RATE_MAX, Math.max(RATE_MIN, Math.round(v * 100) / 100));
    elRateT.textContent = "₹" + v.toFixed(2);
    elRange.value = v;
    elRange.style.setProperty("--p", ((v - RATE_MIN) / (RATE_MAX - RATE_MIN) * 100) + "%");
    if (fromRange || document.activeElement !== elRate) elRate.value = v;
  }

  function fail(field, msg) {
    var wrap = form.querySelector('[data-f="' + field + '"]');
    if (!wrap) return;
    var e = wrap.querySelector(".zc-err");
    if (e) e.textContent = msg;
    wrap.classList.toggle("bad", !!msg);
    var c = wrap.querySelector("input,select");
    if (c) { if (msg) c.setAttribute("aria-invalid", "true"); else c.removeAttribute("aria-invalid"); }
  }

  function read() {
    return { mode: mode(), amount: parseFloat(elAmount.value), state: elState.value, cat: elCat.value, rate: parseFloat(elRate.value), phone: elPhone.value.trim(), email: elEmail.value.trim() };
  }

  /* the visitor's own details: a mobile number is needed, an email is optional (a shared link shows its result without them) */
  function checkContact(v) {
    var ok = true, digits = v.phone.replace(/\D/g, "");
    if (!/^\+?[0-9\s\-()]{10,20}$/.test(v.phone) || digits.length < 10 || digits.length > 13) { fail("phone", "Enter a valid mobile number."); ok = false; } else fail("phone", "");
    if (v.email && !/^\S+@\S+\.\S+$/.test(v.email)) { fail("email", "Enter a valid email or leave it empty."); ok = false; } else fail("email", "");
    return ok;
  }

  function check(v) {
    var ok = true, bill = v.mode === "bill", max = bill ? 1e7 : 1e6;
    if (!isFinite(v.amount) || v.amount <= 0) { fail("amount", bill ? "Enter your monthly electricity bill." : "Enter your monthly electricity units."); ok = false; }
    else if (v.amount > max) { fail("amount", "That looks too high. Enter a value up to " + n0(max) + "."); ok = false; }
    else fail("amount", "");
    if (!stateOf(v.state)) { fail("state", "Select your state."); ok = false; } else fail("state", "");
    if (!isFinite(v.rate) || v.rate < RATE_MIN || v.rate > RATE_MAX) { v.rate = Math.min(RATE_MAX, Math.max(RATE_MIN, isFinite(v.rate) ? v.rate : 8)); setRate(v.rate, true); }
    return ok;
  }

  /* ---------- the maths ---------- */
  function calc(v) {
    var units = v.mode === "bill" ? v.amount / v.rate : v.amount;       // units used in a month (a bill is turned into units by the rate)
    var size = units / 30 / A.perKw;                                     // recommended plant size, kW
    var daily = size * A.perKw, monthly = daily * 30, annual = monthly * 12 / A.yearDiv;
    // 30 years: the yearly figure loses 0.4% in the first year and a further 0.3% in each of the 2nd to 30th years
    var life = 0, f = 1;
    for (var y = 0; y < A.years; y++) { f *= 1 - (y === 0 ? A.deg1 : A.degN); life += annual * f; }
    var annSav = annual * v.rate, co2 = life * A.co2 / 1000;               // CO2 mitigated, in tonnes: total units in 30 years x 0.82 kg. Savings = units x unit charge (the rate stays the same for 30 years)
    return {
      v: v, sun: A.peak, units: units, size: size, daily: daily, monthly: monthly, annual: annual, life: life,
      monSav: monthly * v.rate, annSav: annSav, lifeSav: life * v.rate,
      payback: A.payback, roi: 100 / A.payback, co2: co2, trees: Math.round(life / A.treeUnits)   // equivalent trees: total units in 30 years / 750
    };
  }

  /* ---------- the report ---------- */
  function shareUrl(v) {
    return location.origin + location.pathname + "?m=" + v.mode + "&v=" + encodeURIComponent(v.amount) + "&s=" + encodeURIComponent(v.state) + "&c=" + encodeURIComponent(v.cat) + "&t=" + encodeURIComponent(v.rate);
  }
  function shareText(r) {
    return "My solar savings report from " + cfg.brand + ":\n" +
      "Recommended plant size: " + r.size.toFixed(2) + " kWp\n" +
      "Yearly savings: " + inr(r.annSav) + "\n" +
      "Payback: " + r.payback.toFixed(1) + " years\n" +
      "Try the calculator: ";
  }
  var basis = function (r) { return r.v.mode === "bill" ? "Based on your monthly bill" : "Based on your monthly units"; };
  var hrs = function (n) { return (+n.toFixed(1)) + " hrs/day"; };

  function render(r) {
    var v = r.v, url = shareUrl(v), txt = shareText(r);
    var wa = "https://wa.me/?text=" + encodeURIComponent(txt + url);
    var mail = "mailto:?subject=" + encodeURIComponent("My solar savings report - " + cfg.brand) + "&body=" + encodeURIComponent(txt + "\n" + url);
    var tri = function (a, b, c, unitA, unitB, unitC) {
      return '<div class="zc-3"><div><small>Monthly</small><b>' + a + '</b><em>' + unitA + '</em></div><div><small>Annual</small><b>' + b + '</b><em>' + unitB + '</em></div><div><small>' + A.years + '-year</small><b>' + c + '</b><em>' + unitC + '</em></div></div>';
    };
    var cta = cfg.cta && cfg.cta.text && cfg.cta.link ? '<a class="zh-btn" href="' + esc(cfg.cta.link) + '">' + esc(cfg.cta.text) + " " + ico("arrow-r") + "</a>" : "";
    out.innerHTML =
      '<div class="zc-res-top"><span class="zc-pill">' + ico("pin") + esc(v.state) + '</span><h2>Your Solar Savings Report</h2><p class="zh-sub">Based on your inputs — results are indicative</p></div>' +
      '<div class="zc-card zc-share"><span>' + ico("share") + 'Share Report</span><div class="zc-sbtns">' +
        '<a class="zc-sb zc-sb--wa" href="' + esc(wa) + '" target="_blank" rel="noopener">' + ico("wa") + 'WhatsApp</a>' +
        '<a class="zc-sb" href="' + esc(mail) + '">' + ico("mail") + 'Email</a>' +
        '<button class="zc-sb zc-sb--pdf" type="button" id="zc-pdf">' + ico("download") + 'Download PDF</button></div></div>' +
      '<div class="zc-big"><div><small>Recommended plant size</small><div class="zc-size"><b>' + r.size.toFixed(2) + '</b><span>kWp</span></div><p>' + basis(r) + '</p></div>' +
        '<div class="zc-mini"><div><small>Daily generation</small><b>' + r.daily.toFixed(1) + ' kWh</b></div><div><small>Peak sun hours</small><b>' + hrs(r.sun) + '</b></div></div></div>' +
      '<h3 class="zc-sec">' + ico("bolt") + 'Electricity generation</h3>' +
      '<div class="zc-card"><h4 class="zc-ct">' + ico("chart") + 'Total kWh Generated by Your Solar Plant</h4>' + tri(n0(r.monthly) + " kWh", n0(r.annual) + " kWh", n0(r.life) + " kWh", "per month", "per year", "lifetime total") + "</div>" +
      '<h3 class="zc-sec">' + ico("rupee") + 'Financial savings</h3>' +
      '<div class="zc-card"><h4 class="zc-ct">' + ico("bank") + "Electricity Bill Savings (at ₹" + (+v.rate.toFixed(2)) + "/kWh)</h4>" + tri(inr(r.monSav), inr(r.annSav), inr(r.lifeSav), "per month", "per year", "lifetime savings") + "</div>" +
      '<div class="zc-2"><div class="zc-card zc-kpi">' + ico("clock") + "<b>" + r.payback.toFixed(1) + ' Yrs</b><span>Simple Payback Period</span></div>' +
        '<div class="zc-card zc-kpi">' + ico("chart") + "<b>" + r.roi.toFixed(1) + '%</b><span>Annual Return on Investment</span></div></div>' +
      '<h3 class="zc-sec">' + ico("leaf") + 'Environmental impact</h3>' +
      '<div class="zc-card zc-env"><div>' + ico("leaf") + "<p><b>" + (r.co2 >= 10 ? Math.round(r.co2) : r.co2.toFixed(1)) + ' T</b><span>CO₂ Emissions Mitigated (' + A.years + ' yrs)</span></p></div>' +
        "<div>" + ico("tree") + "<p><b>" + n0(r.trees) + "</b><span>Equivalent Trees Planted</span></p></div></div>" +
      '<p class="zc-note">' + ico("info") + "<span>" + esc(cfg.note || "The computation is indicative in nature. Actual generation and savings may vary.") + "</span></p>" +
      '<div class="zc-end">' + cta + '<button class="zh-btn zh-btn--line" type="button" id="zc-redo">' + ico("edit") + " Recalculate</button></div>";

    $("zc-pdf").addEventListener("click", function () { pdf(r, this); });
    $("zc-redo").addEventListener("click", back);
    form.hidden = true;
    if (hero) hero.hidden = true;
    out.hidden = false;
    try { history.replaceState(null, "", url.slice(location.origin.length)); } catch (e) { /* the address stays as it is */ }
    out.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    out.focus({ preventScroll: true });
  }

  function back() {
    out.hidden = true; out.innerHTML = "";
    form.hidden = false;
    if (hero) hero.hidden = false;
    try { history.replaceState(null, "", location.pathname); } catch (e) { /* ignore */ }
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ---------- the PDF: one A4 page written by hand (standard Helvetica fonts, so no libraries and no downloads) ---------- */
  function rgb(name, fb) {
    var s = getComputedStyle(root).getPropertyValue(name).trim(), m = /^#([0-9a-f]{6})$/i.exec(s) || /^#([0-9a-f]{6})$/i.exec(fb), n = parseInt(m[1], 16);
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
  }

  function pdf(r, btn) {
    var W = 595.28, H = 841.89, M = 40, ops = [], v = r.v;
    var navy = rgb("--navy", "#0d3d7b"), amber = rgb("--amber", "#fec142"), mut = rgb("--mut", "#3d5a86"), soft = rgb("--bg", "#f1f4fb"), line = rgb("--line", "#c9d6ec"), white = [1, 1, 1];
    var meas = document.createElement("canvas").getContext("2d");
    var width = function (t, size, bold) { meas.font = (bold ? "bold " : "") + size + "px Helvetica, Arial, sans-serif"; return meas.measureText(t).width; };
    var pt = function (t) { return String(t).replace(/₹/g, "Rs. ").replace(/[–—−]/g, "-").replace(/₂/g, "2").replace(/[^\x20-\x7e]/g, "").replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)"); };
    var f = function (x) { return (Math.round(x * 100) / 100).toString(); };
    var Y = function (y) { return H - y; };
    var col = function (c) { return c.map(f).join(" "); };
    function rect(x, y, w, h, c) { ops.push(col(c) + " rg " + f(x) + " " + f(Y(y + h)) + " " + f(w) + " " + f(h) + " re f"); }
    function hline(x1, x2, y, c, wd) { ops.push(col(c) + " RG " + f(wd || 0.8) + " w " + f(x1) + " " + f(Y(y)) + " m " + f(x2) + " " + f(Y(y)) + " l S"); }
    function text(t, x, y, size, c, bold, align) {
      var w = width(String(t).replace(/₹/g, "Rs. "), size, bold);
      if (align === "r") x -= w; else if (align === "c") x -= w / 2;
      ops.push("BT /" + (bold ? "F2" : "F1") + " " + size + " Tf " + col(c) + " rg " + f(x) + " " + f(Y(y)) + " Td (" + pt(t) + ") Tj ET");
      return w;
    }
    function wrap(t, maxW, size) {
      var words = String(t).split(/\s+/), lines = [], cur = "";
      words.forEach(function (w) { var n = cur ? cur + " " + w : w; if (width(n, size) > maxW && cur) { lines.push(cur); cur = w; } else cur = n; });
      if (cur) lines.push(cur);
      return lines;
    }
    function heading(t, y) { rect(M, y - 9, 4, 12, amber); text(t.toUpperCase(), M + 12, y, 9.5, navy, true); }
    function triple(y, h, a, b, c) {
      rect(M, y, W - 2 * M, h, soft);
      var cw = (W - 2 * M) / 3, labels = ["MONTHLY", "ANNUAL", A.years + "-YEAR"];
      [a, b, c].forEach(function (x, i) {
        var cx = M + cw * i + cw / 2;
        text(labels[i], cx, y + 19, 7.5, mut, true, "c");
        text(x[0], cx, y + 39, 16, navy, true, "c");
        text(x[1], cx, y + 50, 7.5, mut, false, "c");
      });
    }

    /* header */
    rect(0, 0, W, 100, navy); rect(0, 100, W, 4, amber);
    text("ZAKION ENERGY", M, 46, 22, white, true);
    text("Solar Savings Report", M, 68, 13, amber, true);
    var d = new Date();
    text("Generated " + d.getDate() + " " + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()] + " " + d.getFullYear(), W - M, 46, 9.5, white, false, "r");
    text(v.state + " | " + v.cat, W - M, 64, 9.5, white, false, "r");

    /* inputs */
    rect(M, 118, W - 2 * M, 46, soft);
    var cw4 = (W - 2 * M) / 4, ins = [["CUSTOMER", v.cat], ["STATE", v.state], [v.mode === "bill" ? "MONTHLY BILL" : "MONTHLY UNITS", v.mode === "bill" ? rs(v.amount) : n0(v.amount) + " kWh"], ["ELECTRICITY RATE", "Rs. " + (+v.rate.toFixed(2)) + " / kWh"]];
    ins.forEach(function (x, i) { var cx = M + cw4 * i + 14; text(x[0], cx, 136, 7, mut, true); text(x[1], cx, 153, 10.5, navy, true); });

    /* plant size */
    rect(M, 178, W - 2 * M, 92, navy);
    text("RECOMMENDED PLANT SIZE", M + 22, 202, 8.5, white, true);
    var sw = text(r.size.toFixed(2), M + 22, 244, 40, white, true);
    text("kWp", M + 22 + sw + 6, 244, 16, amber, true);
    text(basis(r), M + 22, 261, 8.5, white, false);
    var rx = W - M - 24;
    text("DAILY GENERATION", rx, 204, 7.5, white, true, "r"); text(r.daily.toFixed(1) + " kWh", rx, 222, 15, white, true, "r");
    text("PEAK SUN HOURS", rx, 242, 7.5, white, true, "r"); text(hrs(r.sun), rx, 260, 15, white, true, "r");

    /* generation and savings */
    heading("Electricity generation", 292);
    triple(300, 56, [n0(r.monthly) + " kWh", "per month"], [n0(r.annual) + " kWh", "per year"], [n0(r.life) + " kWh", "lifetime total"]);
    heading("Financial savings (at Rs. " + (+v.rate.toFixed(2)) + " per kWh)", 378);
    triple(386, 56, [rs(r.monSav), "per month"], [rs(r.annSav), "per year"], [rs(r.lifeSav), "lifetime savings"]);

    /* payback and return */
    var bw = (W - 2 * M - 14) / 2;
    [[r.payback.toFixed(1) + " years", "Simple payback period"], [r.roi.toFixed(1) + "%", "Annual return on investment"]].forEach(function (x, i) {
      var bx = M + (bw + 14) * i;
      rect(bx, 470, bw, 52, soft); rect(bx, 470, 4, 52, amber);
      text(x[0], bx + 20, 494, 17, navy, true); text(x[1], bx + 20, 511, 8.5, mut, false);
    });

    /* environment */
    heading("Environmental impact", 556);
    rect(M, 564, W - 2 * M, 52, soft);
    text((r.co2 >= 10 ? Math.round(r.co2) : r.co2.toFixed(1)) + " tonnes", M + 20, 588, 17, navy, true); text("CO2 emissions mitigated in " + A.years + " years", M + 20, 604, 8.5, mut, false);
    text(n0(r.trees) + " trees", W / 2 + 10, 588, 17, navy, true); text("equivalent trees planted", W / 2 + 10, 604, 8.5, mut, false);

    /* notes and contact */
    var y = 644, notes = wrap((cfg.note || "The computation is indicative in nature.") + " How it is worked out: plant size = monthly units / 30 / " + A.perKw + "; daily generation = size x " + A.perKw + "; monthly = daily x 30; yearly = monthly x 12 / " + A.yearDiv + "; " + A.years + "-year total with " + (A.deg1 * 100).toFixed(1) + "% loss in year 1 and " + (A.degN * 100).toFixed(1) + "% in years 2 to " + A.years + "; savings = units x unit charge; peak sun hours " + A.peak + " for every state; CO2 mitigated = units x " + A.co2 + " kg; trees = units / " + A.treeUnits + ".", W - 2 * M, 7.5);
    notes.slice(0, 6).forEach(function (l) { text(l, M, y, 7.5, mut, false); y += 10; });
    hline(M, W - M, 800, line);
    var contact = [cfg.brand, cfg.phone, cfg.email, location.host].filter(Boolean).join("   |   ");
    text(contact, M, 816, 8.5, navy, true);
    text("Page generated by the " + cfg.brand + " Solar Calculator. This is an estimate, not a quotation.", M, 829, 7, mut, false);

    /* assemble the file: objects, cross-reference table, trailer */
    var stream = ops.join("\n"), parts = [], offs = [], pos = 0;
    var add = function (s) { offs.push(pos); parts.push(s); pos += s.length; };
    var head = "%PDF-1.4\n"; parts.push(head); pos = head.length;
    add("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
    add("2 0 obj\n<< /Type /Pages /Kids [5 0 R] /Count 1 >>\nendobj\n");
    add("3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n");
    add("4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n");
    add("5 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + f(W) + " " + f(H) + "] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents 6 0 R >>\nendobj\n");
    add("6 0 obj\n<< /Length " + stream.length + " >>\nstream\n" + stream + "\nendstream\nendobj\n");
    add("7 0 obj\n<< /Title (Solar Savings Report) /Producer (" + pt(cfg.brand) + ") >>\nendobj\n");
    var xref = "xref\n0 8\n0000000000 65535 f \n" + offs.map(function (o) { return String(o).padStart(10, "0") + " 00000 n \n"; }).join("");
    parts.push(xref + "trailer\n<< /Size 8 /Root 1 0 R /Info 7 0 R >>\nstartxref\n" + pos + "\n%%EOF\n");

    var blob = new Blob(parts, { type: "application/pdf" }), a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Zakion-Solar-Savings-Report.pdf";
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
    if (btn) { btn.disabled = true; setTimeout(function () { btn.disabled = false; }, 1200); }
  }

  /* ---------- the visitor's details go to the company (Submissions in the admin, and an email) ---------- */
  var lastLead = "";
  function sendLead(v, r) {
    var key = [v.phone, v.email, v.mode, v.amount, v.state, v.cat, v.rate].join("|");
    if (key === lastLead) return; // the same details again (Recalculate, then Calculate) are not sent twice
    lastLead = key;
    var fd = new FormData();
    fd.append("phone", v.phone); fd.append("email", v.email);
    fd.append("_hp", (form.querySelector('[name="_hp"]') || {}).value || "");
    fd.append("details", [
      "Customer type: " + v.cat, "State: " + v.state,
      (v.mode === "bill" ? "Monthly bill: " + inr(v.amount) : "Monthly units: " + n0(v.amount) + " kWh") + " (unit charge ₹" + (+v.rate.toFixed(2)) + ")",
      "Recommended plant size: " + r.size.toFixed(2) + " kWp", "Daily generation: " + r.daily.toFixed(1) + " kWh", "Yearly generation: " + n0(r.annual) + " kWh",
      "Yearly savings: " + inr(r.annSav), A.years + "-year savings: " + inr(r.lifeSav), "Payback period: " + r.payback.toFixed(1) + " years"
    ].join(" | "));
    try { fetch("/api/calculator", { method: "POST", body: fd, keepalive: true }).catch(function () { /* the result shows anyway */ }); } catch (x) { /* the result shows anyway */ }
  }

  /* ---------- wiring ---------- */
  form.querySelectorAll("input[name=mode]").forEach(function (r) { r.addEventListener("change", setMode); });
  elAmount.addEventListener("input", function () { fail("amount", ""); });
  elPhone.addEventListener("input", function () { fail("phone", ""); });
  elEmail.addEventListener("input", function () { fail("email", ""); });
  elState.addEventListener("change", function () { fail("state", ""); var s = stateOf(elState.value); if (s) setRate(s.t, true); });
  elRange.addEventListener("input", function () { setRate(parseFloat(elRange.value), true); });
  elRate.addEventListener("input", function () { var x = parseFloat(elRate.value); if (isFinite(x)) setRate(x, false); });
  elRate.addEventListener("change", function () { var x = parseFloat(elRate.value); setRate(isFinite(x) ? x : 8, true); });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = read(), okCalc = check(v), okContact = checkContact(v);
    if (!okCalc || !okContact) { var bad = form.querySelector(".zc-fld.bad input,.zc-fld.bad select"); if (bad) bad.focus(); return; }
    var r = calc(v);
    sendLead(v, r);
    render(r);
  });

  setMode();
  var s0 = stateOf(elState.value);
  setRate(s0 ? s0.t : 8, true);

  /* a shared link: fill the form from the address and show the result */
  try {
    var q = new URLSearchParams(location.search), m = q.get("m"), val = parseFloat(q.get("v")), st = q.get("s"), cat = q.get("c"), t = parseFloat(q.get("t"));
    if ((m === "bill" || m === "units") && isFinite(val) && val > 0 && stateOf(st) && CATS.indexOf(cat) > -1 && isFinite(t)) {
      form.querySelector("input[name=mode][value=" + m + "]").checked = true; setMode();
      elAmount.value = val; elState.value = st; elCat.value = cat; setRate(t, true);
      var v0 = read();
      if (check(v0)) render(calc(v0));
    }
  } catch (e) { /* no shared link */ }
})();
