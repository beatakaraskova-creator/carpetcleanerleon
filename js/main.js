(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var menuBtn = document.getElementById("menu-btn");
  var mobileMenu = document.getElementById("mobile-menu");
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", function () {
      var open = mobileMenu.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
  }

  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove("open");
    if (menuBtn) {
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.setAttribute("aria-label", "Open menu");
    }
  }

  var nav = document.getElementById("nav");
  var progress = document.getElementById("scroll-progress");

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  var book = document.querySelector(".book");
  var pageList = book ? Array.prototype.slice.call(book.querySelectorAll(":scope > .page")) : [];
  var pageIndex = 0;
  var pageLock = false;

  function goPage(n, force) {
    if (!pageList.length) return;
    n = Math.max(0, Math.min(pageList.length - 1, n));
    if (!force && pageLock) return;
    if (n === pageIndex && pageList[n].classList.contains("is-on")) return;
    var goingFwd = n > pageIndex;
    pageLock = true;
    pageIndex = n;
    pageList.forEach(function (page, i) {
      page.classList.toggle("is-on", i === pageIndex);
      page.classList.toggle("is-passed", i < pageIndex);
    });
    if (nav) nav.classList.toggle("is-scrolled", pageIndex > 0);
    if (progress) {
      progress.style.width = pageList.length > 1 ? (pageIndex / (pageList.length - 1)) * 100 + "%" : "0%";
    }
    var id = pageList[pageIndex].id;
    document.querySelectorAll(".nav-links a, .mobile-menu a").forEach(function (a) {
      var href = a.getAttribute("href") || "";
      var on = href === "index.html" ? pageIndex === 0 : href === "#" + id || href === "index.html#" + id;
      a.classList.toggle("active", on);
    });
    pageList[pageIndex].querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-visible");
    });
    window.dispatchEvent(new Event("resize"));
    if (!reduce && !force && document.body.classList.contains("book-flash")) {
      var burst = document.getElementById("fx-burst");
      if (burst) {
        burst.classList.remove("is-on");
        void burst.offsetWidth;
        burst.classList.add("is-on");
        setTimeout(function () { burst.classList.remove("is-on"); }, 340);
      }
    }
    if (!reduce && !force && document.body.classList.contains("book-leon")) {
      var wipe = document.getElementById("leon-wipe");
      var incoming = pageList[pageIndex];
      if (incoming) {
        incoming.classList.remove("is-wipe-fwd", "is-wipe-back");
        incoming.classList.add(goingFwd ? "is-wipe-fwd" : "is-wipe-back");
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            incoming.classList.remove("is-wipe-fwd", "is-wipe-back");
          });
        });
      }
      if (wipe) {
        wipe.classList.remove("is-run", "is-fwd", "is-back");
        void wipe.offsetWidth;
        wipe.classList.add("is-run", goingFwd ? "is-fwd" : "is-back");
        setTimeout(function () {
          wipe.classList.remove("is-run", "is-fwd", "is-back");
        }, 4700);
      }
    }
    var lockMs = 860;
    if (document.body.classList.contains("book-leon")) lockMs = 4700;
    setTimeout(function () { pageLock = false; }, reduce ? 40 : lockMs);
  }

  function pageById(id) {
    return pageList.findIndex(function (p) { return p.id === id; });
  }

  if (pageList.length) {
    goPage(0, true);
    document.querySelectorAll('a[href^="#"], a[href^="index.html#"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        var href = link.getAttribute("href") || "";
        var hash = href.split("#")[1];
        if (!hash) return;
        var i = pageById(hash);
        if (i < 0) return;
        e.preventDefault();
        goPage(i);
        closeMenu();
      });
    });

    window.addEventListener("wheel", function (e) {
      if (pageLock) { e.preventDefault(); return; }
      if (Math.abs(e.deltaY) < 8) return;
      var onDeck = e.target.closest && e.target.closest(".service-grid");
      if (onDeck && Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      goPage(pageIndex + (e.deltaY > 0 ? 1 : -1));
    }, { passive: false });

    window.addEventListener("keydown", function (e) {
      var tag = e.target && e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON") return;
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        goPage(pageIndex + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        goPage(pageIndex - 1);
      }
    });

    var touchX = 0;
    var touchY = 0;
    var touchOnDeck = false;
    document.addEventListener("touchstart", function (e) {
      if (!e.touches[0]) return;
      touchX = e.touches[0].clientX;
      touchY = e.touches[0].clientY;
      touchOnDeck = !!(e.target.closest && e.target.closest(".service-grid"));
    }, { passive: true });
    document.addEventListener("touchend", function (e) {
      if (!e.changedTouches[0]) return;
      var dx = e.changedTouches[0].clientX - touchX;
      var dy = e.changedTouches[0].clientY - touchY;
      if (touchOnDeck && Math.abs(dx) > Math.abs(dy)) return;
      if (Math.abs(dy) < 48 || Math.abs(dy) < Math.abs(dx)) return;
      goPage(pageIndex + (dy < 0 ? 1 : -1));
    }, { passive: true });

    requestAnimationFrame(function () {
      book.classList.add("is-ready");
    });

    var fxNames = ["cover", "push", "fade", "wipe", "flip", "slam", "zoom", "split", "cube", "skew", "flash", "leon"];
    var fxNow = "zoom";
    fxNames.forEach(function (n) {
      document.body.classList.toggle("book-" + n, n === "zoom");
    });
    try { localStorage.setItem("ccl-fx", "zoom"); } catch (err) {}

    var hash = (location.hash || "").replace("#", "");
    if (hash) {
      var start = pageById(hash);
      if (start >= 0) goPage(start);
    }

    var svcGrid = document.querySelector(".service-grid");
    var svcDots = document.querySelectorAll("#svc-dots button");
    function syncSvcDots() {
      if (!svcGrid || !svcDots.length || !svcGrid.clientWidth) return;
      var i = Math.round(svcGrid.scrollLeft / svcGrid.clientWidth);
      svcDots.forEach(function (dot, n) {
        dot.classList.toggle("is-on", n === i);
      });
    }
    if (svcGrid) {
      svcGrid.addEventListener("scroll", syncSvcDots, { passive: true });
      svcDots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          var i = parseInt(dot.getAttribute("data-svc"), 10) || 0;
          svcGrid.scrollTo({ left: i * svcGrid.clientWidth, behavior: "auto" });
        });
      });
    }
  }

  function onScroll() {
    var y = window.scrollY || 0;
    if (nav) nav.classList.toggle("is-scrolled", y > 24);
    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    }
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  var reveals = document.querySelectorAll(".reveal");
  if (reduce) {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  } else if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  if (!reduce) {
    document.querySelectorAll(".tilt").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "rotateY(" + (x * 9) + "deg) rotateX(" + (-y * 9) + "deg) translateY(-6px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });

    document.querySelectorAll(".btn-magnet").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        btn.style.transform = "translate(" + (x * 0.12) + "px, " + (y * 0.18) + "px)";
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.transform = "";
      });
    });
  }

  var jobs = {
    carpet: {
      src: "image/leon/IMG-20260831-WA0103.jpg",
      alt: "A room carpet after a professional clean"
    },
    landing: {
      src: "image/job-done.jpg",
      alt: "A landing carpet after a professional clean"
    },
    stairs: {
      src: "image/job-stairs.jpg",
      alt: "Stair carpet after a professional clean"
    },
    hallway: {
      src: "image/work-hallway.jpg",
      alt: "Hallway and stairs after a professional clean"
    }
  };
  var jobPhoto = document.getElementById("job-photo");
  document.querySelectorAll(".job-pick").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-job");
      var job = jobs[id];
      if (!job || !jobPhoto) return;
      document.querySelectorAll(".job-pick").forEach(function (b) {
        b.classList.toggle("is-on", b === btn);
      });
      jobPhoto.src = job.src;
      jobPhoto.alt = job.alt;
    });
  });

  var counted = false;
  function runCounts() {
    if (counted || reduce) return;
    counted = true;
    document.querySelectorAll("[data-count]").forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      var start = performance.now();
      function tick(now) {
        var t = Math.min(1, (now - start) / 1100);
        var eased = 1 - Math.pow(1 - t, 3);
        el.textContent = String(Math.round(target * eased));
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }
  var stats = document.querySelector(".hero-stats");
  if (stats && "IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        runCounts();
        co.disconnect();
      }
    }, { threshold: 0.4 });
    co.observe(stats);
  } else {
    runCounts();
  }
})();
