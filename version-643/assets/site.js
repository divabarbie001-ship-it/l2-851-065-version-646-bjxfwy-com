(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupHeaderSearch() {
    document.querySelectorAll("[data-header-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var q = input ? input.value.trim() : "";
        var target = "search.html";
        if (q) {
          target += "?q=" + encodeURIComponent(q);
        }
        window.location.href = target;
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function move(step) {
      show(index + step);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        move(1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        move(-1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        move(1);
        restart();
      });
    }

    restart();
  }

  function setupGridFilter() {
    var form = document.querySelector("[data-grid-filter]");
    var grid = document.querySelector("[data-filter-grid]");
    if (!form || !grid) {
      return;
    }
    var input = form.querySelector("input");
    var select = form.querySelector("select");
    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));

    function filter() {
      var q = input ? input.value.trim().toLowerCase() : "";
      var year = select ? select.value : "";
      cards.forEach(function (card) {
        var hay = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-category"),
          card.getAttribute("data-genre")
        ].join(" ").toLowerCase();
        var okText = !q || hay.indexOf(q) !== -1;
        var okYear = !year || card.getAttribute("data-year") === year;
        card.style.display = okText && okYear ? "" : "none";
      });
    }

    form.addEventListener("input", filter);
    form.addEventListener("change", filter);
  }

  function cardHtml(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\">" +
      "<a class=\"poster-link\" href=\"" + escapeAttr(movie.file) + "\" aria-label=\"" + escapeAttr(movie.title) + " 在线观看\">" +
      "<img src=\"" + escapeAttr(movie.cover) + "\" alt=\"" + escapeAttr(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"type-badge\">" + escapeHtml(movie.type) + "</span>" +
      "<span class=\"play-mark\">▶</span>" +
      "</a>" +
      "<div class=\"card-body\">" +
      "<h3><a href=\"" + escapeAttr(movie.file) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
      "<p class=\"meta-line\">" + escapeHtml(movie.region) + " · " + escapeHtml(movie.year) + " · " + escapeHtml(movie.genre) + "</p>" +
      "<p class=\"card-desc\">" + escapeHtml(movie.oneLine) + "</p>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"]/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[ch];
    });
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/'/g, "&#39;");
  }

  function setupSearchPage() {
    var form = document.querySelector("[data-search-panel]");
    var results = document.querySelector("[data-search-results]");
    var loadMore = document.querySelector("[data-load-more]");
    if (!form || !results || !window.SITE_MOVIES) {
      return;
    }
    var visible = 60;
    var current = [];
    var params = new URLSearchParams(window.location.search);
    var qInput = form.querySelector("input[name='q']");
    if (qInput && params.get("q")) {
      qInput.value = params.get("q");
    }

    function pick() {
      var q = (qInput ? qInput.value : "").trim().toLowerCase();
      var category = form.querySelector("select[name='category']").value;
      var type = form.querySelector("select[name='type']").value;
      current = window.SITE_MOVIES.filter(function (movie) {
        var hay = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category, movie.tags.join(" "), movie.oneLine].join(" ").toLowerCase();
        var okText = !q || hay.indexOf(q) !== -1;
        var okCategory = !category || movie.category === category;
        var okType = !type || movie.type === type;
        return okText && okCategory && okType;
      });
      visible = 60;
      render();
    }

    function render() {
      var items = current.slice(0, visible);
      results.innerHTML = items.map(cardHtml).join("");
      if (loadMore) {
        loadMore.style.display = current.length > visible ? "inline-flex" : "none";
      }
      if (!items.length) {
        results.innerHTML = "<p class=\"card-desc\">没有找到匹配影片</p>";
      }
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      pick();
    });
    form.addEventListener("input", pick);
    form.addEventListener("change", pick);
    if (loadMore) {
      loadMore.addEventListener("click", function () {
        visible += 60;
        render();
      });
    }
    pick();
  }

  function setupPlayers() {
    document.querySelectorAll("[data-player]").forEach(function (video) {
      var shell = video.closest(".video-shell");
      var overlay = shell ? shell.querySelector("[data-play]") : null;
      var stream = video.getAttribute("data-stream");
      var mounted = false;
      var hls = null;

      function mount() {
        if (mounted || !stream) {
          return;
        }
        mounted = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function start() {
        mount();
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {
            if (overlay) {
              overlay.classList.remove("is-hidden");
            }
          });
        }
      }

      if (overlay) {
        overlay.addEventListener("click", start);
      }
      video.addEventListener("click", function () {
        if (!mounted) {
          start();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHeaderSearch();
    setupHero();
    setupGridFilter();
    setupSearchPage();
    setupPlayers();
  });
})();
