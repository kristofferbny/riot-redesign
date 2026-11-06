/* ============================================================
   THE RIOT — motion layer
   Two short sticky card-decks (deal motion) bracketing a
   horizontal pinned rooms section (scale-into-focus arrival).
   Lenis scroll. Degrades to static & visible.
   ============================================================ */

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nav = document.querySelector("[data-nav]");

  const heroRevealEls = new Set(document.querySelectorAll(".card--hero [data-reveal]"));
  const ioTargets = [...document.querySelectorAll("[data-reveal]")].filter((el) => !heroRevealEls.has(el));

  if (!reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -7% 0px" }
    );
    ioTargets.forEach((el) => io.observe(el));
  }

  const hasGSAP = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  if (!hasGSAP || reduceMotion) {
    document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-in"));
    if (nav) {
      const onScroll = () => nav.classList.toggle("is-stuck", window.scrollY > 40);
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---- Lenis ---- */
  let lenis = null;
  if (typeof window.Lenis !== "undefined") {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        const id = link.getAttribute("href");
        if (id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: 0, duration: 1.6 });
      });
    });
  }

  /* ---- Nav background ---- */
  if (nav) {
    ScrollTrigger.create({
      start: "top -40",
      end: "max",
      onUpdate: (self) => nav.classList.toggle("is-stuck", self.scroll() > 40),
    });
  }

  /* ---- Card-deck deal (scoped per .deck) ---- */
  gsap.utils.toArray("[data-deck]").forEach((deck) => {
    const cards = gsap.utils.toArray("[data-card]", deck);
    cards.forEach((card, i) => {
      if (i === cards.length - 1) return;
      const inner = card.querySelector("[data-card-inner]");
      const shade = card.querySelector("[data-card-shade]");
      const next = cards[i + 1];
      gsap
        .timeline({ scrollTrigger: { trigger: next, start: "top bottom", end: "top top", scrub: true } })
        .fromTo(inner, { scale: 1 }, { scale: 0.93, ease: "none" }, 0)
        .fromTo(shade, { opacity: 0 }, { opacity: 0.42, ease: "none" }, 0);
    });
  });

  /* ---- Hero opening morph ---- */
  const heroLines = gsap.utils.toArray(".card--hero .line__inner");
  gsap.set(heroLines, { yPercent: 120 });
  const heroImg = document.querySelector("[data-hero-media] .card__img");
  const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
  if (heroImg) intro.from(heroImg, { scale: 1.16, duration: 1.9, ease: "power2.out" }, 0);
  intro
    .to(heroLines, { yPercent: 0, duration: 1.2, stagger: 0.1 }, 0.25)
    .add(() => {
      [...heroRevealEls].forEach((el, i) => {
        gsap.delayedCall(0.1 + i * 0.12, () => el.classList.add("is-in"));
      });
    }, 0.65);

  /* ---- Statement masked lines ---- */
  const stLines = gsap.utils.toArray("[data-st-line]");
  if (stLines.length) {
    gsap.set(stLines, { yPercent: 120 });
    gsap.to(stLines, {
      yPercent: 0,
      duration: 1.15,
      ease: "expo.out",
      stagger: 0.1,
      scrollTrigger: { trigger: ".card--statement", start: "top 60%" },
    });
  }

  /* ---- Poster parallax ---- */
  const posterImg = document.querySelector(".card--poster .card__img");
  if (posterImg) {
    gsap.fromTo(
      posterImg,
      { yPercent: -5 },
      { yPercent: 5, ease: "none", scrollTrigger: { trigger: ".card--poster", start: "top bottom", end: "bottom top", scrub: true } }
    );
  }

  /* ---- ROOMS: 3D orbit carousel + zoom framing (desktop) ---- */
  const mm = gsap.matchMedia();
  mm.add("(min-width: 768px)", () => {
    const orbit = document.querySelector("[data-orbit]");
    const scene = document.querySelector("[data-orbit-scene]");
    const ring = document.querySelector("[data-orbit-ring]");
    const ocards = gsap.utils.toArray("[data-ocard]");
    const n = ocards.length;
    if (!orbit || !ring || !n) return;

    const countEl = document.querySelector("[data-orbit-count]");
    const nameEl = document.querySelector("[data-orbit-name]");
    const descEl = document.querySelector("[data-orbit-desc]");
    const idxEl = document.querySelector("[data-orbit-index]");

    orbit.classList.add("is-3d");
    const step = 360 / n;

    // Place each card on the ring: rotate, then push out along its own Z.
    const layout = () => {
      const radius = Math.round(ring.offsetWidth * 1.15 + 120);
      ocards.forEach((c, i) => {
        c.style.transform = `rotateY(${i * step}deg) translateZ(${radius}px)`;
      });
    };
    layout();

    let activeIdx = -1;
    const setActive = (rotY) => {
      let idx = Math.round(-rotY / step) % n;
      if (idx < 0) idx += n;
      if (idx === activeIdx) return;
      activeIdx = idx;
      const c = ocards[idx];
      if (nameEl) nameEl.innerHTML = c.dataset.name;
      if (descEl) descEl.textContent = c.dataset.desc;
      const num = String(idx + 1).padStart(2, "0");
      if (idxEl) idxEl.textContent = "(" + num + ")";
      if (countEl) countEl.textContent = num + " / 0" + n;
    };

    // Entry: the scene zooms OUT as the section rises into view, so the
    // step-back is already underway before it pins (no late jump, and the
    // card is small by the time it lands, so it never overlaps the caption).
    gsap.fromTo(
      scene,
      { scale: 1 },
      {
        scale: 0.68,
        ease: "power2.out",
        scrollTrigger: { trigger: orbit, start: "top bottom", end: "top top", scrub: true, invalidateOnRefresh: true },
      }
    );

    // Pinned: rotate the ring through all five, then zoom back IN on exit.
    gsap
      .timeline({
        scrollTrigger: {
          trigger: orbit,
          start: "top top",
          end: "+=2800",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: layout,
          onUpdate: () => setActive(gsap.getProperty(ring, "rotationY")),
        },
      })
      .fromTo(ring, { rotationY: 0 }, { rotationY: -360, ease: "none", duration: 0.84 })
      .fromTo(scene, { scale: 0.68 }, { scale: 1, ease: "power2.inOut", duration: 0.16 });

    return () => {
      orbit.classList.remove("is-3d");
      ocards.forEach((c) => (c.style.transform = ""));
      gsap.set([scene, ring], { clearProps: "all" });
    };
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
