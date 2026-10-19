
import { redirect } from "@/i18n/navigation";
import RadioArticles from "@/components/Radio/RadioArticles";
import { getCurrentUser } from "@/lib/server/auth";

export default async function ArticlesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect({ href: "/login", locale: "fr" });
  }

  const radioId = user.radioUsers?.[0]?.radioId;

  if (!radioId) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-semibold">
          Aucune radio associée
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tu dois être associé à une radio pour gérer ses articles.
        </p>
      </main>
    );
  }

  return <RadioArticles radioId={Number(radioId)} />;
}
