
import Image from "next/image";
import { getTranslations } from "next-intl/server";

export default async function Loading() {
  const t = await getTranslations("LoadingScreen");

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-6 text-gray-900 transition-colors dark:bg-[#111827] dark:text-white">
      {/* Décoration */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#F47B16]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[#087C3C]/10 blur-3xl" />

      <section
        className="relative flex w-full max-w-sm flex-col items-center text-center"
        aria-live="polite"
        aria-busy="true"
      >
        {/* Logo animé */}
        <div className="relative mb-8 flex h-28 w-28 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full border border-[#F47B16]/20 [animation-duration:2.5s]" />
          <div className="absolute inset-2 rounded-full border-2 border-[#087C3C]/20" />

          <Image
            src="/WhatsApp_Image_2026-10-10_at_20.27.03-removebg-preview.png"
            alt={t("brand")}
            width={88}
            height={88}
            priority
            sizes="88px"
            className="relative z-10 h-20 w-20 object-contain"
          />
        </div>

        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#087C3C]">
          {t("brand")}
        </p>

        <h1 className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">
          {t("title")}
        </h1>

        <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
          {t("description")}
        </p>

        {/* Barre de chargement */}
        <div
          className="mt-8 h-1.5 w-56 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
          role="progressbar"
          aria-label={t("progressLabel")}
        >
          <div className="h-full w-1/3 animate-loading-bar rounded-full bg-gradient-to-r from-[#F47B16] to-[#087C3C]" />
        </div>

        <p className="mt-4 text-xs text-gray-400">
          {t("tagline")}
        </p>
      </section>
    </main>
  );
}
