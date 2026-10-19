
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Globe,
  Headphones,
  MapPin,
  Radio,
  Search,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Card, CardContent } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/providers/theme-toggle";
import { absoluteUrl } from "@/lib/seo";
import {
  getPublicRadios,
  type PublicRadio,
} from "@/lib/public/radios";
import { buildRadioMediaImageUrl } from "@/lib/radio-media-api";

type Locale = "fr" | "en";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
};

type PageCopy = {
  title: string;
  description: string;
  heading: string;
  intro: string;
  previous: string;
  next: string;
  page: string;
  pagination: string;
  eyebrow: string;
  featuredLabel: string;
  radiosCount: string;
  frequency: string;
  discover: string;
  unknownCity: string;
  website: string;
  listen: string;
  emptyDescription: string;
  emptyTitle: string;
};

const copy: Record<Locale, PageCopy> = {
  fr: {
    title: "Radios communautaires",
    description:
      "Découvrez les radios communautaires africaines, leurs programmes et leurs voix sur AfriWave.",
    heading: "Les radios de nos communautés",
    intro:
      "Découvrez les stations qui informent, rassemblent et font vivre les communautés au quotidien.",
    previous: "Précédent",
    next: "Suivant",
    page: "Page",
    pagination: "Pagination des radios",
    eyebrow: "Les voix de nos communautés",
    featuredLabel: "Découvrez nos radios",
    radiosCount: "radios sur cette page",
    frequency: "Fréquence",
    discover: "Découvrir la radio",
    unknownCity: "Localisation non renseignée",
    website: "Site web",
    listen: "Écouter",
    emptyTitle: "Aucune radio disponible",
    emptyDescription:
      "Revenez prochainement pour découvrir les radios référencées sur AfriWave.",
  },
  en: {
    title: "Community Radios",
    description:
      "Discover African community radio stations, their programmes and voices on AfriWave.",
    heading: "The radios of our communities",
    intro:
      "Discover the stations that inform, connect and bring communities together every day.",
    previous: "Previous",
    next: "Next",
    page: "Page",
    pagination: "Radio pagination",
    eyebrow: "The voices of our communities",
    featuredLabel: "Discover our radios",
    radiosCount: "radios on this page",
    frequency: "Frequency",
    discover: "Discover radio",
    unknownCity: "Location not provided",
    website: "Website",
    listen: "Listen",
    emptyTitle: "No radios available",
    emptyDescription:
      "Come back soon to discover the radio stations listed on AfriWave.",
  },
};

const logoSrc =
  "/WhatsApp_Image_2026-10-10_at_20.27.03-removebg-preview.png";

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { locale } = await params;

  const lang: Locale = locale === "en" ? "en" : "fr";
  const text = copy[lang];
  const canonical = absoluteUrl(`/${lang}/radios`);

  return {
    title: `${text.title} | AfriWave`,
    description: text.description,
    alternates: {
      canonical,
      languages: {
        fr: absoluteUrl("/fr/radios"),
        en: absoluteUrl("/en/radios"),
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

function getRadioLocation(
  radio: PublicRadio,
  text: PageCopy,
): string {
  const parts = [radio.city, radio.country]
    .filter(
      (value): value is string =>
        typeof value === "string" && value.trim().length > 0,
    )
    .map((value) => value.trim());

  const uniqueParts = [...new Set(parts)];

  return uniqueParts.length > 0
    ? uniqueParts.join(", ")
    : text.unknownCity;
}

function getSafeExternalUrl(
  value: string | null | undefined,
): string | null {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

export default async function RadiosPage({
  params,
  searchParams,
}: Props) {
  const [{ locale }, { page: pageParam }] = await Promise.all([
    params,
    searchParams,
  ]);

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

  const result = await getPublicRadios({
    page,
    limit: 12,
  });

  const radios: PublicRadio[] = Array.isArray(result.data)
    ? result.data
    : [];

  const pagination = result.pagination;

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
              aria-current="page"
              className="whitespace-nowrap rounded-full bg-primary/10 px-3 py-2 text-sm font-semibold text-primary"
            >
              {t("Navigation.radios")}
            </Link>

            <Link
              href={`/${lang}/emissions`}
              className="whitespace-nowrap text-sm text-muted-foreground hover:text-foreground"
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
              aria-current="page"
              className="shrink-0 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
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
              className="shrink-0 text-xs text-muted-foreground"
            >
              {t("Navigation.podcasts")}
            </Link>
          </nav>
        </div>
      </header>

      <section
        aria-labelledby="radios-page-title"
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
            <Radio className="size-3.5" aria-hidden="true" />
            {text.eyebrow}
          </div>

          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-sm">
            {text.featuredLabel}
          </p>

          <h1
            id="radios-page-title"
            className="max-w-2xl text-3xl font-black leading-[1.08] tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          >
            {text.heading}
            <span className="text-primary">.</span>
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            {text.intro}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-2">
              <span
                className="size-2 rounded-full bg-primary"
                aria-hidden="true"
              />
              {text.title}
            </span>

            {radios.length > 0 && (
              <span className="rounded-full bg-muted/80 px-3 py-2">
                <span className="font-semibold text-foreground">
                  {radios.length}
                </span>{" "}
                {text.radiosCount}
              </span>
            )}
          </div>
        </div>
      </section>

      {radios.length === 0 ? (
        <section
          aria-labelledby="radios-empty-title"
          className="mb-10 rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center sm:px-10"
        >
          <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Radio className="size-5" aria-hidden="true" />
          </span>

          <h2
            id="radios-empty-title"
            className="text-lg font-semibold"
          >
            {text.emptyTitle}
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            {text.emptyDescription}
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
              {radios.length} {text.radiosCount}
            </span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {radios.map((radio) => {
              const radioUrl = `/${lang}/radios/${radio.slug}`;

              const location = getRadioLocation(radio, text);

              const coverUrl = radio.coverImage
                ? buildRadioMediaImageUrl(radio.coverImage)
                : null;

              const logoUrl = radio.logo
                ? buildRadioMediaImageUrl(radio.logo)
                : null;

              const websiteUrl = getSafeExternalUrl(radio.website);
              const streamUrl = getSafeExternalUrl(radio.streamUrl);

              return (
                <Card
                  key={radio.id}
                  className="group h-full overflow-hidden rounded-2xl border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
                >
                  <Link
                    href={radioUrl}
                    aria-label={`${text.discover}: ${radio.name}`}
                    className="block"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-primary/15 via-muted to-amber-500/15">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt=""
                          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 opacity-30 [background-image:radial-gradient(hsl(var(--primary))_1px,transparent_1px)] [background-size:18px_18px]"
                        />
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

                      <div className="absolute inset-x-4 bottom-4 flex items-end gap-3">
                        <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/30 bg-background shadow-lg sm:size-16">
                          {logoUrl ? (
                            <img
                              src={logoUrl}
                              alt=""
                              sizes="64px"
                              className="object-contain p-1"
                            />
                          ) : (
                            <Radio
                              className="size-7 text-primary"
                              aria-hidden="true"
                            />
                          )}
                        </div>

                        <div className="min-w-0 pb-1 text-white">
                          {radio.frequency && (
                            <span className="inline-flex rounded-full border border-white/25 bg-black/30 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm">
                              {radio.frequency}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>

                  <CardContent className="flex flex-col gap-3 p-5 sm:p-6">
                    <h3 className="text-lg font-bold leading-snug tracking-tight sm:text-xl">
                      <Link
                        href={radioUrl}
                        className="transition-colors hover:text-primary"
                      >
                        {radio.name}
                      </Link>
                    </h3>

                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin
                        className="size-4 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      <span>{location}</span>
                    </p>

                    {radio.description && (
                      <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                        {radio.description}
                      </p>
                    )}

                    <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-border/70 pt-4">
                      {websiteUrl && (
                        <a
                          href={websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
                        >
                          <Globe className="size-4" aria-hidden="true" />
                          {text.website}
                        </a>
                      )}

                      {streamUrl && (
                        <a
                          href={streamUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
                        >
                          <Headphones className="size-4" aria-hidden="true" />
                          {text.listen}
                        </a>
                      )}

                      <Link
                        href={radioUrl}
                        className="ml-auto inline-flex items-center gap-2 text-sm font-semibold text-primary transition-all hover:gap-3"
                      >
                        {text.discover}
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {pagination && pagination.totalPages > 1 && (
        <nav
          aria-label={text.pagination}
          className="mb-8 mt-10 flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card/70 p-3 sm:mt-12 sm:p-4"
        >
          {page > 1 ? (
            <Link
              href={`/${lang}/radios?page=${page - 1}`}
              rel="prev"
              className="inline-flex min-h-10 items-center rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:border-primary/30 hover:bg-primary/5 sm:px-4"
            >
              ← {text.previous}
            </Link>
          ) : (
            <span />
          )}

          <span className="text-sm text-muted-foreground">
            {text.page} {page} / {pagination.totalPages}
          </span>

          {page < pagination.totalPages ? (
            <Link
              href={`/${lang}/radios?page=${page + 1}`}
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
