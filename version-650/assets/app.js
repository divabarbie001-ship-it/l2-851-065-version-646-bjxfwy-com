(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupCarousel() {
        var root = document.querySelector("[data-carousel]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-carousel-dot]"));
        var prev = root.querySelector("[data-carousel-prev]");
        var next = root.querySelector("[data-carousel-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-carousel-dot") || 0));
                restart();
            });
        });
        restart();
    }

    function setupFilters() {
        var input = document.querySelector("[data-filter-input]");
        var selects = Array.prototype.slice.call(document.querySelectorAll("[data-filter-select]"));
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        if (!input && !selects.length) {
            return;
        }

        function apply() {
            var query = input ? input.value.trim().toLowerCase() : "";
            var filters = selects.map(function (select) {
                return {
                    field: select.getAttribute("data-filter-field"),
                    value: select.value
                };
            });
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-keywords") || card.textContent || "").toLowerCase();
                var ok = !query || text.indexOf(query) !== -1;
                filters.forEach(function (filter) {
                    if (filter.value && card.getAttribute("data-" + filter.field) !== filter.value) {
                        ok = false;
                    }
                });
                card.style.display = ok ? "" : "none";
            });
        }

        if (input) {
            input.addEventListener("input", apply);
        }
        selects.forEach(function (select) {
            select.addEventListener("change", apply);
        });
    }

    window.initMoviePlayer = function (mediaUrl) {
        ready(function () {
            var video = document.getElementById("movie-player");
            var startButton = document.getElementById("player-start");
            if (!video || !startButton || !mediaUrl) {
                return;
            }
            var loaded = false;
            var hls = null;

            function begin() {
                if (!loaded) {
                    loaded = true;
                    startButton.classList.add("is-hidden");
                    if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = mediaUrl;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hls = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hls.loadSource(mediaUrl);
                        hls.attachMedia(video);
                    } else {
                        video.src = mediaUrl;
                    }
                    video.controls = true;
                }
                var playTask = video.play();
                if (playTask && typeof playTask.catch === "function") {
                    playTask.catch(function () {});
                }
            }

            startButton.addEventListener("click", begin);
            video.addEventListener("click", function () {
                if (!loaded) {
                    begin();
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    };

    ready(function () {
        setupMobileMenu();
        setupCarousel();
        setupFilters();
    });
})();
