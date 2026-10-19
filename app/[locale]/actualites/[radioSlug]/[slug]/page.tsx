
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import {
  getPublicArticleBySlug,
  getRelatedPublicArticles,
} from "@/lib/public/articles";
import { absoluteUrl } from "@/lib/seo";
import { buildRadioMediaImageUrl } from "@/lib/radio-media-api";
import JsonLd from "@/components/Radio/articles/JsonLd";
import { getTranslations } from "next-intl/server";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Clock3,
  Radio,
  Search,
  UserRound,
} from "lucide-react";
import { ThemeToggle } from "@/components/providers/theme-toggle";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

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
    news: "Actualités",
    home: "Accueil",
    reading: "Lecture",
    publishedBy: "Publié par",
    by: "Par",
    relatedTitle: "À lire également",
    relatedIntro: "Découvrez d’autres actualités de cette radio.",
    back: "Retour aux actualités de la radio",
    read: "Lire l’article",
    noImage: "Actualités des radios communautaires",
    minRead: "min de lecture",
    notFound: "Actualité introuvable",
    search: "Rechercher",
  },
  en: {
    news: "News",
    home: "Home",
    reading: "Reading",
    publishedBy: "Published by",
    by: "By",
    relatedTitle: "Related articles",
    relatedIntro: "Discover more news from this radio station.",
    back: "Back to radio news",
    read: "Read article",
    noImage: "Community radio news",
    minRead: "min read",
    notFound: "Article not found",
    search: "Search",
  },
} as const;

async function getArticlePageData(radioSlug: string, slug: string) {
  const result = await getPublicArticleBySlug(radioSlug, slug);

  if (!result?.article) return null;

  const relatedResult = await getRelatedPublicArticles(
    radioSlug,
    slug,
    4,
  );

  return {
    article: result.article,
    radio: result.radio,
    related: relatedResult?.articles ?? [],
  };
}
export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { locale, radioSlug, slug } = await params;

  if (locale !== "fr" && locale !== "en") return {};

  const data = await getArticlePageData(radioSlug, slug);

  if (!data) {
    return {
      title:
        locale === "fr"
          ? "Actualité introuvable | AfriWave"
          : "Article not found | AfriWave",
      robots: { index: false, follow: false },
    };
  }

  const { article, radio } = data;
  const title = `${article.title} | AfriWave`;
  const description =
    article.excerpt ||
    (locale === "fr"
      ? `Lisez cette actualité publiée par ${radio?.name ?? radioSlug} sur AfriWave.`
      : `Read this article published by ${radio?.name ?? radioSlug} on AfriWave.`);

  const canonical = absoluteUrl(
    `/${locale}/actualites/${radioSlug}/${slug}`,
  );

  const image = article.featuredImage
    ? buildRadioMediaImageUrl(article.featuredImage)
    : undefined;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "article",
      siteName: "AfriWave",
      title,
      description,
      url: canonical,
      locale: locale === "fr" ? "fr_FR" : "en_US",
      publishedTime: article.publishedAt ?? undefined,
      modifiedTime: article.updatedAt ?? undefined,
      ...(image ? { images: [{ url: image, alt: article.title }] } : {}),
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

export default async function ArticleDetailPage({ params }: Props) {
  const { locale, radioSlug, slug } = await params;

  if (locale !== "fr" && locale !== "en") notFound();

  const data = await getArticlePageData(radioSlug, slug);

  if (!data) notFound();

  const { article, radio, related } = data;
  const lang: Locale = locale;
  const text = copy[lang];
  const t = await getTranslations();

  const articleUrl = absoluteUrl(
    `/${lang}/actualites/${radioSlug}/${slug}`,
  );

  const image = article.featuredImage
    ? buildRadioMediaImageUrl(article.featuredImage)
    : undefined;
    
const authorName =
  typeof article.author === "string"
    ? article.author
    : article.author?.name;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt || undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    url: articleUrl,
    inLanguage: lang,
    ...(image ? { image: [image] } : {}),
    ...(article.publishedAt
      ? { datePublished: article.publishedAt }
      : {}),
    ...(article.updatedAt
      ? { dateModified: article.updatedAt }
      : {}),
    ...(authorName
      ? {
          author: {
            "@type": "Person",
            name: authorName,
          },
        }
      : {}),
    publisher: {
      "@type": "Organization",
      name: radio?.name ?? "AfriWave",
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
        name: text.news,
        item: absoluteUrl(`/${lang}/actualites`),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: radio?.name ?? radioSlug,
        item: absoluteUrl(`/${lang}/actualites/${radioSlug}`),
      },
      {
        "@type": "ListItem",
        position: 4,
        name: article.title,
        item: articleUrl,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-background">
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      {/* Navigation principale */}
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
            <Link
              href={`/${lang}`}
              className="whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("Navigation.home")}
            </Link>
            <Link
              href={`/${lang}/actualites`}
              aria-current="page"
              className="whitespace-nowrap rounded-full bg-primary/10 px-3 py-2 text-sm font-semibold text-primary"
            >
              {t("Navigation.news")}
            </Link>
            <Link
              href={`/${lang}/radios`}
              className="whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("Navigation.radios")}
            </Link>
            <Link
              href={`/${lang}/emissions`}
              className="whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("Navigation.shows")}
            </Link>
            <Link
              href={`/${lang}/podcasts`}
              className="whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-foreground"
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
              className="inline-flex size-9 items-center justify-center rounded-xl border border-border transition-colors hover:bg-muted sm:h-10 sm:w-auto sm:gap-2 sm:px-3"
            >
              <Search className="size-4" />
              <span className="hidden text-sm font-semibold sm:inline">
                {t("Navigation.search")}
              </span>
            </Link>

            <Link
              href={`/${lang}/login`}
              className="hidden min-h-10 items-center justify-center rounded-xl border border-border px-3 text-sm font-semibold transition-colors hover:bg-muted sm:inline-flex"
            >
              {t("Navigation.login")}
            </Link>

            <Link
              href={`/${lang}/register`}
              className="hidden min-h-10 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 sm:inline-flex lg:px-4"
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
            <Link
              href={`/${lang}/actualites`}
              aria-current="page"
              className="shrink-0 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
            >
              {t("Navigation.news")}
            </Link>
            <Link href={`/${lang}/radios`} className="shrink-0 text-xs text-muted-foreground">
              {t("Navigation.radios")}
            </Link>
            <Link href={`/${lang}/emissions`} className="shrink-0 text-xs text-muted-foreground">
              {t("Navigation.shows")}
            </Link>
            <Link href={`/${lang}/podcasts`} className="shrink-0 text-xs text-muted-foreground">
              {t("Navigation.podcasts")}
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        {/* Fil d'Ariane */}
        <nav
          aria-label={lang === "fr" ? "Fil d’Ariane" : "Breadcrumb"}
          className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
        >
          <Link
            href={`/${lang}`}
            className="transition-colors hover:text-primary"
          >
            {text.home}
          </Link>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <Link
            href={`/${lang}/actualites`}
            className="transition-colors hover:text-primary"
          >
            {text.news}
          </Link>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <Link
            href={`/${lang}/actualites/${radioSlug}`}
            className="transition-colors hover:text-primary"
          >
            {radio?.name ?? radioSlug}
          </Link>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <span className="max-w-[220px] truncate font-medium text-foreground sm:max-w-sm">
            {article.title}
          </span>
        </nav>

        {/* En-tête éditorial */}
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
            <Link
              href={`/${lang}/actualites/${radioSlug}`}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-3 py-1.5 text-xs font-bold text-primary shadow-sm transition-colors hover:bg-primary/10"
            >
              <Radio className="size-3.5" />
              {radio?.name ?? radioSlug}
            </Link>

            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-sm">
              {lang === "fr"
                ? "LES VOIX DE NOS COMMUNAUTÉS"
                : "THE VOICES OF OUR COMMUNITIES"}
            </p>

            <h1 className="text-3xl font-black leading-[1.1] tracking-tight text-foreground sm:text-4xl lg:text-5xl xl:text-6xl">
              {article.title}
              <span className="text-primary">.</span>
            </h1>

            {article.excerpt && (
              <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                {article.excerpt}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 text-sm text-muted-foreground">
              {authorName && (
                <span className="inline-flex items-center gap-2">
                  <UserRound className="size-4 text-primary" />
                  {text.by} {authorName}
                </span>
              )}

              {article.publishedAt && (
                <time
                  dateTime={article.publishedAt}
                  className="inline-flex items-center gap-2"
                >
                  <CalendarDays className="size-4 text-primary" />
                  {new Date(article.publishedAt).toLocaleDateString(
                    lang === "fr" ? "fr-FR" : "en-US",
                    { dateStyle: "long" },
                  )}
                </time>
              )}
            </div>
          </div>
        </section>

        {/* Article */}
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-12">
          <article className="min-w-0">
            {image ? (
              <figure className="group relative mb-8 overflow-hidden rounded-2xl border border-border/60 bg-muted shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt={article.title}
                  fetchPriority="high"
                  className="max-h-[620px] w-full object-cover"
                />
                <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-5 pb-4 pt-12 text-xs text-white/90">
                  {text.publishedBy} {radio?.name ?? "AfriWave"}
                </figcaption>
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

            <div className="rounded-2xl border border-border/60 bg-card px-5 py-7 shadow-sm sm:px-8 sm:py-10">
              <div className="mb-6 flex items-center gap-2 border-b border-border/70 pb-4 text-xs font-bold uppercase tracking-[0.16em] text-primary">
                <Radio className="size-4" />
                {text.news}
              </div>

              <div
                className={[
                  "prose prose-base max-w-none dark:prose-invert sm:prose-lg",
                  "prose-headings:font-bold prose-headings:tracking-tight",
                  "prose-a:font-semibold prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
                  "prose-img:rounded-xl prose-img:border prose-img:border-border/50",
                  "prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground",
                  "prose-li:marker:text-primary",
                  "break-words",
                ].join(" ")}
                dangerouslySetInnerHTML={{
                  __html: article.content ?? "",
                }}
              />
            </div>

            <div className="mt-7">
              <Link
                href={`/${lang}/actualites/${radioSlug}`}
                className="group inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold transition-all hover:border-primary/30 hover:bg-primary/5"
              >
                <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                {text.back}
              </Link>
            </div>
          </article>

          {/* Informations de la radio */}
          <aside className="space-y-5">
            <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
              <div className="bg-gradient-to-br from-primary/10 via-muted/40 to-amber-500/10 p-5">
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl border border-primary/15 bg-background text-primary shadow-sm">
                  <Radio className="size-6" />
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  {lang === "fr" ? "RADIO COMMUNAUTAIRE" : "COMMUNITY RADIO"}
                </p>
                <h2 className="mt-2 text-xl font-bold leading-snug">
                  {radio?.name ?? radioSlug}
                </h2>
              </div>
              <CardContent className="space-y-4 p-5">
                <p className="text-sm leading-6 text-muted-foreground">
                  {lang === "fr"
                    ? "Suivez les informations et les initiatives de votre communauté sur AfriWave."
                    : "Follow your community's news and initiatives on AfriWave."}
                </p>
                <Link
                  href={`/${lang}/actualites/${radioSlug}`}
                  className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  {text.back}
                  <ArrowRight className="size-4" />
                </Link>
              </CardContent>
            </Card>

            <div className="rounded-2xl border border-border/70 bg-muted/30 p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold">
                <Clock3 className="size-4 text-primary" />
                {text.reading}
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                {lang === "fr"
                  ? "Prenez le temps de découvrir cette actualité et de la partager autour de vous."
                  : "Take a moment to explore this story and share it with others."}
              </p>
            </div>
          </aside>
        </div>

        {/* Articles associés */}
        {related.length > 0 && (
          <section className="mt-16 border-t border-border/70 pt-10 sm:mt-20 sm:pt-12">
            <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  {lang === "fr" ? "POUR PROLONGER LA LECTURE" : "KEEP READING"}
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                  {text.relatedTitle}
                  <span className="text-primary">.</span>
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {text.relatedIntro}
                </p>
              </div>

              <Link
                href={`/${lang}/actualites/${radioSlug}`}
                className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary transition-colors hover:gap-3"
              >
                {text.back}
                <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item: {
                slug: string;
                title: string;
                excerpt?: string | null;
                featuredImage?: string | null;
                publishedAt?: string | null;
              }) => {
                const relatedImage = item.featuredImage
                  ? buildRadioMediaImageUrl(item.featuredImage)
                  : undefined;

                return (
                  <Card
                    key={item.slug}
                    className="group h-full overflow-hidden rounded-2xl border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
                  >
                    {relatedImage ? (
                      <Link
                        href={`/${lang}/actualites/${radioSlug}/${item.slug}`}
                        aria-label={item.title}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={relatedImage}
                          alt={item.title}
                          loading="lazy"
                          className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </Link>
                    ) : (
                      <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-primary/10 via-muted to-amber-500/10">
                        <Radio className="size-8 text-primary/70" />
                      </div>
                    )}

                    <CardContent className="flex h-full flex-col space-y-3 p-5">
                      {item.publishedAt && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.publishedAt).toLocaleDateString(
                            lang === "fr" ? "fr-FR" : "en-US",
                          )}
                        </p>
                      )}

                      <h3 className="text-base font-bold leading-snug tracking-tight transition-colors group-hover:text-primary">
                        <Link
                          href={`/${lang}/actualites/${radioSlug}/${item.slug}`}
                        >
                          {item.title}
                        </Link>
                      </h3>

                      {item.excerpt && (
                        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                          {item.excerpt}
                        </p>
                      )}

                      <Link
                        href={`/${lang}/actualites/${radioSlug}/${item.slug}`}
                        className="mt-auto inline-flex w-fit items-center gap-2 pt-2 text-sm font-semibold text-primary"
                      >
                        {text.read}
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Retour à toutes les actualités */}
        <footer className="mt-12 flex flex-col gap-4 border-t border-border/70 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            AfriWave — {text.news}
          </p>
          <Link
            href={`/${lang}/actualites`}
            className="inline-flex min-h-10 items-center gap-2 self-start rounded-xl border border-border px-4 py-2 text-sm font-semibold transition-colors hover:border-primary/30 hover:bg-primary/5 sm:self-auto"
          >
            <ArrowLeft className="size-4" />
            {lang === "fr" ? "Toutes les actualités" : "All news"}
          </Link>
        </footer>
      </div>
    </main>
  );
}
