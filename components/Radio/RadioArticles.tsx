
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  FileText,
  ChevronLeft,
  ChevronRight,
  Plus,
  Eye,
  CalendarDays,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { ApiError, ArticleStatus, RadioArticle, radioArticleService } from "@/lib/article-api";



const PAGE_SIZE = 10;

const STATUSES: ArticleStatus[] = [
  "DRAFT",
  "PENDING_REVIEW",
  "PUBLISHED",
  "ARCHIVED",
];

const STATUS_STYLES: Record<ArticleStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  PENDING_REVIEW: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  PUBLISHED: "bg-green-500/10 text-green-700 dark:text-green-400",
  ARCHIVED: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
};

interface Props {
  radioId: number;
}

export default function RadioArticles({ radioId }: Props) {
  const t = useTranslations("RadioArticles");

  const [articles, setArticles] = useState<RadioArticle[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ArticleStatus | "">("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const loadArticles = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await radioArticleService.getArticles(
        radioId,
        {
          page,
          limit: PAGE_SIZE,
          search: search.trim() || undefined,
          status: status || undefined,
        },
      );

      setArticles(result.data ?? []);
      setTotalPages(
        Math.max(1, result.pagination?.totalPages ?? 1),
      );
      setTotal(result.pagination?.total ?? result.data?.length ?? 0);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError(t("sessionExpired"));
      } else if (err instanceof ApiError && err.status === 403) {
        setError(t("accessDenied"));
      } else {
        setError(
          err instanceof Error ? err.message : t("loadError"),
        );
      }
    } finally {
      setLoading(false);
    }
  }, [radioId, page, search, status, refreshKey, t]);

  useEffect(() => {
    void loadArticles();
  }, [loadArticles]);

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  function formatDate(value?: string | null) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  }

  function statusLabel(value: ArticleStatus) {
    return t(`statuses.${value}`);
  }

  return (
    <section className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {t("title")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("subtitle")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRefreshKey((value) => value + 1)}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-accent disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            {t("refresh")}
          </button>

          <button
            type="button"
            onClick={() => {
              window.location.assign("articles/new");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            {t("create")}
          </button>
        </div>
      </div>

      {/* Compteurs */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            {t("totalArticles")}
          </p>
          <p className="mt-2 text-2xl font-bold">
            {loading ? "—" : total}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            {t("currentPage")}
          </p>
          <p className="mt-2 text-2xl font-bold">
            {page} <span className="text-muted-foreground">/</span>{" "}
            {totalPages}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            {t("displayedArticles")}
          </p>
          <p className="mt-2 text-2xl font-bold">
            {loading ? "—" : articles.length}
          </p>
        </div>
      </div>

      {/* Recherche et filtre */}
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchPlaceholder")}
            className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>

        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as ArticleStatus | "");
          }}
          aria-label={t("filterStatus")}
          className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary sm:w-56"
        >
          <option value="">{t("allStatuses")}</option>
          {STATUSES.map((item) => (
            <option key={item} value={item}>
              {statusLabel(item)}
            </option>
          ))}
        </select>
      </div>

      {/* Erreur */}
      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={() => setRefreshKey((value) => value + 1)}
            className="w-fit font-semibold text-primary underline underline-offset-4"
          >
            {t("retry")}
          </button>
        </div>
      )}

      {/* Liste */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b px-4 py-4 sm:px-6">
          <h2 className="font-semibold">{t("listTitle")}</h2>
          <span className="text-xs text-muted-foreground">
            {t("pageSize", { count: PAGE_SIZE })}
          </span>
        </div>

        {loading ? (
          <div className="space-y-4 p-6" aria-live="polite">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-12 animate-pulse rounded-lg bg-muted"
              />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </span>
            <h3 className="font-semibold">{t("emptyTitle")}</h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {t("emptyDescription")}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3 font-medium">
                      {t("articleColumn")}
                    </th>
                    <th className="px-4 py-3 font-medium">
                      {t("statusColumn")}
                    </th>
                    <th className="px-4 py-3 font-medium">
                      {t("updatedColumn")}
                    </th>
                    <th className="px-4 py-3 text-right font-medium">
                      {t("actionsColumn")}
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {articles.map((article) => (
                    <tr
                      key={article.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                            {article.featuredImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={article.featuredImage}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <FileText className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-md truncate font-semibold">
                              {article.title}
                            </p>
                            <p className="mt-1 max-w-md truncate text-xs text-muted-foreground">
                              {article.excerpt || article.content}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              #{article.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[article.status]}`}
                        >
                          {statusLabel(article.status)}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-muted-foreground">
                        <span className="inline-flex items-center gap-2 whitespace-nowrap">
                          <CalendarDays className="h-4 w-4" />
                          {formatDate(article.updatedAt ?? article.createdAt)}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-right">
                        <button
                          type="button"
                          title={t("view")}
                          aria-label={`${t("view")} : ${article.title}`}
                          onClick={() => {
                            window.location.assign(
                              `articles/${article.id}`,
                            );
                          }}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border transition hover:bg-accent"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-sm text-muted-foreground">
                {t("paginationInfo", {
                  count: articles.length,
                  total,
                })}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  className="inline-flex h-9 items-center gap-1 rounded-lg border px-3 text-sm transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t("previous")}
                </button>

                <span className="min-w-16 text-center text-sm tabular-nums">
                  {page} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() =>
                    setPage((value) => Math.min(totalPages, value + 1))
                  }
                  className="inline-flex h-9 items-center gap-1 rounded-lg border px-3 text-sm transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t("next")}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
