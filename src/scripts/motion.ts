import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { resolveLatestDmgUrl } from "../lib/download";

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function initReveal() {
  const nodes = document.querySelectorAll<HTMLElement>(".reveal, .reveal-scale");
  if (!nodes.length) return;

  if (reduceMotion()) {
    nodes.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
  );

  nodes.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight * 0.9 && rect.bottom > 0;
    if (inView) el.classList.add("is-visible");
    else observer.observe(el);
  });
}

function initNavScroll() {
  const shell = document.querySelector<HTMLElement>("[data-nav-shell]");
  const light = document.querySelector<HTMLElement>("[data-light-section]");
  if (!shell) return;

  const update = () => {
    const scrolled = window.scrollY > 24;
    shell.classList.toggle("is-scrolled", scrolled);

    if (!shell.classList.contains("is-light")) {
      shell.style.background = scrolled
        ? "rgb(12 12 14 / 0.9)"
        : "rgb(12 12 14 / 0.72)";
    } else {
      shell.style.background = "";
    }

    if (light) {
      const top = light.getBoundingClientRect().top;
      const inLight = top < window.innerHeight * 0.35;
      shell.classList.toggle("is-light", inLight);
      if (inLight) shell.style.background = "";
    }
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
}

function initParallax() {
  if (reduceMotion()) return;
  if (window.matchMedia("(max-width: 767px)").matches) return;

  const nodes = Array.from(
    document.querySelectorAll<HTMLElement>("[data-parallax]"),
  );
  if (!nodes.length) return;

  nodes.forEach((el) => {
    const speed = Number(el.dataset.parallaxSpeed ?? "0.06");
    gsap.to(el, {
      yPercent: speed * 80,
      ease: "none",
      scrollTrigger: {
        trigger: el.parentElement ?? el,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.6,
      },
    });
  });
}

function initThemeWash() {
  const wash = document.querySelector<HTMLElement>("[data-theme-wash]");
  const bridge = document.querySelector<HTMLElement>("[data-theme-bridge]");
  const light = document.querySelector<HTMLElement>("[data-light-section]");
  if (!wash || !light) return;

  if (reduceMotion()) {
    wash.style.backgroundColor = "";
    return;
  }

  ScrollTrigger.create({
    trigger: bridge ?? light,
    start: "top bottom",
    end: "bottom top",
    scrub: true,
    onUpdate: (self) => {
      const t = self.progress;
      // Soft charcoal → cool mist as the bridge enters
      const r = Math.round(12 + (236 - 12) * t);
      const g = Math.round(12 + (238 - 12) * t);
      const b = Math.round(14 + (241 - 14) * t);
      if (t < 0.15) {
        wash.style.backgroundColor = "#0c0c0e";
      } else if (t > 0.85) {
        wash.style.backgroundColor = "#eceef1";
      } else {
        wash.style.backgroundColor = `rgb(${r} ${g} ${b})`;
      }
    },
  });
}

function initMoodsPin() {
  if (reduceMotion()) return;
  if (window.matchMedia("(max-width: 767px)").matches) return;

  const moods = document.querySelector<HTMLElement>("#moods");
  if (!moods) return;

  ScrollTrigger.create({
    trigger: moods,
    start: "top top+=72",
    end: "+=35%",
    pin: true,
    pinSpacing: true,
    scrub: 0.8,
  });
}

function initStillCrossfade() {
  if (reduceMotion()) return;

  document.querySelectorAll<HTMLElement>("[data-still-crossfade]").forEach((root) => {
    const slides = Array.from(
      root.querySelectorAll<HTMLElement>("[data-still]"),
    );
    if (slides.length < 2) return;

    let index = 0;

    const show = (next: number) => {
      const current = slides[index];
      const upcoming = slides[next];
      if (!current || !upcoming) return;
      gsap.to(current, { opacity: 0, duration: 1.15, ease: "power2.inOut" });
      gsap.to(upcoming, { opacity: 1, duration: 1.15, ease: "power2.inOut" });
      current.setAttribute("aria-hidden", "true");
      upcoming.removeAttribute("aria-hidden");
      index = next;
    };

    const advance = () => show((index + 1) % slides.length);

    let timer: number | undefined;

    const start = () => {
      if (timer) return;
      timer = window.setInterval(advance, 4200);
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = undefined;
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) start();
        else stop();
      },
      { threshold: 0.3 },
    );
    io.observe(root);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else if (root.getBoundingClientRect().top < window.innerHeight) start();
    });
  });
}

function initDownloadDrop() {
  const stage = document.querySelector<HTMLElement>("[data-download-stage]");
  const cta = document.querySelector<HTMLElement>("[data-download-cta]");
  const icon = document.querySelector<HTMLElement>("[data-download-icon]");
  if (!stage || reduceMotion()) return;

  gsap.set([icon, cta].filter(Boolean), { y: 28, opacity: 0 });

  ScrollTrigger.create({
    trigger: stage,
    start: "top 75%",
    once: true,
    onEnter: () => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      if (icon) tl.to(icon, { y: 0, opacity: 1, duration: 0.85 }, 0);
      if (cta) tl.to(cta, { y: 0, opacity: 1, duration: 0.75 }, 0.18);
    },
  });
}

function initVideos() {
  const hero = document.querySelector<HTMLVideoElement>("[data-hero-video]");
  const poster = document.querySelector<HTMLImageElement>("[data-hero-poster]");
  const sectionVideos = document.querySelectorAll<HTMLVideoElement>(
    "[data-section-video]",
  );

  if (reduceMotion()) {
    if (hero) {
      hero.pause();
      hero.classList.add("hidden");
      hero.removeAttribute("autoplay");
    }
    poster?.classList.remove("hidden");
    sectionVideos.forEach((v) => {
      v.pause();
      v.removeAttribute("autoplay");
    });
    return;
  }

  if (hero) {
    const play = () => {
      hero.play().catch(() => {});
    };
    play();

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) play();
        else hero.pause();
      },
      { threshold: 0.2 },
    );
    io.observe(hero);
  }

  sectionVideos.forEach((video) => {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(video);
  });
}

let cachedDownloadUrl: string | null = null;

async function getDownloadUrl() {
  if (cachedDownloadUrl) return cachedDownloadUrl;
  cachedDownloadUrl = await resolveLatestDmgUrl();
  return cachedDownloadUrl;
}

function initDownloadLinks() {
  const links = document.querySelectorAll<HTMLAnchorElement>("[data-download]");

  getDownloadUrl().then((url) => {
    links.forEach((a) => {
      a.href = url;
    });
  });

  links.forEach((a) => {
    a.addEventListener("click", async (event) => {
      event.preventDefault();
      const url = await getDownloadUrl();
      a.href = url;
      window.location.assign(url);
    });
  });
}

function initMagneticCta() {
  if (reduceMotion()) return;
  if (window.matchMedia("(pointer: coarse)").matches) return;

  const buttons = document.querySelectorAll<HTMLElement>(".cta-magnetic");
  buttons.forEach((btn) => {
    btn.addEventListener("pointermove", (event) => {
      const rect = btn.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.08}px, ${y * 0.1 - 2}px) scale(1.02)`;
    });
    btn.addEventListener("pointerleave", () => {
      btn.style.transform = "";
    });
  });
}

/** Soft needle drop + brief crackle via Web Audio (no asset file). */
function playNeedleDrop(ctx: AudioContext) {
  const now = ctx.currentTime;

  // Soft click / needle kiss
  const click = ctx.createOscillator();
  const clickGain = ctx.createGain();
  click.type = "sine";
  click.frequency.setValueAtTime(180, now);
  click.frequency.exponentialRampToValueAtTime(55, now + 0.08);
  clickGain.gain.setValueAtTime(0.0001, now);
  clickGain.gain.exponentialRampToValueAtTime(0.12, now + 0.01);
  clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
  click.connect(clickGain);
  clickGain.connect(ctx.destination);
  click.start(now);
  click.stop(now + 0.2);

  // Brief filtered noise crackle
  const seconds = 1.4;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.45));
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1800;
  filter.Q.value = 0.7;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.0001, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.035, now + 0.05);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + seconds);
  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(now);
  noise.stop(now + seconds);
}

function initSound() {
  const toggle = document.querySelector<HTMLButtonElement>("[data-sound-toggle]");
  if (!toggle) return;

  const iconMuted = toggle.querySelector<HTMLElement>("[data-icon-muted]");
  const iconOn = toggle.querySelector<HTMLElement>("[data-icon-on]");
  let enabled = false;
  let ctx: AudioContext | null = null;
  let playedOnce = false;

  const setUi = () => {
    toggle.setAttribute("aria-pressed", enabled ? "true" : "false");
    toggle.setAttribute("aria-label", enabled ? "Mute sound" : "Enable sound");
    toggle.title = enabled ? "Sound on" : "Sound off";
    iconMuted?.classList.toggle("hidden", enabled);
    iconOn?.classList.toggle("hidden", !enabled);
  };

  toggle.addEventListener("click", async () => {
    enabled = !enabled;
    setUi();
    if (!enabled) {
      await ctx?.suspend();
      return;
    }
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") await ctx.resume();
    if (!playedOnce && !reduceMotion()) {
      playNeedleDrop(ctx);
      playedOnce = true;
    }
  });
}

initReveal();
initNavScroll();
initParallax();
initThemeWash();
initMoodsPin();
initStillCrossfade();
initDownloadDrop();
initVideos();
initDownloadLinks();
initMagneticCta();
initSound();
