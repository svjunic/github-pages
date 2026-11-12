// divには標準のボタン動作がないため、クリックとキーボード操作を実装する。
document.querySelectorAll('.trigger[role="button"]').forEach((trigger) => {
  const panel = document.getElementById(trigger.getAttribute("aria-controls"));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let animation = null;

  function setExpanded(expanded, animate = true) {
    // 連続操作時は、アニメーション途中の見た目を次の開始位置にする。
    const startHeight = panel.getBoundingClientRect().height;
    const startOpacity = panel.hidden ? 0 : Number(getComputedStyle(panel).opacity);
    const startPadding = panel.hidden ? "0px" : getComputedStyle(panel).paddingBottom;
    if (animation) {
      animation.cancel();
      animation = null;
    }

    // パネル内にフォーカスがある状態で閉じても、フォーカスを失わないようにする。
    if (!expanded && panel.contains(document.activeElement)) trigger.focus();
    trigger.setAttribute("aria-expanded", String(expanded));
    // 閉じるアニメーション中もTab移動・支援技術の対象から外す。
    panel.inert = !expanded;
    if (expanded) panel.removeAttribute("aria-hidden");
    else panel.setAttribute("aria-hidden", "true");

    if (!animate || reducedMotion.matches || typeof panel.animate !== "function") {
      panel.hidden = !expanded;
      return;
    }

    panel.hidden = false;
    const endHeight = expanded ? panel.getBoundingClientRect().height : 0;
    const endPadding = expanded ? getComputedStyle(panel).paddingBottom : "0px";
    animation = panel.animate(
      [
        { height: `${startHeight}px`, opacity: startOpacity, paddingBottom: startPadding },
        { height: `${endHeight}px`, opacity: expanded ? 1 : 0, paddingBottom: endPadding },
      ],
      { duration: 240, easing: "ease-in-out", fill: "both" },
    );
    const currentAnimation = animation;
    currentAnimation.onfinish = () => {
      if (animation !== currentAnimation) return;
      panel.hidden = !expanded;
      // 固定の高さを残さず、文章の折り返しや画面幅の変化に追従する。
      currentAnimation.cancel();
      animation = null;
    };
  }

  function toggle() {
    setExpanded(trigger.getAttribute("aria-expanded") !== "true");
  }

  // HTMLに指定した初期状態を、パネルの表示状態にも反映する。
  setExpanded(trigger.getAttribute("aria-expanded") === "true", false);

  reducedMotion.addEventListener("change", () => {
    setExpanded(trigger.getAttribute("aria-expanded") === "true", false);
  });

  let spacePressed = false;
  trigger.addEventListener("click", toggle);
  trigger.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (!event.repeat) toggle();
    } else if (event.key === " ") {
      // 標準ボタンと同様に、Spaceは離したときに開閉する。
      event.preventDefault();
      spacePressed = true;
    }
  });
  trigger.addEventListener("keyup", (event) => {
    if (event.key === " ") {
      event.preventDefault();
      if (spacePressed) toggle();
      spacePressed = false;
    }
  });
  trigger.addEventListener("blur", () => {
    spacePressed = false;
  });
});
