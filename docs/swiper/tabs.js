(() => {
  if (typeof Swiper === "undefined") {
    document.querySelector("#load-error").hidden = false;
    return;
  }
  const cards = [...document.querySelectorAll(".card")].map(card => card.cloneNode(true));
  const wrapper = document.querySelector(".swiper-wrapper");
  const tablist = document.querySelector('[role="tablist"]');
  const toggle = document.querySelector(".autoplay-toggle");
  const section = document.querySelector("section");
  const desktop = matchMedia("(min-width: 768px)");
  let swiper;
  let size = 1;
  let playing = true;
  function stop() {
    playing = false;
    swiper.autoplay.stop();
    toggle.textContent = "自動再生を開始";
  }
  function sync() {
    const active = swiper.activeIndex;
    [...tablist.children].forEach((tab, index) => {
      tab.setAttribute("aria-selected", String(index === active));
      tab.tabIndex = index === active ? 0 : -1;
      tab.classList.toggle("swiper-pagination-bullet-active", index === active);
    });
    swiper.slides.each((panel, index) => {
      panel.setAttribute("aria-hidden", String(index !== active));
      panel.inert = index !== active;
    });
    const start = active * size + 1;
    document.querySelector("#status").textContent =
      `表示中：${start}〜${Math.min(cards.length, start + size - 1)}枚目 / 全${cards.length}枚（${size}枚送り）`;
  }
  function build() {
    const firstCard = swiper ? swiper.activeIndex * size : 0;
    const focusedTab = tablist.contains(document.activeElement);
    if (swiper) swiper.destroy(true, true);
    size = desktop.matches ? Number(document.body.dataset.group) : 1;
    wrapper.replaceChildren();
    tablist.replaceChildren();
    for (let start = 0; start < cards.length; start += size) {
      const index = start / size;
      const end = Math.min(cards.length, start + size);
      const label = `スライド${start + 1}${size === 1 ? "" : `〜${end}`}`;
      const panel = document.createElement("div");
      panel.className = "swiper-slide";
      panel.id = `panel-${index}`;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", `tab-${index}`);
      const content = document.createElement("div");
      content.className = "panel-cards";
      content.style.setProperty("--panel-columns", size);
      content.append(...cards.slice(start, end));
      panel.append(content);
      wrapper.append(panel);
      const tab = document.createElement("button");
      tab.type = "button";
      tab.id = `tab-${index}`;
      tab.className = "swiper-pagination-bullet";
      tab.textContent = index + 1;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", panel.id);
      tab.setAttribute("aria-label", label);
      tab.addEventListener("click", () => swiper.slideTo(index));
      tablist.append(tab);
    }
    swiper = new Swiper(".swiper", {
      initialSlide: Math.floor(firstCard / size),
      effect: document.body.dataset.effect || "slide",
      fadeEffect: { crossFade: true },
      slidesPerView: 1,
      slidesPerGroup: 1,
      spaceBetween: 16,
      speed: matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 350,
      loop: false,
      autoplay: playing ? { delay: 3000, disableOnInteraction: false, stopOnLastSlide: false, waitForTransition: false } : false,
      pagination: false,
      navigation: { prevEl: ".previous", nextEl: ".next" },
      a11y: {
        enabled: true,
        slideRole: "tabpanel",
        slideLabelMessage: null,
        prevSlideMessage: "前のグループを表示",
        nextSlideMessage: "次のグループを表示",
        containerRoleDescriptionMessage: "カルーセル",
      },
    });
    // Auto rotation is silent, including when restarted after initialization.
    wrapper.setAttribute("aria-live", "off");
    swiper.on("slideChange", sync);
    sync();
    if (focusedTab) tablist.children[swiper.activeIndex].focus();
  }
  tablist.addEventListener("keydown", event => {
    const tab = event.target.closest('[role="tab"]');
    if (!tab) return;
    const index = [...tablist.children].indexOf(tab);
    const count = tablist.children.length;
    const next = { ArrowRight: (index + 1) % count, ArrowLeft: (index - 1 + count) % count, Home: 0, End: count - 1 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    swiper.slideTo(next);
    tablist.children[next].focus();
  });
  toggle.addEventListener("click", () => {
    if (playing) stop();
    else {
      playing = true;
      swiper.params.autoplay = { ...swiper.params.autoplay, enabled: true, delay: 3000, disableOnInteraction: false, stopOnLastSlide: false, waitForTransition: false };
      swiper.autoplay.start();
      toggle.textContent = "自動再生を停止";
    }
  });
  section.addEventListener("focusin", event => {
    // Keep the rotation control usable on its first click after focus enters.
    if (event.target !== toggle) stop();
  });
  section.addEventListener("mouseenter", stop);
  desktop.addEventListener("change", build);
  build();
})();
