"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Radio,
  FileText,
  CheckCircle2,
  Archive,
  Clock3,
  FilePenLine,
  ShieldCheck,
  Image as ImageIcon,
  MessageCircle,
  Video,
  Wallet,
  Euro,
  RefreshCw,
  Activity,
} from "lucide-react";

import StatCard from "@/components/admin/StatCard";

type ContentStatus = {
  total: number;
  published: number;
  drafts: number;
  pendingReview: number;
  archived: number;
};

type MonthlyHistory = {
  month: string;
  total: number;
  whatsappText: number;
  whatsappImage: number;
  otherText: number;
  otherImage: number;
  uncovAiVideoRequests: number;
  uncovAiVideoCostCents: number;
  uncovAiVideoCostEur: number;
};

type VideoService = {
  available: boolean;
  error: string | null;
  account: {
    balanceCents: number;
    balanceEur: number;
    totalToppedUpCents: number;
    totalToppedUpEur: number;
    totalSpentCents: number;
    totalSpentEur: number;
    totalRequests: number;
  } | null;
  pricing: Record<
    string,
    {
      costCents: number;
      costEur: number;
    }
  >;
  usage: {
    byEndpoint: Record<
      string,
      {
        requests: number;
        totalCostCents: number;
        totalCostEur: number;
        lastUsedAt?: string;
      }
    >;
    video: {
      requests: number;
      totalCostCents: number;
      totalCostEur: number;
    };
    returnedRecords: number;
  };
  monthlyUsage: {
    month: string;
    requests: number;
    totalCostCents: number;
    totalCostEur: number;
  }[];
  payments: {
    amountCents: number;
    amountEur: number;
    status: string;
    date: string;
  }[];
  generatedAt: string;
};

type Overview = {
  totals: {
    radios: number;
    content: number;
    published: number;
    drafts: number;
    pendingReview: number;
    archived: number;
  };
  content: {
    articles: ContentStatus;
    shows: ContentStatus;
    podcasts: ContentStatus;
  };
  myDataCheck: {
    totals: {
      verifications: number;
      whatsappText: number;
      whatsappImage: number;
      whatsapp: number;
      otherText: number;
      otherImage: number;
      images: number;
      lastSevenDays: number;
    };
    currentMonth: {
      month: string;
      total: number;
      whatsappText: number;
      whatsappImage: number;
      whatsapp: number;
      otherText: number;
      otherImage: number;
    };
    monthlyHistory: MonthlyHistory[];
    generatedAt: string;
    videoService: VideoService;
  };
  generatedAt: string;
};

type OverviewResponse = {
  success: boolean;
  message?: string;
  data?: Overview;
};

function formatNumber(value: number | undefined) {
  return new Intl.NumberFormat("fr-FR").format(value ?? 0);
}

function formatEuro(value: number | undefined) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(value ?? 0);
}

function formatMonth(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);

  if (!year || !monthNumber) return month;

  return new Intl.DateTimeFormat("fr-FR", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, monthNumber - 1, 1)));
}

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function AdminOverviewStats() {
  const t = useTranslations("AdminDashboard");

  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const response = await fetch("/api/analytics/admin/overview", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      const contentType = response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error(
          `Réponse non JSON du proxy (HTTP ${response.status})`
        );
      }

      const result: OverviewResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP ${response.status}`);
      }

      if (!result.success || !result.data?.totals) {
        throw new Error("Réponse analytics invalide");
      }

      setOverview(result.data);
    } catch (err) {
      console.error("Erreur des statistiques admin :", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const stats = [
    {
      key: "radios",
      value: overview?.totals.radios,
      icon: Radio,
      accent: "green" as const,
    },
    {
      key: "content",
      value: overview?.totals.content,
      icon: FileText,
      accent: "orange" as const,
    },
    {
      key: "published",
      value: overview?.totals.published,
      icon: CheckCircle2,
      accent: "blue" as const,
    },
    {
      key: "pendingReview",
      value: overview?.totals.pendingReview,
      icon: Clock3,
      accent: "amber" as const,
    },
    {
      key: "drafts",
      value: overview?.totals.drafts,
      icon: FilePenLine,
      accent: "purple" as const,
    },
    {
      key: "archived",
      value: overview?.totals.archived,
      icon: Archive,
      accent: "orange" as const,
    },
  ];

  const myDataCheck = overview?.myDataCheck;
  const videoService = myDataCheck?.videoService;
  const account = videoService?.account;
  const currentMonth = myDataCheck?.currentMonth;

  const monthlyHistory = myDataCheck?.monthlyHistory ?? [];
  const monthlyUsage = videoService?.monthlyUsage ?? [];

  return (
    <section className="space-y-8">
      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-600 dark:text-red-400"
        >
          <span>{t("analyticsError")}</span>

          <button
            type="button"
            onClick={() => void loadOverview()}
            className="font-semibold underline underline-offset-4"
          >
            {t("retry")}
          </button>
        </div>
      )}

      {/* Statistiques globales AfriWave */}
      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Vue d’ensemble
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Radios et contenus de la plateforme.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadOverview()}
            disabled={loading}
            aria-label="Actualiser les statistiques"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border transition hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map(({ key, value, icon, accent }) => (
            <StatCard
              key={key}
              title={t(`analytics.${key}`)}
              value={loading ? "—" : (value ?? "—")}
              description={
                loading ? t("loadingStats") : t("analyticsDescription")
              }
              icon={icon}
              accent={accent}
            />
          ))}
        </div>
      </div>

      {/* Répartition des contenus */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Répartition des contenus
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Détail des articles, émissions et podcasts.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {(
            [
              ["Articles", "articles", FileText],
              ["Émissions", "shows", Activity],
              ["Podcasts", "podcasts", MessageCircle],
            ] as const
          ).map(([label, key, Icon]) => {
            const item = overview?.content[key];

            return (
              <div
                key={key}
                className="rounded-2xl border bg-card p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    {label}
                  </span>
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>

                <p className="mt-3 text-3xl font-bold tabular-nums">
                  {loading ? "—" : formatNumber(item?.total)}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Publiés</p>
                    <p className="mt-1 font-semibold text-emerald-600">
                      {loading ? "—" : formatNumber(item?.published)}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Brouillons</p>
                    <p className="mt-1 font-semibold">
                      {loading ? "—" : formatNumber(item?.drafts)}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">En révision</p>
                    <p className="mt-1 font-semibold text-amber-600">
                      {loading ? "—" : formatNumber(item?.pendingReview)}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Archivés</p>
                    <p className="mt-1 font-semibold">
                      {loading ? "—" : formatNumber(item?.archived)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Statistiques MyDataCheck */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold tracking-tight">
              MyDataCheck
            </h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Vérifications effectuées et consommation du service UncovAI.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Vérifications totales"
            value={
              loading
                ? "—"
                : formatNumber(myDataCheck?.totals.verifications)
            }
            description="Toutes les vérifications MyDataCheck."
            icon={ShieldCheck}
            accent="green"
          />

          <StatCard
            title="Vérifications WhatsApp"
            value={
              loading ? "—" : formatNumber(myDataCheck?.totals.whatsapp)
            }
            description="Textes et images via WhatsApp."
            icon={MessageCircle}
            accent="blue"
          />

          <StatCard
            title="Vérifications d’images"
            value={
              loading ? "—" : formatNumber(myDataCheck?.totals.images)
            }
            description="Images soumises à vérification."
            icon={ImageIcon}
            accent="purple"
          />

          <StatCard
            title="7 derniers jours"
            value={
              loading
                ? "—"
                : formatNumber(myDataCheck?.totals.lastSevenDays)
            }
            description="Activité récente enregistrée."
            icon={Activity}
            accent="orange"
          />
        </div>

        {/* Répartition par canal */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <h3 className="font-semibold">Canaux de vérification</h3>

            <div className="mt-5 space-y-4">
              {[
                {
                  label: "Textes via WhatsApp",
                  value: myDataCheck?.totals.whatsappText,
                },
                {
                  label: "Images via WhatsApp",
                  value: myDataCheck?.totals.whatsappImage,
                },
                {
                  label: "Textes hors WhatsApp",
                  value: myDataCheck?.totals.otherText,
                },
                {
                  label: "Images hors WhatsApp",
                  value: myDataCheck?.totals.otherImage,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <span className="text-muted-foreground">
                    {item.label}
                  </span>
                  <span className="font-semibold tabular-nums">
                    {loading ? "—" : formatNumber(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <h3 className="font-semibold">Mois en cours</h3>

            <p className="mt-1 text-sm text-muted-foreground">
              {currentMonth?.month
                ? formatMonth(currentMonth.month)
                : "Période courante"}
            </p>

            <p className="mt-4 text-3xl font-bold tabular-nums">
              {loading ? "—" : formatNumber(currentMonth?.total)}
            </p>

            <p className="text-sm text-muted-foreground">
              Vérifications enregistrées
            </p>

            <div className="mt-5 grid grid-cols-2 gap-4 border-t pt-4 text-sm">
              <div>
                <p className="text-muted-foreground">WhatsApp</p>
                <p className="mt-1 font-semibold">
                  {loading ? "—" : formatNumber(currentMonth?.whatsapp)}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground">Hors WhatsApp</p>
                <p className="mt-1 font-semibold">
                  {loading
                    ? "—"
                    : formatNumber(
                        (currentMonth?.otherText ?? 0) +
                          (currentMonth?.otherImage ?? 0)
                      )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compte et consommation UncovAI */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold tracking-tight">
              Service UncovAI
            </h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Solde du compte, coûts cumulés et volume de requêtes API.
          </p>
        </div>

        {!loading && videoService && !videoService.available && (
          <div
            role="status"
            className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-400"
          >
            Service UncovAI indisponible
            {videoService.error ? ` : ${videoService.error}` : "."}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Solde disponible"
            value={loading ? "—" : formatEuro(account?.balanceEur)}
            description="Crédit actuellement disponible."
            icon={Wallet}
            accent="green"
          />

          <StatCard
            title="Montant consommé"
            value={loading ? "—" : formatEuro(account?.totalSpentEur)}
            description="Dépenses cumulées du compte."
            icon={Euro}
            accent="orange"
          />

          <StatCard
            title="Total rechargé"
            value={loading ? "—" : formatEuro(account?.totalToppedUpEur)}
            description="Crédits ajoutés au compte."
            icon={RefreshCw}
            accent="blue"
          />

          <StatCard
            title="Requêtes API"
            value={
              loading ? "—" : formatNumber(account?.totalRequests)
            }
            description="Nombre total de requêtes retournées."
            icon={Activity}
            accent="purple"
          />
        </div>

        {/* Tarification */}
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <h3 className="font-semibold">Tarification par endpoint</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Coût unitaire communiqué par l’API UncovAI.
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-3 pr-4 font-medium">Endpoint</th>
                  <th className="py-3 text-right font-medium">
                    Coût par requête
                  </th>
                </tr>
              </thead>

              <tbody>
                {Object.entries(videoService?.pricing ?? {}).map(
                  ([endpoint, pricing]) => (
                    <tr key={endpoint} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-mono text-xs sm:text-sm">
                        {endpoint}
                      </td>
                      <td className="py-3 text-right font-semibold tabular-nums">
                        {formatEuro(pricing.costEur)}
                      </td>
                    </tr>
                  )
                )}

                {!loading &&
                  Object.keys(videoService?.pricing ?? {}).length === 0 && (
                    <tr>
                      <td
                        colSpan={2}
                        className="py-4 text-center text-muted-foreground"
                      >
                        Aucune tarification disponible.
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Utilisation par endpoint */}
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <h3 className="font-semibold">Consommation par endpoint</h3>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-3 pr-4 font-medium">Endpoint</th>
                  <th className="py-3 pr-4 text-right font-medium">
                    Requêtes
                  </th>
                  <th className="py-3 pr-4 text-right font-medium">Coût</th>
                  <th className="py-3 text-right font-medium">
                    Dernière utilisation
                  </th>
                </tr>
              </thead>

              <tbody>
                {Object.entries(videoService?.usage.byEndpoint ?? {}).map(
                  ([endpoint, usage]) => (
                    <tr key={endpoint} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-mono text-xs">
                        {endpoint}
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums">
                        {formatNumber(usage.requests)}
                      </td>
                      <td className="py-3 pr-4 text-right font-semibold tabular-nums">
                        {formatEuro(usage.totalCostEur)}
                      </td>
                      <td className="py-3 text-right text-muted-foreground">
                        {formatDate(usage.lastUsedAt)}
                      </td>
                    </tr>
                  )
                )}

                {!loading &&
                  Object.keys(videoService?.usage.byEndpoint ?? {}).length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-4 text-center text-muted-foreground"
                      >
                        Aucune consommation détaillée disponible.
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Historique mensuel MyDataCheck et UncovAI */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Historique mensuel
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Vérifications MyDataCheck et coûts des requêtes vidéo UncovAI.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Video className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Consommation mensuelle</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-3 pr-4 font-medium">Mois</th>
                  <th className="py-3 pr-4 text-right font-medium">
                    Vérifications
                  </th>
                  <th className="py-3 pr-4 text-right font-medium">
                    Requêtes vidéo
                  </th>
                  <th className="py-3 text-right font-medium">
                    Coût vidéo
                  </th>
                </tr>
              </thead>

              <tbody>
                {monthlyHistory.map((month) => {
                  const usage = monthlyUsage.find(
                    (item) => item.month === month.month
                  );

                  return (
                    <tr key={month.month} className="border-b last:border-0">
                      <td className="py-3 pr-4 capitalize">
                        {formatMonth(month.month)}
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums">
                        {formatNumber(month.total)}
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums">
                        {formatNumber(
                          usage?.requests ?? month.uncovAiVideoRequests
                        )}
                      </td>
                      <td className="py-3 text-right font-semibold tabular-nums">
                        {formatEuro(
                          usage?.totalCostEur ??
                            month.uncovAiVideoCostEur
                        )}
                      </td>
                    </tr>
                  );
                })}

                {!loading && monthlyHistory.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-5 text-center text-muted-foreground"
                    >
                      Aucun historique mensuel disponible.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Historique des paiements */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <h3 className="font-semibold">Derniers rechargements</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Paiements retournés par le service UncovAI.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-3 pr-4 font-medium">Date</th>
                <th className="py-3 pr-4 text-right font-medium">Montant</th>
                <th className="py-3 text-right font-medium">Statut</th>
              </tr>
            </thead>

            <tbody>
              {(videoService?.payments ?? []).map((payment, index) => (
                <tr
                  key={`${payment.date}-${index}`}
                  className="border-b last:border-0"
                >
                  <td className="py-3 pr-4">{formatDate(payment.date)}</td>
                  <td className="py-3 pr-4 text-right font-semibold tabular-nums">
                    {formatEuro(payment.amountEur)}
                  </td>
                  <td className="py-3 text-right">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        payment.status.toLowerCase() === "completed"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}

              {!loading &&
                (videoService?.payments ?? []).length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-5 text-center text-muted-foreground"
                    >
                      Aucun paiement disponible.
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>

      {overview?.generatedAt && (
        <p className="text-right text-xs text-muted-foreground">
          Statistiques actualisées le {formatDate(overview.generatedAt)}
        </p>
      )}
    </section>
  );
}
