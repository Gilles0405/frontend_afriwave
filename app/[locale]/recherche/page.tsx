
import { getLocale } from "next-intl/server";
import SiteHeader from "@/components/layout/site-header";
import PublicSearchPage from "@/components/public/PublicSearchPage";

type Locale = "fr" | "en";

export default async function RecherchePage() {
  const currentLocale = await getLocale();
  const locale: Locale = currentLocale === "en" ? "en" : "fr";

  return (
    <>
      <SiteHeader locale={locale} />
      <PublicSearchPage />
    </>
  );
}
