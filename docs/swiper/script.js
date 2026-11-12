(() => {
  if (typeof Swiper === "undefined") {
    document.querySelector("#load-error").hidden = false;
    return;
  }
  const group = Number(document.body.dataset.group);
  const useCurrent = document.body.dataset.current === "true";
  const custom = document.body.dataset.pagination === "custom";
  const swiper = new Swiper(".swiper", {
    effect: document.body.dataset.effect || "slide",
    fadeEffect: { crossFade: true },
    slidesPerView: 1,
    slidesPerGroup: 1,
    spaceBetween: 16,
    speed: matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 350,
    loop: false,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
      stopOnLastSlide: false,
      waitForTransition: false,
    },
    watchSlidesProgress: true,
    breakpoints: { 768: { slidesPerView: group, slidesPerGroup: group } },
    navigation: { prevEl: ".previous", nextEl: ".next" },
    pagination: custom ? false : {
      el: ".swiper-pagination",
      clickable: true,
      renderBullet(index, className) {
        return `<button type="button" class="${className}" aria-label="グループ${index + 1}を表示">${index + 1}</button>`;
      },
    },
    a11y: {
      enabled: true,
      prevSlideMessage: "前のグループを表示",
      nextSlideMessage: "次のグループを表示",
      firstSlideMessage: "最初のグループです",
      lastSlideMessage: "最後のグループです",
      slideLabelMessage: "全{{slidesLength}}枚中{{index}}枚目",
      containerRoleDescriptionMessage: "カルーセル",
      itemRoleDescriptionMessage: "スライド",
    },
  });
  const autoplayToggle = document.querySelector(".autoplay-toggle");
  autoplayToggle.addEventListener("click", () => {
    if (swiper.autoplay.running) {
      swiper.autoplay.stop();
      autoplayToggle.textContent = "自動再生を開始";
    } else {
      swiper.autoplay.start();
      autoplayToggle.textContent = "自動再生を停止";
    }
  });
  function syncState() {
    // Register after construction so Swiper's a11y handler runs first.
    if (custom) {
      const el = document.querySelector(".custom-pagination");
      const groupSize = Number(swiper.params.slidesPerGroup);
      const count = Math.ceil(swiper.slides.length / groupSize);
      if (el.children.length !== count) {
        el.replaceChildren(...Array.from({ length: count }, (_, index) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "swiper-pagination-bullet";
          button.textContent = index + 1;
          const start = index * groupSize + 1;
          const end = Math.min(swiper.slides.length, start + groupSize - 1);
          button.setAttribute("aria-label", `スライド${start}${start === end ? "" : `〜${end}`}を表示`);
          button.addEventListener("click", () => swiper.slideTo(index * groupSize));
          return button;
        }));
      }
      [...el.children].forEach((button, index) => {
        button.classList.toggle("swiper-pagination-bullet-active", index === Math.floor(swiper.activeIndex / groupSize));
      });
    } else {
      swiper.pagination.bullets.each((bullet) => {
        if (!useCurrent) bullet.removeAttribute("aria-current");
      });
    }
    const start = swiper.activeIndex + 1;
    const end = Math.min(swiper.slides.length, start + Number(swiper.params.slidesPerView) - 1);
    document.querySelector("#status").textContent =
      `表示中：${start}〜${end}枚目 / 全${swiper.slides.length}枚（${swiper.params.slidesPerGroup}枚送り）`;
  }
  swiper.on("paginationUpdate", syncState);
  swiper.on("resize", syncState);
  if (custom) swiper.on("slideChange", syncState);
  syncState();
})();
