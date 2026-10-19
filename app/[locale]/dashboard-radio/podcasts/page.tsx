
import RadioPodcastManager from "@/components/Radio/RadioPodcastManager";
import { getCurrentUser } from "@/lib/server/auth";
import { redirect } from "@/i18n/navigation";

export default async function RadioPodcastsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect({ href: "/login", locale: "fr" });
  }

  const radioId = user.radioUsers?.[0]?.radioId;

  if (!radioId) {
    redirect({ href: "/dashboard-radio", locale: "fr" });
  }

  return <RadioPodcastManager radioId={Number(radioId)} />;
}
