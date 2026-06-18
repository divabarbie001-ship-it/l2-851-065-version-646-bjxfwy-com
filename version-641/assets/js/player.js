function setupPlayer(streamUrl) {
    var video = document.getElementById("moviePlayer");
    var cover = document.getElementById("playCover");
    var message = document.getElementById("playerMessage");
    var started = false;
    var hlsInstance = null;

    if (!video || !cover || !streamUrl) {
        return;
    }

    function showMessage(text) {
        if (message) {
            message.textContent = text;
            message.hidden = false;
        }
    }

    function playVideo() {
        var result = video.play();
        if (result && typeof result.catch === "function") {
            result.catch(function () {
                showMessage("点击画面继续播放");
            });
        }
    }

    function start() {
        cover.classList.add("is-hidden");
        if (started) {
            playVideo();
            return;
        }
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            video.addEventListener("loadedmetadata", playVideo, { once: true });
            video.load();
            playVideo();
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            playVideo();
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                playVideo();
            });
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    showMessage("播放暂时无法载入");
                    if (hlsInstance) {
                        hlsInstance.destroy();
                        hlsInstance = null;
                    }
                }
            });
            return;
        }
        showMessage("播放暂时无法载入");
    }

    cover.addEventListener("click", start);
    video.addEventListener("click", function () {
        if (!started) {
            start();
        }
    });
}
