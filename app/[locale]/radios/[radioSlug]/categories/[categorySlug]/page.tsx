
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, ChevronRight, MapPin, Newspaper, RadioTower } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/providers/theme-toggle";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { absoluteUrl } from "@/lib/seo";
import { buildRadioMediaImageUrl } from "@/lib/radio-media-api";

type Locale = "fr" | "en";

type PageProps = {
  params: Promise<{
    locale: string;
    radioSlug: string;
    categorySlug: string;
  }>;
  searchParams: Promise<{ page?: string }>;
};

type Radio = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  coverImage?: string | null;
  city?: string | null;
  country?: string | null;
};

type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
};

type Article = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  publishedAt?: string | null;
  createdAt?: string | null;
};

type CategoryArticlesResponse = {
  success: boolean;
  data: {
    radio: Radio;
    category: Category;
    articles: Article[];
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
  };
};

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? ""
).replace(/\/+$/, "");

function copy(locale: Locale) {
  return locale === "fr"
    ? {
        home: "Accueil",
        radios: "Radios",
        news: "Actualités",
        eyebrow: "Explorer la radio",
        articles: "Articles de la rubrique",
        intro: "Retrouvez les dernières publications de cette catégorie.",
        empty: "Aucun article publié dans cette rubrique pour le moment.",
        emptyHint: "Revenez bientôt pour découvrir les prochaines actualités.",
        previous: "Précédent",
        next: "Suivant",
        page: "Page",
        of: "sur",
        back: "Retour à la radio",
        read: "Lire l'article",
        noDescription: "Découvrez les actualités de cette rubrique.",
        unknownDate: "Date non renseignée",
        category: "Rubrique",
        pagination: "Pagination des articles",
      }
    : {
        home: "Home",
        radios: "Radios",
        news: "News",
        eyebrow: "Explore this radio",
        articles: "Category articles",
        intro: "Explore the latest publications in this category.",
        empty: "No articles have been published in this category yet.",
        emptyHint: "Come back soon to discover new stories.",
        previous: "Previous",
        next: "Next",
        page: "Page",
        of: "of",
        back: "Back to radio",
        read: "Read article",
        noDescription: "Explore news from this category.",
        unknownDate: "Date unavailable",
        category: "Category",
        pagination: "Article pagination",
      };
}

async function getCategoryArticles(
  radioSlug: string,
  categorySlug: string,
  page: number,
): Promise<CategoryArticlesResponse["data"] | null> {
  const path =
    `/api/public/radios/${encodeURIComponent(radioSlug)}` +
    `/categories/${encodeURIComponent(categorySlug)}/articles` +
    `?page=${page}&limit=10`;

  try {
    // absoluteUrl() converts the same-origin proxy path to an absolute URL.
    const response = await fetch(absoluteUrl(path), {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        `[RadioCategoryArticles] API ${response.status}: ${path}`,
      );
      return null;
    }

    const result =
      (await response.json()) as CategoryArticlesResponse;

    if (
      !result.success ||
      !result.data?.radio ||
      !result.data?.category ||
      !Array.isArray(result.data.articles)
    ) {
      return null;
    }

    return result.data;
  } catch (error) {
    console.error("[RadioCategoryArticles] Erreur API :", error);
    return null;
  }
}

function getArticleImage(article: Article): string | null {
  if (!article.featuredImage) return null;

  return buildRadioMediaImageUrl(article.featuredImage) ?? null;
}

function formatDate(value: string | null | undefined, locale: Locale) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat(
    locale === "fr" ? "fr-FR" : "en-GB",
    { day: "numeric", month: "long", year: "numeric" },
  ).format(date);
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, radioSlug, categorySlug } = await params;
  const lang: Locale = locale === "en" ? "en" : "fr";
  const text = copy(lang);

  const result = await getCategoryArticles(radioSlug, categorySlug, 1);

  if (!result) {
    return {
      title: lang === "fr"
        ? "Rubrique introuvable | AfriWave"
        : "Category not found | AfriWave",
      robots: { index: false, follow: false },
    };
  }

  const title = `${result.category.name} | ${result.radio.name} | AfriWave`;
  const description =
    result.category.description?.trim() || text.noDescription;
  const canonical =
    `/${lang}/radios/${result.radio.slug}/categories/${result.category.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(canonical),
      languages: {
        fr: absoluteUrl(
          `/fr/radios/${result.radio.slug}/categories/${result.category.slug}`,
        ),
        en: absoluteUrl(
          `/en/radios/${result.radio.slug}/categories/${result.category.slug}`,
        ),
      },
    },
    openGraph: {
      type: "website",
      siteName: "AfriWave",
      title,
      description,
      url: absoluteUrl(canonical),
      locale: lang === "fr" ? "fr_FR" : "en_US",
    },
    robots: { index: true, follow: true },
  };
}

export default async function RadioCategoryArticlesPage({
  params,
  searchParams,
}: PageProps) {
  const [{ locale, radioSlug, categorySlug }, { page: pageParam }] =
    await Promise.all([params, searchParams]);

  if (locale !== "fr" && locale !== "en") notFound();

  const lang: Locale = locale;
  const text = copy(lang);
  const parsedPage = Number(pageParam);
  const page =
    Number.isSafeInteger(parsedPage) && parsedPage > 0
      ? parsedPage
      : 1;

  const result = await getCategoryArticles(
    radioSlug,
    categorySlug,
    page,
  );

  if (
    !result ||
    result.radio.slug !== radioSlug ||
    result.category.slug !== categorySlug
  ) {
    notFound();
  }

  const { radio, category, articles, pagination } = result;
  const logo = radio.logo
    ? buildRadioMediaImageUrl(radio.logo)
    : null;

  const basePath =
    `/${lang}/radios/${radio.slug}/categories/${category.slug}`;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href={`/${lang}`}
            className="shrink-0"
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
            <Link href={`/${lang}`} className="text-muted-foreground hover:text-primary">
              {text.home}
            </Link>
            <Link href={`/${lang}/actualites`} className="text-muted-foreground hover:text-primary">
              {text.news}
            </Link>
            <Link href={`/${lang}/radios`} className="text-primary" aria-current="page">
              {text.radios}
            </Link>
            <Link href={`/${lang}/emissions`} className="text-muted-foreground hover:text-primary">
              {lang === "fr" ? "Émissions" : "Shows"}
            </Link>
            <Link href={`/${lang}/podcasts`} className="text-muted-foreground hover:text-primary">
              Podcasts
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <section className="relative isolate overflow-hidden border-b border-border bg-gradient-to-br from-primary/10 via-background to-amber-500/10">
        <div className="absolute -right-16 -top-20 -z-10 size-72 rounded-full bg-primary/10 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12 lg:px-8">
          <nav
            aria-label={lang === "fr" ? "Fil d'Ariane" : "Breadcrumb"}
            className="mb-7 flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
          >
            <Link href={`/${lang}`} className="hover:text-primary">
              {text.home}
            </Link>
            <ChevronRight className="size-4" />
            <Link href={`/${lang}/radios`} className="hover:text-primary">
              {text.radios}
            </Link>
            <ChevronRight className="size-4" />
            <Link
              href={`/${lang}/radios/${radio.slug}`}
              className="max-w-[220px] truncate hover:text-primary"
            >
              {radio.name}
            </Link>
            <ChevronRight className="size-4" />
            <span className="font-medium text-foreground">{category.name}</span>
          </nav>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:size-20">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logo}
                  alt=""
                  className="size-full object-contain p-2"
                />
              ) : (
                <RadioTower className="size-8 text-primary" />
              )}
            </div>

            <div className="min-w-0">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                {text.eyebrow} · {radio.name}
              </p>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {category.name}
              </h1>
              <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
                {category.description?.trim() || text.noDescription}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {(radio.city || radio.country) && (
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="size-4 text-primary" />
                    {[radio.city, radio.country].filter(Boolean).join(", ")}
                  </span>
                )}
                <span className="inline-flex items-center gap-2">
                  <Newspaper className="size-4 text-primary" />
                  {pagination.totalItems} {text.articles.toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-9 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-8">
        <section className="min-w-0">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                {text.category}
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                {text.articles}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {text.intro}
              </p>
            </div>
          </div>

          {articles.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {articles.map((article) => {
                const image = getArticleImage(article);
                const publishedDate = formatDate(
                  article.publishedAt ?? article.createdAt,
                  lang,
                );
                const articleUrl =
                  `/${lang}/actualites/${radio.slug}/${article.slug}`;

                return (
                  <Card
                    key={article.id}
                    className="group h-full overflow-hidden border-border/70 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
                  >
                    <Link href={articleUrl} className="block">
                      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-primary/10 via-muted to-amber-500/10">
                        {image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={image}
                            alt=""
                            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center">
                            <Newspaper className="size-10 text-primary/60" />
                          </div>
                        )}
                      </div>
                    </Link>

                    <CardContent className="flex h-full flex-col p-5">
                      {publishedDate && (
                        <p className="mb-3 inline-flex items-center gap-2 text-xs text-muted-foreground">
                          <CalendarDays className="size-4 text-primary" />
                          <time dateTime={article.publishedAt ?? article.createdAt ?? undefined}>
                            {publishedDate}
                          </time>
                        </p>
                      )}

                      <h3 className="text-lg font-bold leading-snug tracking-tight">
                        <Link
                          href={articleUrl}
                          className="transition-colors hover:text-primary"
                        >
                          {article.title}
                        </Link>
                      </h3>

                      {article.excerpt && (
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                          {article.excerpt}
                        </p>
                      )}

                      <Link
                        href={articleUrl}
                        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3"
                      >
                        {text.read}
                        <ArrowRight className="size-4" />
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-dashed shadow-none">
              <CardContent className="flex flex-col items-center px-6 py-12 text-center">
                <Newspaper className="mb-4 size-9 text-muted-foreground" />
                <h3 className="font-semibold">{text.empty}</h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  {text.emptyHint}
                </p>
              </CardContent>
            </Card>
          )}

          {pagination.totalPages > 1 && (
            <nav
              aria-label={text.pagination}
              className="mt-8 flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-3 sm:mt-10 sm:p-4"
            >
              {page > 1 ? (
                <Link
                  href={`${basePath}?page=${page - 1}`}
                  rel="prev"
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-muted sm:px-4"
                >
                  <ArrowLeft className="size-4" />
                  {text.previous}
                </Link>
              ) : (
                <span />
              )}

              <span className="text-sm text-muted-foreground">
                {text.page} {page} {text.of} {pagination.totalPages}
              </span>

              {page < pagination.totalPages ? (
                <Link
                  href={`${basePath}?page=${page + 1}`}
                  rel="next"
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-muted sm:px-4"
                >
                  {text.next}
                  <ArrowRight className="size-4" />
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}

          <div className="mt-8 border-t border-border pt-6">
            <Link
              href={`/${lang}/radios/${radio.slug}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              <ArrowLeft className="size-4" />
              {text.back}
            </Link>
          </div>
        </section>

        <aside className="h-fit rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-24">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            {text.eyebrow}
          </p>
          <h2 className="mt-2 text-lg font-bold">{radio.name}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {category.description?.trim() || text.noDescription}
          </p>

          <div className="my-5 border-t border-border" />

          <Link
            href={`/${lang}/radios/${radio.slug}`}
            className="flex items-center justify-between gap-2 rounded-lg bg-primary/10 px-3 py-3 text-sm font-semibold text-primary hover:bg-primary/15"
          >
            {text.back}
            <ArrowRight className="size-4 shrink-0" />
          </Link>

          <Link
            href={`/${lang}/radios/${radio.slug}#categories-heading`}
            className="mt-3 flex items-center justify-between gap-2 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {lang === "fr" ? "Toutes les rubriques" : "All categories"}
            <ChevronRight className="size-4 shrink-0" />
          </Link>
        </aside>
      </div>

      <footer className="border-t border-border bg-muted/20">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-7 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <Link href={`/${lang}`} className="font-semibold text-foreground hover:text-primary">
            AfriWave
          </Link>
          <p>{radio.name} · {category.name}</p>
          <Link href={`/${lang}/radios`} className="inline-flex items-center gap-2 font-medium hover:text-primary">
            {text.radios}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </footer>
    </main>
  );
}
