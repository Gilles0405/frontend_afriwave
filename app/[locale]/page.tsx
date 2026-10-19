
import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowRight,
  Headphones,
  LogIn,
  Mic2,
  Newspaper,
  Radio,
  Search,
  Waves,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/providers/theme-toggle";

type HomeProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: HomeProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "Metadata",
  });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      languages: {
        fr: "/fr",
        en: "/en",
      },
    },
  };
}



const featuredItems = [
  {
    key: "radio",
    icon: Radio,
    labelKey: "radioLabel",
    titleKey: "radioTitle",
    descriptionKey: "radioDescription",
    href: "/radios",
  },
  {
    key: "news",
    icon: Mic2,
    labelKey: "newsLabel",
    titleKey: "newsTitle",
    descriptionKey: "newsDescription",
    href: "/actualites",
  },
  {
    key: "shows",
    icon: Headphones,
    labelKey: "showsLabel",
    titleKey: "showsTitle",
    descriptionKey: "showsDescription",
    href: "/emissions",
  },
] as const;

export default async function Home({ params }: HomeProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      {/* Header */}

      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
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
              className="whitespace-nowrap text-sm font-semibold text-primary"
            >
              {t("Navigation.home")}
            </Link>
            <Link
              href="/actualites"
              className="whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-foreground"
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
                className="shrink-0 text-xs font-semibold text-primary"
              >
                {t("Navigation.home")}
              </Link>
              <Link
                href="/actualites"
                className="shrink-0 text-xs text-muted-foreground"
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


      {/* Hero */}

      <section className="relative isolate overflow-hidden">
        {/* Arrière-plan décoratif */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute -right-24 -top-16 size-56 rounded-full bg-primary/10 blur-3xl sm:-right-32 sm:-top-20 sm:size-[420px]" />
          <div className="absolute -left-24 top-40 size-52 rounded-full bg-secondary/20 blur-3xl sm:-left-40 sm:top-52 sm:size-[360px]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        </div>

        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-4 pb-12 pt-10 sm:gap-12 sm:px-6 sm:pb-20 sm:pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:px-8 lg:py-24 xl:py-28">
          {/* Contenu principal */}
          <div className="mx-auto w-full min-w-0 max-w-2xl lg:mx-0">
            <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-semibold leading-relaxed text-primary sm:mb-6 sm:px-4 sm:text-sm">
              <span className="relative flex size-2 shrink-0">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-50" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              <span>{t("Hero.eyebrow")}</span>
            </div>

            <h1 className="break-words text-3xl font-black leading-[1.12] tracking-tight [overflow-wrap:anywhere] min-[390px]:text-4xl sm:text-5xl sm:leading-[1.08] lg:text-6xl xl:text-7xl">
              {t("Hero.title")}
              <span className="mt-2 block text-primary">
                {t("Hero.highlight")}
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:mt-6 sm:text-base sm:leading-8 lg:text-lg">
              {t("Hero.description")}
            </p>

            {/* Recherche */}
            <form
              action={`/${locale}/recherche`}
              method="GET"
              role="search"
              className="mt-6 flex w-full min-w-0 flex-col gap-2 rounded-2xl border border-border bg-card p-2 shadow-lg shadow-black/[0.03] sm:mt-8 sm:flex-row sm:items-center sm:gap-3"
            >
              <label htmlFor="home-search" className="sr-only">
                {t("Hero.searchPlaceholder")}
              </label>

              <div className="flex min-h-12 min-w-0 flex-1 items-center gap-3 px-2 sm:px-3">
                <Search
                  aria-hidden="true"
                  className="size-5 shrink-0 text-muted-foreground"
                />
                <input
                  id="home-search"
                  type="search"
                  name="q"
                  placeholder={t("Hero.searchPlaceholder")}
                  className="h-12 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-sm placeholder:text-muted-foreground focus-visible:outline-none sm:text-sm"
                />
              </div>

              <button
                type="submit"
                className="inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:w-auto sm:px-6"
              >
                {t("Hero.searchButton")}
                <ArrowRight aria-hidden="true" className="size-4" />
              </button>
            </form>

            {/* Points forts */}
            <div className="mt-6 flex flex-col gap-3 text-sm text-muted-foreground min-[390px]:flex-row min-[390px]:flex-wrap min-[390px]:gap-x-5 sm:mt-8 sm:gap-x-6 sm:gap-y-3">
              <span className="inline-flex min-w-0 items-center gap-2">
                <Radio
                  aria-hidden="true"
                  className="size-4 shrink-0 text-primary"
                />
                <span>{t("Hero.trustRadios")}</span>
              </span>

              <span className="inline-flex min-w-0 items-center gap-2">
                <Headphones
                  aria-hidden="true"
                  className="size-4 shrink-0 text-primary"
                />
                <span>{t("Hero.trustAudio")}</span>
              </span>
            </div>
          </div>

          {/* Illustration AfriWave */}
          <div className="relative mx-auto w-full min-w-0 max-w-lg lg:mx-0 lg:justify-self-end">
            <div
              aria-hidden="true"
              className="absolute inset-6 rounded-full bg-primary/10 blur-3xl sm:inset-8"
            />

            <div className="relative min-w-0 rounded-3xl border border-border/80 bg-card/90 p-3 shadow-2xl shadow-black/5 backdrop-blur sm:rounded-[2rem] sm:p-6 md:p-7">
              {/* En-tête de la carte */}
              <div className="flex min-w-0 items-center justify-between gap-3 px-1 sm:px-0">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary sm:text-xs sm:tracking-[0.2em]">
                    AFRIWAVE
                  </p>
                  <h2 className="mt-1.5 break-words text-lg font-bold leading-snug sm:mt-2 sm:text-2xl">
                    {t("Hero.visualTitle")}
                  </h2>
                </div>

                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:size-12 sm:rounded-2xl">
                  <Radio aria-hidden="true" className="size-5 sm:size-6" />
                </div>
              </div>

              {/* Onde sonore décorative */}
              <div
                aria-hidden="true"
                className="my-5 flex h-24 items-center justify-center gap-1 overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5 px-3 min-[390px]:gap-1.5 sm:my-8 sm:h-32 sm:gap-1.5 sm:rounded-2xl sm:px-5"
              >
                {Array.from({ length: 35 }, (_, index) => (
                  <span
                    key={index}
                    className="w-1 min-[390px]:w-1.5 rounded-full bg-primary/80 sm:w-1.5"
                    style={{
                      height: `${18 + ((index * 37 + 19) % 76)}%`,
                    }}
                  />
                ))}
              </div>

              {/* Accès rapides */}
              <div className="space-y-2 sm:space-y-3">
                <Link
                  href="/radios"
                  className="group flex min-w-0 items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:gap-4 sm:rounded-2xl sm:p-4"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:size-11">
                    <Radio aria-hidden="true" className="size-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-semibold sm:text-base">
                      {t("Hero.visualRadio")}
                    </p>
                    <p className="mt-1 break-words text-xs leading-5 text-muted-foreground sm:text-sm">
                      {t("Hero.visualRadioDescription")}
                    </p>
                  </div>

                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1"
                  />
                </Link>

                <Link
                  href="/emissions"
                  className="group flex min-w-0 items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:gap-4 sm:rounded-2xl sm:p-4"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary/30 text-foreground sm:size-11">
                    <Headphones aria-hidden="true" className="size-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-semibold sm:text-base">
                      {t("Hero.visualShows")}
                    </p>
                    <p className="mt-1 break-words text-xs leading-5 text-muted-foreground sm:text-sm">
                      {t("Hero.visualShowsDescription")}
                    </p>
                  </div>

                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </div>

              <p className="mt-4 break-words px-1 text-center text-[11px] leading-5 text-muted-foreground sm:mt-5 sm:px-0 sm:text-xs">
                {t("Hero.visualFooter")}
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Categories */}
{/* <section className="border-y border-border/70 bg-muted/30 py-16 sm:py-20">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">
          {t("Categories.eyebrow")}
        </p>

        <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
          {t("Categories.title")}
        </h2>

        <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
          {t("Categories.description")}
        </p>
      </div>
    </div>

    {categories.length > 0 ? (
      <div className="mt-9 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/${locale}/radios/${radio.slug}/categories/${category.slug}`}
            className="group rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 sm:p-6"
          >
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Newspaper className="size-5" />
            </div>

            <h3 className="mt-5 font-bold">
              {category.name}
            </h3>

            {category.description && (
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                {category.description}
              </p>
            )}

            <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
              <span>{t("Categories.discover")}</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    ) : (
      <p className="mt-9 rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
        {t("Categories.empty")}
      </p>
    )}
  </div>
</section> */}


      {/* Featured sections */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">
                {t("Featured.eyebrow")}
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                {t("Featured.title")}
              </h2>
              <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
                {t("Featured.description")}
              </p>
            </div>
            <Link
              href="/actualites"
              className="inline-flex items-center gap-2 text-sm font-bold text-primary transition-opacity hover:opacity-75"
            >
              {t("Featured.explore")}
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {featuredItems.map(
              ({
                key,
                icon: Icon,
                labelKey,
                titleKey,
                descriptionKey,
                href,
              }) => (
                <article
                  key={key}
                  className="group flex h-full flex-col rounded-3xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 sm:p-7"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="size-6" />
                    </div>
                    <span className="rounded-full bg-secondary/30 px-3 py-1 text-xs font-semibold">
                      {t(`Featured.${labelKey}`)}
                    </span>
                  </div>

                  <h3 className="mt-6 text-xl font-bold">
                    {t(`Featured.${titleKey}`)}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-7 text-muted-foreground">
                    {t(`Featured.${descriptionKey}`)}
                  </p>

                  <Link
                    href={href}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary"
                  >
                    {t("Featured.learnMore")}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </article>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-primary px-6 py-12 text-primary-foreground sm:px-12 sm:py-16 lg:px-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-32 size-80 rounded-full border-[48px] border-white/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 right-1/3 size-64 rounded-full bg-white/10 blur-3xl"
          />

          <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/80">
                {t("CTA.eyebrow")}
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                {t("CTA.title")}
              </h2>
              <p className="mt-4 leading-7 text-white/85">
                {t("CTA.description")}
              </p>
            </div>

            <Link
              href="/radios"
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-primary transition-transform hover:scale-[1.02]"
            >
              {t("CTA.button")}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}

      <footer className="border-t border-border bg-muted/20">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:gap-10 sm:px-6 sm:py-12 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {/* Identité AfriWave */}
          <div className="min-w-0 md:col-span-2 lg:col-span-1">
            <Link href="/" aria-label="AfriWave — Accueil">
              <Image
                src="/WhatsApp_Image_2026-10-10_at_20.27.03-removebg-preview.png"
                alt="Logo AfriWave"
                width={140}
                height={48}
                className="h-10 w-auto object-contain"
              />
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">
              {t("Footer.description")}
            </p>

            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              {t("Footer.signature")}
            </p>
          </div>

          {/* Explorer */}
          <div className="min-w-0">
            <h2 className="font-bold">{t("Footer.explore")}</h2>

            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>
                <Link className="transition-colors hover:text-primary" href="/actualites">
                  {t("Navigation.news")}
                </Link>
              </li>
              <li>
                <Link className="transition-colors hover:text-primary" href="/radios">
                  {t("Navigation.radios")}
                </Link>
              </li>
              <li>
                <Link className="transition-colors hover:text-primary" href="/emissions">
                  {t("Navigation.shows")}
                </Link>
              </li>
              <li>
                <Link className="transition-colors hover:text-primary" href="/podcasts">
                  {t("Navigation.podcasts")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Plateforme */}
          <div className="min-w-0">
            <h2 className="font-bold">{t("Footer.platform")}</h2>

            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>
                <Link className="transition-colors hover:text-primary" href="/recherche">
                  {t("Navigation.search")}
                </Link>
              </li>
              <li>
                <Link className="transition-colors hover:text-primary" href="/radios">
                  {t("Footer.discoverRadios")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Espace utilisateur */}

          {/* Espace utilisateur */}
          <div className="min-w-0">
            <h2 className="font-bold">{t("Footer.accountTitle")}</h2>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {t("Footer.accountDescription")}
            </p>

            <div className="mt-5 flex flex-col gap-3 min-[380px]:flex-row min-[380px]:flex-wrap">
              <Link
                href="/login"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {t("Footer.login")}
              </Link>

              <Link
                href="/register"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {t("Footer.registerRadio")}
              </Link>
            </div>

            <div className="mt-6 border-l-2 border-primary/50 pl-3">
              <h3 className="text-sm font-semibold">
                {t("Footer.mottoTitle")}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {t("Footer.motto")}
              </p>
            </div>
          </div>

        </div>

        {/* Bas de page */}
        <div className="border-t border-border">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-5 text-xs leading-5 text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <p>
              © {new Date().getFullYear()} AfriWave. {t("Footer.rights")}
            </p>

            <p>{t("Footer.signature")}</p>
          </div>
        </div>
      </footer>

    </main>
  );
}
