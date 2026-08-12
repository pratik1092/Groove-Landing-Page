/** Fallback DMG when the Releases API is unavailable. */
export const downloadFallbackUrl =
  import.meta.env.PUBLIC_DOWNLOAD_URL ??
  "https://github.com/pratik1092/Groove-App/releases/download/v1.0.0/Groove-1.0.0.dmg";

export const releasesApiUrl =
  "https://api.github.com/repos/pratik1092/Groove-App/releases/latest";

export const appRepoUrl = "https://github.com/pratik1092/Groove-App";

export const appVersion = "1.0.0";

export const tagline =
  "A live vinyl wallpaper for whatever’s playing in Spotify or Apple Music.";

export const siteTitle = "Groove — Your desktop, spinning.";

export const siteDescription = tagline;
