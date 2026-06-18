(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(i);
                start();
            });
        });
        start();
    }

    function getQueryValue(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || "";
    }

    function setupFilters() {
        var panels = document.querySelectorAll("[data-filter-panel]");
        if (!panels.length) {
            return;
        }
        var initialQuery = getQueryValue("q").trim().toLowerCase();
        panels.forEach(function (panel) {
            var input = panel.querySelector("[data-search-input]");
            var category = panel.querySelector("[data-category-filter]");
            var year = panel.querySelector("[data-year-filter]");
            var grid = document.querySelector("[data-movie-grid]");
            if (!grid) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
            if (input && initialQuery) {
                input.value = initialQuery;
            }
            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var selectedCategory = category ? category.value : "";
                var selectedYear = year ? year.value : "";
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-text") || "").toLowerCase();
                    var cardCategory = card.getAttribute("data-category") || "";
                    var cardYear = card.getAttribute("data-year") || "";
                    var matched = true;
                    if (query && text.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (selectedCategory && selectedCategory !== cardCategory) {
                        matched = false;
                    }
                    if (selectedYear && selectedYear !== cardYear) {
                        matched = false;
                    }
                    card.hidden = !matched;
                });
            }
            [input, category, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    window.initMoviePlayer = function (videoUrl) {
        ready(function () {
            var shell = document.querySelector(".video-shell");
            var video = document.querySelector("[data-player-video]");
            var button = document.querySelector("[data-play-button]");
            var attached = false;
            if (!shell || !video || !button || !videoUrl) {
                return;
            }
            function attach() {
                if (attached) {
                    return;
                }
                attached = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = videoUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(videoUrl);
                    hls.attachMedia(video);
                } else {
                    video.src = videoUrl;
                }
            }
            function play() {
                attach();
                shell.classList.add("is-playing");
                var action = video.play();
                if (action && typeof action.catch === "function") {
                    action.catch(function () {});
                }
            }
            button.addEventListener("click", play);
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener("play", function () {
                shell.classList.add("is-playing");
            });
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
