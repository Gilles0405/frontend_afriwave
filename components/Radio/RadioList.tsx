
"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Search,
  Radio as RadioIcon,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
} from "lucide-react";



import RadioCard from "./RadioCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { getAllRadios, Radio, RadioPagination } from "@/lib/radio.request";

export default function RadioList() {
  const t = useTranslations("RadioList");

  const [radios, setRadios] = useState<Radio[]>([]);
  const [pagination, setPagination] = useState<RadioPagination | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 350);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const loadRadios = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getAllRadios({
        page,
        limit: 9,
        search,
      });

      setRadios(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("errors.loadFailed")
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, t]);

  useEffect(() => {
    void loadRadios();
  }, [loadRadios]);

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            {t("eyebrow")}
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("title")}
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            {t("description")}
          </p>
        </div>

        {!loading && pagination && (
          <p className="text-sm text-muted-foreground">
            {t("stationCount", { count: pagination.totalItems })}
          </p>
        )}
      </header>

      <div className="relative max-w-xl">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchLabel")}
          className="h-11 rounded-xl bg-background pl-10"
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>{t("errors.title")}</AlertTitle>
          <AlertDescription className="flex flex-col items-start gap-3">
            <span>{error}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void loadRadios()}
              disabled={loading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {t("retry")}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          aria-label={t("loading")}
          aria-busy="true"
        >
          {Array.from({ length: 9 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border"
            >
              <Skeleton className="aspect-[16/9] w-full rounded-none" />
              <div className="space-y-3 p-5">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-2/5" />
              </div>
            </div>
          ))}
        </div>
      ) : !error && radios.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed px-5 py-12 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <RadioIcon
              className="h-7 w-7 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
          <h2 className="text-lg font-semibold">{t("empty.title")}</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            {t("empty.description")}
          </p>

          {search && (
            <Button
              variant="outline"
              className="mt-5"
              onClick={() => setSearchInput("")}
            >
              {t("empty.clearSearch")}
            </Button>
          )}
        </div>
      ) : !error ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {radios.map((radio) => (
            <RadioCard key={radio.id} radio={radio} />
          ))}
        </div>
      ) : null}

      {!loading && !error && pagination && pagination.totalPages > 1 && (
        <nav
          aria-label={t("pagination.label")}
          className="flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row"
        >
          <p className="text-sm text-muted-foreground">
            {t("pagination.page", {
              page: pagination.page,
              total: pagination.totalPages,
            })}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPreviousPage || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              {t("pagination.previous")}
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNextPage || loading}
              onClick={() => setPage((current) => current + 1)}
            >
              {t("pagination.next")}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </nav>
      )}

      {loading && (
        <span className="sr-only">
          <LoaderCircle aria-hidden="true" />
          {t("loading")}
        </span>
      )}
    </section>
  );
}
