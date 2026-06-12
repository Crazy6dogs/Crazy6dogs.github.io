const reelTrack = document.querySelector("[data-reel-track]");
const reelRail = document.querySelector("[data-reel-rail]");
const activeVideo = document.querySelector("#reel-active-video");
const activeKicker = document.querySelector("#reel-active-kicker");
const activeTitle = document.querySelector("#reel-active-title");
const activeDescription = document.querySelector("#reel-active-description");

if (reelTrack && reelRail && activeVideo && activeKicker && activeTitle && activeDescription) {
  const originalCards = Array.from(reelTrack.querySelectorAll(".reel-card"));
  let reelOffset = 0;
  let reelPaused = false;
  let lastTimestamp = 0;
  const reelSpeed = 52;

  const playVideo = (video, options = {}) => {
    if (!video) return;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch((error) => {
        if (options.fallbackMuted && !video.muted) {
          video.muted = true;
          const mutedPlayPromise = video.play();
          if (mutedPlayPromise && typeof mutedPlayPromise.catch === "function") {
            mutedPlayPromise.catch(() => {});
          }
          return;
        }
        // Browsers may block autoplay before direct user interaction.
      });
    }
  };

  const playPreviewVideos = () => {
    reelTrack.querySelectorAll(".reel-preview video").forEach((video) => {
      video.muted = true;
      playVideo(video);
    });
  };

  originalCards.forEach((card) => {
    const clone = card.cloneNode(true);
    clone.setAttribute("data-clone", "true");
    reelTrack.appendChild(clone);
  });

  const setActiveCard = (card, shouldPlay = false) => {
    const { key, kicker, title, description, ratio, src } = card.dataset;

    reelTrack.querySelectorAll(`.reel-card[data-key="${key}"]`).forEach((item) => {
      item.classList.add("is-active");
    });

    reelTrack.querySelectorAll(".reel-card").forEach((item) => {
      if (item.dataset.key !== key) {
        item.classList.remove("is-active");
      }
    });

    activeKicker.textContent = kicker;
    activeTitle.textContent = title;
    activeDescription.textContent = description;
    activeVideo.setAttribute("aria-label", `${title}项目介绍视频`);
    activeVideo.classList.toggle("is-portrait", ratio === "portrait");

    if (activeVideo.getAttribute("src") !== src) {
      activeVideo.src = src;
      activeVideo.load();
    }

    if (shouldPlay) {
      playVideo(activeVideo, { fallbackMuted: true });
    }
  };

  reelTrack.addEventListener("click", (event) => {
    const card = event.target.closest(".reel-card");
    if (!card) return;
    reelPaused = true;
    reelRail.classList.add("is-paused");
    setActiveCard(card, true);
  });

  reelRail.addEventListener("mouseenter", () => {
    reelPaused = true;
    reelRail.classList.add("is-paused");
  });

  reelRail.addEventListener("mouseleave", () => {
    reelPaused = false;
    reelRail.classList.remove("is-paused");
  });

  const animateReel = (timestamp) => {
    if (!lastTimestamp) {
      lastTimestamp = timestamp;
    }
    const deltaSeconds = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    if (!reelPaused) {
      const resetPoint = reelTrack.scrollWidth / 2;
      reelOffset -= reelSpeed * deltaSeconds;
      if (Math.abs(reelOffset) >= resetPoint) {
        reelOffset = 0;
      }
      reelTrack.style.transform = `translateX(${reelOffset}px)`;
    }
    window.requestAnimationFrame(animateReel);
  };

  setActiveCard(originalCards[0]);
  playPreviewVideos();
  window.requestAnimationFrame(animateReel);
}
