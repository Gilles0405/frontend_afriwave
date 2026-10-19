
"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Users,
  ShieldCheck,
  MailCheck,
  AlertCircle,
} from "lucide-react";

import {
  getAdminUsers,
  type AdminUser,
  type UsersPagination,
} from "@/lib/admin-users.request";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
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

export default function UserManagementTable() {
  const t = useTranslations("AdminUsers");
  const locale = useLocale();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<UsersPagination | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [globalRole, setGlobalRole] = useState("ALL");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [verifiedFilter, setVerifiedFilter] = useState("ALL");

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Debounce de la recherche
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  // Charger les utilisateurs depuis l'API
  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      setLoading(true);
      setError("");

      try {
        const result = await getAdminUsers({
          page,
          limit: 10,
          search,
          ...(globalRole !== "ALL"
            ? {
                globalRole: globalRole as "USER" | "SUPER_ADMIN",
              }
            : {}),
          ...(activeFilter !== "ALL"
            ? { isActive: activeFilter === "ACTIVE" }
            : {}),
          ...(verifiedFilter !== "ALL"
            ? { emailVerified: verifiedFilter === "VERIFIED" }
            : {}),
        });

        if (cancelled) return;

        setUsers(result.data);
        setPagination(result.pagination);
      } catch (err) {
        if (cancelled) return;

        setUsers([]);
        setPagination(null);
        setError(
          err instanceof Error ? err.message : t("errors.loadFailed")
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, [page, search, globalRole, activeFilter, verifiedFilter, t]);

  const changeFilter = (
    setter: (value: string) => void,
    value: string
  ) => {
    setter(value);
    setPage(1);
  };

  const formatDate = (date?: string) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
    }).format(parsedDate);
  };

  const getFullName = (user: AdminUser) => {
    const name = [user.firstName, user.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    return name || t("anonymous");
  };

  return (
    <section className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">
              {t("title")}
            </h1>
          </div>

          <p className="text-sm text-muted-foreground">
            {t("description")}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => setPage((current) => current)}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          {t("refresh")}
        </Button>
      </div>

      {/* Recherche et filtres */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="relative sm:col-span-2 xl:col-span-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchLabel")}
            className="pl-9"
          />
        </div>

        <Select
          value={globalRole}
          onValueChange={(value) =>
            changeFilter(setGlobalRole, value ?? "ALL")
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("filters.role")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("filters.allRoles")}</SelectItem>
            <SelectItem value="USER">{t("roles.user")}</SelectItem>
            <SelectItem value="SUPER_ADMIN">
              {t("roles.superAdmin")}
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={activeFilter}
          onValueChange={(value) =>
            changeFilter(setActiveFilter, value ?? "ALL")
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("filters.status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("filters.allStatuses")}</SelectItem>
            <SelectItem value="ACTIVE">{t("status.active")}</SelectItem>
            <SelectItem value="INACTIVE">
              {t("status.inactive")}
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={verifiedFilter}
          onValueChange={(value) =>
            changeFilter(setVerifiedFilter, value ?? "ALL")
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("filters.email")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">
              {t("filters.allVerification")}
            </SelectItem>
            <SelectItem value="VERIFIED">
              {t("verification.verified")}
            </SelectItem>
            <SelectItem value="UNVERIFIED">
              {t("verification.unverified")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Erreur */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("errors.title")}</AlertTitle>
          <AlertDescription className="flex flex-col items-start gap-3">
            <span>{error}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => current)}
            >
              {t("retry")}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Tableau */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="flex flex-col gap-1 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <h2 className="font-semibold">{t("table.title")}</h2>

          <p className="text-sm text-muted-foreground">
            {t("table.resultCount", {
              count: pagination?.totalItems ?? 0,
            })}
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.user")}</TableHead>
                <TableHead>{t("table.role")}</TableHead>
                <TableHead>{t("table.status")}</TableHead>
                <TableHead>{t("table.email")}</TableHead>
                <TableHead>{t("table.registered")}</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 5 }).map((__, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton className="h-5 w-full max-w-32" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {t("errors.loadFailed")}
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-32 text-center"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-8 w-8 text-muted-foreground/60" />
                      <p className="font-medium">{t("empty.title")}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("empty.description")}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex min-w-48 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-semibold text-primary">
                          {user.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={user.avatar}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            getFullName(user)
                              .split(/\s+/)
                              .slice(0, 2)
                              .map((part) => part[0])
                              .join("")
                              .toUpperCase()
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {getFullName(user)}
                          </p>
                          <p className="max-w-56 truncate text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {user.globalRole === "SUPER_ADMIN" ? (
                        <Badge className="gap-1 border-orange-500/20 bg-orange-500/10 text-orange-700 hover:bg-orange-500/15 dark:text-orange-300">
                          <ShieldCheck className="h-3 w-3" />
                          {t("roles.superAdmin")}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          {t("roles.user")}
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      {user.isActive ? (
                        <Badge className="border-green-600/20 bg-green-600/10 text-green-700 hover:bg-green-600/15 dark:text-green-400">
                          {t("status.active")}
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          {t("status.inactive")}
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      {user.emailVerified ? (
                        <span className="inline-flex items-center gap-1.5 text-sm text-green-700 dark:text-green-400">
                          <MailCheck className="h-4 w-4" />
                          {t("verification.verified")}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {t("verification.unverified")}
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm text-muted-foreground">
            {t("pagination.page", {
              page: pagination?.page ?? page,
              total: pagination?.totalPages ?? 0,
            })}
          </p>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={
                loading ||
                !pagination ||
                !pagination.hasPreviousPage
              }
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              {t("pagination.previous")}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={
                loading ||
                !pagination ||
                !pagination.hasNextPage
              }
              onClick={() => setPage((current) => current + 1)}
            >
              {t("pagination.next")}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
