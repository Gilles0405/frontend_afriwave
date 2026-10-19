
"use client";

import { useCallback, useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  MapPin,
  Radio,
  RefreshCw,
  Search,
} from "lucide-react";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { radioRequestApi, RadioRequestStatus } from "@/lib/radio-request-api";
import { RadioRequest } from "@/lib/radioRequestApi";

const PAGE_SIZE = 10;

type StatusFilter = "ALL" | RadioRequestStatus;

function statusClass(status: RadioRequestStatus) {
  switch (status) {
    case "APPROVED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300";
    case "REJECTED":
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300";
    default:
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300";
  }
}

export default function RadioRequestTableAdmin() {
  const t = useTranslations("RadioRequests");

  const [requests, setRequests] = useState<RadioRequest[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await radioRequestApi.list({
        page,
        limit: PAGE_SIZE,
        ...(status !== "ALL" ? { status } : {}),
        search: debouncedSearch || undefined,
      });

      if (!Array.isArray(result.data)) {
        throw new Error("Invalid radio requests response");
      }

      const requestsData = result.data as RadioRequest[];
      setRequests(requestsData);
      setTotal(result.pagination?.total ?? requestsData.length);
    } catch (error) {
      console.error("Unable to load radio requests:", error);
      setError(t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [page, status, debouncedSearch, t]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function formatDate(value?: string | null) {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
    }).format(date);
  }

  function renderStatus(value: RadioRequestStatus) {
    return (
      <Badge variant="outline" className={statusClass(value)}>
        {t(`status.${value}`)}
      </Badge>
    );
  }

  function renderLocation(request: RadioRequest) {
    return (
      [request.city, request.country].filter(Boolean).join(", ") || "—"
    );
  }

  function renderRequestLink(request: RadioRequest) {
    return (
      <Button  variant="outline" size="sm">
        <Link href={`/admin/radio-requests/${request.id}`}>
          <Eye className="mr-2 h-4 w-4" />
          {t("view")}
        </Link>
      </Button>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("description", { count: total })}
          </p>
        </div>

        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => void loadRequests()}
          disabled={loading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          {t("refresh")}
        </Button>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div>
            <CardTitle>{t("listTitle")}</CardTitle>
            <CardDescription>{t("listDescription")}</CardDescription>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("searchPlaceholder")}
                aria-label={t("searchPlaceholder")}
              />
            </div>

            <Select
              value={status}
              onValueChange={(value) => setStatus(value as StatusFilter)}
            >
              <SelectTrigger
                className="w-full sm:w-[200px]"
                aria-label={t("filterStatus")}
              >
                <SelectValue placeholder={t("filterStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t("allStatuses")}</SelectItem>
                <SelectItem value="PENDING">
                  {t("status.PENDING")}
                </SelectItem>
                <SelectItem value="APPROVED">
                  {t("status.APPROVED")}
                </SelectItem>
                <SelectItem value="REJECTED">
                  {t("status.REJECTED")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span>{error}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void loadRequests()}
                >
                  {t("retry")}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Vue mobile */}
          <div className="space-y-3 md:hidden">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-32 animate-pulse rounded-lg border bg-muted/30"
                />
              ))
            ) : requests.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <Radio className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <p className="font-medium">{t("empty")}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("emptyDescription")}
                </p>
              </div>
            ) : (
              requests.map((request) => (
                <article
                  key={request.id}
                  className="space-y-3 rounded-lg border p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words font-medium">
                        {request.name}
                      </p>
                      {request.frequency && (
                        <p className="text-sm text-muted-foreground">
                          {request.frequency}
                        </p>
                      )}
                    </div>
                    {renderStatus(request.status)}
                  </div>

                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    {renderLocation(request)}
                  </p>

                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4 shrink-0" />
                    {formatDate(request.createdAt ?? request.created_at)}
                  </p>

                  <div className="pt-1">{renderRequestLink(request)}</div>
                </article>
              ))
            )}
          </div>

          {/* Vue tablette et desktop */}
          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("columns.radio")}</TableHead>
                    <TableHead>{t("columns.location")}</TableHead>
                    <TableHead>{t("columns.email")}</TableHead>
                    <TableHead>{t("columns.date")}</TableHead>
                    <TableHead>{t("columns.status")}</TableHead>
                    <TableHead className="text-right">
                      {t("columns.action")}
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        {Array.from({ length: 6 }).map((__, cellIndex) => (
                          <TableCell key={cellIndex}>
                            <div className="h-4 max-w-32 animate-pulse rounded bg-muted" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-40 text-center">
                        <Radio className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                        <p className="font-medium">{t("empty")}</p>
                        <p className="text-sm text-muted-foreground">
                          {t("emptyDescription")}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <p className="font-medium">{request.name}</p>
                          {request.frequency && (
                            <p className="text-sm text-muted-foreground">
                              {request.frequency}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>{renderLocation(request)}</TableCell>
                        <TableCell className="max-w-48 truncate">
                          {request.email || "—"}
                        </TableCell>
                        <TableCell>
                          {formatDate(request.createdAt ?? request.created_at)}
                        </TableCell>
                        <TableCell>{renderStatus(request.status)}</TableCell>
                        <TableCell className="text-right">
                          {renderRequestLink(request)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {t("showing", { count: requests.length, total })}
            </p>

            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <span className="text-sm text-muted-foreground">
                {t("page", { page, totalPages })}
              </span>

              <Button
                variant="outline"
                size="icon"
                aria-label={t("previousPage")}
                disabled={page <= 1 || loading}
                onClick={() =>
                  setPage((current) => Math.max(1, current - 1))
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                aria-label={t("nextPage")}
                disabled={page >= totalPages || loading}
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
