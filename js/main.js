/* EEHEO — vanilla JS for animations & interactions (no build step) */
(function () {
  "use strict";

  /* ---------- Contour signature: inject SVG into every .contours ---------- */
  function buildContours() {
    document.querySelectorAll(".contours").forEach(function (el) {
      if (el.dataset.built) return;
      el.dataset.built = "1";
      var draw = el.classList.contains("draw");
      var paths = "";
      for (var i = 0; i < 8; i++) {
        var o = i * 26;
        var d =
          "M -50 " + (360 + o) +
          " C 180 " + (300 + o) + ", 320 " + (430 + o) + ", 520 " + (360 + o) +
          " S 820 " + (250 + o) + ", 1000 " + (330 + o) +
          " S 1260 " + (290 + o) + ", 1280 " + (320 + o);
        var op = (0.55 - i * 0.05).toFixed(2);
        var delay = draw ? ' style="animation-delay:' + (i * 0.12) + 's"' : "";
        paths += '<path d="' + d + '" pathLength="1" stroke-width="1.4" stroke-opacity="' + op + '"' + delay + "/>";
      }
      el.innerHTML =
        '<svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
        paths + "</svg>";
    });
  }

  /* ---------- Scroll reveals + stagger ---------- */
  function initReveals() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (e) { e.classList.add("in"); });
      return;
    }
    // stagger: assign incremental delay to children of [data-stagger]
    document.querySelectorAll("[data-stagger]").forEach(function (group) {
      var gap = parseFloat(group.dataset.stagger) || 0.08;
      Array.prototype.forEach.call(group.children, function (child, idx) {
        if (child.classList.contains("reveal")) {
          child.style.transitionDelay = (idx * gap) + "s";
        }
      });
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "-60px 0px", threshold: 0.05 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- Count-up numbers ---------- */
  function initCounters() {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var nums = document.querySelectorAll("[data-count]");
    function run(el) {
      var to = parseFloat(el.dataset.count);
      var suffix = el.dataset.suffix || "";
      if (reduce) { el.textContent = to.toLocaleString() + suffix; return; }
      var dur = 1600, start = null;
      function tick(now) {
        if (!start) start = now;
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * to).toLocaleString() + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
    if (!("IntersectionObserver" in window)) { nums.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { run(entry.target); io.unobserve(entry.target); }
      });
    }, { rootMargin: "-40px 0px" });
    nums.forEach(function (e) { io.observe(e); });
  }

  /* ---------- Nav: solid on scroll + mobile menu ---------- */
  function initNav() {
    var nav = document.querySelector(".nav");
    if (!nav) return;
    function onScroll() { nav.classList.toggle("solid", window.scrollY > 40); }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    var btn = nav.querySelector(".menu-btn");
    var menu = document.querySelector(".mobile-menu");
    if (btn && menu) {
      btn.addEventListener("click", function () {
        var open = menu.classList.toggle("open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }
  }

  /* ---------- Services accordion ---------- */
  function initAccordion() {
    var items = document.querySelectorAll(".acc-item");
    items.forEach(function (item, i) {
      var head = item.querySelector(".acc-head");
      var body = item.querySelector(".acc-body");
      if (!head || !body) return;
      function setOpen(open) {
        item.classList.toggle("open", open);
        head.setAttribute("aria-expanded", open ? "true" : "false");
        body.style.maxHeight = open ? body.scrollHeight + "px" : "0px";
      }
      head.addEventListener("click", function () {
        var willOpen = !item.classList.contains("open");
        // close siblings (single-open accordion)
        items.forEach(function (other) {
          if (other !== item) {
            other.classList.remove("open");
            var oh = other.querySelector(".acc-head");
            var ob = other.querySelector(".acc-body");
            if (oh) oh.setAttribute("aria-expanded", "false");
            if (ob) ob.style.maxHeight = "0px";
          }
        });
        setOpen(willOpen);
      });
      setOpen(i === 0); // first open by default
    });
    // keep open heights correct on resize
    window.addEventListener("resize", function () {
      document.querySelectorAll(".acc-item.open .acc-body").forEach(function (b) {
        b.style.maxHeight = b.scrollHeight + "px";
      });
    });
  }

  /* ---------- Gallery + lightbox ---------- */
  function initGallery() {
    var grid = document.querySelector(".masonry[data-gallery]");
    if (!grid) return;
    var COUNT = parseInt(grid.dataset.gallery, 10) || 40;
    var EXT = grid.dataset.ext || "jpg";
    var themes = ["Community health outreach","Education & sponsorship","Youth empowerment",
      "WASH initiative","Care & support","Advocacy in action","Nutrition program",
      "Champion of Change","Field work"];
    var ratios = ["3 / 4", "1 / 1", "4 / 3"];
    var phSvg = '<div class="imgph" role="img" aria-label="ALT" style="aspect-ratio:RATIO">' +
      '<svg viewBox="0 0 64 64" fill="currentColor" aria-hidden="true">' +
      '<path d="M4 50 L22 26 L34 40 L44 28 L60 50 Z"/><circle cx="48" cy="16" r="7"/></svg></div>';

    var data = [];
    var frag = document.createDocumentFragment();
    for (var i = 0; i < COUNT; i++) {
      var n = i + 1;
      var theme = themes[i % themes.length];
      var alt = theme + " — EEHEO program photo " + n;
      var src = "images/gallery" + n + "." + EXT;
      var ratio = ratios[i % 3];
      data.push({ src: src, alt: alt, cap: theme });

      var btn = document.createElement("button");
      btn.className = "tile reveal";
      btn.setAttribute("aria-label", "Open image: " + theme);
      btn.dataset.idx = i;
      btn.style.transitionDelay = ((i % 8) * 0.04) + "s";

      var img = document.createElement("img");
      img.src = src; img.alt = alt; img.loading = "lazy"; img.decoding = "async";
      img.style.aspectRatio = ratio; img.style.objectFit = "cover";
      img.onerror = (function (alt, ratio) {
        return function () {
          var ph = phSvg.replace("ALT", alt).replace("RATIO", ratio);
          this.outerHTML = ph;
        };
      })(alt, ratio);

      var ov = document.createElement("span");
      ov.className = "ov"; ov.textContent = theme;
      btn.appendChild(img); btn.appendChild(ov);
      frag.appendChild(btn);
    }
    grid.appendChild(frag);

    // lightbox
    var lb = document.querySelector(".lightbox");
    if (!lb) return;
    var stage = lb.querySelector(".lb-stage");
    var count = lb.querySelector(".lb-count");
    var idx = 0;

    function render() {
      var d = data[idx];
      stage.innerHTML = "";
      var img = document.createElement("img");
      img.src = d.src; img.alt = d.alt;
      img.onerror = function () {
        this.outerHTML = '<div class="imgph" style="width:70vw;max-width:760px;aspect-ratio:4/3" role="img" aria-label="' + d.alt + '">' +
          '<svg viewBox="0 0 64 64" fill="currentColor" aria-hidden="true"><path d="M4 50 L22 26 L34 40 L44 28 L60 50 Z"/><circle cx="48" cy="16" r="7"/></svg></div>';
      };
      stage.appendChild(img);
      if (count) count.textContent = (idx + 1) + " / " + data.length;
    }
    function open(i) { idx = i; render(); lb.classList.add("open"); document.body.style.overflow = "hidden"; }
    function close() { lb.classList.remove("open"); document.body.style.overflow = ""; }
    function prev() { idx = (idx - 1 + data.length) % data.length; render(); }
    function next() { idx = (idx + 1) % data.length; render(); }

    grid.addEventListener("click", function (e) {
      var tile = e.target.closest(".tile");
      if (tile) open(parseInt(tile.dataset.idx, 10));
    });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    lb.querySelector(".lb-close").addEventListener("click", close);
    lb.querySelector(".lb-prev").addEventListener("click", function (e) { e.stopPropagation(); prev(); });
    lb.querySelector(".lb-next").addEventListener("click", function (e) { e.stopPropagation(); next(); });
    window.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    });
  }

  /* ---------- Year in footer ---------- */
  function initYear() {
    var y = document.querySelector("[data-year]");
    if (y) y.textContent = new Date().getFullYear();
  }

  document.addEventListener("DOMContentLoaded", function () {
    buildContours();
    initNav();
    initReveals();
    initCounters();
    initAccordion();
    initGallery();
    initYear();
  });
})();
