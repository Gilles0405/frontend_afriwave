
"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  FileText,
  CheckCircle2,
  Clock3,
  FilePenLine,
  Archive,
} from "lucide-react";

import StatCard from "@/components/admin/StatCard";

type Overview = {
  radioId: number;
  totals: {
    content: number;
    published: number;
    drafts: number;
    pendingReview: number;
    archived: number;
  };
  content: {
    articles: {
      total: number;
      published: number;
      drafts: number;
      pendingReview: number;
      archived: number;
    };
    shows: {
      total: number;
      published: number;
      drafts: number;
      pendingReview: number;
      archived: number;
    };
    podcasts: {
      total: number;
      published: number;
      drafts: number;
      pendingReview: number;
      archived: number;
    };
  };
};

type OverviewResponse = {
  success: boolean;
  message?: string;
  data?: Overview;
};

export default function RadioOverviewStats({
  radioId,
}: {
  radioId: number | string;
}) {
  const t = useTranslations("RadioDashboard");

  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const response = await fetch(
        `/api/analytics/${encodeURIComponent(String(radioId))}/overview`,
        {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
          headers: { Accept: "application/json" },
        },
      );

      const contentType = response.headers.get("content-type") ?? "";

      if (!contentType.includes("application/json")) {
        throw new Error(`Réponse non JSON (HTTP ${response.status})`);
      }

      const result: OverviewResponse = await response.json();

      if (!response.ok || !result.success || !result.data?.totals) {
        throw new Error(
          result.message || `Impossible de charger les statistiques (${response.status})`,
        );
      }

      if (String(result.data.radioId) !== String(radioId)) {
        throw new Error("Les statistiques reçues ne correspondent pas à cette radio.");
      }

      setOverview(result.data);
    } catch (err) {
      console.error("Erreur des statistiques radio :", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [radioId]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const stats = [
    {
      key: "content",
      value: overview?.totals.content,
      icon: FileText,
      accent: "green" as const,
    },
    {
      key: "published",
      value: overview?.totals.published,
      icon: CheckCircle2,
      accent: "blue" as const,
    },
    {
      key: "drafts",
      value: overview?.totals.drafts,
      icon: FilePenLine,
      accent: "purple" as const,
    },
    {
      key: "pendingReview",
      value: overview?.totals.pendingReview,
      icon: Clock3,
      accent: "amber" as const,
    },
    {
      key: "archived",
      value: overview?.totals.archived,
      icon: Archive,
      accent: "orange" as const,
    },
  ];

  return (
    <div>
      {error && (
        <div
          role="alert"
          className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-600 dark:text-red-400"
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(({ key, value, icon, accent }) => (
          <StatCard
            key={key}
            title={t(`analytics.${key}`)}
            value={loading ? "—" : (value ?? "—")}
            description={
              loading
                ? t("loadingStats")
                : t("analyticsDescription")
            }
            icon={icon}
            accent={accent}
          />
        ))}
      </div>

      {overview && !loading && (
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {(
            [
              ["articles", overview.content.articles],
              ["shows", overview.content.shows],
              ["podcasts", overview.content.podcasts],
            ] as const
          ).map(([key, item]) => (
            <div
              key={key}
              className="rounded-xl border border-border bg-card p-4"
            >
              <p className="text-sm font-medium">{t(`types.${key}`)}</p>
              <p className="mt-2 text-2xl font-bold">{item.total}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("typePublished", { count: item.published })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
