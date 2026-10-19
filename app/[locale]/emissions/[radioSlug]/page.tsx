
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Clock3,
  Mic2,
  RadioTower,
  UserRound,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/providers/theme-toggle";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

import { getPublicRadioShows } from "@/lib/public/shows";
import { absoluteUrl } from "@/lib/seo";
import { buildRadioMediaImageUrl } from "@/lib/radio-media-api";

type Locale = "fr" | "en";

type Props = {
  params: Promise<{
    locale: string;
    radioSlug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
};

type RadioInfo = {
  id: number;
  name: string;
  slug: string;
  logo?: string | null;
};

type RadioShow = {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  coverImage?: string | null;
  hostName?: string | null;
  daysOfWeek?: number[] | null;
  startTime?: string | null;
  endTime?: string | null;
  timezone?: string | null;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

/**
 * Compatible avec la réponse backend :
 * {
 *   success: true,
 *   radio: {...},
 *   data: [...],
 *   pagination: {...}
 * }
 *
 * Les propriétés items et data sont acceptées afin de
 * tolérer une éventuelle normalisation dans le service frontend.
 */
type ShowsResponse = {
  success?: boolean;
  radio?: RadioInfo | null;
  data?: RadioShow[];
  items?: RadioShow[];
  pagination?: Partial<Pagination>;
};

const PAGE_SIZE = 10;

async function getRadioShowsPageData(
  radioSlug: string,
  page: number,
) {
  const result = await getPublicRadioShows(radioSlug, {
    page,
    limit: PAGE_SIZE,
  });

  const shows = result?.data ?? [];

  return {
    radio: result?.radio ?? null,
    shows,
    pagination: {
      page: result?.pagination?.page ?? page,
      limit: result?.pagination?.limit ?? PAGE_SIZE,
      total: result?.pagination?.total ?? shows.length,
      totalPages: result?.pagination?.totalPages ?? 0,
    },
  };
}


function getLocalePath(locale: Locale, radioSlug: string, page?: number) {
  const basePath = `/${locale}/emissions/${radioSlug}`;

  return page && page > 1 ? `${basePath}?page=${page}` : basePath;
}

function formatTime(time?: string | null) {
  if (!time) return null;

  // Le backend renvoie par exemple 19:00:00.
  // On conserve l'heure locale de la radio sans conversion de fuseau.
  return time.slice(0, 5);
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { locale, radioSlug } = await params;
  const lang: Locale = locale === "en" ? "en" : "fr";

  const fallbackTitle =
    lang === "fr"
      ? `Émissions de ${radioSlug} | AfriWave`
      : `${radioSlug} Shows | AfriWave`;

  try {
    const data = await getRadioShowsPageData(radioSlug, 1);
    const radioName = data.radio?.name ?? radioSlug;

    const title =
      lang === "fr"
        ? `Émissions de ${radioName} | AfriWave`
        : `${radioName} Shows | AfriWave`;

    const description =
      lang === "fr"
        ? `Découvrez les émissions, les animateurs et les horaires de diffusion de ${radioName} sur AfriWave.`
        : `Discover shows, hosts and broadcast schedules from ${radioName} on AfriWave.`;

    const canonical = absoluteUrl(
      `/${lang}/emissions/${radioSlug}`,
    );

    const logo = data.radio?.logo
      ? buildRadioMediaImageUrl(data.radio.logo)
      : undefined;

    return {
      title,
      description,
      alternates: {
        canonical,
        languages: {
          fr: absoluteUrl(`/fr/emissions/${radioSlug}`),
          en: absoluteUrl(`/en/emissions/${radioSlug}`),
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
    return {
      title: fallbackTitle,
      alternates: {
        canonical: absoluteUrl(
          `/${lang}/emissions/${radioSlug}`,
        ),
        languages: {
          fr: absoluteUrl(`/fr/emissions/${radioSlug}`),
          en: absoluteUrl(`/en/emissions/${radioSlug}`),
        },
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  }
}

export default async function RadioShowsPage({
  params,
  searchParams,
}: Props) {
  const { locale, radioSlug } = await params;
  const { page: pageParam } = await searchParams;

  if (locale !== "fr" && locale !== "en") {
    notFound();
  }

  const lang: Locale = locale;
  const parsedPage = Number(pageParam);
  const page =
    Number.isSafeInteger(parsedPage) && parsedPage > 0
      ? parsedPage
      : 1;

  const [t, nav, data] = await Promise.all([
    getTranslations({
      locale: lang,
      namespace: "RadioShows",
    }),
    getTranslations({
      locale: lang,
      namespace: "Navigation",
    }),
    getRadioShowsPageData(radioSlug, page),
  ]);

  // Le backend renvoie success, radio, data et pagination.
  if (!data.radio && data.shows.length === 0) {
    notFound();
  }

  const radioName = data.radio?.name ?? radioSlug;
  const radioLogo = data.radio?.logo
    ? buildRadioMediaImageUrl(data.radio.logo)
    : null;

  const dayLabels: Record<number, string> = {
    0: t("days.sunday"),
    1: t("days.monday"),
    2: t("days.tuesday"),
    3: t("days.wednesday"),
    4: t("days.thursday"),
    5: t("days.friday"),
    6: t("days.saturday"),
    7: t("days.sunday"),
  };

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
              className="text-primary"
              aria-current="page"
            >
              {nav("shows")}
            </Link>

            <Link
              href={`/${lang}/podcasts`}
              className="text-muted-foreground transition-colors hover:text-primary"
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
            <Link href={`/${lang}`} className="hover:text-primary">
              {nav("home")}
            </Link>

            <ChevronRight className="h-4 w-4" />

            <Link
              href={`/${lang}/emissions`}
              className="hover:text-primary"
            >
              {nav("shows")}
            </Link>

            <ChevronRight className="h-4 w-4" />

            <span className="max-w-[220px] truncate font-medium text-foreground sm:max-w-sm">
              {radioName}
            </span>
          </nav>

          <div className="flex flex-col gap-7 md:flex-row md:items-center md:gap-10">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:h-28 sm:w-28">
              {radioLogo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={radioLogo}
                  alt={t("radioLogoAlt", { radioName })}
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <RadioTower className="h-12 w-12 text-primary" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                <RadioTower className="h-4 w-4" />
                {t("communityRadio")}
              </div>

              <h1 className="max-w-4xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                {t("title", { radioName })}
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                {t("description", { radioName })}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <Mic2 className="h-4 w-4 text-primary" />
                  {t("showCount", { count: data.pagination.total })}
                </span>

                <span className="inline-flex items-center gap-2">
                  <RadioTower className="h-4 w-4 text-primary" />
                  AfriWave
                </span>
              </div>

              <Link
                href={`/${lang}/emissions`}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:opacity-80"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("allShows")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Liste des émissions */}
      <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <section>
          <div className="mb-7 border-b border-border pb-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
              {t("sectionEyebrow")}
            </p>

            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {t("allShowsTitle")}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                  {t("allShowsDescription", { radioName })}
                </p>
              </div>

              <span className="text-sm text-muted-foreground">
                {t("showCount", { count: data.pagination.total })}
              </span>
            </div>
          </div>

          {data.shows.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.shows.map((show) => {
                const cover = show.coverImage
                  ? buildRadioMediaImageUrl(show.coverImage)
                  : null;

                const startTime = formatTime(show.startTime);
                const endTime = formatTime(show.endTime);

                const days = Array.isArray(show.daysOfWeek)
                  ? [...new Set(show.daysOfWeek)]
                      .filter(
                        (day) =>
                          Number.isInteger(day) &&
                          day >= 0 &&
                          day <= 7,
                      )
                      .sort((a, b) => a - b)
                      .map((day) => dayLabels[day])
                  : [];

                const showHref =
                  `/${lang}/emissions/${radioSlug}/${show.slug}`;

                return (
                  <Card
                    key={show.id}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
                  >
                    <Link
                      href={showHref}
                      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      aria-label={show.title}
                    >
                      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                        {cover ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={cover}
                            alt={t("coverAlt", { title: show.title })}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 via-muted to-muted">
                            <RadioTower className="h-14 w-14 text-primary/60" />
                          </div>
                        )}

                        <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-background/85 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur">
                          <Mic2 className="h-3.5 w-3.5 text-primary" />
                          {t("showBadge")}
                        </div>
                      </div>
                    </Link>

                    <CardContent className="flex flex-1 flex-col space-y-4 p-5 sm:p-6">
                      <div>
                        <h3 className="text-lg font-bold leading-snug tracking-tight sm:text-xl">
                          <Link
                            href={showHref}
                            className="transition-colors hover:text-primary focus-visible:text-primary"
                          >
                            {show.title}
                          </Link>
                        </h3>

                        {show.description && (
                          <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                            {show.description}
                          </p>
                        )}
                      </div>

                      {show.hostName && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <UserRound className="h-4 w-4 shrink-0 text-primary" />
                          <span>
                            {t("host")}: {show.hostName}
                          </span>
                        </div>
                      )}

                      {(startTime || endTime) && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <div>
                            <p className="font-semibold text-foreground">
                              {startTime && endTime
                                ? `${startTime} – ${endTime}`
                                : startTime ?? endTime}
                            </p>
                            {show.timezone && (
                              <p className="mt-1 text-xs">
                                {t("timezone")}: {show.timezone}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {days.length > 0 && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <div>
                            <p className="mb-1 font-medium text-foreground">
                              {t("broadcastDays")}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {days.map((day, index) => (
                                <span
                                  key={`${day}-${index}`}
                                  className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs"
                                >
                                  {day}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-auto border-t border-border pt-4">
                        <Link
                          href={showHref}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
                        >
                          {t("discoverShow")}
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <RadioTower className="h-7 w-7 text-muted-foreground" />
              </div>

              <h3 className="text-lg font-semibold">
                {t("emptyTitle")}
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                {t("emptyDescription", { radioName })}
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
                {data.pagination.page}
              </span>{" "}
              {t("of")}{" "}
              <span className="font-semibold text-foreground">
                {data.pagination.totalPages}
              </span>
            </p>

            <div className="flex items-center gap-3">
              {data.pagination.page > 1 ? (
                <Link
                  href={getLocalePath(
                    lang,
                    radioSlug,
                    data.pagination.page - 1,
                  )}
                  rel="prev"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t("previous")}
                </Link>
              ) : (
                <span />
              )}

              {data.pagination.page < data.pagination.totalPages && (
                <Link
                  href={getLocalePath(
                    lang,
                    radioSlug,
                    data.pagination.page + 1,
                  )}
                  rel="next"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  {t("next")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
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
            href={`/${lang}/emissions`}
            className="inline-flex items-center gap-2 font-medium transition-colors hover:text-primary"
          >
            {t("discoverAllShows")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </footer>
    </main>
  );
}
