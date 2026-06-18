(function () {
  function bindPlayer(source) {
    var video = document.querySelector('[data-video-player]');
    var cover = document.querySelector('[data-player-cover]');
    var button = document.querySelector('[data-player-button]');
    if (!video || !source) {
      return;
    }

    var loaded = false;
    var hls = null;

    function load() {
      if (loaded) {
        return video.play();
      }
      loaded = true;
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.controls = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
      return promise;
    }

    function toggle() {
      if (!loaded || video.paused) {
        load();
      } else {
        video.pause();
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        load();
      });
    }
    if (cover) {
      cover.addEventListener('click', load);
    }
    video.addEventListener('click', toggle);
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.initPlayer = function (source) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        bindPlayer(source);
      }, { once: true });
      return;
    }
    bindPlayer(source);
  };
})();
