
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Clock3,
  MapPin,
  Radio,
  UserRound,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import JsonLd from "@/components/Radio/articles/JsonLd";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/providers/theme-toggle";
import { absoluteUrl } from "@/lib/seo";
import { getPublicShowDetail } from "@/lib/public/shows";
import { buildRadioMediaImageUrl } from "@/lib/radio-media-api";
import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{
    locale: string;
    radioSlug: string;
    showSlug: string;
  }>;
};

type Locale = "fr" | "en";

const copy = {
  fr: {
    home: "Accueil",
    shows: "Émissions",
    communityRadio: "ÉMISSION DE RADIO COMMUNAUTAIRE",
    about: "À propos de cette émission",
    host: "Animateur",
    schedule: "Horaires de diffusion",
    days: "Jours de diffusion",
    timezone: "Fuseau horaire",
    relatedRadio: "À propos de la radio",
    viewRadio: "Découvrir la radio",
    back: "Retour aux émissions",
    noImage: "Illustration de l’émission",
    notFound: "Émission introuvable",
    intro:
      "Découvrez les émissions, les animateurs et les programmes des radios communautaires sur AfriWave.",
    daysOfWeek: [
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
    home: "Home",
    shows: "Programmes",
    communityRadio: "COMMUNITY RADIO PROGRAMME",
    about: "About this programme",
    host: "Host",
    schedule: "Broadcast schedule",
    days: "Broadcast days",
    timezone: "Time zone",
    relatedRadio: "About the radio station",
    viewRadio: "Discover the radio",
    back: "Back to programmes",
    noImage: "Programme illustration",
    notFound: "Programme not found",
    intro:
      "Discover programmes, hosts and schedules from community radio stations on AfriWave.",
    daysOfWeek: [
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

function formatTime(value: string): string {
  if (!value) return "";

  const match = value.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return value;

  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

function getBroadcastDays(
  days: number[],
  locale: Locale,
): string {
  const labels = copy[locale].daysOfWeek;

  return [...new Set(days)]
    .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
    .sort((a, b) => a - b)
    .map((day) => labels[day])
    .join(", ");
}

async function getShowPageData(
  radioSlug: string,
  showSlug: string,
) {
  try {
    const response = await getPublicShowDetail(radioSlug, showSlug);

    if (!response?.success || !response.data || !response.radio) {
      return null;
    }

    return {
      show: response.data,
      radio: response.radio,
    };
  } catch (error) {
    console.error("Erreur de chargement du détail de l’émission :", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { locale, radioSlug, showSlug } = await params;

  if (locale !== "fr" && locale !== "en") return {};

  const data = await getShowPageData(radioSlug, showSlug);

  if (!data) {
    return {
      title:
        locale === "fr"
          ? "Émission introuvable | AfriWave"
          : "Programme not found | AfriWave",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const { show, radio } = data;
  const title = `${show.title} | AfriWave`;

  const description =
    show.description ||
    (locale === "fr"
      ? `${show.title}, une émission proposée par ${radio.name} sur AfriWave.`
      : `${show.title}, a programme from ${radio.name} on AfriWave.`);

  const canonical = absoluteUrl(
    `/${locale}/emissions/${radioSlug}/${showSlug}`,
  );

  const image = show.coverImage
    ? buildRadioMediaImageUrl(show.coverImage)
    : undefined;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        fr: absoluteUrl(`/fr/emissions/${radioSlug}/${showSlug}`),
        en: absoluteUrl(`/en/emissions/${radioSlug}/${showSlug}`),
      },
    },
    openGraph: {
      type: "website",
      siteName: "AfriWave",
      title,
      description,
      url: canonical,
      locale: locale === "fr" ? "fr_FR" : "en_US",
      ...(image
        ? {
            images: [
              {
                url: image,
                alt: show.title,
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

export default async function ShowDetailPage({ params }: Props) {
  const { locale, radioSlug, showSlug } = await params;

  if (locale !== "fr" && locale !== "en") {
    notFound();
  }

  const data = await getShowPageData(radioSlug, showSlug);

  if (!data) notFound();

  const lang: Locale = locale;
  const { show, radio } = data;
  const text = copy[lang];
  const t = await getTranslations();

  const showUrl = absoluteUrl(
    `/${lang}/emissions/${radioSlug}/${showSlug}`,
  );

  const radioUrl = absoluteUrl(
    `/${lang}/radios/${radio.slug}`,
  );

  const days = getBroadcastDays(show.daysOfWeek ?? [], lang);
  const image = show.coverImage
    ? buildRadioMediaImageUrl(show.coverImage)
    : undefined;

  const showJsonLd = {
    "@context": "https://schema.org",
    "@type": "RadioSeries",
    name: show.title,
    description: show.description || undefined,
    url: showUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": showUrl,
    },
    inLanguage: lang,
    ...(image ? { image } : {}),
    ...(show.hostName
      ? {
          actor: {
            "@type": "Person",
            name: show.hostName,
          },
        }
      : {}),
    broadcastChannel: {
      "@type": "RadioChannel",
      name: radio.name,
      url: radioUrl,
    },
    broadcaster: {
      "@type": "Organization",
      name: radio.name,
      url: radioUrl,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "AfriWave",
        item: absoluteUrl(`/${lang}`),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: text.shows,
        item: absoluteUrl(`/${lang}/emissions`),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: radio.name,
        item: radioUrl,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: show.title,
        item: showUrl,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-background">
      <JsonLd data={showJsonLd} />
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
            aria-label={lang === "fr" ? "Navigation principale" : "Main navigation"}
            className="hidden items-center gap-5 xl:flex"
          >
            <Link href={`/${lang}`} className="text-sm text-muted-foreground hover:text-foreground">
              {t("Navigation.home")}
            </Link>
            <Link href={`/${lang}/actualites`} className="text-sm text-muted-foreground hover:text-foreground">
              {t("Navigation.news")}
            </Link>
            <Link href={`/${lang}/radios`} className="text-sm text-muted-foreground hover:text-foreground">
              {t("Navigation.radios")}
            </Link>
            <Link
              href={`/${lang}/emissions`}
              aria-current="page"
              className="rounded-full bg-primary/10 px-3 py-2 text-sm font-semibold text-primary"
            >
              {t("Navigation.shows")}
            </Link>
            <Link href={`/${lang}/podcasts`} className="text-sm text-muted-foreground hover:text-foreground">
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
              <span className="text-sm font-semibold sm:inline">
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
            aria-label={lang === "fr" ? "Navigation mobile" : "Mobile navigation"}
            className="mx-auto flex max-w-7xl items-center gap-4 overflow-x-auto"
          >
            <Link href={`/${lang}`} className="shrink-0 text-xs text-muted-foreground">
              {t("Navigation.home")}
            </Link>
            <Link href={`/${lang}/actualites`} className="shrink-0 text-xs text-muted-foreground">
              {t("Navigation.news")}
            </Link>
            <Link href={`/${lang}/radios`} className="shrink-0 text-xs text-muted-foreground">
              {t("Navigation.radios")}
            </Link>
            <Link
              href={`/${lang}/emissions`}
              aria-current="page"
              className="shrink-0 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
            >
              {t("Navigation.shows")}
            </Link>
            <Link href={`/${lang}/podcasts`} className="shrink-0 text-xs text-muted-foreground">
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
          <Link href={`/${lang}/emissions`} className="hover:text-primary">
            {text.shows}
          </Link>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <Link href={`/${lang}/radios/${radio.slug}`} className="hover:text-primary">
            {radio.name}
          </Link>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <span className="max-w-[220px] truncate font-medium text-foreground sm:max-w-sm">
            {show.title}
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

          <Link
            href={`/${lang}/radios/${radio.slug}`}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-3 py-1.5 text-xs font-bold text-primary shadow-sm hover:bg-primary/10"
          >
            <Radio className="size-3.5" />
            {radio.name}
          </Link>

          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-sm">
            {text.communityRadio}
          </p>

          <h1 className="text-3xl font-black leading-[1.1] tracking-tight text-foreground sm:text-4xl lg:text-5xl xl:text-6xl">
            {show.title}
            <span className="text-primary">.</span>
          </h1>

          {show.description && (
            <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              {show.description}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted-foreground">
            {show.hostName && (
              <span className="inline-flex items-center gap-2">
                <UserRound className="size-4 text-primary" />
                {text.host}: {show.hostName}
              </span>
            )}

            <span className="inline-flex items-center gap-2">
              <Clock3 className="size-4 text-primary" />
              {formatTime(show.startTime)} – {formatTime(show.endTime)}
            </span>
          </div>
        </section>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12">
          <article className="min-w-0">
            {image ? (
              <figure className="mb-8 overflow-hidden rounded-2xl border border-border/60 bg-muted shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt={show.title}
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
                  <Radio className="size-8" />
                </div>
              </div>
            )}

            <section className="rounded-2xl border border-border/60 bg-card px-5 py-7 shadow-sm sm:px-8 sm:py-10">
              <div className="mb-6 flex items-center gap-2 border-b border-border/70 pb-4 text-xs font-bold uppercase tracking-[0.16em] text-primary">
                <CalendarDays className="size-4" />
                {text.about}
              </div>

              {show.description ? (
                <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground sm:text-base">
                  {show.description}
                </p>
              ) : (
                <p className="text-sm leading-7 text-muted-foreground">
                  {text.intro}
                </p>
              )}

              <div className="mt-8 grid gap-4 border-t border-border/70 pt-6 sm:grid-cols-2">
                <div className="rounded-xl bg-muted/50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    {text.days}
                  </p>
                  <p className="mt-2 text-sm font-semibold">
                    {getBroadcastDays(show.daysOfWeek ?? [], lang) || "—"}
                  </p>
                </div>

                <div className="rounded-xl bg-muted/50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    {text.timezone}
                  </p>
                  <p className="mt-2 break-words text-sm font-semibold">
                    {show.timezone || "Africa/Douala"}
                  </p>
                </div>
              </div>
            </section>

            <div className="mt-7">
              <Link
                href={`/${lang}/emissions`}
                className="group inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:border-primary/30 hover:bg-primary/5"
              >
                <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                {text.back}
              </Link>
            </div>
          </article>

          <aside className="space-y-5">
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

                {radio.logo && (
                  <div className="mt-4 flex size-16 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-background p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={buildRadioMediaImageUrl(radio.logo)}
                      alt={radio.name}
                      className="size-full object-contain"
                    />
                  </div>
                )}
              </div>

              <CardContent className="space-y-4 p-5">
                <p className="text-sm leading-6 text-muted-foreground">
                  {text.intro}
                </p>

                <Link
                  href={`/${lang}/emissions/${radio.slug}`}
                  className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  {text.viewRadio}
                  <ArrowRight className="size-4" />
                </Link>
              </CardContent>
            </Card>

            <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
              <div className="bg-gradient-to-br from-primary/10 via-background to-amber-500/10 p-5">
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl border border-primary/15 bg-background text-primary shadow-sm">
                  <Clock3 className="size-6" />
                </div>

                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                  {text.schedule}
                </p>

                <p className="mt-3 text-2xl font-black">
                  {formatTime(show.startTime)} – {formatTime(show.endTime)}
                </p>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {getBroadcastDays(show.daysOfWeek ?? [], lang) || "—"}
                </p>
              </div>
            </Card>

            <div className="rounded-2xl border border-border/70 bg-muted/30 p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold">
                <MapPin className="size-4 text-primary" />
                AfriWave
              </div>

              <p className="text-sm leading-6 text-muted-foreground">
                {text.intro}
              </p>
            </div>
          </aside>
        </div>

        <footer className="mt-12 flex flex-col gap-4 border-t border-border/70 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            AfriWave — {text.shows}
          </p>

          <Link
            href={`/${lang}/emissions`}
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
