
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Headphones,
  Podcast,
  RadioTower,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/providers/theme-toggle";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

import { getPublicArticles } from "@/lib/public/articles";
import { getPublicRadioPodcasts } from "@/lib/public/podcasts";
import { absoluteUrl } from "@/lib/seo";
import { buildRadioMediaImageUrl } from "@/lib/radio-media-api";

type Props = {
  params: Promise<{ locale: string; radioSlug: string }>;
  searchParams: Promise<{ page?: string }>;
};

type PodcastItem = {
  id: number;
  radioId: number;
  title: string;
  slug: string;
  description?: string | null;
  audioUrl: string;
  coverImage?: string | null;
  duration?: number | null;
  status?: string;
  publishedAt?: string | null;
  createdAt?: string | null;
};

type PodcastCardProps = {
  podcast: PodcastItem;
  radioSlug: string;
  locale: "fr" | "en";
  featured?: boolean;
  listenLabel: string;
  durationLabel: string;
};

async function getRadioPodcastsPageData(
  radioSlug: string,
  page: number,
) {
  const [podcastResult, radioResult] = await Promise.all([
    getPublicRadioPodcasts(radioSlug, page, 10),
    getPublicArticles(radioSlug, { page: 1, limit: 1 }),
  ]);

  return {
    podcasts: podcastResult?.items ?? [],
    pagination: podcastResult?.pagination ?? {
      total: 0,
      page,
      limit: 10,
      totalPages: 0,
    },
    radio: radioResult?.radio ?? null,
  };
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { locale, radioSlug } = await params;
  const lang = locale === "en" ? "en" : "fr";

  try {
    const data = await getRadioPodcastsPageData(radioSlug, 1);
    const radioName = data.radio?.name ?? radioSlug;

    const title =
      lang === "fr"
        ? `Podcasts de ${radioName} | AfriWave`
        : `${radioName} Podcasts | AfriWave`;

    const description =
      lang === "fr"
        ? `Écoutez les podcasts et contenus audio de ${radioName} sur AfriWave.`
        : `Listen to podcasts and audio content from ${radioName} on AfriWave.`;

    const canonical = absoluteUrl(`/${lang}/podcasts/${radioSlug}`);

    const logo = data.radio?.logo
      ? buildRadioMediaImageUrl(data.radio.logo)
      : undefined;

    return {
      title,
      description,
      alternates: {
        canonical,
        languages: {
          fr: absoluteUrl(`/fr/podcasts/${radioSlug}`),
          en: absoluteUrl(`/en/podcasts/${radioSlug}`),
        },
      },
      openGraph: {
        type: "website",
        siteName: "AfriWave",
        title,
        description,
        url: canonical,
        locale: lang === "fr" ? "fr_FR" : "en_US",
        ...(logo ? { images: [logo] } : {}),
      },
      twitter: {
        card: logo ? "summary_large_image" : "summary",
        title,
        description,
        ...(logo ? { images: [logo] } : {}),
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch {
    const title =
      lang === "fr"
        ? `Podcasts de ${radioSlug} | AfriWave`
        : `${radioSlug} Podcasts | AfriWave`;

    return {
      title,
      alternates: {
        canonical: absoluteUrl(`/${lang}/podcasts/${radioSlug}`),
        languages: {
          fr: absoluteUrl(`/fr/podcasts/${radioSlug}`),
          en: absoluteUrl(`/en/podcasts/${radioSlug}`),
        },
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  }
}

export default async function RadioPodcastsPage({
  params,
  searchParams,
}: Props) {
  const { locale, radioSlug } = await params;
  const { page: pageParam } = await searchParams;

  if (locale !== "fr" && locale !== "en") {
    notFound();
  }

  const lang = locale;
  const parsedPage = Number(pageParam);
  const page =
    Number.isSafeInteger(parsedPage) && parsedPage > 0
      ? parsedPage
      : 1;

  const [t, nav, data] = await Promise.all([
    getTranslations({
      locale: lang,
      namespace: "RadioPodcasts",
    }),
    getTranslations({
      locale: lang,
      namespace: "Navigation",
    }),
    getRadioPodcastsPageData(radioSlug, page),
  ]);

  if (!data.radio && data.podcasts.length === 0) {
    notFound();
  }

  const radioName = data.radio?.name ?? radioSlug;
  const radioLogo = data.radio?.logo
    ? buildRadioMediaImageUrl(data.radio.logo)
    : null;

  const featuredPodcasts = data.podcasts.slice(0, 3);

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Navigation globale */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href={`/${lang}`}
            className="flex shrink-0 items-center"
            aria-label="AfriWave - Accueil"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/WhatsApp_Image_2026-10-10_at_20.27.03-removebg-preview.png"
              alt="AfriWave"
              className="h-10 w-auto object-contain sm:h-12"
            />
          </Link>

          <nav className="hidden items-center gap-5 text-sm font-medium lg:flex">
            <Link
              href={`/${lang}`}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              {nav("home")}
            </Link>

            <Link
              href={`/${lang}/actualites`}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              {nav("news")}
            </Link>

            <Link
              href={`/${lang}/radios`}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              {nav("radios")}
            </Link>

            <Link
              href={`/${lang}/emissions`}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              {nav("shows")}
            </Link>

            <Link
              href={`/${lang}/podcasts`}
              className="text-primary"
              aria-current="page"
            >
              {nav("podcasts")}
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero de la radio */}
      <section className="relative isolate overflow-hidden border-b border-border">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-background"
        />

        <div
          aria-hidden="true"
          className="absolute -right-20 -top-24 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
        />

        <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <nav
            aria-label={t("breadcrumbLabel")}
            className="mb-7 flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
          >
            <Link
              href={`/${lang}`}
              className="transition-colors hover:text-primary"
            >
              {nav("home")}
            </Link>

            <ChevronRight className="h-4 w-4" />

            <Link
              href={`/${lang}/podcasts`}
              className="transition-colors hover:text-primary"
            >
              {nav("podcasts")}
            </Link>

            <ChevronRight className="h-4 w-4" />

            <span className="max-w-[220px] truncate font-medium text-foreground sm:max-w-sm">
              {radioName}
            </span>
          </nav>

          <div className="flex flex-col gap-7 md:flex-row md:items-center md:gap-10">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:h-28 sm:w-28">
              {radioLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={radioLogo}
                  alt={radioName}
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <RadioTower className="h-12 w-12 text-primary" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                <Podcast className="h-4 w-4" />
                {t("communityRadio")}
              </div>

              <h1 className="max-w-4xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                {t("title", { radioName })}
              </h1>

              {data.radio?.description && (
                <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                  {data.radio.description}
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <Headphones className="h-4 w-4 text-primary" />
                  {t("podcastCount", {
                    count: data.pagination.total,
                  })}
                </span>

                <span className="inline-flex items-center gap-2">
                  <RadioTower className="h-4 w-4 text-primary" />
                  AfriWave
                </span>
              </div>

              <Link
                href={`/${lang}/podcasts`}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:opacity-80"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("allPodcasts")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {/* Podcasts à la une */}
        {featuredPodcasts.length > 0 && (
          <section className="mb-14">
            <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  {t("featuredEyebrow")}
                </p>

                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {t("featured")}
                </h2>

                <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                  {t("featuredDescription", { radioName })}
                </p>
              </div>

              <span className="text-sm text-muted-foreground">
                {t("featuredCount", {
                  count: featuredPodcasts.length,
                })}
              </span>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredPodcasts.map((podcast, index) => (
                <PodcastCard
                  key={podcast.id}
                  podcast={podcast}
                  radioSlug={radioSlug}
                  locale={lang}
                  featured={index === 0}
                  listenLabel={t("listenPodcast")}
                  durationLabel={t("durationUnknown")}
                />
              ))}
            </div>
          </section>
        )}

        {/* Tous les podcasts */}
        <section>
          <div className="mb-7 border-b border-border pb-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
              {t("allPodcastsEyebrow")}
            </p>

            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t("allPodcastsTitle")}
            </h2>

            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              {t("allPodcastsDescription")}
            </p>
          </div>

          {data.podcasts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.podcasts.map((podcast) => (
                <PodcastCard
                  key={podcast.id}
                  podcast={podcast}
                  radioSlug={radioSlug}
                  locale={lang}
                  listenLabel={t("listenPodcast")}
                  durationLabel={t("durationUnknown")}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Podcast className="h-7 w-7 text-muted-foreground" />
              </div>

              <h3 className="text-lg font-semibold">
                {t("emptyTitle")}
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                {t("emptyDescription")}
              </p>
            </div>
          )}
        </section>

        {/* Pagination */}
        {data.pagination.totalPages > 1 && (
          <nav
            aria-label={t("paginationLabel")}
            className="mt-12 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-sm text-muted-foreground">
              {t("page")}{" "}
              <span className="font-semibold text-foreground">
                {page}
              </span>{" "}
              {t("of")}{" "}
              <span className="font-semibold text-foreground">
                {data.pagination.totalPages}
              </span>
            </p>

            <div className="flex items-center gap-3">
              {page > 1 ? (
                <Link
                  href={`/${lang}/podcasts/${radioSlug}?page=${page - 1}`}
                  rel="prev"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t("previous")}
                </Link>
              ) : (
                <span />
              )}

              {page < data.pagination.totalPages ? (
                <Link
                  href={`/${lang}/podcasts/${radioSlug}?page=${page + 1}`}
                  rel="next"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  {t("next")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <span />
              )}
            </div>
          </nav>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/20">
        <div className="container mx-auto flex max-w-7xl flex-col gap-3 px-4 py-7 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <Link
            href={`/${lang}`}
            className="font-semibold text-foreground transition-colors hover:text-primary"
          >
            AfriWave
          </Link>

          <p>{t("footerTagline")}</p>

          <Link
            href={`/${lang}/podcasts`}
            className="inline-flex items-center gap-2 font-medium transition-colors hover:text-primary"
          >
            {t("discoverPodcasts")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </footer>
    </main>
  );
}

function PodcastCard({
  podcast,
  radioSlug,
  locale,
  featured = false,
  listenLabel,
  durationLabel,
}: PodcastCardProps) {
  const href = `/${locale}/podcasts/${radioSlug}/${podcast.slug}`;

  const image = podcast.coverImage
    ? buildRadioMediaImageUrl(podcast.coverImage)
    : null;

  const publishedAt = podcast.publishedAt ?? podcast.createdAt;
  const duration =
    typeof podcast.duration === "number" && podcast.duration > 0
      ? `${Math.floor(podcast.duration / 60)}:${String(
          podcast.duration % 60,
        ).padStart(2, "0")}`
      : durationLabel;

  return (
    <Card
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg ${
        featured ? "sm:col-span-2 lg:col-span-1" : ""
      }`}
    >
      <Link
        href={href}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-label={podcast.title}
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={podcast.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-muted to-muted">
              <Headphones className="h-12 w-12 text-primary/60" />
            </div>
          )}

          <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-background/85 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur">
            <RadioTower className="h-3.5 w-3.5 text-primary" />
            AfriWave
          </div>
        </div>
      </Link>

      <CardContent className="flex flex-1 flex-col space-y-3 p-5 sm:p-6">
        {publishedAt && (
          <p className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5 text-primary" />
            {new Date(publishedAt).toLocaleDateString(
              locale === "fr" ? "fr-FR" : "en-US",
              {
                day: "numeric",
                month: "long",
                year: "numeric",
              },
            )}
          </p>
        )}

        <h3 className="text-lg font-bold leading-snug tracking-tight sm:text-xl">
          <Link
            href={href}
            className="transition-colors group-hover:text-primary focus-visible:text-primary"
          >
            {podcast.title}
          </Link>
        </h3>

        {podcast.description && (
          <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
            {podcast.description}
          </p>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Headphones className="h-3.5 w-3.5 text-primary" />
          <span>{duration}</span>
        </div>

        <div className="mt-auto pt-2">
          <Link
            href={href}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            {listenLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
