
import RadioCategoryManager from "@/components/Radio/RadioCategoryManager";
import { getCurrentUser } from "@/lib/server/auth";
import { redirect } from "@/i18n/navigation";

export default async function RadioCategoriesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect({ href: "/login", locale: "fr" });
  }

  const radioId = user.radioUsers?.[0]?.radioId;

  if (!radioId) {
    redirect({ href: "/dashboard-radio", locale: "fr" });
  }

  return <RadioCategoryManager radioId={Number(radioId)} />;
}
