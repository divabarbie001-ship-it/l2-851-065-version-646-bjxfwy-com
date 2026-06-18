(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupMobileMenu() {
        var button = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            var open = panel.classList.toggle("is-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupSearchForms() {
        document.querySelectorAll(".global-search").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    return;
                }
                event.preventDefault();
                window.location.href = "search.html?q=" + encodeURIComponent(input.value.trim());
            });
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (!slides.length || !dots.length) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("is-active", position === current);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("is-active", position === current);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }
        dots.forEach(function (dot, position) {
            dot.addEventListener("click", function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(position);
                start();
            });
        });
        start();
    }

    function setupFilterGrid() {
        var grids = Array.prototype.slice.call(document.querySelectorAll(".filter-grid"));
        if (!grids.length) {
            return;
        }
        var input = document.querySelector(".local-filter");
        var formInput = document.querySelector(".search-page-form input[name='q']");
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        if (formInput && initial) {
            formInput.value = initial;
        }
        if (input && initial && input !== formInput) {
            input.value = initial;
        }
        function items() {
            var all = [];
            grids.forEach(function (grid) {
                all = all.concat(Array.prototype.slice.call(grid.querySelectorAll(".filter-item")));
            });
            return all;
        }
        function applyFilter() {
            var value = normalize((formInput && formInput.value) || (input && input.value) || initial);
            items().forEach(function (item) {
                var haystack = normalize([
                    item.getAttribute("data-title"),
                    item.getAttribute("data-year"),
                    item.getAttribute("data-genre"),
                    item.getAttribute("data-tags")
                ].join(" "));
                item.classList.toggle("hidden-by-filter", value && haystack.indexOf(value) === -1);
            });
        }
        function sortGrid(mode, button) {
            grids.forEach(function (grid) {
                var children = Array.prototype.slice.call(grid.querySelectorAll(".filter-item"));
                children.sort(function (a, b) {
                    if (mode === "latest") {
                        return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
                    }
                    if (mode === "score") {
                        return Number(b.getAttribute("data-score") || 0) - Number(a.getAttribute("data-score") || 0);
                    }
                    return 0;
                });
                children.forEach(function (child) {
                    grid.appendChild(child);
                });
            });
            document.querySelectorAll(".sort-button").forEach(function (item) {
                item.classList.toggle("is-active", item === button);
            });
        }
        [input, formInput].forEach(function (field) {
            if (field) {
                field.addEventListener("input", applyFilter);
            }
        });
        document.querySelectorAll(".sort-button").forEach(function (button) {
            button.addEventListener("click", function () {
                sortGrid(button.getAttribute("data-sort") || "default", button);
            });
        });
        applyFilter();
    }

    ready(function () {
        setupMobileMenu();
        setupSearchForms();
        setupHero();
        setupFilterGrid();
    });
})();
