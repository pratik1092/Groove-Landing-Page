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
  if (!shell) return;

  const onScroll = () => {
    const scrolled = window.scrollY > 24;
    shell.classList.toggle("is-scrolled", scrolled);
    shell.style.background = scrolled
      ? "rgb(12 12 14 / 0.88)"
      : "rgb(12 12 14 / 0.72)";
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
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
      yPercent: speed * 100,
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
  const light = document.querySelector<HTMLElement>("[data-light-section]");
  if (!light || reduceMotion()) return;

  gsap.fromTo(
    light,
    { autoAlpha: 0.92 },
    {
      autoAlpha: 1,
      ease: "none",
      scrollTrigger: {
        trigger: light,
        start: "top 85%",
        end: "top 40%",
        scrub: true,
      },
    },
  );
}

function initMoodsPin() {
  if (reduceMotion()) return;
  if (window.matchMedia("(max-width: 767px)").matches) return;

  const moods = document.querySelector<HTMLElement>("#moods");
  if (!moods) return;

  ScrollTrigger.create({
    trigger: moods,
    start: "top top+=72",
    end: "+=45%",
    pin: true,
    pinSpacing: true,
    scrub: 0.8,
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
      hero.play().catch(() => {
        /* autoplay blocked — poster remains underneath */
      });
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
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
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

  // Warm cache + update hrefs
  getDownloadUrl().then((url) => {
    links.forEach((a) => {
      a.href = url;
    });
  });

  links.forEach((a) => {
    a.addEventListener("click", async (event) => {
      // Ensure we always hit the latest asset, then navigate for auto-download
      event.preventDefault();
      const url = await getDownloadUrl();
      a.href = url;
      // Force download navigation
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

initReveal();
initNavScroll();
initParallax();
initThemeWash();
initMoodsPin();
initVideos();
initDownloadLinks();
initMagneticCta();
