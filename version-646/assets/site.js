(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var next = hero.querySelector("[data-hero-next]");
      var prev = hero.querySelector("[data-hero-prev]");
      var active = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === active);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === active);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(active + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (next) {
        next.addEventListener("click", function () {
          show(active + 1);
          start();
        });
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(active - 1);
          start();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          start();
        });
      });

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var scope = panel.parentElement || document;
      var input = panel.querySelector("[data-filter-input]");
      var region = panel.querySelector("[data-filter-region]");
      var type = panel.querySelector("[data-filter-type]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));

      function match(card) {
        var query = input ? input.value.trim().toLowerCase() : "";
        var regionValue = region ? region.value : "";
        var typeValue = type ? type.value : "";
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
        var okQuery = !query || haystack.indexOf(query) !== -1;
        var okRegion = !regionValue || (card.getAttribute("data-region") || "").indexOf(regionValue) !== -1;
        var okType = !typeValue || (card.getAttribute("data-type") || "").indexOf(typeValue) !== -1;
        return okQuery && okRegion && okType;
      }

      function apply() {
        cards.forEach(function (card) {
          card.classList.toggle("is-hidden", !match(card));
        });
      }

      [input, region, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });

    var jump = document.querySelector("[data-player-jump]");
    if (jump) {
      jump.addEventListener("click", function (event) {
        event.preventDefault();
        var box = document.querySelector(".player-shell");
        if (box) {
          box.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        var button = document.querySelector("[data-player-button]");
        if (button) {
          button.click();
        }
      });
    }
  });
})();

function initPlayer(source) {
  var video = document.querySelector("[data-player-video]");
  var overlay = document.querySelector("[data-player-overlay]");
  var button = document.querySelector("[data-player-button]");
  var hlsInstance = null;

  if (!video || !source) {
    return;
  }

  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = source;
  } else if (window.Hls && window.Hls.isSupported()) {
    hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
    hlsInstance.loadSource(source);
    hlsInstance.attachMedia(video);
  } else {
    video.src = source;
  }

  function begin() {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });
    }
  }

  if (button) {
    button.addEventListener("click", begin);
  }

  if (overlay) {
    overlay.addEventListener("click", begin);
  }

  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });

  video.addEventListener("ended", function () {
    if (overlay) {
      overlay.classList.remove("is-hidden");
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
