
import {
  FileText,
  MapPin,
  RadioTower,
  Signal,
} from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

import { redirect } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/server/auth";
import RadioOverviewStats from "@/components/Radio/RadioOverviewStats";


export default async function RadioDashboardPage() {
  const user = await getCurrentUser();
  const locale = await getLocale();
  const t = await getTranslations("RadioDashboard");

  if (!user) {
    redirect({ href: "/login", locale });
  }

  const memberships = user.radioUsers ?? [];

  // Sélectionner une radio active à laquelle l'utilisateur appartient.
  const membership = memberships.find(
    (item: (typeof memberships)[number]) => item.radio?.status === "ACTIVE",
  );

  const radio = membership?.radio;

  if (!radio) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <RadioTower className="mx-auto mb-4 h-12 w-12 text-primary" />

          <h1 className="text-xl font-bold">
            {t("noRadioTitle")}
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {t("noRadioDescription")}
          </p>
        </div>
      </section>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      {/* En-tête du dashboard */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="mb-2 text-sm font-medium text-primary">
              {t("welcome")}
            </p>

            <h1 className="break-words text-2xl font-bold tracking-tight sm:text-3xl">
              {radio.name}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              {t("description")}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {radio.city && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {radio.city}
                  {radio.country ? `, ${radio.country}` : ""}
                </span>
              )}

              {radio.frequency && (
                <span className="inline-flex items-center gap-1.5">
                  <Signal className="h-4 w-4" />
                  {radio.frequency}
                </span>
              )}
            </div>
          </div>

          <div className="flex h-16 w-16 shrink-0 items-center justify-center self-start rounded-2xl bg-primary/10 text-primary sm:h-20 sm:w-20">
            <RadioTower className="h-9 w-9 sm:h-11 sm:w-11" />
          </div>
        </div>
      </section>

      {/* Statistiques de cette radio */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">
            {t("statisticsTitle")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("statisticsDescription")}
          </p>
        </div>

        <RadioOverviewStats radioId={radio.id} />
      </section>

      {/* Informations complémentaires */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <FileText className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold">{t("contentTitle")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("contentDescription")}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <RadioTower className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold">{t("stationTitle")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("stationDescription")}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
