
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Newspaper,
  RadioTower,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/providers/theme-toggle";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

import {
  getLatestPublicArticles,
  getPublicArticles,
} from "@/lib/public/articles";
import { absoluteUrl } from "@/lib/seo";
import { buildRadioMediaImageUrl } from "@/lib/radio-media-api";

type Props = {
  params: Promise<{ locale: string; radioSlug: string }>;
  searchParams: Promise<{ page?: string }>;
};

type Article = {
  slug: string;
  title: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  publishedAt?: string | null;
};

type ArticleCardProps = {
  article: Article;
  radioSlug: string;
  locale: "fr" | "en";
  featured?: boolean;
  readLabel: string;
};

async function getRadioPageData(radioSlug: string, page: number) {
  const [latestResult, listResult] = await Promise.all([
    getLatestPublicArticles(radioSlug, 6),
    getPublicArticles(radioSlug, { page, limit: 10 }),
  ]);

  return {
    latest: latestResult.articles ?? [],
    articles: listResult.articles ?? [],
    radio: listResult.radio ?? latestResult.radio,
    pagination: listResult.pagination,
  };
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { locale, radioSlug } = await params;
  const lang = locale === "en" ? "en" : "fr";

  try {
    const data = await getRadioPageData(radioSlug, 1);
    const radioName = data.radio?.name ?? radioSlug;

    const title =
      lang === "fr"
        ? `Actualités de ${radioName} | AfriWave`
        : `${radioName} News | AfriWave`;

    const description =
      lang === "fr"
        ? `Consultez les dernières actualités publiées par ${radioName} sur AfriWave.`
        : `Read the latest news published by ${radioName} on AfriWave.`;

    const canonical = absoluteUrl(`/${lang}/actualites/${radioSlug}`);

    const logo = data.radio?.logo
      ? buildRadioMediaImageUrl(data.radio.logo)
      : undefined;

    return {
      title,
      description,
      alternates: {
        canonical,
        languages: {
          fr: absoluteUrl(`/fr/actualites/${radioSlug}`),
          en: absoluteUrl(`/en/actualites/${radioSlug}`),
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
        ? `Actualités de ${radioSlug} | AfriWave`
        : `${radioSlug} News | AfriWave`;

    return {
      title,
      alternates: {
        canonical: absoluteUrl(`/${lang}/actualites/${radioSlug}`),
        languages: {
          fr: absoluteUrl(`/fr/actualites/${radioSlug}`),
          en: absoluteUrl(`/en/actualites/${radioSlug}`),
        },
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  }
}

export default async function RadioActualitesPage({
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
      namespace: "RadioActualites",
    }),
    getTranslations({
      locale: lang,
      namespace: "Navigation",
    }),
    getRadioPageData(radioSlug, page),
  ]);

  if (!data.radio && data.articles.length === 0) {
    notFound();
  }

  const radioName = data.radio?.name ?? radioSlug;
  const radioLogo = data.radio?.logo
    ? buildRadioMediaImageUrl(data.radio.logo)
    : null;

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
              className="text-primary"
              aria-current="page"
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
            <Link
              href={`/${lang}`}
              className="transition-colors hover:text-primary"
            >
              {nav("home")}
            </Link>

            <ChevronRight className="h-4 w-4" />

            <Link
              href={`/${lang}/actualites`}
              className="transition-colors hover:text-primary"
            >
              {nav("news")}
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
                <RadioTower className="h-4 w-4" />
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
                  <Newspaper className="h-4 w-4 text-primary" />
                  {data.articles.length} {t("publications")}
                </span>

                <span className="inline-flex items-center gap-2">
                  <RadioTower className="h-4 w-4 text-primary" />
                  AfriWave
                </span>
              </div>

              <Link
                href={`/${lang}/actualites`}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:opacity-80"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("allNews")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {/* Articles à la une */}
        {data.latest.length > 0 && (
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
                {t("recentArticlesCount", {
                  count: data.latest.length,
                })}
              </span>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.latest.map((article, index) => (
                <ArticleCard
                  key={article.slug}
                  article={article}
                  radioSlug={radioSlug}
                  locale={lang}
                  featured={index === 0}
                  readLabel={t("readArticle")}
                />
              ))}
            </div>
          </section>
        )}

        {/* Toutes les publications */}
        <section>
          <div className="mb-7 border-b border-border pb-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
              {t("allArticlesEyebrow")}
            </p>

            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t("allArticles")}
            </h2>

            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              {t("allArticlesDescription")}
            </p>
          </div>

          {data.articles.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.articles.map((article) => (
                <ArticleCard
                  key={article.slug}
                  article={article}
                  radioSlug={radioSlug}
                  locale={lang}
                  readLabel={t("readArticle")}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Newspaper className="h-7 w-7 text-muted-foreground" />
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
        {data.pagination && data.pagination.totalPages > 1 && (
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
                  href={`/${lang}/actualites/${radioSlug}?page=${page - 1}`}
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
                  href={`/${lang}/actualites/${radioSlug}?page=${page + 1}`}
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
            href={`/${lang}/actualites`}
            className="inline-flex items-center gap-2 font-medium transition-colors hover:text-primary"
          >
            {t("discoverNews")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </footer>
    </main>
  );
}

function ArticleCard({
  article,
  radioSlug,
  locale,
  featured = false,
  readLabel,
}: ArticleCardProps) {
  const href = `/${locale}/actualites/${radioSlug}/${article.slug}`;

  const image = article.featuredImage
    ? buildRadioMediaImageUrl(article.featuredImage)
    : null;

  return (
    <Card
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg ${
        featured ? "sm:col-span-2 lg:col-span-1" : ""
      }`}
    >
      <Link
        href={href}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-label={article.title}
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={article.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-muted to-muted">
              <Newspaper className="h-12 w-12 text-primary/60" />
            </div>
          )}

          <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-background/85 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur">
            <RadioTower className="h-3.5 w-3.5 text-primary" />
            AfriWave
          </div>
        </div>
      </Link>

      <CardContent className="flex flex-1 flex-col space-y-3 p-5 sm:p-6">
        {article.publishedAt && (
          <p className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5 text-primary" />
            {new Date(article.publishedAt).toLocaleDateString(
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
            {article.title}
          </Link>
        </h3>

        {article.excerpt && (
          <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
            {article.excerpt}
          </p>
        )}

        <div className="mt-auto pt-2">
          <Link
            href={href}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            {readLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
