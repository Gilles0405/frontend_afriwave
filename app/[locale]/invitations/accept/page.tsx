
import SiteHeader from "@/components/layout/site-header";
import AcceptInvitationForm from "@/components/Radio/AcceptInvitationForm";

type Locale = "fr" | "en";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string | string[] }>;
};

export default async function AcceptInvitationPage({
  params,
  searchParams,
}: PageProps) {
  const [{ locale: currentLocale }, query] = await Promise.all([
    params,
    searchParams,
  ]);

  const locale: Locale = currentLocale === "en" ? "en" : "fr";

  const token = Array.isArray(query.token)
    ? query.token[0]
    : query.token;

  return (
    <>
      <SiteHeader locale={locale} />

      <main className="min-h-[calc(100vh-4rem)] bg-background px-4 py-10 sm:py-14">
        <div className="mx-auto w-full max-w-xl">
          <AcceptInvitationForm
            locale={locale}
            token={token ?? ""}
          />
        </div>
      </main>
    </>
  );
}




