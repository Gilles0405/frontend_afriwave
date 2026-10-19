
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ?? ""
  ).replace(/\/+$/, "");

  const now = new Date();

  const pages = [
    "",
    "/fr",
    "/en",
    "/fr/actualites",
    "/en/actualites",
    "/fr/radios",
    "/en/radios",
    "/fr/recherche",
    "/en/recherche",
    "/fr/emissions",
    "/en/emissions",
    "/fr/podcasts",
    "/en/podcasts",
  ];

  return pages.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: path.endsWith("/actualites") ? 0.9 : 0.7,
  }));
}
