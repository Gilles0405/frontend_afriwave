
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Clock3,
  Headphones,
  MapPin,
  Radio,
  Search,
} from "lucide-react";

import { absoluteUrl } from "@/lib/seo";
import { getPublicPodcastBySlug } from "@/lib/public/podcasts";
import JsonLd from "@/components/Radio/articles/JsonLd";
import { getTranslations } from "next-intl/server";
import { ThemeToggle } from "@/components/providers/theme-toggle";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { buildRadioMediaAudioUrl, buildRadioMediaImageUrl } from "@/lib/radio-media-api";

type Props = {
  params: Promise<{
    locale: string;
    radioSlug: string;
    slug: string;
  }>;
};

type Locale = "fr" | "en";

const copy = {
  fr: {
    podcasts: "Podcasts",
    home: "Accueil",
    listen: "Écouter le podcast",
    publishedBy: "Publié par",
    relatedRadio: "À propos de la radio",
    back: "Retour aux podcasts",
    noImage: "Podcast de radio communautaire",
    notFound: "Podcast introuvable",
    description: "À propos de cet épisode",
    duration: "Durée",
    published: "Publié le",
    location: "Localisation",
    communityRadio: "RADIO COMMUNAUTAIRE",
    audioUnavailable: "Le lecteur audio n'est pas disponible.",
    intro:
      "Découvrez les émissions et les voix des radios communautaires sur AfriWave.",
  },
  en: {
    podcasts: "Podcasts",
    home: "Home",
    listen: "Listen to the podcast",
    publishedBy: "Published by",
    relatedRadio: "About the radio",
    back: "Back to podcasts",
    noImage: "Community radio podcast",
    notFound: "Podcast not found",
    description: "About this episode",
    duration: "Duration",
    published: "Published on",
    location: "Location",
    communityRadio: "COMMUNITY RADIO",
    audioUnavailable: "The audio player is unavailable.",
    intro:
      "Discover programmes and voices from community radio stations on AfriWave.",
  },
} as const;

function formatDuration(
  seconds: number | null | undefined,
  locale: Locale,
) {
  if (seconds == null || seconds < 1) return null;

  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;

  const time =
    remaining > 0
      ? `${minutes}:${String(remaining).padStart(2, "0")}`
      : `${minutes}:00`;

  return `${time} min`;
}

async function getPodcastPageData(
  radioSlug: string,
  slug: string,
) {
  return getPublicPodcastBySlug(radioSlug, slug);
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { locale, radioSlug, slug } = await params;

  if (locale !== "fr" && locale !== "en") return {};

  const data = await getPodcastPageData(radioSlug, slug);

  if (!data) {
    return {
      title:
        locale === "fr"
          ? "Podcast introuvable | AfriWave"
          : "Podcast not found | AfriWave",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const { podcast, radio } = data;
  const title = `${podcast.title} | AfriWave`;

  const description =
    podcast.description ||
    (locale === "fr"
      ? radio
        ? `Écoutez ${podcast.title}, publié par ${radio.name} sur AfriWave.`
        : `Écoutez ${podcast.title} sur AfriWave, la plateforme des radios communautaires.`
      : radio
        ? `Listen to ${podcast.title}, published by ${radio.name} on AfriWave.`
        : `Listen to ${podcast.title} on AfriWave, the community radio platform.`);

  const canonical = absoluteUrl(
    `/${locale}/podcasts/${radioSlug}/${slug}`,
  );

  const image = podcast.coverImage || undefined;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "music.song",
      siteName: "AfriWave",
      title,
      description,
      url: canonical,
      locale: locale === "fr" ? "fr_FR" : "en_US",
      ...(podcast.publishedAt
        ? { publishedTime: podcast.publishedAt }
        : {}),
      ...(image
        ? {
          images: [
            {
              url: image,
              alt: podcast.title,
            },
          ],
        }
        : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function PodcastDetailPage({
  params,
}: Props) {
  const { locale, radioSlug, slug } = await params;

  if (locale !== "fr" && locale !== "en") {
    notFound();
  }

  const data = await getPodcastPageData(radioSlug, slug);

  if (!data) notFound();

  const { podcast, radio } = data;
  const lang: Locale = locale;
  const text = copy[lang];
  const t = await getTranslations();

  const podcastUrl = absoluteUrl(
    `/${lang}/podcasts/${radioSlug}/${slug}`,
  );

  const radioUrl = absoluteUrl(
    `/${lang}/radios/${radio?.slug ?? radioSlug}`,
  );

  const radioName = radio?.name ?? radioSlug.replace(/-/g, " ");

  const duration = formatDuration(podcast.duration, lang);
  const image = podcast.coverImage || undefined;

  const podcastJsonLd = {
    "@context": "https://schema.org",
    "@type": "PodcastEpisode",
    name: podcast.title,
    description: podcast.description || undefined,
    url: podcastUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": podcastUrl,
    },
    inLanguage: lang,
    ...(image ? { image: [image] } : {}),
    ...(podcast.audioUrl
      ? {
        associatedMedia: {
          "@type": "MediaObject",
          contentUrl: podcast.audioUrl,
          encodingFormat: "audio/mpeg",
        },
      }
      : {}),
    ...(podcast.publishedAt
      ? { datePublished: podcast.publishedAt }
      : {}),
    ...(duration
      ? {
        timeRequired: `PT${Math.floor(
          (podcast.duration ?? 0) / 60,
        )}M`,
      }
      : {}),
    ...(radio
      ? {
        partOfSeries: {
          "@type": "PodcastSeries",
          name: radio.name,
          url: radioUrl,
        },
        publisher: {
          "@type": "Organization",
          name: radio.name,
        },
      }
      : {}),
  };

  const breadcrumbItems = [
    {
      "@type": "ListItem",
      position: 1,
      name: "AfriWave",
      item: absoluteUrl(`/${lang}`),
    },
    {
      "@type": "ListItem",
      position: 2,
      name: text.podcasts,
      item: absoluteUrl(`/${lang}/podcasts`),
    },
    ...(radio
      ? [
        {
          "@type": "ListItem",
          position: 3,
          name: radio.name,
          item: radioUrl,
        },
      ]
      : []),
    {
      "@type": "ListItem",
      position: radio ? 4 : 3,
      name: podcast.title,
      item: podcastUrl,
    },
  ];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems,
  };

  return (
    <main className="min-h-screen bg-background">
      <JsonLd data={podcastJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <header className="sticky top-0 z-50 mb-6 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:min-h-[76px] sm:gap-4 sm:px-6 lg:px-8">
          <Link
            href={`/${lang}`}
            aria-label="AfriWave — Accueil"
            className="flex min-w-0 shrink-0 items-center"
          >
            <Image
              src="/WhatsApp_Image_2026-10-10_at_20.27.03-removebg-preview.png"
              alt="Logo AfriWave"
              width={150}
              height={52}
              priority
              className="h-9 w-auto object-contain sm:h-11"
            />
          </Link>

          <nav
            aria-label={
              lang === "fr"
                ? "Navigation principale"
                : "Main navigation"
            }
            className="hidden items-center gap-5 xl:flex"
          >
            <Link
              href={`/${lang}`}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {t("Navigation.home")}
            </Link>
            <Link
              href={`/${lang}/actualites`}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {t("Navigation.news")}
            </Link>
            <Link
              href={`/${lang}/radios`}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {t("Navigation.radios")}
            </Link>
            <Link
              href={`/${lang}/emissions`}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {t("Navigation.shows")}
            </Link>
            <Link
              href={`/${lang}/podcasts`}
              aria-current="page"
              className="rounded-full bg-primary/10 px-3 py-2 text-sm font-semibold text-primary"
            >
              {t("Navigation.podcasts")}
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <LanguageSwitcher />
            <ThemeToggle />

            <Link
              href={`/${lang}/recherche`}
              aria-label={t("Navigation.search")}
              className="inline-flex size-9 items-center justify-center rounded-xl border border-border hover:bg-muted sm:h-10 sm:w-auto sm:gap-2 sm:px-3"
            >
              <Search className="size-4" />
              <span className="hidden text-sm font-semibold sm:inline">
                {t("Navigation.search")}
              </span>
            </Link>

            <Link
              href={`/${lang}/login`}
              className="hidden min-h-10 items-center justify-center rounded-xl border border-border px-3 text-sm font-semibold hover:bg-muted sm:inline-flex"
            >
              {t("Navigation.login")}
            </Link>

            <Link
              href={`/${lang}/register`}
              className="hidden min-h-10 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-sm font-bold text-primary-foreground hover:opacity-90 sm:inline-flex lg:px-4"
            >
              <Radio className="size-4" />
              <span>{t("Navigation.registerRadio")}</span>
            </Link>
          </div>
        </div>

        <div className="border-t border-border/60 px-3 py-2 xl:hidden">
          <nav
            aria-label={
              lang === "fr" ? "Navigation mobile" : "Mobile navigation"
            }
            className="mx-auto flex max-w-7xl items-center gap-4 overflow-x-auto"
          >
            <Link
              href={`/${lang}`}
              className="shrink-0 text-xs text-muted-foreground"
            >
              {t("Navigation.home")}
            </Link>
            <Link
              href={`/${lang}/actualites`}
              className="shrink-0 text-xs text-muted-foreground"
            >
              {t("Navigation.news")}
            </Link>
            <Link
              href={`/${lang}/radios`}
              className="shrink-0 text-xs text-muted-foreground"
            >
              {t("Navigation.radios")}
            </Link>
            <Link
              href={`/${lang}/emissions`}
              className="shrink-0 text-xs text-muted-foreground"
            >
              {t("Navigation.shows")}
            </Link>
            <Link
              href={`/${lang}/podcasts`}
              aria-current="page"
              className="shrink-0 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
            >
              {t("Navigation.podcasts")}
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <nav
          aria-label={lang === "fr" ? "Fil d’Ariane" : "Breadcrumb"}
          className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
        >
          <Link href={`/${lang}`} className="hover:text-primary">
            {text.home}
          </Link>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <Link
            href={`/${lang}/podcasts`}
            className="hover:text-primary"
          >
            {text.podcasts}
          </Link>

          {radio && (
            <>
              <ChevronRight className="size-3.5" aria-hidden="true" />
              <Link href={radioUrl.replace(absoluteUrl(""), "")} className="hover:text-primary">
                {radio.name}
              </Link>
            </>
          )}

          <ChevronRight className="size-3.5" aria-hidden="true" />
          <span className="max-w-[220px] truncate font-medium text-foreground sm:max-w-sm">
            {podcast.title}
          </span>
        </nav>

        <section className="relative isolate mb-8 overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-primary/[0.09] via-background to-amber-500/[0.08] px-5 py-7 shadow-sm sm:mb-10 sm:px-9 sm:py-10 lg:px-12 lg:py-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-16 -z-10 size-56 rounded-full bg-primary/10 blur-3xl sm:size-72"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 left-1/3 -z-10 size-48 rounded-full bg-amber-500/10 blur-3xl"
          />

          <div className="max-w-4xl">
            {radio && (
              <Link
                href={`/${lang}/radios/${radio.slug}`}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-3 py-1.5 text-xs font-bold text-primary shadow-sm hover:bg-primary/10"
              >
                <Radio className="size-3.5" />
                {radio.name}
              </Link>
            )}

            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-sm">
              {text.communityRadio}
            </p>

            <h1 className="text-3xl font-black leading-[1.1] tracking-tight text-foreground sm:text-4xl lg:text-5xl xl:text-6xl">
              {podcast.title}
              <span className="text-primary">.</span>
            </h1>

            {podcast.description && (
              <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                {podcast.description}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 text-sm text-muted-foreground">
              {podcast.publishedAt && (
                <time
                  dateTime={podcast.publishedAt}
                  className="inline-flex items-center gap-2"
                >
                  <CalendarDays className="size-4 text-primary" />
                  {text.published}{" "}
                  {new Date(podcast.publishedAt).toLocaleDateString(
                    lang === "fr" ? "fr-FR" : "en-US",
                    { dateStyle: "long" },
                  )}
                </time>
              )}

              {duration && (
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="size-4 text-primary" />
                  {text.duration}: {duration}
                </span>
              )}
            </div>
          </div>
        </section>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12">
          <article className="min-w-0">
            {image ? (
              <figure className="mb-8 overflow-hidden rounded-2xl border border-border/60 bg-muted shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={buildRadioMediaImageUrl(image)}
                  alt={podcast.title}
                  fetchPriority="high"
                  className="max-h-[620px] w-full object-cover"
                />
              </figure>
            ) : (
              <div className="relative mb-8 flex aspect-[16/7] items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/15 via-muted to-amber-500/15">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 opacity-30 [background-image:radial-gradient(hsl(var(--primary))_1px,transparent_1px)] [background-size:18px_18px]"
                />
                <div className="relative flex size-16 items-center justify-center rounded-2xl border border-primary/20 bg-background/80 text-primary shadow-sm">
                  <Headphones className="size-8" />
                </div>
              </div>
            )}

            <section className="rounded-2xl border border-border/60 bg-card px-5 py-7 shadow-sm sm:px-8 sm:py-10">
              <div className="mb-6 flex items-center gap-2 border-b border-border/70 pb-4 text-xs font-bold uppercase tracking-[0.16em] text-primary">
                <Headphones className="size-4" />
                {text.listen}
              </div>

              {podcast.audioUrl ? (
                <audio
                  controls
                  preload="metadata"
                  className="w-full"
                  aria-label={podcast.title}
                >
                  <source
                    src={buildRadioMediaAudioUrl(podcast.audioUrl)}
                    type="audio/mpeg"
                  />
                  {text.audioUnavailable}
                </audio>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {text.audioUnavailable}
                </p>
              )}

              {podcast.description && (
                <div className="mt-8 border-t border-border/70 pt-6">
                  <h2 className="mb-3 text-lg font-bold">
                    {text.description}
                  </h2>
                  <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground sm:text-base">
                    {podcast.description}
                  </p>
                </div>
              )}
            </section>

            <div className="mt-7">
              <Link
                href={`/${lang}/podcasts`}
                className="group inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:border-primary/30 hover:bg-primary/5"
              >
                <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                {text.back}
              </Link>
            </div>
          </article>


          <aside className="space-y-5">
            {radio && (
              <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
                <div className="bg-gradient-to-br from-primary/10 via-muted/40 to-amber-500/10 p-5">
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl border border-primary/15 bg-background text-primary shadow-sm">
                    <Radio className="size-6" />
                  </div>

                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    {text.relatedRadio}
                  </p>

                  <h2 className="mt-2 text-xl font-bold leading-snug">
                    {radio.name}
                  </h2>

                  {(radio.city || radio.country) && (
                    <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="size-4 text-primary" />
                      {[radio.city, radio.country].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>

                <CardContent className="space-y-4 p-5">
                  <p className="text-sm leading-6 text-muted-foreground">
                    {text.intro}
                  </p>

                  <Link
                    href={`/${lang}/radios/${radio.slug}`}
                    className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                  >
                    {text.relatedRadio}
                    <ArrowRight className="size-4" />
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Carte pour découvrir les autres podcasts de la radio */}
            <Card className="group overflow-hidden rounded-2xl border-border/70 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md">
              <div className="bg-gradient-to-br from-primary/10 via-background to-amber-500/10 p-5">
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl border border-primary/15 bg-background text-primary shadow-sm transition-transform duration-300 group-hover:scale-105">
                  <Headphones className="size-6" />
                </div>

                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                  {text.podcasts}
                </p>

                <h2 className="mt-2 text-xl font-bold leading-snug">
                  {lang === "fr"
                    ? "Tous les podcasts de cette radio"
                    : "All podcasts from this radio"}
                </h2>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {lang === "fr"
                    ? "Explorez les autres épisodes et découvrez de nouvelles voix et émissions."
                    : "Explore other episodes and discover new voices and programmes."}
                </p>
              </div>

              <CardContent className="p-5">
                <Link
                  href={`/${lang}/podcasts/${radioSlug}`}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  {lang === "fr"
                    ? "Voir tous les podcasts"
                    : "View all podcasts"}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </CardContent>
            </Card>

            {/* Carte informative */}
            <div className="rounded-2xl border border-border/70 bg-muted/30 p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold">
                <Headphones className="size-4 text-primary" />
                {text.listen}
              </div>

              <p className="text-sm leading-6 text-muted-foreground">
                {text.intro}
              </p>
            </div>
          </aside>

        </div>

        <footer className="mt-12 flex flex-col gap-4 border-t border-border/70 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            AfriWave — {text.podcasts}
          </p>
          <Link
            href={`/${lang}/podcasts`}
            className="inline-flex min-h-10 items-center gap-2 self-start rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:border-primary/30 hover:bg-primary/5 sm:self-auto"
          >
            <ArrowLeft className="size-4" />
            {text.back}
          </Link>
        </footer>
      </div>
    </main>
  );
}
