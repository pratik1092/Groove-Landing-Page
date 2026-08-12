# Groove Landing Page

Marketing site for [Groove](https://github.com/pratik1092/Groove-App) — a live vinyl wallpaper for macOS.

## Stack

- [Astro](https://astro.build) + Tailwind CSS 4
- GSAP + ScrollTrigger for motion
- Hosted on Vercel
- Download CTA resolves the latest `Groove-*.dmg` from GitHub Releases

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Download URL

Default fallback:

`https://github.com/pratik1092/Groove-App/releases/download/v1.0.0/Groove-1.0.0.dmg`

Override with `PUBLIC_DOWNLOAD_URL` if needed. On load/click, the site fetches the latest release asset matching `Groove-*.dmg`.

## Design

See the app repo: `docs/superpowers/specs/2026-08-11-groove-landing-design.md`
