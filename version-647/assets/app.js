(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, current) {
      slide.classList.toggle('active', current === activeSlide);
    });

    dots.forEach(function (dot, current) {
      dot.classList.toggle('active', current === activeSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5600);
  }

  var searchInput = document.querySelector('[data-search]');
  var filterSelect = document.querySelector('[data-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  function applySearch() {
    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var filter = filterSelect ? filterSelect.value : 'all';

    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search-text') || '').toLowerCase();
      var filterText = card.getAttribute('data-filter-text') || '';
      var keywordMatched = !keyword || text.indexOf(keyword) !== -1;
      var filterMatched = filter === 'all' || filterText.indexOf(filter) !== -1 || text.indexOf(filter.toLowerCase()) !== -1;
      card.classList.toggle('hide', !(keywordMatched && filterMatched));
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applySearch);
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', applySearch);
  }

  function setupPlayer(shell) {
    var video = shell.querySelector('video');
    var layer = shell.querySelector('[data-play-button]');
    var url = shell.getAttribute('data-hls') || '';
    var prepared = false;

    function prepare() {
      if (!video || prepared || !url) {
        return;
      }

      prepared = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = url;
      }
    }

    function play() {
      prepare();

      if (layer) {
        layer.classList.add('is-hidden');
      }

      if (video) {
        var started = video.play();

        if (started && typeof started.catch === 'function') {
          started.catch(function () {});
        }
      }
    }

    if (layer) {
      layer.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        if (layer) {
          layer.classList.add('is-hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (layer && video.currentTime === 0) {
          layer.classList.remove('is-hidden');
        }
      });
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
})();
