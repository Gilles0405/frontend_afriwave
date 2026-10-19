
import { redirect } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/server/auth";
import RadioTeamManager from "@/components/Radio/RadioTeamManager";

export default async function RadioTeamPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect({ href: "/login", locale: "fr" });
  }

  const radioId = user.radioUsers?.[0]?.radioId;

  if (!radioId) {
    redirect({ href: "/dashboard-radio", locale: "fr" });
  }
  const roles: {
    id: number;
    name: string;
    description?: string | null;
  }[] = [];

  return (
    <main className="container mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <RadioTeamManager
        radioId={Number(radioId)}
        currentUserId={Number(user.id)}
      />
    </main>
  );
}
