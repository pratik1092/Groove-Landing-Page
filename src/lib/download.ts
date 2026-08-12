import { downloadFallbackUrl, releasesApiUrl } from "../lib/site";

const DMG_PATTERN = /^Groove-.*\.dmg$/i;

export async function resolveLatestDmgUrl(): Promise<string> {
  try {
    const res = await fetch(releasesApiUrl, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!res.ok) return downloadFallbackUrl;
    const data = (await res.json()) as {
      assets?: { name: string; browser_download_url: string }[];
    };
    const asset = data.assets?.find((a) => DMG_PATTERN.test(a.name));
    return asset?.browser_download_url ?? downloadFallbackUrl;
  } catch {
    return downloadFallbackUrl;
  }
}
