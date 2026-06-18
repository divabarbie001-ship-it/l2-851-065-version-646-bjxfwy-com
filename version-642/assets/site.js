(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
      return;
    }
    callback();
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        start();
      });
    });

    show(0);
    start();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    scopes.forEach(function (scope) {
      var input = scope.querySelector('[data-filter-input]');
      var year = scope.querySelector('[data-filter-field="year"]');
      var type = scope.querySelector('[data-filter-field="type"]');
      var list = document.querySelector('[data-card-list]');
      var empty = document.querySelector('[data-empty-state]');
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
      var url = new URL(window.location.href);
      var queryValue = url.searchParams.get('q') || '';
      if (queryValue && input) {
        input.value = queryValue;
      }

      function normalize(value) {
        return String(value || '').toLowerCase().trim();
      }

      function apply() {
        var query = normalize(input ? input.value : '');
        var selectedYear = year ? year.value : '';
        var selectedType = type ? type.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.textContent
          ].join(' '));
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
          var matchesType = !selectedType || card.getAttribute('data-type') === selectedType;
          var ok = matchesQuery && matchesYear && matchesType;
          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('visible', visible === 0);
        }
      }

      [input, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function setupYear() {
    Array.prototype.slice.call(document.querySelectorAll('[data-current-year]')).forEach(function (node) {
      node.textContent = String(new Date().getFullYear());
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupYear();
  });
})();
