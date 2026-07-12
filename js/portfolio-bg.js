(function () {
  const scene = document.querySelector(".portfolio__bg");
  const stage = document.querySelector(".portfolio");

  if (!scene || !stage) {
    return;
  }

  const layers = Array.from(scene.querySelectorAll("[data-depth]"));
  const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));
  const scrollMarks = Array.from(document.querySelectorAll(".scroll-mark span"));
  const scrollSections = [
    document.querySelector(".hero"),
    document.querySelector("#about"),
    document.querySelector("#work"),
  ];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (reducedMotion.matches) {
    stage.classList.remove("is-booting");
    stage.classList.add("is-bg-visible", "is-content-visible", "is-hero-visible");
    revealItems.forEach((item) => item.classList.add("is-reveal-visible"));
    setupScrollMark();
    return;
  }

  const introTiming = {
    blackDelay: 420,
    bgDuration: 2100,
    contentGap: 80,
    heroGap: 280,
  };

  const state = {
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0,
    targetScroll: window.scrollY || 0,
    currentScroll: window.scrollY || 0,
  };

  const startIntro = () => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    scene.classList.add("is-bg-intro");

    layers.forEach((layer, index) => {
      const rect = layer.getBoundingClientRect();
      const depth = Number.parseFloat(layer.dataset.depth || "0");
      const startX = centerX - (rect.left + rect.width / 2);
      const startY = centerY - (rect.top + rect.height / 2);
      const startScale = Math.max(0.34, 0.58 - depth * 0.14);
      const delay = index * 0.045;

      layer.style.setProperty("--intro-x", `${startX.toFixed(2)}px`);
      layer.style.setProperty("--intro-y", `${startY.toFixed(2)}px`);
      layer.style.setProperty("--intro-scale", startScale.toFixed(2));
      layer.style.setProperty("--intro-opacity", "0");
      layer.style.setProperty("--intro-delay", `${delay.toFixed(3)}s`);
    });

    window.requestAnimationFrame(() => {
      stage.classList.add("is-bg-visible");

      window.requestAnimationFrame(() => {
        layers.forEach((layer) => {
          layer.style.setProperty("--intro-x", "0px");
          layer.style.setProperty("--intro-y", "0px");
          layer.style.setProperty("--intro-scale", "1");
          layer.style.setProperty("--intro-opacity", "1");
        });
      });
    });

    window.setTimeout(() => {
      scene.classList.remove("is-bg-intro");

      layers.forEach((layer) => {
        layer.style.removeProperty("--intro-x");
        layer.style.removeProperty("--intro-y");
        layer.style.removeProperty("--intro-scale");
        layer.style.removeProperty("--intro-opacity");
        layer.style.removeProperty("--intro-delay");
      });
    }, introTiming.bgDuration);
  };

  const startSequence = () => {
    window.setTimeout(startIntro, introTiming.blackDelay);

    window.setTimeout(() => {
      stage.classList.remove("is-booting");
      stage.classList.add("is-content-visible");
    }, introTiming.blackDelay + introTiming.bgDuration + introTiming.contentGap);

    window.setTimeout(() => {
      stage.classList.add("is-hero-visible");
    }, introTiming.blackDelay + introTiming.bgDuration + introTiming.heroGap);
  };

  const setupScrollReveal = () => {
    revealItems.forEach((item) => {
      item.style.setProperty("--reveal-delay", item.dataset.revealDelay || "0s");
    });

    if (!("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-reveal-visible"));
      return;
    }

    const revealGroups = new Map();

    revealItems.forEach((item) => {
      const trigger = item.closest(".about, .work") || item;

      if (!revealGroups.has(trigger)) {
        revealGroups.set(trigger, []);
      }

      revealGroups.get(trigger).push(item);
    });

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const items = revealGroups.get(entry.target) || [];

          items.forEach((item) => {
            item.classList.toggle("is-reveal-visible", entry.isIntersecting);
          });
        });
      },
      {
        threshold: 0.18,
        rootMargin: "-5% 0px -12% 0px",
      }
    );

    revealGroups.forEach((items, trigger) => {
      revealObserver.observe(trigger);
    });
  };

  function setActiveScrollMark(activeIndex) {
    scrollMarks.forEach((mark, index) => {
      mark.classList.toggle("is-active", index === activeIndex);
    });
  }

  function updateScrollMark() {
    if (!scrollMarks.length) {
      return;
    }

    const viewportAnchor = window.innerHeight * 0.52;
    let activeIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    scrollSections.forEach((section, index) => {
      if (!section) {
        return;
      }

      const rect = section.getBoundingClientRect();

      if (rect.top <= viewportAnchor && rect.bottom >= viewportAnchor) {
        activeIndex = index;
        nearestDistance = 0;
        return;
      }

      const distance = Math.min(
        Math.abs(rect.top - viewportAnchor),
        Math.abs(rect.bottom - viewportAnchor)
      );

      if (distance < nearestDistance) {
        nearestDistance = distance;
        activeIndex = index;
      }
    });

    setActiveScrollMark(activeIndex);
  }

  function setupScrollMark() {
    updateScrollMark();

    window.addEventListener("scroll", updateScrollMark, { passive: true });
    window.addEventListener("resize", updateScrollMark);
  }

  const setPointerTarget = (clientX, clientY) => {
    const rect = stage.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;

    state.targetX = (x - 0.5) * 2;
    state.targetY = (y - 0.5) * 2;
  };

  const resetPointerTarget = () => {
    state.targetX = 0;
    state.targetY = 0;
  };

  window.addEventListener(
    "pointermove",
    (event) => {
      setPointerTarget(event.clientX, event.clientY);
    },
    { passive: true }
  );

  window.addEventListener("pointerleave", resetPointerTarget, { passive: true });

  window.addEventListener(
    "scroll",
    () => {
      state.targetScroll = window.scrollY || 0;
    },
    { passive: true }
  );

  const render = () => {
    state.currentX += (state.targetX - state.currentX) * 0.08;
    state.currentY += (state.targetY - state.currentY) * 0.08;
    state.currentScroll += (state.targetScroll - state.currentScroll) * 0.06;

    scene.style.setProperty("--scene-rotate-x", `${(-state.currentY * 2.5).toFixed(3)}deg`);
    scene.style.setProperty("--scene-rotate-y", `${(state.currentX * 3.2).toFixed(3)}deg`);

    layers.forEach((layer) => {
      const depth = Number.parseFloat(layer.dataset.depth || "0");
      const direction = layer.dataset.drift === "reverse" ? -1 : 1;
      const x = state.currentX * depth * 54 * direction;
      const y = state.currentY * depth * 42 * direction - state.currentScroll * depth * 0.035;
      const z = depth * 96;

      layer.style.setProperty("--bg-x", `${x.toFixed(2)}px`);
      layer.style.setProperty("--bg-y", `${y.toFixed(2)}px`);
      layer.style.setProperty("--bg-z", `${z.toFixed(2)}px`);
    });

    window.requestAnimationFrame(render);
  };

  setupScrollReveal();
  setupScrollMark();
  startSequence();
  render();
})();


const btnTop = document.querySelector('.btn-top');

window.addEventListener('scroll', () => {
  if (window.scrollY > 200) {
    btnTop.classList.add('show');
  } else {
    btnTop.classList.remove('show');
  }
});
