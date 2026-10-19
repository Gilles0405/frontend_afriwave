
"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
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
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  FolderOpen,
  LoaderCircle,
} from "lucide-react";
import { CategoryStatus, RadioCategory, radioCategoryService } from "@/lib/Categoryservice-api";

type Props = {
  radioId: number;
};

type FormValues = {
  name: string;
  description: string;
  status: CategoryStatus;
};

const initialForm: FormValues = {
  name: "",
  description: "",
  status: "ACTIVE",
};

export default function RadioCategoryManager({ radioId }: Props) {
  const t = useTranslations("RadioCategories");

  const [categories, setCategories] = useState<RadioCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<RadioCategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] =
    useState<RadioCategory | null>(null);
  const [form, setForm] = useState<FormValues>(initialForm);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadCategories = useCallback(async () => {
    setLoading(true);

    try {
      const result = await radioCategoryService.getCategories(radioId);
      setCategories(result);
    } catch (err) {
      console.error("[RadioCategoryManager]", err);
      toast.error(t("errors.load"));
    } finally {
      setLoading(false);
    }
  }, [radioId, t]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const openCreateDialog = () => {
    setSelected(null);
    setForm(initialForm);
    setError("");
    setDialogOpen(true);
  };

  const openEditDialog = (category: RadioCategory) => {
    setSelected(category);
    setForm({
      name: category.name,
      description: category.description ?? "",
      status: category.status,
    });
    setError("");
    setDialogOpen(true);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const name = form.name.trim();
    const description = form.description.trim();

    if (name.length < 2) {
      setError(t("validation.nameMin"));
      return;
    }

    if (name.length > 100) {
      setError(t("validation.nameMax"));
      return;
    }

    if (description.length > 1000) {
      setError(t("validation.descriptionMax"));
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name,
        description: description || null,
        status: form.status,
      };

      if (selected) {
        await radioCategoryService.updateCategory(
          radioId,
          selected.id,
          payload,
        );
        toast.success(t("messages.updated"));
      } else {
        await radioCategoryService.createCategory(radioId, payload);
        toast.success(t("messages.created"));
      }

      setDialogOpen(false);
      setSelected(null);
      setForm(initialForm);
      await loadCategories();
    } catch (err) {
      console.error("[RadioCategoryManager save]", err);
      setError(t("errors.save"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    setDeleting(true);

    try {
      await radioCategoryService.deleteCategory(
        radioId,
        categoryToDelete.id,
      );

      toast.success(t("messages.deleted"));
      setDeleteOpen(false);
      setCategoryToDelete(null);
      await loadCategories();
    } catch (err) {
      console.error("[RadioCategoryManager delete]", err);
      toast.error(t("errors.delete"));
    } finally {
      setDeleting(false);
    }
  };

  const filteredCategories = categories.filter((category) => {
    const searchValue = search.trim().toLocaleLowerCase();

    const matchesSearch =
      !searchValue ||
      category.name.toLocaleLowerCase().includes(searchValue) ||
      category.slug.toLocaleLowerCase().includes(searchValue) ||
      (category.description ?? "")
        .toLocaleLowerCase()
        .includes(searchValue);

    const matchesStatus =
      statusFilter === "ALL" || category.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("description")}
          </p>
        </div>

        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 size-4" />
          {t("actions.create")}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("stats.total")}</CardDescription>
            <CardTitle className="text-3xl">
              {categories.length}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("stats.active")}</CardDescription>
            <CardTitle className="text-3xl">
              {categories.filter((item) => item.status === "ACTIVE").length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("search")}
              aria-label={t("search")}
              className="sm:max-w-sm"
            />

            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value ?? "ALL")}
            >
              <SelectTrigger className="sm:w-48">
                <SelectValue placeholder={t("filters.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t("filters.all")}</SelectItem>
                <SelectItem value="ACTIVE">{t("status.ACTIVE")}</SelectItem>
                <SelectItem value="INACTIVE">
                  {t("status.INACTIVE")}
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => void loadCategories()}
              disabled={loading}
              aria-label={t("actions.refresh")}
            >
              <RefreshCw
                className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`}
              />
              {t("actions.refresh")}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <LoaderCircle className="size-5 animate-spin" />
              {t("loading")}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <FolderOpen className="size-10 text-muted-foreground" />
              <p className="font-medium">{t("empty.title")}</p>
              <p className="text-sm text-muted-foreground">
                {categories.length === 0
                  ? t("empty.description")
                  : t("empty.search")}
              </p>

              {categories.length === 0 && (
                <Button onClick={openCreateDialog} variant="outline">
                  <Plus className="mr-2 size-4" />
                  {t("actions.create")}
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("fields.name")}</TableHead>
                    <TableHead>{t("fields.slug")}</TableHead>
                    <TableHead>{t("fields.status")}</TableHead>
                    <TableHead className="text-right">
                      {t("fields.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="min-w-48">
                        <div className="font-medium">{category.name}</div>
                        {category.description && (
                          <p className="mt-1 max-w-sm truncate text-sm text-muted-foreground">
                            {category.description}
                          </p>
                        )}
                      </TableCell>

                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {category.slug}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            category.status === "ACTIVE"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {t(`status.${category.status}`)}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => openEditDialog(category)}
                            aria-label={t("actions.edit")}
                            title={t("actions.edit")}
                          >
                            <Pencil className="size-4" />
                          </Button>

                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => {
                              setCategoryToDelete(category);
                              setDeleteOpen(true);
                            }}
                            aria-label={t("actions.delete")}
                            title={t("actions.delete")}
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
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selected ? t("dialog.editTitle") : t("dialog.createTitle")}
            </DialogTitle>
            <DialogDescription>
              {selected
                ? t("dialog.editDescription")
                : t("dialog.createDescription")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="category-name" className="text-sm font-medium">
                {t("fields.name")}
              </label>
              <Input
                id="category-name"
                value={form.name}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    name: event.target.value,
                  }))
                }
                placeholder={t("placeholders.name")}
                maxLength={100}
                required
              />
              <p className="text-xs text-muted-foreground">
                {form.name.length}/100
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="category-description"
                className="text-sm font-medium"
              >
                {t("fields.description")}
              </label>
              <Textarea
                id="category-description"
                value={form.description}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    description: event.target.value,
                  }))
                }
                placeholder={t("placeholders.description")}
                maxLength={1000}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                {form.description.length}/1000
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("fields.status")}
              </label>
              <Select
                value={form.status}
                onValueChange={(value: CategoryStatus | null) => {
                  if (value !== null) {
                    setForm((previous) => ({ ...previous, status: value }));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">
                    {t("status.ACTIVE")}
                  </SelectItem>
                  <SelectItem value="INACTIVE">
                    {t("status.INACTIVE")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                {t("actions.cancel")}
              </Button>

              <Button type="submit" disabled={saving}>
                {saving && (
                  <LoaderCircle className="mr-2 size-4 animate-spin" />
                )}
                {saving
                  ? t("actions.saving")
                  : selected
                    ? t("actions.save")
                    : t("actions.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("deleteDialog.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDialog.description", {
                name: categoryToDelete?.name ?? "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              {t("actions.cancel")}
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={deleting}
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting && (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
              )}
              {deleting ? t("actions.deleting") : t("actions.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
