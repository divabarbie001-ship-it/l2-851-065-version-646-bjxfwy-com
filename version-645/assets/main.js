(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMobileMenu() {
    var button = qs('[data-menu-toggle]');
    var menu = qs('[data-nav-menu]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    if (slides.length > 1) {
      start();
    }
  }

  function initLocalFilters() {
    qsa('[data-card-filter]').forEach(function (filterBox) {
      var textInput = qs('[data-local-filter]', filterBox);
      var categorySelect = qs('[data-category-filter]', filterBox);
      var yearSelect = qs('[data-year-filter]', filterBox);
      var cardList = qs('[data-card-list]');

      if (!cardList) {
        return;
      }

      var cards = qsa('.movie-card', cardList);

      function applyFilter() {
        var query = textInput ? textInput.value.trim().toLowerCase() : '';
        var category = categorySelect ? categorySelect.value : '';
        var year = yearSelect ? yearSelect.value : '';

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year')
          ].join(' ').toLowerCase();
          var matchQuery = !query || haystack.indexOf(query) !== -1;
          var matchCategory = !category || card.getAttribute('data-category') === category;
          var matchYear = !year || card.getAttribute('data-year') === year;

          card.classList.toggle('is-hidden-card', !(matchQuery && matchCategory && matchYear));
        });
      }

      [textInput, categorySelect, yearSelect].forEach(function (element) {
        if (element) {
          element.addEventListener('input', applyFilter);
          element.addEventListener('change', applyFilter);
        }
      });
    });
  }

  function renderSearchCard(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="movie-poster" href="' + movie.href + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="movie-badge">' + escapeHtml(movie.type) + '</span>',
      '    <span class="play-float">播放</span>',
      '  </a>',
      '  <div class="movie-body">',
      '    <h3><a href="' + movie.href + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="movie-meta">',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.categoryName) + '</span>',
      '    </div>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initSearchPage() {
    var input = qs('#searchInput');
    var category = qs('#searchCategory');
    var type = qs('#searchType');
    var results = qs('#searchResults');
    var count = qs('#searchCount');

    if (!input || !results || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    input.value = initialQuery;

    function applySearch() {
      var query = input.value.trim().toLowerCase();
      var categoryValue = category ? category.value : '';
      var typeValue = type ? type.value : '';
      var list = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.categoryName,
          movie.oneLine,
          movie.tags.join(' ')
        ].join(' ').toLowerCase();
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchCategory = !categoryValue || movie.categorySlug === categoryValue;
        var matchType = !typeValue || movie.type === typeValue;

        return matchQuery && matchCategory && matchType;
      });

      count.textContent = '共找到 ' + list.length + ' 部影片';
      results.innerHTML = list.slice(0, 240).map(renderSearchCard).join('');

      if (list.length > 240) {
        count.textContent += '，当前展示前 240 部，请继续输入关键词缩小范围。';
      }
    }

    [input, category, type].forEach(function (element) {
      if (element) {
        element.addEventListener('input', applySearch);
        element.addEventListener('change', applySearch);
      }
    });

    applySearch();
  }

  function initPlayer() {
    var panel = qs('[data-player]');

    if (!panel) {
      return;
    }

    var video = qs('video', panel);
    var startButton = qs('[data-start-player]', panel);
    var source = video ? video.getAttribute('data-src') : '';
    var hlsInstance = null;
    var isReady = false;

    function attachAndPlay() {
      if (!video || !source) {
        return;
      }

      if (!isReady) {
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
            if (!data || !data.fatal) {
              return;
            }

            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            } else {
              hlsInstance.destroy();
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          video.src = source;
        }
        isReady = true;
      }

      if (startButton) {
        startButton.classList.add('is-hidden');
      }

      video.play().catch(function () {
        video.controls = true;
      });
    }

    if (startButton) {
      startButton.addEventListener('click', attachAndPlay);
    }

    video.addEventListener('play', function () {
      if (startButton) {
        startButton.classList.add('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initLocalFilters();
    initSearchPage();
    initPlayer();
  });
})();
