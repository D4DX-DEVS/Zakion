// Count-up for .zk-stat numbers; text is already final in the HTML, so no-JS and reduced-motion users see the real values.
(function () {
  var els = document.querySelectorAll("[data-zk-count]");
  if (!els.length || !("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      var el = e.target, to = parseInt(el.getAttribute("data-zk-count"), 10), pad = el.getAttribute("data-zk-pad") | 0, suf = el.getAttribute("data-zk-suffix") || "", t0 = performance.now();
      (function tick(t) {
        var p = Math.min((t - t0) / 1400, 1), v = Math.round(to * (1 - Math.pow(1 - p, 3)));
        el.textContent = String(v).padStart(pad, "0") + suf;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }, { threshold: 0.4 });
  els.forEach(function (el) { io.observe(el); });
})();
