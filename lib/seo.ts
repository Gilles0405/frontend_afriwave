
import type { Metadata } from "next";
import { buildRadioMediaImageUrl } from "./radio-media-api";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? ""
).replace(/\/+$/, "");

export function absoluteUrl(path: string) {
  return new URL(path.replace(/^\/+/, ""), `${siteUrl}/`).toString();
}

type PageSeoInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  locale?: "fr" | "en";
};

export function createPageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  locale = "fr",
}: PageSeoInput): Metadata {
  const canonical = absoluteUrl(path);
  const imageUrl = image ? absoluteUrl(image) : undefined;
  const openGraphImageUrl = imageUrl
    ? buildRadioMediaImageUrl(imageUrl)
    : undefined;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        fr: absoluteUrl(`/fr${path.replace(/^\/(fr|en)/, "")}`),
        en: absoluteUrl(`/en${path.replace(/^\/(fr|en)/, "")}`),
      },
    },
    openGraph: {
      type,
      title,
      description,
      url: canonical,
      siteName: "AfriWave",
      locale: locale === "fr" ? "fr_FR" : "en_US",
      ...(openGraphImageUrl
        ? {
            images: [
              {
                url: openGraphImageUrl,
                alt: title,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };
}
