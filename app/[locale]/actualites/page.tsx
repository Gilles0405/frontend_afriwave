

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { absoluteUrl } from "@/lib/seo";
import { buildRadioMediaImageUrl } from "@/lib/radio-media-api";
import {
    getAllPublicArticles,
    type GlobalPublicArticle,
} from "@/lib/public/articles";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { LogIn, Radio, Search } from "lucide-react";
import { ThemeToggle } from "@/components/providers/theme-toggle";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

type Props = {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ page?: string }>;
};

type Locale = "fr" | "en";

type Pagination = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
};

const copy = {
    fr: {
        title: "Actualités",
        description:
            "Retrouvez les dernières actualités des radios communautaires sur AfriWave.",
        heading: "Toutes les actualités",
        intro: "L’actualité des radios communautaires, au même endroit.",
        empty: "Aucune actualité publiée pour le moment.",
        previous: "Précédent",
        next: "Suivant",
        page: "Page",
        read: "Lire l’article",
        pagination: "Pagination",
        eyebrow: "LE FIL DE L’ACTUALITÉ",
        featuredLabel: "LES VOIX DE NOS COMMUNAUTÉS",
        articlesLabel: "À découvrir",
        articlesCount: "articles sur cette page",
    },
    en: {
        title: "News",
        description:
            "Discover the latest news from community radio stations on AfriWave.",
        heading: "Latest news",
        intro: "Community radio news, all in one place.",
        empty: "No news has been published yet.",
        previous: "Previous",
        next: "Next",
        page: "Page",
        read: "Read article",
        pagination: "Pagination",
        eyebrow: "THE LATEST UPDATES",
        featuredLabel: "THE VOICES OF OUR COMMUNITIES",
        articlesLabel: "Discover the latest stories",
        articlesCount: "articles on this page",
    },
} as const;

export async function generateMetadata({
    params,
}: Props): Promise<Metadata> {
    const { locale } = await params;
   
    const lang: Locale = locale === "en" ? "en" : "fr";
    const text = copy[lang];
    const canonical = absoluteUrl(`/${lang}/actualites`);

    return {
        title: `${text.title} | AfriWave`,
        description: text.description,
        alternates: {
            canonical,
            languages: {
                fr: absoluteUrl("/fr/actualites"),
                en: absoluteUrl("/en/actualites"),
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

export default async function ActualitesPage({
    params,
    searchParams,
}: Props) {
    const { locale } = await params;
    const { page: pageParam } = await searchParams;
    const t = await getTranslations();
    if (locale !== "fr" && locale !== "en") {
        notFound();
    }

    const lang: Locale = locale;
    const text = copy[lang];

    const requestedPage = Number(pageParam);
    const page =
        Number.isSafeInteger(requestedPage) && requestedPage > 0
            ? requestedPage
            : 1;

    const result = await getAllPublicArticles({
        page,
        limit: 12,
    });

    const articles: GlobalPublicArticle[] = result.articles;
    const pagination = result.pagination;

    return (
        <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
           <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl mb-6">
                   <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:min-h-[76px] sm:gap-4 sm:px-6 lg:px-8">
                     {/* Logo */}
                     <Link
                       href="/"
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
           
                     {/* Navigation desktop */}
                     <nav
                       aria-label="Navigation principale"
                       className="hidden items-center gap-5 xl:flex"
                     >
                       <Link
                         href="/"
                         className="whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-foreground"
                       >
                         {t("Navigation.home")}
                       </Link>
                       <Link
                         href="/actualites"
                         aria-current="page"
                         className="whitespace-nowrap rounded-full bg-primary/10 px-3 py-2 text-sm font-semibold text-primary transition-colors"
                       >
                         {t("Navigation.news")}
                       </Link>
                       <Link
                         href="/radios"
                         className="whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-foreground"
                       >
                         {t("Navigation.radios")}
                       </Link>
                       <Link
                         href="/emissions"
                         className="whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-foreground"
                       >
                         {t("Navigation.shows")}
                       </Link>
                       <Link
                         href="/podcasts"
                         className="whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-foreground"
                       >
                         {t("Navigation.podcasts")}
                       </Link>
                     </nav>
           
                     {/* Actions */}
                     <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                       <LanguageSwitcher />
                       <ThemeToggle />
           
                       {/* Recherche : icône seule sur mobile */}
                       <Link
                         href="/recherche"
                         aria-label={t("Navigation.search")}
                         className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-border transition-colors hover:bg-muted sm:h-10 sm:w-auto sm:gap-2 sm:px-3"
                       >
                         <Search className="size-4" />
                         <span className="hidden text-sm font-semibold sm:inline">
                           {t("Navigation.search")}
                         </span>
                       </Link>
           
                       {/* Connexion */}
                       <Link
                         href="/login"
                         aria-label={t("Navigation.login")}
                         className="inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-border px-2.5 text-xs font-semibold transition-colors hover:bg-muted sm:min-h-10 sm:gap-2 sm:px-3 sm:text-sm"
                       >
                         <LogIn className="size-4 shrink-0" />
                         <span className="hidden sm:inline">
                           {t("Navigation.login")}
                         </span>
                         <span className="sm:hidden">
                           {t("Navigation.loginShort")}
                         </span>
                       </Link>
           
                       {/* Inscription radio */}
                       <Link
                         href="/register"
                         className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 lg:px-4"
                       >
                         <Radio className="size-4 shrink-0" />
                         <span>{t("Navigation.registerRadio")}</span>
                       </Link>
                     </div>
                   </div>
           
                   {/* Accès secondaire sur mobile et tablette */}
                   <div className="border-t border-border/60 px-3 py-2 md:hidden">
                     <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
                       <nav
                         aria-label="Navigation mobile"
                         className="flex min-w-0 items-center gap-4 overflow-x-auto"
                       >
                         <Link
                           href="/"
                           className="shrink-0 text-xs text-muted-foreground transition-colors hover:text-foreground"
                         >
                           {t("Navigation.home")}
                         </Link>
                         <Link
                           href="/actualites"
                           aria-current="page"
                           className="shrink-0 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
                         >
                           {t("Navigation.news")}
                         </Link>
                         <Link
                           href="/radios"
                           className="shrink-0 text-xs text-muted-foreground"
                         >
                           {t("Navigation.radios")}
                         </Link>
                         <Link
                           href="/emissions"
                           className="shrink-0 text-xs text-muted-foreground"
                         >
                           {t("Navigation.shows")}
                         </Link>
                         <Link
                           href="/podcasts"
                           className="shrink-0 text-xs text-muted-foreground"
                         >
                           {t("Navigation.podcasts")}
                         </Link>
                       </nav>
           
                       <Link
                         href="/register"
                         className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90"
                       >
                         <Radio className="size-3.5" />
                         <span>{t("Navigation.registerRadio")}</span>
                       </Link>
                     </div>
                   </div>
                 </header>

            <section
                aria-labelledby="news-page-title"
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
                        id="news-page-title"
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
                            <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
                            {text.articlesLabel}
                        </span>
                        {articles.length > 0 && (
                            <span className="rounded-full bg-muted/80 px-3 py-2">
                                <span className="font-semibold text-foreground">{articles.length}</span>{" "}
                                {text.articlesCount}
                            </span>
                        )}
                    </div>
                </div>
            </section>

            {articles.length === 0 ? (
                <div className="mb-10 rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center sm:px-10">
                    <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Radio className="size-5" aria-hidden="true" />
                    </span>
                    <h2 className="text-lg font-semibold">{text.heading}</h2>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                        {text.empty}
                    </p>
                </div>
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
                            {articles.length} {text.articlesCount}
                        </span>
                    </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                    {articles.map((article) => {
                        const articleUrl =
                            `/${lang}/actualites/${article.radioSlug}/${article.slug}`;

                        const image = article.featuredImage
                            ? buildRadioMediaImageUrl(article.featuredImage)
                            : null;

                        return (
                            <Card
                                key={`${article.radioSlug}-${article.slug}`}
                                className="group h-full overflow-hidden rounded-2xl border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
                            >
                                {image ? (
                                    <Link
                                        href={articleUrl}
                                        aria-label={article.title}
                                    >
                                        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={image}
                                                alt={article.title}
                                                loading="lazy"
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        </div>
                                    </Link>
                                ) : (
                                    <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-gradient-to-br from-primary/15 via-muted to-amber-500/15">
                                        <div aria-hidden="true" className="absolute inset-0 opacity-30 [background-image:radial-gradient(hsl(var(--primary))_1px,transparent_1px)] [background-size:18px_18px]" />
                                        <span className="relative flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-background/80 text-primary shadow-sm">
                                            <Radio className="size-7" aria-hidden="true" />
                                        </span>
                                    </div>
                                )}

                                <CardContent className="flex h-full flex-col space-y-3 p-5 sm:p-6">
                                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                                        <Link
                                            href={`/${lang}/actualites/${article.radioSlug}`}
                                            className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary transition-colors hover:bg-primary/15"
                                        >
                                            {article.radioName}
                                        </Link>

                                        {article.publishedAt && (
                                            <>
                                                {" · "}
                                                {new Date(
                                                    article.publishedAt,
                                                ).toLocaleDateString(
                                                    lang === "fr" ? "fr-FR" : "en-US",
                                                )}
                                            </>
                                        )}
                                    </p>

                                    <h3 className="text-lg font-bold leading-snug tracking-tight sm:text-xl">
                                        <Link
                                            href={articleUrl}
                                            className="transition-colors group-hover:text-primary"
                                        >
                                            {article.title}
                                        </Link>
                                    </h3>

                                    {article.excerpt && (
                                        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                                            {article.excerpt}
                                        </p>
                                    )}

                                    <Link
                                        href={articleUrl}
                                        className="mt-auto inline-flex w-fit items-center gap-2 pt-1 text-sm font-semibold text-primary transition-all group-hover:gap-3"
                                    >
                                        {text.read} <span aria-hidden="true">→</span>
                                    </Link>
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
                            href={`/${lang}/actualites?page=${page - 1}`}
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

                    {page < pagination.totalPages && (
                        <Link
                            href={`/${lang}/actualites?page=${page + 1}`}
                            rel="next"
                            className="inline-flex min-h-10 items-center rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:border-primary/30 hover:bg-primary/5 sm:px-4"
                        >
                            {text.next} →
                        </Link>
                    )}
                </nav>
            )}
        </main>
    );
}
