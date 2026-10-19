
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Search,
  RefreshCw,
  ArrowRight,
  Radio,
  Clock3,
  CheckCircle2,
  XCircle,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";
import { radioRequestApi } from "@/lib/radio-request-api";

type RadioRequest = {
  id: number | string;
  name: string;
  city?: string | null;
  country?: string | null;
  email?: string | null;
  status?: string | null;
  createdAt?: string | null;
  created_at?: string | null;
};

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: RadioRequest[];
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
};

const statusStyles: Record<string, string> = {
  PENDING:
    "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  APPROVED:
    "bg-green-500/10 text-green-700 dark:text-green-400",
  REJECTED:
    "bg-red-500/10 text-red-700 dark:text-red-400",
};

function getStatusIcon(status: string) {
  switch (status.toUpperCase()) {
    case "APPROVED":
      return CheckCircle2;
    case "REJECTED":
      return XCircle;
    default:
      return Clock3;
  }
}

export default function RadioRequestTable() {
  const t = useTranslations("RadioRequestTable");

  const [requests, setRequests] = useState<RadioRequest[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);

 
const loadRequests = useCallback(async () => {
  setLoading(true);
  setError("");

  try {
    const result = await radioRequestApi.list({
      page: 1,
      limit: 100,
    });

    if (!result.success || !Array.isArray(result.data)) {
      throw new Error(
        result.message ?? "Réponse API invalide"
      );
    }

    setRequests(result.data as RadioRequest[]);
    setTotal(result.pagination?.total ?? result.data.length);
  } catch (err) {
    console.error("Erreur de chargement des demandes :", err);
    setError(t("loadError"));
  } finally {
    setLoading(false);
  }
}, [t]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return requests.slice(0, 8);
    }

    return requests
      .filter((request) =>
        [
          request.name,
          request.city,
          request.country,
          request.email,
          request.status,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(query),
          ),
      )
      .slice(0, 8);
  }, [requests, search]);

  function formatDate(value?: string | null) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
    }).format(date);
  }

  function getStatusLabel(status?: string | null) {
    const normalized = (status ?? "PENDING").toUpperCase();

    if (
      normalized === "PENDING" ||
      normalized === "APPROVED" ||
      normalized === "REJECTED"
    ) {
      return t(`status.${normalized}`);
    }

    return status ?? t("status.PENDING");
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <div className="flex items-center gap-2">
            <Radio
              className="h-5 w-5 text-primary"
              aria-hidden="true"
            />
            <h2 className="text-lg font-semibold text-foreground">
              {t("title")}
            </h2>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            {t("description", { count: total })}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("searchPlaceholder")}
              aria-label={t("searchPlaceholder")}
              className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-56"
            />
          </label>

          <button
            type="button"
            onClick={() => void loadRequests()}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border px-3 text-sm font-medium text-foreground transition hover:bg-accent disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
              aria-hidden="true"
            />
            {t("refresh")}
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="m-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-700 dark:text-red-400"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">{error}</div>
          <button
            type="button"
            onClick={() => void loadRequests()}
            className="font-semibold underline underline-offset-4"
          >
            {t("retry")}
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] text-left text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th scope="col" className="px-6 py-4 font-semibold">
                {t("columns.radio")}
              </th>
              <th scope="col" className="px-6 py-4 font-semibold">
                {t("columns.location")}
              </th>
              <th scope="col" className="px-6 py-4 font-semibold">
                {t("columns.date")}
              </th>
              <th scope="col" className="px-6 py-4 font-semibold">
                {t("columns.status")}
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-right font-semibold"
              >
                {t("columns.action")}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <LoaderCircle className="mx-auto h-6 w-6 animate-spin text-primary" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    {t("loading")}
                  </p>
                </td>
              </tr>
            ) : !error && filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <Radio className="mx-auto h-8 w-8 text-muted-foreground/50" />
                  <p className="mt-3 font-medium text-foreground">
                    {t("empty")}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("emptyDescription")}
                  </p>
                </td>
              </tr>
            ) : (
              filteredRequests.map((request) => {
                const status = (
                  request.status ?? "PENDING"
                ).toUpperCase();

                const StatusIcon = getStatusIcon(status);

                return (
                  <tr
                    key={request.id}
                    className="transition hover:bg-muted/30"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">
                        {request.name}
                      </div>

                      {request.email && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          {request.email}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-muted-foreground">
                      {[request.city, request.country]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">
                      {formatDate(
                        request.createdAt ?? request.created_at,
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          statusStyles[status] ??
                          "bg-muted text-muted-foreground"
                        }`}
                      >
                        <StatusIcon
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                        {getStatusLabel(status)}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/radio-requests/${request.id}`}
                        aria-label={t("viewRequest", {
                          name: request.name,
                        })}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 font-semibold text-primary transition hover:bg-primary/10"
                      >
                        {t("view")}
                        <ArrowRight
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-xs text-muted-foreground">
          {t("showing", {
            count: filteredRequests.length,
            total,
          })}
        </p>

        <Link
          href="/admin/radio-requests"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          {t("viewAll")}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
