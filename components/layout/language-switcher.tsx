
"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const nextLocale = locale === "fr" ? "en" : "fr";

  return (
    <button
      type="button"
      onClick={() => router.replace(pathname, { locale: nextLocale })}
      aria-label={
        locale === "fr" ? "Switch to English" : "Passer en français"
      }
      className="inline-flex h-10 items-center justify-center rounded-xl border border-border px-3 text-sm font-semibold transition-colors hover:bg-muted"
    >
      {locale === "fr" ? "EN" : "FR"}
    </button>
  );
}
