
import { redirect } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/server/auth";
import MediaDashboard from "@/components/Radio/media/MediaDashboard";

export default async function RadioMediaPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect({ href: "/login", locale: "fr" });
  }

  const radioId = user.radioUsers?.[0]?.radioId;

  if (!radioId) {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold">
          Aucun espace radio associé à votre compte
        </h1>
        <p className="mt-2 text-muted-foreground">
          Contactez l'administrateur pour vérifier l'accès à votre radio.
        </p>
      </main>
    );
  }

  return <MediaDashboard radioId={radioId} />;
}
