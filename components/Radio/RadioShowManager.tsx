
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Archive,
  CalendarDays,
  Clock3,
  ImagePlus,
  LoaderCircle,
  Pencil,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Send,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioShow, radioShowService, ShowPayload, ShowStatus } from "@/lib/Showservice-api";

type FormValues = {
  title: string;
  description: string;
  coverImage: string;
  hostName: string;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  timezone: string;
};

const EMPTY_FORM: FormValues = {
  title: "",
  description: "",
  coverImage: "",
  hostName: "",
  daysOfWeek: [],
  startTime: "",
  endTime: "",
  timezone: "Africa/Douala",
};

const WEEKDAYS = [
  { value: 1, key: "monday" },
  { value: 2, key: "tuesday" },
  { value: 3, key: "wednesday" },
  { value: 4, key: "thursday" },
  { value: 5, key: "friday" },
  { value: 6, key: "saturday" },
  { value: 7, key: "sunday" },
] as const;

const STATUSES: ShowStatus[] = [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
];

function toFormValues(show?: RadioShow): FormValues {
  if (!show) return { ...EMPTY_FORM };

  return {
    title: show.title ?? "",
    description: show.description ?? "",
    coverImage: show.coverImage ?? "",
    hostName: show.hostName ?? "",
    daysOfWeek: show.daysOfWeek ?? [],
    startTime: show.startTime?.slice(0, 5) ?? "",
    endTime: show.endTime?.slice(0, 5) ?? "",
    timezone: show.timezone || "Africa/Douala",
  };
}

function toPayload(values: FormValues): ShowPayload {
  return {
    title: values.title.trim(),
    description: values.description.trim() || null,
    coverImage: values.coverImage.trim() || null,
    hostName: values.hostName.trim() || null,
    daysOfWeek: [...values.daysOfWeek].sort((a, b) => a - b),
    startTime: values.startTime || null,
    endTime: values.endTime || null,
    timezone: values.timezone.trim() || "Africa/Douala",
  };
}

export default function RadioShowManager({
  radioId,
}: {
  radioId: number;
}) {
  const t = useTranslations("RadioShows");

  const [shows, setShows] = useState<RadioShow[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingShow, setEditingShow] = useState<RadioShow | null>(null);
  const [form, setForm] = useState<FormValues>({ ...EMPTY_FORM });
  const [formError, setFormError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<RadioShow | null>(null);
  const [statusTarget, setStatusTarget] = useState<{
    show: RadioShow;
    action: "publish" | "archive";
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadShows = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await radioShowService.getShows(radioId, {
        page,
        limit,
        status: statusFilter === "ALL"
          ? ""
          : (statusFilter as ShowStatus),
        search,
      });

      setShows(result.data);
      setTotal(result.pagination.total);
      setTotalPages(Math.max(1, result.pagination.totalPages));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.load"));
    } finally {
      setLoading(false);
    }
  }, [radioId, page, limit, statusFilter, search, t]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadShows();
    }, 250);

    return () => clearTimeout(timer);
  }, [loadShows]);

  const stats = useMemo(() => ({
    total,
    published: shows.filter((show) => show.status === "PUBLISHED").length,
    drafts: shows.filter((show) => show.status === "DRAFT").length,
  }), [shows, total]);

  function openCreate() {
    setEditingShow(null);
    setForm({ ...EMPTY_FORM });
    setFormError("");
    setFormOpen(true);
  }

  function openEdit(show: RadioShow) {
    setEditingShow(show);
    setForm(toFormValues(show));
    setFormError("");
    setFormOpen(true);
  }

  function updateField<K extends keyof FormValues>(
    key: K,
    value: FormValues[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleDay(day: number, checked: boolean) {
    setForm((current) => ({
      ...current,
      daysOfWeek: checked
        ? [...new Set([...current.daysOfWeek, day])]
        : current.daysOfWeek.filter((value) => value !== day),
    }));
  }

  async function handleUpload(file?: File) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t("errors.invalidImage"));
      return;
    }

    setUploading(true);

    try {
      const result = await radioShowService.uploadImage(radioId, file);
      const apiBase = process.env.NEXT_PUBLIC_API_URL;

      if (!apiBase) {
        throw new Error(t("errors.apiUrl"));
      }

      // Le backend renvoie un chemin relatif : coverImage exige une URL absolue.
      const absoluteUrl = new URL(
        result.data.imageUrl,
        apiBase,
      ).toString();

      updateField("coverImage", absoluteUrl);
      toast.success(t("messages.imageUploaded"));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("errors.upload"),
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (form.title.trim().length < 3) {
      setFormError(t("validation.titleMin"));
      return;
    }

    if (form.title.trim().length > 180) {
      setFormError(t("validation.titleMax"));
      return;
    }

    if (
      form.startTime &&
      form.endTime &&
      form.startTime === form.endTime
    ) {
      setFormError(t("validation.timesDifferent"));
      return;
    }

    if (
      form.coverImage &&
      !/^https?:\/\/.+/i.test(form.coverImage.trim())
    ) {
      setFormError(t("validation.imageUrl"));
      return;
    }

    setSaving(true);

    try {
      const payload = toPayload(form);

      if (editingShow) {
        await radioShowService.updateShow(
          radioId,
          editingShow.id,
          payload,
        );
        toast.success(t("messages.updated"));
      } else {
        await radioShowService.createShow(radioId, payload);
        toast.success(t("messages.created"));
        setPage(1);
      }

      setFormOpen(false);
      await loadShows();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("errors.save");
      setFormError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setActionLoading(true);

    try {
      await radioShowService.deleteShow(radioId, deleteTarget.id);
      toast.success(t("messages.deleted"));
      setDeleteTarget(null);
      await loadShows();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("errors.delete"),
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleStatusAction() {
    if (!statusTarget) return;

    setActionLoading(true);

    try {
      if (statusTarget.action === "publish") {
        await radioShowService.publishShow(
          radioId,
          statusTarget.show.id,
        );
        toast.success(t("messages.published"));
      } else {
        await radioShowService.archiveShow(
          radioId,
          statusTarget.show.id,
        );
        toast.success(t("messages.archived"));
      }

      setStatusTarget(null);
      await loadShows();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("errors.action"),
      );
    } finally {
      setActionLoading(false);
    }
  }

  function statusLabel(status: ShowStatus) {
    return t(`status.${status}`);
  }

  function statusVariant(
    status: ShowStatus,
  ): "default" | "secondary" | "outline" | "destructive" {
    if (status === "PUBLISHED") return "default";
    if (status === "ARCHIVED") return "outline";
    return "secondary";
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Radio className="size-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t("title")}
            </h1>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {t("description")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void loadShows()}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`} />
            {t("actions.refresh")}
          </Button>
          <Button type="button" onClick={openCreate}>
            <Plus className="mr-2 size-4" />
            {t("actions.create")}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("stats.total")}</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {t("stats.totalHint")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("stats.published")}</CardDescription>
            <CardTitle className="text-3xl">{stats.published}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {t("stats.publishedHint")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("stats.drafts")}</CardDescription>
            <CardTitle className="text-3xl">{stats.drafts}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {t("stats.draftsHint")}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("list.title")}</CardTitle>
          <CardDescription>{t("list.description")}</CardDescription>

          <div className="flex flex-col gap-3 pt-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                value={search}
                placeholder={t("search")}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value ?? "ALL");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder={t("filters.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t("filters.all")}</SelectItem>
                {STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {statusLabel(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <div
              role="alert"
              className="mb-4 flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm"
            >
              <p>{error}</p>
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void loadShows()}
                >
                  {t("actions.retry")}
                </Button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex min-h-48 items-center justify-center gap-2 text-muted-foreground">
              <LoaderCircle className="size-5 animate-spin" />
              {t("loading")}
            </div>
          ) : shows.length === 0 ? (
            <div className="flex min-h-52 flex-col items-center justify-center gap-3 text-center">
              <div className="rounded-full bg-muted p-4">
                <Radio className="size-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold">{t("empty.title")}</h3>
              <p className="max-w-md text-sm text-muted-foreground">
                {search || statusFilter !== "ALL"
                  ? t("empty.filtered")
                  : t("empty.description")}
              </p>
              {!search && statusFilter === "ALL" && (
                <Button type="button" onClick={openCreate}>
                  <Plus className="mr-2 size-4" />
                  {t("actions.create")}
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {shows.map((show) => (
                  <div
                    key={show.id}
                    className="rounded-xl border bg-card p-3"
                  >
                    <div className="flex gap-3">
                      {show.coverImage ? (
                        <img
                          src={show.coverImage}
                          alt=""
                          className="size-20 shrink-0 rounded-lg border object-cover"
                        />
                      ) : (
                        <div className="flex size-20 shrink-0 items-center justify-center rounded-lg bg-muted">
                          <Radio className="size-7 text-muted-foreground" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="break-words font-semibold">
                            {show.title}
                          </h3>
                          <Badge variant={statusVariant(show.status)}>
                            {statusLabel(show.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {show.hostName || t("fields.noHost")}
                        </p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock3 className="size-3.5" />
                          {show.startTime?.slice(0, 5) || "—"}
                          {" – "}
                          {show.endTime?.slice(0, 5) || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(show)}
                      >
                        <Pencil className="mr-1 size-3.5" />
                        {t("actions.edit")}
                      </Button>

                      {show.status !== "PUBLISHED" &&
                        show.status !== "ARCHIVED" && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() =>
                              setStatusTarget({ show, action: "publish" })
                            }
                          >
                            <Send className="mr-1 size-3.5" />
                            {t("actions.publish")}
                          </Button>
                        )}

                      {show.status !== "ARCHIVED" && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setStatusTarget({ show, action: "archive" })
                          }
                        >
                          <Archive className="mr-1 size-3.5" />
                          {t("actions.archive")}
                        </Button>
                      )}

                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteTarget(show)}
                      >
                        <Trash2 className="mr-1 size-3.5" />
                        {t("actions.delete")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("fields.show")}</TableHead>
                      <TableHead>{t("fields.host")}</TableHead>
                      <TableHead>{t("fields.schedule")}</TableHead>
                      <TableHead>{t("fields.status")}</TableHead>
                      <TableHead className="text-right">
                        {t("fields.actions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {shows.map((show) => (
                      <TableRow key={show.id}>
                        <TableCell>
                          <div className="flex min-w-52 items-center gap-3">
                            {show.coverImage ? (
                              <img
                                src={show.coverImage}
                                alt=""
                                className="size-12 rounded-md border object-cover"
                              />
                            ) : (
                              <div className="flex size-12 items-center justify-center rounded-md bg-muted">
                                <Radio className="size-5 text-muted-foreground" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="max-w-56 truncate font-medium">
                                {show.title}
                              </p>
                              <p className="max-w-56 truncate text-xs text-muted-foreground">
                                {show.slug}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          {show.hostName || t("fields.noHost")}
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <p className="flex items-center gap-1.5">
                              <Clock3 className="size-3.5 text-muted-foreground" />
                              {show.startTime?.slice(0, 5) || "—"}
                              {" – "}
                              {show.endTime?.slice(0, 5) || "—"}
                            </p>
                            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <CalendarDays className="size-3.5" />
                              {show.daysOfWeek.length
                                ? show.daysOfWeek
                                    .map((day) =>
                                      t(`days.short.${WEEKDAYS[day - 1].key}`),
                                    )
                                    .join(", ")
                                : t("fields.noSchedule")}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant={statusVariant(show.status)}>
                            {statusLabel(show.status)}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              title={t("actions.edit")}
                              aria-label={t("actions.edit")}
                              onClick={() => openEdit(show)}
                            >
                              <Pencil className="size-4" />
                            </Button>

                            {show.status === "DRAFT" && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                title={t("actions.publish")}
                                aria-label={t("actions.publish")}
                                onClick={() =>
                                  setStatusTarget({ show, action: "publish" })
                                }
                              >
                                <Send className="size-4" />
                              </Button>
                            )}

                            {show.status !== "ARCHIVED" && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                title={t("actions.archive")}
                                aria-label={t("actions.archive")}
                                onClick={() =>
                                  setStatusTarget({ show, action: "archive" })
                                }
                              >
                                <Archive className="size-4" />
                              </Button>
                            )}

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              title={t("actions.delete")}
                              aria-label={t("actions.delete")}
                              onClick={() => setDeleteTarget(show)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  {t("pagination.summary", {
                    total,
                    page,
                    totalPages,
                  })}
                </p>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((current) => current - 1)}
                  >
                    {t("pagination.previous")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
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

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingShow ? t("form.editTitle") : t("form.createTitle")}
            </DialogTitle>
            <DialogDescription>
              {editingShow
                ? t("form.editDescription")
                : t("form.createDescription")}
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-5" onSubmit={handleSave}>
            <div className="space-y-2">
              <label htmlFor="show-title" className="text-sm font-medium">
                {t("fields.title")} *
              </label>
              <Input
                id="show-title"
                value={form.title}
                minLength={3}
                maxLength={180}
                required
                onChange={(event) =>
                  updateField("title", event.target.value)
                }
                placeholder={t("placeholders.title")}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="show-host" className="text-sm font-medium">
                {t("fields.host")}
              </label>
              <Input
                id="show-host"
                maxLength={150}
                value={form.hostName}
                onChange={(event) =>
                  updateField("hostName", event.target.value)
                }
                placeholder={t("placeholders.host")}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="show-description" className="text-sm font-medium">
                {t("fields.description")}
              </label>
              <Textarea
                id="show-description"
                maxLength={10000}
                rows={5}
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                placeholder={t("placeholders.description")}
              />
              <p className="text-right text-xs text-muted-foreground">
                {form.description.length}/10000
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">
                {t("fields.coverImage")}
              </label>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {form.coverImage ? (
                  <img
                    src={form.coverImage}
                    alt={t("fields.coverPreview")}
                    className="size-24 rounded-lg border object-cover"
                  />
                ) : (
                  <div className="flex size-24 items-center justify-center rounded-lg border border-dashed bg-muted">
                    <ImagePlus className="size-7 text-muted-foreground" />
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploading}
                    onClick={() =>
                      document.getElementById("show-image-file")?.click()
                    }
                  >
                    {uploading ? (
                      <LoaderCircle className="mr-2 size-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 size-4" />
                    )}
                    {t("actions.uploadImage")}
                  </Button>

                  {form.coverImage && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => updateField("coverImage", "")}
                    >
                      {t("actions.removeImage")}
                    </Button>
                  )}
                </div>

                <input
                  id="show-image-file"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    void handleUpload(event.target.files?.[0]);
                    event.currentTarget.value = "";
                  }}
                />
              </div>

              <Input
                type="url"
                value={form.coverImage}
                onChange={(event) =>
                  updateField("coverImage", event.target.value)
                }
                placeholder="https://..."
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">
                {t("fields.days")}
              </label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {WEEKDAYS.map((day) => (
                  <label
                    key={day.value}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm transition-colors hover:bg-accent"
                  >
                    <Checkbox
                      checked={form.daysOfWeek.includes(day.value)}
                      onCheckedChange={(checked) =>
                        toggleDay(day.value, checked === true)
                      }
                    />
                    {t(`days.${day.key}`)}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="show-start" className="text-sm font-medium">
                  {t("fields.startTime")}
                </label>
                <Input
                  id="show-start"
                  type="time"
                  value={form.startTime}
                  onChange={(event) =>
                    updateField("startTime", event.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="show-end" className="text-sm font-medium">
                  {t("fields.endTime")}
                </label>
                <Input
                  id="show-end"
                  type="time"
                  value={form.endTime}
                  onChange={(event) =>
                    updateField("endTime", event.target.value)
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="show-timezone" className="text-sm font-medium">
                {t("fields.timezone")}
              </label>
              <Input
                id="show-timezone"
                maxLength={60}
                value={form.timezone}
                onChange={(event) =>
                  updateField("timezone", event.target.value)
                }
                placeholder="Africa/Douala"
              />
            </div>

            {formError && (
              <p
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
              >
                {formError}
              </p>
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
                disabled={saving || uploading}
              >
                {t("actions.cancel")}
              </Button>
              <Button type="submit" disabled={saving || uploading}>
                {saving && (
                  <LoaderCircle className="mr-2 size-4 animate-spin" />
                )}
                {saving
                  ? t("actions.saving")
                  : editingShow
                    ? t("actions.save")
                    : t("actions.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDialog.description", {
                title: deleteTarget?.title ?? "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>
              {t("actions.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={actionLoading}
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading && (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
              )}
              {t("actions.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(statusTarget)}
        onOpenChange={(open) => !open && setStatusTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusTarget?.action === "publish"
                ? t("publishDialog.title")
                : t("archiveDialog.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {statusTarget?.action === "publish"
                ? t("publishDialog.description", {
                    title: statusTarget.show.title,
                  })
                : t("archiveDialog.description", {
                    title: statusTarget?.show.title ?? "",
                  })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>
              {t("actions.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={actionLoading}
              onClick={(event) => {
                event.preventDefault();
                void handleStatusAction();
              }}
            >
              {actionLoading && (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
              )}
              {statusTarget?.action === "publish"
                ? t("actions.publish")
                : t("actions.archive")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
