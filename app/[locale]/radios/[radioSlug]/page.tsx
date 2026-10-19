
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    ChevronRight,
    Globe,
    Headphones,
    Mail,
    MapPin,
    Newspaper,
    Phone,
    Podcast,
    RadioTower,
} from "lucide-react";

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
    }>;
};

type Radio = {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    logo?: string | null;
    logoUrl?: string | null;
    coverImage?: string | null;
    frequency?: string | null;
    city?: string | null;
    country?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    facebook?: string | null;
    instagram?: string | null;
    youtube?: string | null;
    twitter?: string | null;
    streamUrl?: string | null;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
};

type RadioCategory = {
    id: number;
    radioId: number;
    name: string;
    slug: string;
    description?: string | null;
};

type RadioApiResponse = {
    success: boolean;
    data: Radio;
};

type CategoriesApiResponse = {
    success: boolean;
    data: RadioCategory[];
    radio?: Radio;
};

type RadioPageData = {
    radio: Radio;
    categories: RadioCategory[];
};

const API_URL = (
    process.env.API_URL ?? "http://localhost:3001"
).replace(/\/$/, "");

function normalizeLocale(locale: string): Locale {
    return locale === "en" ? "en" : "fr";
}

async function fetchJson<T>(
    path: string,
): Promise<T | null> {
    try {
        const response = await fetch(`${API_URL}${path}`, {
            headers: { Accept: "application/json" },
            next: { revalidate: 60 },
        });

        if (!response.ok) {
            console.error(
                `API ${response.status}: ${path}`,
            );
            return null;
        }

        return (await response.json()) as T;
    } catch (error) {
        console.error(`Erreur API : ${path}`, error);
        return null;
    }
}

async function getRadioPageData(
    radioSlug: string,
): Promise<RadioPageData | null> {
    const categoriesPath =
        `/api/public/radios/${encodeURIComponent(radioSlug)}/categories`;

    const categoriesResult =
        await fetchJson<CategoriesApiResponse>(categoriesPath);

    // L'endpoint des catégories doit fournir l'identifiant de la radio.
    const radioId = categoriesResult?.radio?.id;

    if (!categoriesResult?.success || !radioId) {
        console.error(
            "La réponse catégories ne fournit pas radio.id.",
        );
        return null;
    }

    // Endpoint réel de détail radio : { success, data: Radio }.
    const radioResult = await fetchJson<RadioApiResponse>(
        `/api/radio/${radioId}`,
    );

    if (
        !radioResult?.success ||
        !radioResult.data ||
        radioResult.data.slug !== radioSlug
    ) {
        return null;
    }

    return {
        radio: radioResult.data,
        categories: Array.isArray(categoriesResult.data)
            ? categoriesResult.data
            : [],
    };
}

function getRadioLogo(radio: Radio): string | null {
    const source = radio.logoUrl ?? radio.logo;
    return source ? buildRadioMediaImageUrl(source) ?? null : null;
}

function getRadioCover(radio: Radio): string | null {
    return radio.coverImage
        ? buildRadioMediaImageUrl(radio.coverImage) ?? null
        : null;
}

function getSocialLinks(radio: Radio) {
    return [
        {
            label: "Facebook",
            url: radio.facebook,
            icon: Globe,
        },
        {
            label: "Instagram",
            url: radio.instagram,
            icon: Globe,
        },
        {
            label: "YouTube",
            url: radio.youtube,
            icon: Headphones,
        },
    ].filter((item) => Boolean(item.url));
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { locale, radioSlug } = await params;
    const lang = normalizeLocale(locale);
    const result = await getRadioPageData(radioSlug);

    if (!result) {
        return {
            title:
                lang === "fr"
                    ? "Radio introuvable | AfriWave"
                    : "Radio not found | AfriWave",
            robots: { index: false, follow: false },
        };
    }

    const { radio } = result;
    const title = `${radio.name} | AfriWave`;
    const description =
        radio.description?.trim() ||
        (lang === "fr"
            ? `Découvrez les actualités, émissions et podcasts de ${radio.name} sur AfriWave.`
            : `Discover news, shows and podcasts from ${radio.name} on AfriWave.`);

    const canonical = absoluteUrl(
        `/${lang}/radios/${radio.slug}`,
    );
    const logo = getRadioLogo(radio);
    const cover = getRadioCover(radio);
    const image = cover ?? logo;

    return {
        title,
        description,
        alternates: {
            canonical,
            languages: {
                fr: absoluteUrl(`/fr/radios/${radio.slug}`),
                en: absoluteUrl(`/en/radios/${radio.slug}`),
            },
        },
        openGraph: {
            type: "website",
            siteName: "AfriWave",
            title,
            description,
            url: canonical,
            locale: lang === "fr" ? "fr_FR" : "en_US",
            ...(image
                ? { images: [{ url: image, alt: radio.name }] }
                : {}),
        },
        twitter: {
            card: image ? "summary_large_image" : "summary",
            title,
            description,
            ...(image ? { images: [image] } : {}),
        },
        robots: { index: true, follow: true },
    };
}

export default async function RadioDetailPage({
    params,
}: PageProps) {
    const { locale, radioSlug } = await params;

    if (locale !== "fr" && locale !== "en") {
        notFound();
    }

    const lang = locale;
    const [t, nav, result] = await Promise.all([
        getTranslations({
            locale: lang,
            namespace: "RadioDetail",
        }),
        getTranslations({
            locale: lang,
            namespace: "Navigation",
        }),
        getRadioPageData(radioSlug),
    ]);

    if (!result || result.radio.status !== "ACTIVE") {
        notFound();
    }

    const { radio, categories } = result;
    const logo = getRadioLogo(radio);
    const cover = getRadioCover(radio);
    const socialLinks = getSocialLinks(radio);

    const description =
        radio.description?.trim() || t("noDescription");

    return (
        <main className="min-h-screen bg-background text-foreground">
            {/* Navigation globale */}
            <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
                    <Link
                        href={`/${lang}`}
                        className="shrink-0 font-bold tracking-tight"
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
                            {nav("home")}
                        </Link>
                        <Link href={`/${lang}/actualites`} className="text-muted-foreground hover:text-primary">
                            {nav("news")}
                        </Link>
                        <Link href={`/${lang}/radios`} className="text-primary" aria-current="page">
                            {nav("radios")}
                        </Link>
                        <Link href={`/${lang}/emissions`} className="text-muted-foreground hover:text-primary">
                            {nav("shows")}
                        </Link>
                        <Link href={`/${lang}/podcasts`} className="text-muted-foreground hover:text-primary">
                            {nav("podcasts")}
                        </Link>
                    </nav>

                    <div className="flex items-center gap-2">
                        <LanguageSwitcher />
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            {/* Hero radio */}
            <section className="relative isolate overflow-hidden border-b border-border">
                {cover && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={cover}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 -z-20 h-full w-full object-cover opacity-20"
                    />
                )}

                <div
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/15 via-background/95 to-background"
                />
                <div
                    aria-hidden="true"
                    className="absolute -right-20 -top-24 -z-10 size-80 rounded-full bg-primary/10 blur-3xl"
                />

                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
                    <nav
                        aria-label={lang === "fr" ? "Fil d'Ariane" : "Breadcrumb"}
                        className="mb-8 flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
                    >
                        <Link href={`/${lang}`} className="hover:text-primary">
                            {nav("home")}
                        </Link>
                        <ChevronRight className="size-4" />
                        <Link href={`/${lang}/radios`} className="hover:text-primary">
                            {nav("radios")}
                        </Link>
                        <ChevronRight className="size-4" />
                        <span className="max-w-[240px] truncate font-medium text-foreground">
                            {radio.name}
                        </span>
                    </nav>

                    <div className="flex flex-col gap-7 md:flex-row md:items-center md:gap-10">
                        <div className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-card shadow-lg sm:size-36">
                            {logo ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={logo}
                                    alt={t("logoAlt", { name: radio.name })}
                                    className="size-full object-contain p-3"
                                />
                            ) : (
                                <RadioTower className="size-14 text-primary" />
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                                <RadioTower className="size-4" />
                                {t("radioLabel")}
                            </div>

                            <h1 className="max-w-4xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                                {radio.name}
                            </h1>

                            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                                {description}
                            </p>

                            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                {radio.frequency && (
                                    <span className="rounded-full border border-border bg-background/80 px-3 py-1.5 font-semibold text-foreground">
                                        {radio.frequency}
                                    </span>
                                )}

                                {(radio.city || radio.country) && (
                                    <span className="inline-flex items-center gap-2">
                                        <MapPin className="size-4 text-primary" />
                                        {[radio.city, radio.country].filter(Boolean).join(", ")}
                                    </span>
                                )}
                            </div>

                            <div className="mt-6 flex flex-wrap gap-3">
                                {radio.streamUrl && (
                                    <a
                                        href={radio.streamUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                                    >
                                        <Headphones className="size-4" />
                                        {lang === "fr" ? "Écouter en direct" : "Listen live"}
                                        <ArrowRight className="size-4" />
                                    </a>
                                )}

                                {radio.website && (
                                    <a
                                        href={radio.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-5 py-3 text-sm font-semibold transition-colors hover:bg-muted"
                                    >
                                        <Globe className="size-4" />
                                        {lang === "fr" ? "Site officiel" : "Official website"}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contenu principal + aside */}
            <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-8">
                <div className="min-w-0 space-y-14">
                    {/* Catégories */}
                    <section id="categories-heading" className="scroll-mt-28">
                        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                                    {t("categoriesEyebrow")}
                                </p>
                                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                    {t("categoriesTitle")}
                                </h2>
                                <p className="mt-2 max-w-2xl text-muted-foreground">
                                    {t("categoriesDescription", { name: radio.name })}
                                </p>
                            </div>

                            <span className="text-sm text-muted-foreground">
                                {t("categoryCount", { count: categories.length })}
                            </span>
                        </div>

                        {categories.length > 0 ? (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {categories.map((category) => (
                                    <Link
                                        key={category.id}
                                        href={`/${lang}/radios/${radio.slug}/categories/${category.slug}`}
                                        className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        <Card className="h-full border-border/70 transition-all duration-200 group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-md">
                                            <CardContent className="flex h-full items-start gap-4 p-5">
                                                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                                    <Newspaper className="size-5" />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-semibold">{category.name}</h3>
                                                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                                                        {category.description || t("categoryFallback")}
                                                    </p>
                                                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                                                        {t("exploreCategory")}
                                                        <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <Card className="border-dashed shadow-none">
                                <CardContent className="flex flex-col items-center px-6 py-12 text-center">
                                    <Newspaper className="mb-4 size-8 text-muted-foreground" />
                                    <h3 className="font-semibold">{t("emptyCategoriesTitle")}</h3>
                                    <p className="mt-2 max-w-md text-sm text-muted-foreground">
                                        {t("emptyCategoriesDescription")}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </section>

                    {/* Actualités */}
                    <section className="overflow-hidden rounded-2xl border bg-muted/20 p-6 sm:p-8">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <CalendarDays className="size-6" />
                            </div>
                            <div className="flex-1">
                                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">
                                    {t("newsEyebrow")}
                                </p>
                                <h2 className="text-xl font-bold sm:text-2xl">{t("newsTitle")}</h2>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    {t("newsDescription", { name: radio.name })}
                                </p>
                            </div>
                            <Link
                                href={`/${lang}/actualites/${radio.slug}`}
                                className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-primary hover:underline"
                            >
                                {lang === "fr" ? "Voir les actualités" : "View news"}
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>
                    </section>

                    {/* Podcasts */}
                    <section className="overflow-hidden rounded-2xl border p-6 sm:p-8">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Podcast className="size-6" />
                            </div>
                            <div className="flex-1">
                                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">
                                    {t("podcastsEyebrow")}
                                </p>
                                <h2 className="text-xl font-bold sm:text-2xl">
                                    {t("podcastsTitle")}
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    {t("podcastsDescription", { name: radio.name })}
                                </p>
                            </div>
                            <Link
                                href={`/${lang}/podcasts/${radio.slug}`}
                                className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-primary hover:underline"
                            >
                                {lang === "fr" ? "Voir les podcasts" : "View podcasts"}
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>
                    </section>

                    {/* Émissions */}
                    <section className="overflow-hidden rounded-2xl border bg-muted/20 p-6 sm:p-8">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <RadioTower className="size-6" />
                            </div>
                            <div className="flex-1">
                                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">
                                    {lang === "fr" ? "Programmes" : "Programming"}
                                </p>
                                <h2 className="text-xl font-bold sm:text-2xl">
                                    {lang === "fr" ? "Émissions de la radio" : "Radio shows"}
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    {lang === "fr"
                                        ? `Retrouvez les émissions proposées par ${radio.name}.`
                                        : `Discover shows from ${radio.name}.`}
                                </p>
                            </div>
                            <Link
                                href={`/${lang}/emissions`}
                                className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-primary hover:underline"
                            >
                                {lang === "fr" ? "Découvrir les émissions" : "Discover shows"}
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>
                    </section>

                    {/* Coordonnées */}
                    {(radio.address || radio.phone || radio.email || socialLinks.length > 0) && (
                        <section className="border-t border-border pt-8">
                            <h2 className="mb-5 text-xl font-bold">
                                {lang === "fr" ? "Contacter la radio" : "Contact the radio"}
                            </h2>

                            <div className="grid gap-4 sm:grid-cols-2">
                                {radio.address && (
                                    <div className="flex items-start gap-3 text-sm">
                                        <MapPin className="mt-0.5 size-5 shrink-0 text-primary" />
                                        <div>
                                            <p className="font-semibold">
                                                {lang === "fr" ? "Adresse" : "Address"}
                                            </p>
                                            <p className="mt-1 text-muted-foreground">{radio.address}</p>
                                        </div>
                                    </div>
                                )}

                                {radio.phone && (
                                    <div className="flex items-start gap-3 text-sm">
                                        <Phone className="mt-0.5 size-5 shrink-0 text-primary" />
                                        <div>
                                            <p className="font-semibold">
                                                {lang === "fr" ? "Téléphone" : "Phone"}
                                            </p>
                                            <a href={`tel:${radio.phone}`} className="mt-1 text-muted-foreground hover:text-primary">
                                                {radio.phone}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {radio.email && (
                                    <div className="flex items-start gap-3 text-sm">
                                        <Mail className="mt-0.5 size-5 shrink-0 text-primary" />
                                        <div>
                                            <p className="font-semibold">Email</p>
                                            <a href={`mailto:${radio.email}`} className="mt-1 break-all text-muted-foreground hover:text-primary">
                                                {radio.email}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {socialLinks.map((social) => {
                                    const Icon = social.icon;

                                    return (
                                        <Link
                                            key={social.label}
                                            href={social.url!}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={social.label}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    <div className="border-t border-border pt-6">
                        <Link
                            href={`/${lang}/radios`}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                        >
                            <ArrowLeft className="size-4" />
                            {t("backToRadios")}
                        </Link>
                    </div>
                </div>

                {/* Aside : navigation vers les catégories */}
                <aside className="h-fit rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-24">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                        {lang === "fr" ? "Explorer" : "Explore"}
                    </p>
                    <h2 className="mt-2 text-lg font-bold">
                        {lang === "fr" ? "Rubriques de la radio" : "Radio categories"}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {lang === "fr"
                            ? `Explorez les contenus de ${radio.name} par rubrique.`
                            : `Explore ${radio.name}'s content by category.`}
                    </p>

                    <Link
                        href={`/${lang}/radios/${radio.slug}#categories-heading`}
                        className="mt-5 flex items-center justify-between gap-2 rounded-lg bg-primary/10 px-3 py-3 text-sm font-semibold text-primary hover:bg-primary/15"
                    >
                        {lang === "fr" ? "Toutes les rubriques" : "All categories"}
                        <ArrowRight className="size-4 shrink-0" />
                    </Link>

                    <div className="my-4 border-t border-border" />

                    {categories.length > 0 ? (
                        <nav
                            aria-label={lang === "fr" ? "Catégories de la radio" : "Radio categories"}
                            className="space-y-1"
                        >
                            {categories.map((category) => (
                                <Link
                                    key={category.id}
                                    href={`/${lang}/radios/${radio.slug}/categories/${category.slug}`}
                                    className="group flex items-center justify-between gap-3 rounded-lg px-3 py-3 text-sm transition-colors hover:bg-muted"
                                >
                                    <span className="min-w-0 truncate font-medium">
                                        {category.name}
                                    </span>
                                    <ChevronRight className="size-4 shrink-0 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary" />
                                </Link>
                            ))}
                        </nav>
                    ) : (
                        <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                            {lang === "fr"
                                ? "Aucune rubrique disponible."
                                : "No categories available."}
                        </p>
                    )}

                    <div className="my-4 border-t border-border" />

                    <Link
                        href={`/${lang}/radios`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
                    >
                        <ArrowLeft className="size-4" />
                        {t("backToRadios")}
                    </Link>
                </aside>
            </div>

            <footer className="border-t border-border bg-muted/20">
                <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-7 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                    <Link href={`/${lang}`} className="font-semibold text-foreground hover:text-primary">
                        AfriWave
                    </Link>
                    <p>{t("footerTagline")}</p>
                    <Link
                        href={`/${lang}/radios`}
                        className="inline-flex items-center gap-2 font-medium hover:text-primary"
                    >
                        {t("discoverRadios")}
                        <ArrowRight className="size-4" />
                    </Link>
                </div>
            </footer>
        </main>
    );
}
