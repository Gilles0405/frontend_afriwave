
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Radio,
  Headphones,
  Newspaper,
  RefreshCw,
  Search,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  listRadioMedia,
  type RadioMedia,
  type RadioMediaType,
  type RadioMediaPagination,
} from "@/lib/radio-media-api";
import MediaList from "./MediaList";

type Props = {
  radioId: number;
};

const PAGE_SIZE = 20;

const initialPagination: RadioMediaPagination = {
  total: 0,
  page: 1,
  limit: PAGE_SIZE,
  totalPages: 0,
};

const mediaTypes: {
  value: RadioMediaType;
  label: string;
  icon: typeof Radio;
}[] = [
  { value: "show", label: "shows", icon: Radio },
  { value: "podcast", label: "podcasts", icon: Headphones },
  { value: "article", label: "articles", icon: Newspaper },
];

export default function MediaDashboard({ radioId }: Props) {
  const t = useTranslations("RadioMedia");

  const [type, setType] = useState<RadioMediaType>("show");
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<RadioMedia[]>([]);
  const [pagination, setPagination] =
    useState<RadioMediaPagination>(initialPagination);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadMedia = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const response = await listRadioMedia(radioId, {
        type,
        page,
        limit: PAGE_SIZE,
        status: status === "ALL" ? undefined : status,
      });

      setItems(response.items);
      setPagination(response.pagination);
    } catch (err) {
      console.error("[RadioMedia] Chargement impossible :", err);
      setError(true);
      setItems([]);
      setPagination(initialPagination);
      toast.error(t("errors.load"));
    } finally {
      setLoading(false);
    }
  }, [radioId, type, page, status, refreshKey, t]);

  useEffect(() => {
    void loadMedia();
  }, [loadMedia]);

  const visibleItems = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();

    if (!normalizedSearch) return items;

    return items.filter((item) =>
      `${item.title} ${item.slug}`
        .toLocaleLowerCase()
        .includes(normalizedSearch),
    );
  }, [items, search]);

  function changeType(value: string) {
    setType(value as RadioMediaType);
    setPage(1);
    setSearch("");
    setStatus("ALL");
  }

  function changeStatus(value: string | null) {
    if (value === null) return;

    setStatus(value);
    setPage(1);
  }

  function retry() {
    setRefreshKey((current) => current + 1);
  }

  return (
    <main className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("description")}
          </p>
        </div>

        <Button
          variant="outline"
          onClick={retry}
          disabled={loading}
        >
          <RefreshCw
            className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`}
          />
          {t("refresh")}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {mediaTypes.map(({ value, label, icon: Icon }) => (
          <Card
            key={value}
            className={`cursor-pointer border-border/70 shadow-sm transition-colors hover:border-primary/50 ${
              type === value ? "border-primary bg-primary/[0.03]" : ""
            }`}
            onClick={() => changeType(value)}
          >
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex size-11 items-center justify-center rounded-xl bg-muted">
                <Icon className="size-5" />
              </div>

              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">
                  {t(`categories.${label}`)}
                </p>
                <p className="text-2xl font-bold tabular-nums">
                  {loading && type === value
                    ? "…"
                    : type === value
                      ? pagination.total
                      : "—"}
                </p>
              </div>

              {type === value && (
                <Badge className="ml-auto">{t("active")}</Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>{t("listTitle")}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("count", { count: pagination.total })}
            </p>
          </div>

          <Tabs value={type} onValueChange={changeType}>
            <TabsList className="grid h-auto w-full grid-cols-3">
              {mediaTypes.map(({ value, label, icon: Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="gap-2 py-2"
                >
                  <Icon className="size-4" />
                  <span>{t(`categories.${label}`)}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {mediaTypes.map(({ value }) => (
              <TabsContent key={value} value={value} />
            ))}
          </Tabs>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("searchPlaceholder")}
                className="pl-9"
              />
            </div>

            <Select value={status} onValueChange={changeStatus}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder={t("filterStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t("statuses.all")}</SelectItem>
                <SelectItem value="PUBLISHED">
                  {t("statuses.published")}
                </SelectItem>
                <SelectItem value="DRAFT">
                  {t("statuses.draft")}
                </SelectItem>
                <SelectItem value="ARCHIVED">
                  {t("statuses.archived")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                {t("errors.load")}
              </p>
              <Button variant="outline" onClick={retry}>
                {t("retry")}
              </Button>
            </div>
          ) : (
            <>
              <MediaList items={visibleItems} loading={loading} />

              <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  {t("pagination.page", {
                    page: pagination.page,
                    totalPages: pagination.totalPages,
                  })}
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={loading || page <= 1}
                    onClick={() => setPage((current) => current - 1)}
                  >
                    {t("pagination.previous")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={
                      loading ||
                      pagination.totalPages === 0 ||
                      page >= pagination.totalPages
                    }
                    onClick={() => setPage((current) => current + 1)}
                  >
                    {t("pagination.next")}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
