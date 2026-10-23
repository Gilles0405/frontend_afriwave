
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  Clock3,
  Radio,
  RadioTower,
  Search,
  UserRound,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/providers/theme-toggle";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { absoluteUrl } from "@/lib/seo";
import { getPublicShows, type PublicShowListItem } from "@/lib/public/shows";
import { buildRadioMediaImageUrl } from "@/lib/radio-media-api";


type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
};

type Locale = "fr" | "en";

const copy = {
  fr: {
    title: "Émissions",
    description:
      "Découvrez les émissions des radios communautaires sur AfriWave : actualités, débats, culture et initiatives citoyennes.",
    heading: "Toutes les émissions",
    intro:
      "Découvrez les voix, les rendez-vous et les programmes qui font vivre les radios de nos communautés.",
    empty: "Aucune émission disponible pour le moment.",
    error: "Impossible de charger les émissions pour le moment.",
    retryHint:
      "Veuillez réessayer dans quelques instants.",
    previous: "Précédent",
    next: "Suivant",
    page: "Page",
    discover: "Découvrir l'émission",
    pagination: "Pagination des émissions",
    eyebrow: "LES VOIX DE NOS COMMUNAUTÉS",
    featuredLabel: "PROGRAMMES RADIO",
    showsLabel: "À découvrir",
    showsCount: "émissions sur cette page",
    schedule: "Horaires de diffusion",
    host: "Présenté par",
    unknownHost: "Équipe de la radio",
    unknownRadio: "Radio communautaire",
    noDescription:
      "Découvrez cette émission et ses prochains rendez-vous sur AfriWave.",
    days: [
      "Dimanche",
      "Lundi",
      "Mardi",
      "Mercredi",
      "Jeudi",
      "Vendredi",
      "Samedi",
    ],
  },
  en: {
    title: "Radio Shows",
    description:
      "Discover community radio shows on AfriWave, from local news and discussions to culture and community initiatives.",
    heading: "All radio shows",
    intro:
      "Discover the voices, regular programmes and stories bringing our communities together.",
    empty: "No radio shows are available at the moment.",
    error: "Unable to load radio shows at the moment.",
    retryHint: "Please try again shortly.",
    previous: "Previous",
    next: "Next",
    page: "Page",
    discover: "Discover this show",
    pagination: "Radio shows pagination",
    eyebrow: "THE VOICES OF OUR COMMUNITIES",
    featuredLabel: "RADIO PROGRAMMES",
    showsLabel: "Explore programmes",
    showsCount: "shows on this page",
    schedule: "Broadcast schedule",
    host: "Hosted by",
    unknownHost: "Radio team",
    unknownRadio: "Community radio",
    noDescription:
      "Discover this programme and its upcoming broadcasts on AfriWave.",
    days: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
  },
} as const;

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { locale } = await params;

  const lang: Locale = locale === "en" ? "en" : "fr";
  const text = copy[lang];
  const canonical = absoluteUrl(`/${lang}/emissions`);

  return {
    title: `${text.title} | AfriWave`,
    description: text.description,
    alternates: {
      canonical,
      languages: {
        fr: absoluteUrl("/fr/emissions"),
        en: absoluteUrl("/en/emissions"),
      },
    },
    openGraph: {
      type: "website",
      siteName: "AfriWave",
      title: `${text.title} | AfriWave`,
      description: text.description,
      url: canonical,
      locale: lang === "fr" ? "fr_FR" : "en_US",
    },
    twitter: {
      card: "summary",
      title: `${text.title} | AfriWave`,
      description: text.description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

function formatTime(value: string, locale: Locale): string {
  const match = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(value);

  if (!match) return value;

  const hours = Number(match[1]);
  const minutes = match[2];

  if (locale === "en") {
    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 || 12;

    return `${displayHour}:${minutes} ${period}`;
  }

  return `${String(hours).padStart(2, "0")}:${minutes}`;
}

function formatDays(
  daysOfWeek: number[],
  locale: Locale,
): string {
  const text = copy[locale];

  // Convention actuelle : 0 = dimanche, 1 = lundi, ..., 6 = samedi.
  // À ajuster si le backend utilise une autre convention.
  const validDays = [...new Set(daysOfWeek)]
    .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
    .sort((a, b) => a - b);

  if (validDays.length === 0) {
    return locale === "fr"
      ? "Jours non précisés"
      : "Days not specified";
  }

  return validDays.map((day) => text.days[day]).join(" · ");
}

export default async function ShowsPage({
  params,
  searchParams,
}: Props) {
  const { locale } = await params;
  const { page: pageParam } = await searchParams;

  if (locale !== "fr" && locale !== "en") {
    notFound();
  }

  const lang: Locale = locale;
  const text = copy[lang];
  const t = await getTranslations();

  const requestedPage = Number(pageParam);
  const page =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;

  let shows: PublicShowListItem[] = [];
  let pagination = {
    page,
    limit: 12,
    total: 0,
    totalPages: 0,
  };
  let hasError = false;

  try {
    const result = await getPublicShows({
      page,
      limit: 12,
    });

    shows = result.data as unknown as PublicShowListItem[];
    pagination = result.pagination ?? pagination;
  } catch (error) {
    console.error("Erreur de chargement des émissions publiques :", error);
    hasError = true;
  }
 
const logoSrc =
  "/WhatsApp_Image_2026-10-10_at_20.27.03-removebg-preview.png";
  return (
    <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
       <header className="sticky top-0 z-50 mb-6 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:min-h-[76px] sm:gap-4 sm:px-6 lg:px-8">
          <Link
            href={`/${lang}`}
            aria-label="AfriWave — Accueil"
            className="flex min-w-0 shrink-0 items-center"
          >
            <Image
              src={logoSrc}
              alt="Logo AfriWave"
              width={150}
              height={52}
              priority
              className="h-9 w-auto object-contain sm:h-11"
            />
          </Link>

          <nav
            aria-label={lang === "fr" ? "Navigation principale" : "Main navigation"}
            className="hidden items-center gap-5 xl:flex"
          >
            <Link
              href={`/${lang}`}
              className="whitespace-nowrap text-sm text-muted-foreground hover:text-foreground"
            >
              {t("Navigation.home")}
            </Link>

            <Link
              href={`/${lang}/actualites`}
              className="whitespace-nowrap text-sm text-muted-foreground hover:text-foreground"
            >
              {t("Navigation.news")}
            </Link>

            <Link
              href={`/${lang}/radios`}
             
              className="whitespace-nowrap text-sm text-muted-foreground hover:text-foreground "
            >
              {t("Navigation.radios")}
            </Link>

            <Link
              href={`/${lang}/emissions`}
               aria-current="page"
              className="whitespace-nowrap  rounded-full bg-primary/10 px-3 py-2 text-sm font-semibold text-primary"
            >
              {t("Navigation.shows")}
            </Link>

            <Link
              href={`/${lang}/podcasts`}
              className="whitespace-nowrap text-sm text-muted-foreground hover:text-foreground"
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
              <Search className="size-4" aria-hidden="true" />
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
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-sm font-bold text-primary-foreground hover:opacity-90 lg:px-4"
            >
              <Radio className="size-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">
                {t("Navigation.registerRadio")}
              </span>
            </Link>
          </div>
        </div>

        <div className="border-t border-border/60 px-3 py-2 md:hidden">
          <nav
            aria-label={lang === "fr" ? "Navigation mobile" : "Mobile navigation"}
            className="flex items-center gap-4 overflow-x-auto"
          >
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
                    aria-current="page"
               className="shrink-0 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
            >
              {t("Navigation.shows")}
            </Link>

            <Link
              href={`/${lang}/podcasts`}
              className="shrink-0 text-xs text-muted-foreground"
            >
              {t("Navigation.podcasts")}
            </Link>
          </nav>
        </div>
      </header>
      <section
        aria-labelledby="shows-page-title"
        className="relative isolate mb-10 overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-primary/[0.09] via-background to-amber-500/[0.08] px-5 py-8 shadow-sm sm:mb-12 sm:px-9 sm:py-11 lg:px-12 lg:py-14"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-16 -z-10 size-56 rounded-full bg-primary/10 blur-3xl sm:size-72"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 left-1/3 -z-10 size-48 rounded-full bg-amber-500/10 blur-3xl"
        />

        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-primary shadow-sm sm:text-xs">
            <RadioTower className="size-3.5" aria-hidden="true" />
            {text.eyebrow}
          </div>

          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-sm">
            {text.featuredLabel}
          </p>

          <h1
            id="shows-page-title"
            className="max-w-2xl text-3xl font-black leading-[1.08] tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          >
            {text.heading}
            <span className="text-primary">.</span>
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            {text.intro}
          </p>

          {!hasError && (
            <div className="mt-7 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-2">
                <span
                  className="size-2 rounded-full bg-primary"
                  aria-hidden="true"
                />
                {text.showsLabel}
              </span>

              {shows.length > 0 && (
                <span className="rounded-full bg-muted/80 px-3 py-2">
                  <span className="font-semibold text-foreground">
                    {shows.length}
                  </span>{" "}
                  {text.showsCount}
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      {hasError ? (
        <section
          role="alert"
          className="mb-10 rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-12 text-center sm:px-10"
        >
          <RadioTower
            className="mx-auto mb-4 size-8 text-muted-foreground"
            aria-hidden="true"
          />
          <h2 className="text-lg font-semibold">{text.error}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            {text.retryHint}
          </p>
        </section>
      ) : shows.length === 0 ? (
        <section className="mb-10 rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center sm:px-10">
          <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <RadioTower className="size-5" aria-hidden="true" />
          </span>

          <h2 className="text-lg font-semibold">{text.heading}</h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            {text.empty}
          </p>
        </section>
      ) : (
        <section aria-label={text.heading} className="pb-2">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                {text.eyebrow}
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                {text.heading}
              </h2>
            </div>

            <span className="hidden rounded-full border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground sm:inline-flex">
              {shows.length} {text.showsCount}
            </span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {shows.map((show) => {
              const radioSlug = show.radio?.slug;
              const radioName =
                show.radio?.name ?? text.unknownRadio;

              const showUrl = radioSlug
                ? `/${lang}/emissions/${radioSlug}/${show.slug}`
                : `/${lang}/emissions`;

              return (
                <Card
                  key={`${radioSlug ?? "radio"}-${show.slug}`}
                  className="group h-full overflow-hidden rounded-2xl border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
                >
                  <Link
                    href={showUrl}
                    aria-label={`${text.discover} : ${show.title}`}
                  >
                    <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-gradient-to-br from-primary/15 via-muted to-amber-500/15">
                      {show.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={buildRadioMediaImageUrl(show.coverImage)}
                          alt=""
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <>
                          <div
                            aria-hidden="true"
                            className="absolute inset-0 opacity-30 [background-image:radial-gradient(hsl(var(--primary))_1px,transparent_1px)] [background-size:18px_18px]"
                          />
                          <span className="relative flex size-16 items-center justify-center rounded-2xl border border-primary/20 bg-background/80 text-primary shadow-sm">
                            <RadioTower
                              className="size-8"
                              aria-hidden="true"
                            />
                          </span>
                        </>
                      )}

                      <span className="absolute bottom-3 left-3 inline-flex max-w-[85%] items-center gap-2 truncate rounded-full border border-border/50 bg-background/90 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm backdrop-blur">
                        <Radio className="size-3.5 shrink-0 text-primary" />
                        <span className="truncate">{radioName}</span>
                      </span>
                    </div>
                  </Link>

                  <CardContent className="flex h-full flex-col gap-4 p-5 sm:p-6">
                    <div>
                      <h3 className="text-lg font-bold leading-snug tracking-tight sm:text-xl">
                        <Link
                          href={showUrl}
                          className="transition-colors group-hover:text-primary"
                        >
                          {show.title}
                        </Link>
                      </h3>

                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                        {show.description || text.noDescription}
                      </p>
                    </div>

                    <div className="space-y-3 border-t border-border/70 pt-4">
                      <div className="flex items-start gap-2.5 text-sm">
                        <UserRound
                          className="mt-0.5 size-4 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">
                            {text.host}
                          </p>
                          <p className="mt-0.5 font-medium">
                            {show.hostName || text.unknownHost}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 text-sm">
                        <CalendarDays
                          className="mt-0.5 size-4 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">
                            {text.schedule}
                          </p>
                          <p className="mt-0.5 leading-6 font-medium">
                            {formatDays(show.daysOfWeek, lang)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 text-sm">
                        <Clock3
                          className="size-4 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                        <p className="font-semibold">
                          {formatTime(show.startTime, lang)}
                          {" – "}
                          {formatTime(show.endTime, lang)}
                        </p>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {show.timezone === "Africa/Douala"
                            ? "WAT"
                            : show.timezone}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={showUrl}
                      className="mt-auto inline-flex w-fit items-center gap-2 pt-1 text-sm font-semibold text-primary transition-all hover:gap-3"
                    >
                      {text.discover}
                      <span aria-hidden="true">→</span>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {!hasError && pagination.totalPages > 1 && (
        <nav
          aria-label={text.pagination}
          className="mb-8 mt-10 flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card/70 p-3 sm:mt-12 sm:p-4"
        >
          {page > 1 ? (
            <Link
              href={`/${lang}/emissions?page=${page - 1}`}
              rel="prev"
              className="inline-flex min-h-10 items-center rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:border-primary/30 hover:bg-primary/5 sm:px-4"
            >
              ← {text.previous}
            </Link>
          ) : (
            <span />
          )}

          <span className="text-sm text-muted-foreground">
            {text.page} {pagination.page} / {pagination.totalPages}
          </span>

          {page < pagination.totalPages ? (
            <Link
              href={`/${lang}/emissions?page=${page + 1}`}
              rel="next"
              className="inline-flex min-h-10 items-center rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:border-primary/30 hover:bg-primary/5 sm:px-4"
            >
              {text.next} →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </main>
  );
}
