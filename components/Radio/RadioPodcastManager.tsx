
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
    Archive,
    AudioLines,
    CheckCircle2,
    FileAudio,
    Loader2,
    Pencil,
    Play,
    Plus,
    Search,
    Trash2,
    Upload,
    X,
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
import { PodcastStatus, RadioPodcast, radioPodcastService } from "@/lib/RadioPodcast-api";

const PAGE_SIZE = 10;

type Props = {
    radioId: number;
};

type FormState = {
    title: string;
    slug: string;
    description: string;
    duration: string;
};

const EMPTY_FORM: FormState = {
    title: "",
    slug: "",
    description: "",
    duration: "",
};

function getMediaUrl(path: string | null | undefined) {
    if (!path) return "";

    if (/^https?:\/\//i.test(path)) return path;

    const base = process.env.NEXT_PUBLIC_API_URL;

    if (!base) return path;

    return new URL(
        path.startsWith("/") ? path : `/${path}`,
        base,
    ).toString();
}

export default function RadioPodcastManager({ radioId }: Props) {
    const t = useTranslations("RadioPodcasts");

    const audioInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const [items, setItems] = useState<RadioPodcast[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [actionId, setActionId] = useState<number | null>(null);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<RadioPodcast | null>(null);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [audioPreview, setAudioPreview] = useState("");
    const [imagePreview, setImagePreview] = useState("");

    const [deleteTarget, setDeleteTarget] = useState<RadioPodcast | null>(null);
    const [publishTarget, setPublishTarget] = useState<RadioPodcast | null>(null);
    const [archiveTarget, setArchiveTarget] = useState<RadioPodcast | null>(null);

    const loadPodcasts = useCallback(async () => {
        setLoading(true);

        try {
            const result = await radioPodcastService.getPodcasts(radioId, {
                page,
                limit: PAGE_SIZE,
                ...(statusFilter !== "ALL"
                    ? { status: statusFilter as PodcastStatus }
                    : {}),
            });

            setItems(result.data.items);
            setTotal(result.data.pagination.total);
            setTotalPages(Math.max(1, result.data.pagination.totalPages));
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : t("errors.load"),
            );
        } finally {
            setLoading(false);
        }
    }, [radioId, page, statusFilter, t]);

    useEffect(() => {
        void loadPodcasts();
    }, [loadPodcasts]);

    useEffect(() => {
        return () => {
            if (audioPreview.startsWith("blob:")) {
                URL.revokeObjectURL(audioPreview);
            }
            if (imagePreview.startsWith("blob:")) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [audioPreview, imagePreview]);

    const resetForm = () => {
        setForm(EMPTY_FORM);
        setEditing(null);
        setAudioFile(null);
        setImageFile(null);
        setAudioPreview("");
        setImagePreview("");

        if (audioInputRef.current) audioInputRef.current.value = "";
        if (imageInputRef.current) imageInputRef.current.value = "";
    };

    const openCreate = () => {
        resetForm();
        setDialogOpen(true);
    };

    const openEdit = (podcast: RadioPodcast) => {
        resetForm();
        setEditing(podcast);
        setForm({
            title: podcast.title,
            slug: podcast.slug,
            description: podcast.description ?? "",
            duration: podcast.duration?.toString() ?? "",
        });
        setAudioPreview(getMediaUrl(podcast.audioUrl));
        setImagePreview(getMediaUrl(podcast.coverImage));
        setDialogOpen(true);
    };

    const chooseAudio = (file?: File) => {
        if (!file) return;

        if (!file.type.startsWith("audio/")) {
            toast.error(t("errors.invalidAudio"));
            return;
        }

        setAudioFile(file);
        setAudioPreview(URL.createObjectURL(file));
    };

    const chooseImage = (file?: File) => {
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error(t("errors.invalidImage"));
            return;
        }

        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const savePodcast = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (form.title.trim().length < 3) {
            toast.error(t("errors.titleRequired"));
            return;
        }

        if (!editing && !audioFile) {
            toast.error(t("errors.audioRequired"));
            return;
        }

        setSaving(true);

        try {
            if (editing) {
                await radioPodcastService.updatePodcast(radioId, editing.id, {
                    title: form.title.trim(),
                    slug: form.slug.trim() || undefined,
                    description: form.description.trim() || null,
                    duration: form.duration ? Number(form.duration) : null,
                });

                // Remplacement des fichiers : voir la note backend ci-dessous.
                if (audioFile || imageFile) {
                    toast.warning(t("messages.filesNeedBackendSupport"));
                }

                toast.success(t("messages.updated"));
            } else {
                const payload = new FormData();

                payload.set("title", form.title.trim());

                if (form.slug.trim()) payload.set("slug", form.slug.trim());
                if (form.description.trim()) {
                    payload.set("description", form.description.trim());
                }
                if (form.duration) {
                    payload.set("duration", form.duration);
                }

                if (audioFile) payload.set("audio", audioFile);
                if (imageFile) payload.set("image", imageFile);

                await radioPodcastService.createPodcast(radioId, payload);
                toast.success(t("messages.created"));
            }

            setDialogOpen(false);
            resetForm();
            await loadPodcasts();
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : t("errors.save"),
            );
        } finally {
            setSaving(false);
        }
    };

    const runAction = async (
        podcast: RadioPodcast,
        action: "publish" | "archive" | "delete",
    ) => {
        setActionId(podcast.id);

        try {
            if (action === "publish") {
                await radioPodcastService.publishPodcast(radioId, podcast.id);
                toast.success(t("messages.published"));
            } else if (action === "archive") {
                await radioPodcastService.archivePodcast(radioId, podcast.id);
                toast.success(t("messages.archived"));
            } else {
                await radioPodcastService.deletePodcast(radioId, podcast.id);
                toast.success(t("messages.deleted"));
            }

            setDeleteTarget(null);
            setPublishTarget(null);
            setArchiveTarget(null);
            await loadPodcasts();
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : t("errors.action"),
            );
        } finally {
            setActionId(null);
        }
    };

    const filteredItems = items.filter((podcast) => {
        const query = search.trim().toLocaleLowerCase();

        return (
            !query ||
            podcast.title.toLocaleLowerCase().includes(query) ||
            podcast.slug.toLocaleLowerCase().includes(query)
        );
    });

    const statusLabel = (status: PodcastStatus) => {
        const labels: Record<PodcastStatus, string> = {
            DRAFT: t("status.draft"),
            PUBLISHED: t("status.published"),
            ARCHIVED: t("status.archived"),
        };

        return labels[status];
    };

    const statusVariant = (status: PodcastStatus) => {
        if (status === "PUBLISHED") return "default";
        if (status === "ARCHIVED") return "secondary";
        return "outline";
    };

    return (
        <section className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <AudioLines className="size-6 text-primary" />
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            {t("title")}
                        </h1>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {t("description")}
                    </p>
                </div>

                <Button onClick={openCreate} className="w-full sm:w-auto">
                    <Plus className="mr-2 size-4" />
                    {t("actions.create")}
                </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>{t("stats.total")}</CardDescription>
                        <CardTitle className="text-3xl">{total}</CardTitle>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>{t("stats.currentPage")}</CardDescription>
                        <CardTitle className="text-3xl">
                            {items.length} / {PAGE_SIZE}
                        </CardTitle>
                    </CardHeader>
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
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder={t("list.search")}
                                className="pl-9"
                            />
                        </div>

                        <Select
                            value={statusFilter}
                            onValueChange={(value) => {
                                setStatusFilter(value ?? "ALL");
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder={t("list.filter")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">{t("status.all")}</SelectItem>
                                <SelectItem value="DRAFT">{t("status.draft")}</SelectItem>
                                <SelectItem value="PUBLISHED">
                                    {t("status.published")}
                                </SelectItem>
                                <SelectItem value="ARCHIVED">
                                    {t("status.archived")}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>

                <CardContent>
                    {loading ? (
                        <div className="flex min-h-40 items-center justify-center">
                            <Loader2 className="size-7 animate-spin text-primary" />
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
                            <FileAudio className="size-10 text-muted-foreground" />
                            <p className="font-medium">{t("list.empty")}</p>
                            <p className="text-sm text-muted-foreground">
                                {t("list.emptyDescription")}
                            </p>
                            <Button variant="outline" onClick={openCreate}>
                                <Plus className="mr-2 size-4" />
                                {t("actions.create")}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredItems.map((podcast) => (
                                <article
                                    key={podcast.id}
                                    className="flex flex-col gap-4 rounded-xl border p-4 md:flex-row md:items-center"
                                >
                                    <div className="flex min-w-0 flex-1 items-start gap-3">
                                        {podcast.coverImage ? (
                                            <img
                                                src={getMediaUrl(podcast.coverImage)}
                                                alt=""
                                                className="size-16 shrink-0 rounded-lg border object-cover"
                                            />
                                        ) : (
                                            <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-muted">
                                                <AudioLines className="size-7 text-muted-foreground" />
                                            </div>
                                        )}

                                        <div className="min-w-0 flex-1 space-y-1">
                                            <h3 className="truncate font-semibold">
                                                {podcast.title}
                                            </h3>
                                            <p className="line-clamp-2 text-sm text-muted-foreground">
                                                {podcast.description || t("list.noDescription")}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                                <Badge variant={statusVariant(podcast.status)}>
                                                    {statusLabel(podcast.status)}
                                                </Badge>
                                                {podcast.duration != null && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {podcast.duration} {t("fields.durationUnit")}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {podcast.audioUrl && (
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                aria-label={t("actions.play")}
                                                title={t("actions.play")}
                                                onClick={() => {
                                                    window.open(
                                                        getMediaUrl(podcast.audioUrl),
                                                        "_blank",
                                                        "noopener,noreferrer",
                                                    );
                                                }}
                                            >
                                                <Play className="size-4" />
                                            </Button>
                                        )}

                                        <Button
                                            size="icon"
                                            variant="outline"
                                            aria-label={t("actions.edit")}
                                            title={t("actions.edit")}
                                            onClick={() => openEdit(podcast)}
                                        >
                                            <Pencil className="size-4" />
                                        </Button>

                                        {podcast.status === "DRAFT" && (
                                            <Button
                                                size="sm"
                                                onClick={() => setPublishTarget(podcast)}
                                            >
                                                <CheckCircle2 className="mr-1 size-4" />
                                                {t("actions.publish")}
                                            </Button>
                                        )}

                                        {podcast.status !== "ARCHIVED" && (
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                aria-label={t("actions.archive")}
                                                title={t("actions.archive")}
                                                onClick={() => setArchiveTarget(podcast)}
                                            >
                                                <Archive className="size-4" />
                                            </Button>
                                        )}

                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            aria-label={t("actions.delete")}
                                            title={t("actions.delete")}
                                            onClick={() => setDeleteTarget(podcast)}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}

                    <div className="mt-6 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-muted-foreground">
                            {t("pagination.page", {
                                page,
                                totalPages,
                            })}
                        </p>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                disabled={page <= 1 || loading}
                                onClick={() => setPage((value) => value - 1)}
                            >
                                {t("pagination.previous")}
                            </Button>
                            <Button
                                variant="outline"
                                disabled={page >= totalPages || loading}
                                onClick={() => setPage((value) => value + 1)}
                            >
                                {t("pagination.next")}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog
                open={dialogOpen}
                onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) resetForm();
                }}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? t("form.editTitle") : t("form.createTitle")}
                        </DialogTitle>
                        <DialogDescription>
                            {t("form.description")}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={savePodcast} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="podcast-title">
                                {t("fields.title")}
                            </label>
                            <Input
                                id="podcast-title"
                                value={form.title}
                                onChange={(event) =>
                                    setForm((value) => ({ ...value, title: event.target.value }))
                                }
                                minLength={3}
                                maxLength={180}
                                required
                            />
                        </div>
                        {editing &&
                            <div className="space-y-2">
                                <label className="text-sm font-medium" htmlFor="podcast-slug">
                                    {t("fields.slug")}
                                </label>
                                <Input
                                    id="podcast-slug"
                                    value={form.slug}
                                    onChange={(event) =>
                                        setForm((value) => ({ ...value, slug: event.target.value }))
                                    }
                                    maxLength={200}
                                    placeholder={t("fields.slugPlaceholder")}
                                />
                            </div>}

                        <div className="space-y-2">
                            <label
                                className="text-sm font-medium"
                                htmlFor="podcast-description"
                            >
                                {t("fields.description")}
                            </label>
                            <Textarea
                                id="podcast-description"
                                value={form.description}
                                onChange={(event) =>
                                    setForm((value) => ({
                                        ...value,
                                        description: event.target.value,
                                    }))
                                }
                                rows={4}
                                maxLength={10000}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="podcast-duration">
                                {t("fields.duration")}
                            </label>
                            <Input
                                id="podcast-duration"
                                type="number"
                                min={1}
                                step={1}
                                value={form.duration}
                                onChange={(event) =>
                                    setForm((value) => ({
                                        ...value,
                                        duration: event.target.value,
                                    }))
                                }
                                placeholder={t("fields.durationPlaceholder")}
                            />
                        </div>

                        <div className="space-y-2">
                            <span className="text-sm font-medium">{t("fields.audio")}</span>
                            <input
                                ref={audioInputRef}
                                type="file"
                                accept="audio/*"
                                className="sr-only"
                                onChange={(event) => chooseAudio(event.target.files?.[0])}
                            />

                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => audioInputRef.current?.click()}
                                >
                                    <Upload className="mr-2 size-4" />
                                    {t("actions.chooseAudio")}
                                </Button>
                                {audioFile && (
                                    <span className="max-w-full truncate text-sm text-muted-foreground">
                                        {audioFile.name}
                                    </span>
                                )}
                                {audioFile && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        aria-label={t("actions.removeAudio")}
                                        onClick={() => {
                                            setAudioFile(null);
                                            setAudioPreview(
                                                editing ? getMediaUrl(editing.audioUrl) : "",
                                            );
                                            if (audioInputRef.current) {
                                                audioInputRef.current.value = "";
                                            }
                                        }}
                                    >
                                        <X className="size-4" />
                                    </Button>
                                )}
                            </div>

                            {audioPreview && (
                                <audio
                                    controls
                                    preload="metadata"
                                    src={audioPreview}
                                    className="w-full"
                                />
                            )}

                            {!editing && (
                                <p className="text-xs text-muted-foreground">
                                    {t("form.audioRequired")}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <span className="text-sm font-medium">
                                {t("fields.coverImage")}
                            </span>
                            <input
                                ref={imageInputRef}
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={(event) => chooseImage(event.target.files?.[0])}
                            />

                            <div className="flex flex-wrap items-center gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => imageInputRef.current?.click()}
                                >
                                    <Upload className="mr-2 size-4" />
                                    {t("actions.chooseImage")}
                                </Button>
                                {imageFile && (
                                    <span className="max-w-full truncate text-sm text-muted-foreground">
                                        {imageFile.name}
                                    </span>
                                )}
                            </div>

                            {imagePreview && (
                                <img
                                    src={imagePreview}
                                    alt={t("fields.coverPreview")}
                                    className="mt-2 aspect-video max-h-56 rounded-lg border object-cover"
                                />
                            )}

                            <p className="text-xs text-muted-foreground">
                                {t("form.coverRequiredForPublish")}
                            </p>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={saving}
                                onClick={() => setDialogOpen(false)}
                            >
                                {t("actions.cancel")}
                            </Button>
                            <Button type="submit" disabled={saving}>
                                {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
                                {editing ? t("actions.save") : t("actions.create")}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog
                open={Boolean(publishTarget)}
                onOpenChange={(open) => !open && setPublishTarget(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("confirm.publishTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("confirm.publishDescription", {
                                title: publishTarget?.title ?? "",
                            })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("actions.cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={actionId !== null}
                            onClick={() => {
                                if (publishTarget) {
                                    void runAction(publishTarget, "publish");
                                }
                            }}
                        >
                            {actionId === publishTarget?.id && (
                                <Loader2 className="mr-2 size-4 animate-spin" />
                            )}
                            {t("actions.publish")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={Boolean(archiveTarget)}
                onOpenChange={(open) => !open && setArchiveTarget(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("confirm.archiveTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("confirm.archiveDescription", {
                                title: archiveTarget?.title ?? "",
                            })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("actions.cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={actionId !== null}
                            onClick={() => {
                                if (archiveTarget) {
                                    void runAction(archiveTarget, "archive");
                                }
                            }}
                        >
                            {t("actions.archive")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={Boolean(deleteTarget)}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("confirm.deleteTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("confirm.deleteDescription", {
                                title: deleteTarget?.title ?? "",
                            })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("actions.cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={actionId !== null}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => {
                                if (deleteTarget) {
                                    void runAction(deleteTarget, "delete");
                                }
                            }}
                        >
                            {t("actions.delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </section>
    );
}
