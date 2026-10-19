
"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Search,
  Radio,
  Newspaper,
  Headphones,
  Mic2,
  Clock3,
  CalendarDays,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  X,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buildRadioMediaImageUrl } from "@/lib/radio-media-api";
import { getTranslations } from "next-intl/server";

type ContentType = "article" | "show" | "podcast";
type SearchType = ContentType | "all";

interface SearchResult {
  id: string;
  type: ContentType;
  contentId: string | number;
  title: string;
  slug: string;
  radio: {
    id: string | number;
    name: string;
    slug: string;
  };
  category: {
    id: string | number;
    name: string;
  } | null;
  description: string;
  imageUrl: string | null;
  audioUrl: string | null;
  duration: number | null;
  hostName: string | null;
  publishedAt: string | null;
  url: string;
  score: number | null;
}

interface SearchResponse {
  success: boolean;
  query: string;
  filters: {
    type: ContentType | null;
    radioSlug: string | null;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  results: SearchResult[];
  message?: string;
}

const API_URL = "/api";

function getContentIcon(type: ContentType) {
  switch (type) {
    case "article":
      return Newspaper;
    case "show":
      return Mic2;
    case "podcast":
      return Headphones;
  }
}

export default  function PublicSearchPage() {
  const t = useTranslations("PublicSearch");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlQuery = searchParams.get("q") ?? "";
  const urlType = searchParams.get("type") ?? "all";
  const urlRadioSlug = searchParams.get("radioSlug") ?? "";
  const urlPage = Number(searchParams.get("page") ?? "1");

  const [query, setQuery] = useState(urlQuery);
  const [type, setType] = useState<SearchType>(
    isSearchType(urlType) ? urlType : "all"
  );
  const [radioSlug, setRadioSlug] = useState(urlRadioSlug);

  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  function isSearchType(value: string): value is SearchType {
    return (
      value === "all" ||
      value === "article" ||
      value === "show" ||
      value === "podcast"
    );
  }

  const fetchResults = useCallback(
    async (
      requestedPage: number,
      requestedQuery: string,
      requestedType: SearchType,
      requestedRadioSlug: string
    ) => {
      const normalizedQuery = requestedQuery.trim();

      if (!normalizedQuery) {
        setResults([]);
        setTotal(0);
        setTotalPages(0);
        setPage(1);
        setHasSearched(false);
        setError(null);
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({
        q: normalizedQuery,
        page: String(requestedPage),
        limit: "10",
      });

      if (requestedType !== "all") {
        params.set("type", requestedType);
      }

      if (requestedRadioSlug.trim()) {
        params.set("radioSlug", requestedRadioSlug.trim());
      }

      setLoading(true);
      setError(null);
      setHasSearched(true);

      try {
        const response = await fetch(
          `${API_URL}/search?${params.toString()}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          }
        );

        const data: SearchResponse = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ?? "Search request failed"
          );
        }

        setResults(data.results ?? []);
        setTotal(data.pagination?.total ?? 0);
        setTotalPages(data.pagination?.totalPages ?? 0);
        setPage(data.pagination?.page ?? requestedPage);
      } catch (err) {
        console.error(
          "Erreur pendant la recherche AfriWave :",
          err
        );

        setResults([]);
        setTotal(0);
        setTotalPages(0);
        setError(t("error"));
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  /*
   * Synchronise le composant avec l'URL.
   *
   * Exemple :
   * /fr/recherche?q=gilles
   *
   * La requête est automatiquement récupérée et exécutée.
   * Sans q, aucune publication n'est chargée automatiquement.
   */
  useEffect(() => {
    setQuery(urlQuery);
    setType(isSearchType(urlType) ? urlType : "all");
    setRadioSlug(urlRadioSlug);

    if (!urlQuery.trim()) {
      setResults([]);
      setTotal(0);
      setTotalPages(0);
      setPage(1);
      setHasSearched(false);
      setError(null);
      setLoading(false);
      return;
    }

    const requestedPage =
      Number.isInteger(urlPage) && urlPage > 0
        ? urlPage
        : 1;

    void fetchResults(
      requestedPage,
      urlQuery,
      isSearchType(urlType) ? urlType : "all",
      urlRadioSlug
    );
  }, [
    urlQuery,
    urlType,
    urlRadioSlug,
    urlPage,
    fetchResults,
  ]);

  const updateUrl = useCallback(
    (
      requestedQuery: string,
      requestedType: SearchType,
      requestedRadioSlug: string,
      requestedPage = 1
    ) => {
      const normalizedQuery = requestedQuery.trim();

      if (!normalizedQuery) {
        router.push(pathname, { scroll: false });
        return;
      }

      const params = new URLSearchParams();
      params.set("q", normalizedQuery);

      if (requestedType !== "all") {
        params.set("type", requestedType);
      }

      if (requestedRadioSlug.trim()) {
        params.set("radioSlug", requestedRadioSlug.trim());
      }

      params.set("page", String(requestedPage));

      router.push(`${pathname}?${params.toString()}`, {
        scroll: false,
      });
    },
    [pathname, router]
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateUrl(query, type, radioSlug, 1);
  };

  const handleTypeChange = (value: SearchType | null) => {
    if (value === null) return;

    setType(value);

    if (query.trim()) {
      updateUrl(query, value, radioSlug, 1);
    }
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;

    updateUrl(query, type, radioSlug, nextPage);
  };

  const handleClear = () => {
    setQuery("");
    setType("all");
    setRadioSlug("");
    router.push(pathname, { scroll: false });
  };

  const formatDate = (date: string | null) => {
    if (!date) return null;

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return null;

    return new Intl.DateTimeFormat(
      locale === "en" ? "en-GB" : "fr-FR",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    ).format(parsedDate);
  };

  const getTypeLabel = (contentType: ContentType) => {
    switch (contentType) {
      case "article":
        return t("article");
      case "show":
        return t("show");
      case "podcast":
        return t("podcast");
    }
  };

  return (
    <main className="min-h-screen bg-background">
      {/* En-tête de la page */}
      <section className="relative overflow-hidden border-b border-border/70 bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 size-72 rounded-full bg-emerald-600/10 blur-3xl" />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="outline"
              className="mb-4 gap-2 rounded-full border-primary/30 px-3 py-1"
            >
              <Radio className="size-3.5 text-primary" />
              AfriWave
            </Badge>

            <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {t("title")}
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              {t("description")}
            </p>

            <form
              onSubmit={handleSubmit}
              className="mx-auto mt-8 max-w-2xl"
            >
              <div className="flex flex-col gap-2 rounded-2xl border border-border/80 bg-background p-2 shadow-lg shadow-primary/5 sm:flex-row">
                <div className="relative min-w-0 flex-1">
                  <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    value={query}
                    onChange={(event) =>
                      setQuery(event.target.value)
                    }
                    placeholder={t("placeholder")}
                    aria-label={t("placeholder")}
                    className="h-12 border-0 bg-transparent pl-10 shadow-none focus-visible:ring-0"
                  />

                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      aria-label={t("clear")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="h-12 gap-2 rounded-xl px-6 font-bold"
                >
                  {loading ? (
                    <RefreshCw className="size-4 animate-spin" />
                  ) : (
                    <Search className="size-4" />
                  )}
                  {t("search")}
                </Button>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 text-left sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                    {t("filterType")}
                  </label>

                  <Select
                    value={type}
                    onValueChange={handleTypeChange}
                  >
                    <SelectTrigger className="h-10 rounded-xl bg-background">
                      <SelectValue placeholder={t("allTypes")} />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="all">
                        {t("allTypes")}
                      </SelectItem>
                      <SelectItem value="article">
                        {t("article")}
                      </SelectItem>
                      <SelectItem value="show">
                        {t("show")}
                      </SelectItem>
                      <SelectItem value="podcast">
                        {t("podcast")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                    {t("radioPlaceholder")}
                  </label>

                  <Input
                    value={radioSlug}
                    onChange={(event) =>
                      setRadioSlug(event.target.value)
                    }
                    placeholder={t("radioPlaceholder")}
                    className="h-10 rounded-xl bg-background"
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Résultats : affichés uniquement après une recherche */}
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {!hasSearched && !loading && (
          <div className="mx-auto max-w-xl py-12 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10">
              <Search className="size-7 text-primary" />
            </div>

            <h2 className="mt-5 text-xl font-bold">
              {t("discoverTitle")}
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {t("description")}
            </p>
          </div>
        )}

        {hasSearched && (
          <>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  {t("resultsEyebrow")}
                </p>

                <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
                  {t("resultsTitle")}
                </h2>

                {!loading && !error && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t("resultCount", { count: total })}
                  </p>
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                className="gap-2 self-start rounded-xl sm:self-auto"
              >
                <X className="size-4" />
                {t("reset")}
              </Button>
            </div>

            {error && (
              <Card className="rounded-2xl border-destructive/30">
                <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                  <p className="text-sm text-destructive">
                    {error}
                  </p>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      void fetchResults(
                        page,
                        query,
                        type,
                        radioSlug
                      )
                    }
                    className="gap-2 rounded-xl"
                  >
                    <RefreshCw className="size-4" />
                    {t("retry")}
                  </Button>
                </CardContent>
              </Card>
            )}

            {loading && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card
                    key={index}
                    className="overflow-hidden rounded-2xl"
                  >
                    <div className="aspect-[16/9] animate-pulse bg-muted" />
                    <CardContent className="space-y-3 p-5">
                      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                      <div className="h-6 w-full animate-pulse rounded bg-muted" />
                      <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
                      <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!loading && !error && results.length === 0 && (
              <Card className="rounded-2xl border-dashed">
                <CardContent className="flex flex-col items-center px-6 py-14 text-center">
                  <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
                    <Search className="size-7 text-muted-foreground" />
                  </div>

                  <h3 className="mt-5 text-xl font-bold">
                    {t("emptyTitle")}
                  </h3>

                  <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    {t("emptyDescription")}
                  </p>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClear}
                    className="mt-5 rounded-xl"
                  >
                    {t("reset")}
                  </Button>
                </CardContent>
              </Card>
            )}

            {!loading && !error && results.length > 0 && (
              <>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {results.map((item) => {
                    const ContentIcon = getContentIcon(item.type);
                    const publishedDate = formatDate(
                      item.publishedAt
                    );

                    return (
                      <Card
                        key={item.id}
                        className="group flex h-full flex-col overflow-hidden rounded-2xl border-border/70 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
                      >
                        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                          {item.imageUrl ? (
                            <img
                              src={buildRadioMediaImageUrl(item.imageUrl)}
                              alt={item.title}
                              loading="lazy"
                              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center bg-gradient-to-br from-primary/10 via-muted to-emerald-600/10">
                              <ContentIcon className="size-12 text-primary/60" />
                            </div>
                          )}

                          <div className="absolute left-3 top-3">
                            <Badge className="gap-1.5 border border-background/20 bg-background/95 text-foreground shadow-sm hover:bg-background">
                              <ContentIcon className="size-3.5 text-primary" />
                              {getTypeLabel(item.type)}
                            </Badge>
                          </div>
                        </div>

                        <CardContent className="flex flex-1 flex-col p-5">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5 font-semibold text-primary">
                              <Radio className="size-3.5" />
                              {item.radio.name}
                            </span>

                            {item.category && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>{item.category.name}</span>
                              </>
                            )}
                          </div>

                          <h3 className="mt-3 line-clamp-2 text-lg font-bold leading-snug tracking-tight transition-colors group-hover:text-primary">
                            {item.title}
                          </h3>

                          {item.description && (
                            <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                              {item.description}
                            </p>
                          )}

                          {item.hostName && (
                            <p className="mt-3 text-sm text-muted-foreground">
                              {t("presentedBy")}{" "}
                              <span className="font-semibold text-foreground">
                                {item.hostName}
                              </span>
                            </p>
                          )}

                          <div className="mt-auto">
                            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/70 pt-4 text-xs text-muted-foreground">
                              {publishedDate && (
                                <span className="inline-flex items-center gap-1.5">
                                  <CalendarDays className="size-3.5" />
                                  {publishedDate}
                                </span>
                              )}

                              {item.duration != null && (
                                <span className="inline-flex items-center gap-1.5">
                                  <Clock3 className="size-3.5" />
                                  {item.duration} {t("minutes")}
                                </span>
                              )}
                            </div>

                            {item.url && (
                              <a
                                href={item.url}
                                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary transition-all hover:gap-3"
                              >
                                {t("readMore")}
                                <ArrowRight className="size-4" />
                              </a>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <nav
                    aria-label={t("pagination")}
                    className="mt-10 flex flex-wrap items-center justify-center gap-3"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      disabled={page <= 1 || loading}
                      onClick={() =>
                        handlePageChange(page - 1)
                      }
                      className="gap-2 rounded-xl"
                    >
                      <ChevronLeft className="size-4" />
                      <span className="hidden sm:inline">
                        {t("previous")}
                      </span>
                    </Button>

                    <span className="text-sm font-medium text-muted-foreground">
                      {t("pageLabel", {
                        page,
                        totalPages,
                      })}
                    </span>

                    <Button
                      type="button"
                      variant="outline"
                      disabled={
                        page >= totalPages || loading
                      }
                      onClick={() =>
                        handlePageChange(page + 1)
                      }
                      className="gap-2 rounded-xl"
                    >
                      <span className="hidden sm:inline">
                        {t("next")}
                      </span>
                      <ChevronRight className="size-4" />
                    </Button>
                  </nav>
                )}
              </>
            )}
          </>
        )}
      </section>
    </main>
  );
}
