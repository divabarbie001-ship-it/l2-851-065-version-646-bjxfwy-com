
(function() {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function() {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;
    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }
    function next() {
      show(current + 1);
    }
    function start() {
      timer = window.setInterval(next, 5000);
    }
    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }
    var prevButton = hero.querySelector('[data-hero-prev]');
    var nextButton = hero.querySelector('[data-hero-next]');
    if (prevButton) {
      prevButton.addEventListener('click', function() {
        show(current - 1);
        restart();
      });
    }
    if (nextButton) {
      nextButton.addEventListener('click', function() {
        show(current + 1);
        restart();
      });
    }
    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });
    show(0);
    start();
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
  searchInputs.forEach(function(input) {
    var panel = input.closest('.container-custom') || document;
    var yearFilter = panel.querySelector('[data-year-filter]');
    var cards = Array.prototype.slice.call(panel.querySelectorAll('.js-movie-card'));
    function apply() {
      var q = input.value.trim().toLowerCase();
      var year = yearFilter ? yearFilter.value : '';
      cards.forEach(function(card) {
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var info = (card.getAttribute('data-info') || '').toLowerCase();
        var okText = !q || title.indexOf(q) !== -1 || info.indexOf(q) !== -1;
        var okYear = !year || info.indexOf(year) !== -1;
        card.classList.toggle('is-hidden', !(okText && okYear));
      });
    }
    input.addEventListener('input', apply);
    if (yearFilter) {
      yearFilter.addEventListener('change', apply);
    }
  });
})();
