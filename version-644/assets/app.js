(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, "");
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function() {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    if (prev) {
      prev.addEventListener("click", function() {
        show(current - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function() {
        show(current + 1);
      });
    }
    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        show(i);
      });
    });
    show(0);
    window.setInterval(function() {
      show(current + 1);
    }, 5200);
  }

  function setupFilters() {
    var blocks = Array.prototype.slice.call(document.querySelectorAll("[data-filter-block]"));
    blocks.forEach(function(block) {
      var search = block.querySelector("[data-filter-search]");
      var selects = Array.prototype.slice.call(block.querySelectorAll("[data-filter-select]"));
      var cards = Array.prototype.slice.call(block.querySelectorAll("[data-card]"));
      var count = block.querySelector("[data-filter-count]");

      function apply() {
        var term = normalize(search ? search.value : "");
        var active = selects.map(function(select) {
          return {
            key: select.getAttribute("data-filter-select"),
            value: normalize(select.value)
          };
        });
        var visible = 0;
        cards.forEach(function(card) {
          var text = normalize(card.getAttribute("data-search"));
          var ok = !term || text.indexOf(term) !== -1;
          active.forEach(function(item) {
            if (!item.value) {
              return;
            }
            var field = normalize(card.getAttribute("data-" + item.key));
            if (field.indexOf(item.value) === -1) {
              ok = false;
            }
          });
          card.classList.toggle("hidden-by-filter", !ok);
          if (ok) {
            visible += 1;
          }
        });
        if (count) {
          count.textContent = visible;
        }
      }

      if (search) {
        search.addEventListener("input", apply);
      }
      selects.forEach(function(select) {
        select.addEventListener("change", apply);
      });
      apply();
    });
  }

  ready(function() {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
