
// "use client";

// import { useCallback, useEffect, useState } from "react";
// import { useLocale, useTranslations } from "next-intl";
// import { useRouter } from "@/i18n/navigation";

// import {
//     ApiError,
//     radioArticleService,
//     type RadioArticle,
// } from "@/lib/article-api";

// import {
//     AlertDialog,
//     AlertDialogAction,
//     AlertDialogCancel,
//     AlertDialogContent,
//     AlertDialogDescription,
//     AlertDialogFooter,
//     AlertDialogHeader,
//     AlertDialogTitle,
//     AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";

// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import {
//     Card,
//     CardContent,
//     CardHeader,
//     CardTitle,
// } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import { Skeleton } from "@/components/ui/skeleton";

// interface ArticleDetailsProps {
//     radioId: number;
//     articleId: number;
// }

// type Feedback = {
//     type: "success" | "error";
//     message: string;
// } | null;

// const statusVariants: Record<
//     RadioArticle["status"],
//     "default" | "secondary" | "outline" | "destructive"
// > = {
//     DRAFT: "secondary",
//     PENDING_REVIEW: "outline",
//     PUBLISHED: "default",
//     ARCHIVED: "destructive",
// };

// export default function ArticleDetails({
//     radioId,
//     articleId,
// }: ArticleDetailsProps) {
//     const t = useTranslations("ArticleDetails");
//     const locale = useLocale();
//     const router = useRouter();

//     const [article, setArticle] = useState<RadioArticle | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [publishing, setPublishing] = useState(false);
//     const [archiving, setArchiving] = useState(false);
//     const [deleting, setDeleting] = useState(false);
//     const [error, setError] = useState("");
//     const [feedback, setFeedback] = useState<Feedback>(null);
//     const [deleted, setDeleted] = useState(false);

//     const busy = publishing || archiving || deleting;

//     const loadArticle = useCallback(async () => {
//         setLoading(true);
//         setError("");

//         try {
//             const response = await radioArticleService.getArticleById(
//                 radioId,
//                 articleId,
//             );

//             setArticle(response.data);
//         } catch (err) {
//             setArticle(null);
//             setError(
//                 err instanceof ApiError ? err.message : t("errors.load"),
//             );
//         } finally {
//             setLoading(false);
//         }
//     }, [radioId, articleId, t]);

//     // Un seul chargement pour éviter les requêtes en double.
//     useEffect(() => {
//         void loadArticle();
//     }, [loadArticle]);

//     const formatDate = (value?: string | null) => {
//         if (!value) return "—";

//         const date = new Date(value);

//         if (Number.isNaN(date.getTime())) return "—";

//         return new Intl.DateTimeFormat(locale, {
//             dateStyle: "medium",
//             timeStyle: "short",
//         }).format(date);
//     };

//     const handlePublish = async () => {
//         if (!article || busy || article.status === "ARCHIVED") return;

//         setPublishing(true);
//         setError("");
//         setFeedback(null);

//         try {
//             const response = await radioArticleService.publishArticle(
//                 radioId,
//                 articleId,
//             );

//             if (response.data) {
//                 setArticle(response.data);
//             } else {
//                 await loadArticle();
//             }

//             setFeedback({
//                 type: "success",
//                 message: t("actions.publishSuccess"),
//             });
//         } catch (err) {
//             setFeedback({
//                 type: "error",
//                 message:
//                     err instanceof ApiError
//                         ? err.message
//                         : t("errors.publish"),
//             });
//         } finally {
//             setPublishing(false);
//         }
//     };

//     const handleArchive = async () => {
//         if (!article || busy || article.status === "ARCHIVED") return;

//         setArchiving(true);
//         setError("");
//         setFeedback(null);

//         try {
//             const response = await radioArticleService.archiveArticle(
//                 radioId,
//                 articleId,
//             );

//             if (response.data) {
//                 setArticle(response.data);
//             } else {
//                 await loadArticle();
//             }

//             setFeedback({
//                 type: "success",
//                 message: t("actions.archiveSuccess"),
//             });
//         } catch (err) {
//             setFeedback({
//                 type: "error",
//                 message:
//                     err instanceof ApiError
//                         ? err.message
//                         : t("errors.archive"),
//             });
//         } finally {
//             setArchiving(false);
//         }
//     };

//     const handleDelete = async () => {
//         if (!article || busy) return;

//         setDeleting(true);
//         setError("");
//         setFeedback(null);

//         try {
//             await radioArticleService.deleteArticle(radioId, articleId);
//             setDeleted(true);
//         } catch (err) {
//             setFeedback({
//                 type: "error",
//                 message:
//                     err instanceof ApiError
//                         ? err.message
//                         : t("errors.delete"),
//             });
//         } finally {
//             setDeleting(false);
//         }
//     };

//     if (loading) {
//         return (
//             <div className="mx-auto w-full max-w-4xl space-y-4">
//                 <Skeleton className="h-10 w-2/3" />
//                 <Skeleton className="h-64 w-full rounded-xl" />
//                 <Skeleton className="h-40 w-full rounded-xl" />
//             </div>
//         );
//     }

//     if (deleted) {
//         return (
//             <Card>
//                 <CardContent className="space-y-4 p-6">
//                     <p role="status" className="text-sm text-green-700">
//                         {t("actions.deleteSuccess")}
//                     </p>

//                     <Button variant="outline" onClick={() => router.back()}>
//                         {t("actions.back")}
//                     </Button>
//                 </CardContent>
//             </Card>
//         );
//     }

//     if (error || !article) {
//         return (
//             <Card>
//                 <CardContent className="space-y-4 p-6">
//                     <p role="alert" className="text-sm text-destructive">
//                         {error || t("errors.notFound")}
//                     </p>

//                     <div className="flex flex-wrap gap-2">
//                         <Button
//                             onClick={() => void loadArticle()}
//                             variant="outline"
//                         >
//                             {t("actions.retry")}
//                         </Button>

//                         <Button variant="ghost" onClick={() => router.back()}>
//                             {t("actions.back")}
//                         </Button>
//                     </div>
//                 </CardContent>
//             </Card>
//         );
//     }

//     const canPublish =
//         article.status === "DRAFT" ||
//         article.status === "PENDING_REVIEW";

//     const canArchive = article.status !== "ARCHIVED";

//     return (
//         <div className="mx-auto w-full max-w-4xl space-y-6">
//             {feedback && (
//                 <div
//                     role={feedback.type === "error" ? "alert" : "status"}
//                     className={
//                         feedback.type === "error"
//                             ? "rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
//                             : "rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300"
//                     }
//                 >
//                     {feedback.message}
//                 </div>
//             )}

//             <Card>
//                 <CardHeader className="space-y-4">
//                     <div className="flex flex-wrap items-center justify-between gap-3">
//                         <div className="flex flex-wrap items-center gap-2">
//                             <Badge variant={statusVariants[article.status]}>
//                                 {t(`statuses.${article.status}`)}
//                             </Badge>

//                             {article.categoryId != null && (
//                                 <Badge variant="outline">
//                                     {t("fields.category")} #{article.categoryId}
//                                 </Badge>
//                             )}
//                         </div>

//                         <span className="text-xs text-muted-foreground">
//                             {t("fields.articleId")}: {article.id}
//                         </span>
//                     </div>

//                     <CardTitle className="break-words text-2xl font-bold tracking-tight sm:text-3xl">
//                         {article.title}
//                     </CardTitle>

//                     {article.excerpt && (
//                         <p className="text-muted-foreground">
//                             {article.excerpt}
//                         </p>
//                     )}

//                     <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
//                         <span>
//                             {t("fields.createdAt")}:{" "}
//                             {formatDate(article.createdAt)}
//                         </span>

//                         {article.publishedAt && (
//                             <span>
//                                 {t("fields.publishedAt")}:{" "}
//                                 {formatDate(article.publishedAt)}
//                             </span>
//                         )}
//                     </div>
//                 </CardHeader>

//                 <Separator />

//                 <CardContent className="space-y-6 p-5 sm:p-6">
//                     {article.featuredImage && (
//                         <div className="overflow-hidden rounded-xl border bg-muted">
//                             {/* eslint-disable-next-line @next/next/no-img-element */}
//                             <img
//                                 src={article.featuredImage}
//                                 alt={article.title}
//                                 className="max-h-[480px] w-full object-cover"
//                             />
//                         </div>
//                     )}

//                     <section className="space-y-3">
//                         <h2 className="text-lg font-semibold">
//                             {t("sections.content")}
//                         </h2>

//                         <div className="whitespace-pre-wrap break-words leading-8">
//                             {article.content}
//                         </div>
//                     </section>

//                     <Separator />

//                     <section className="space-y-4">
//                         <h2 className="text-lg font-semibold">
//                             {t("sections.seo")}
//                         </h2>

//                         <div>
//                             <p className="text-sm font-medium">
//                                 {t("fields.seoTitle")}
//                             </p>
//                             <p className="mt-1 break-words text-sm text-muted-foreground">
//                                 {article.seoTitle || "—"}
//                             </p>
//                         </div>

//                         <div>
//                             <p className="text-sm font-medium">
//                                 {t("fields.seoDescription")}
//                             </p>
//                             <p className="mt-1 break-words text-sm text-muted-foreground">
//                                 {article.seoDescription || "—"}
//                             </p>
//                         </div>
//                     </section>

//                     <Separator />

//                     <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
//                         <Button
//                             variant="outline"
//                             onClick={() => router.back()}
//                             disabled={busy}
//                         >
//                             {t("actions.back")}
//                         </Button>

//                         <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
//                             {canPublish && (
//                                 <Button
//                                     onClick={() => void handlePublish()}
//                                     disabled={busy}
//                                     className="bg-[#087C3C] text-white hover:bg-[#066631]"
//                                 >
//                                     {publishing
//                                         ? t("actions.publishing")
//                                         : t("actions.publish")}
//                                 </Button>
//                             )}

//                             {canArchive && (
//                                 <AlertDialog>
//                                     <AlertDialogTrigger
//                                         disabled={busy}
//                                         className="inline-flex h-10 items-center justify-center rounded-md border border-amber-600 px-4 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-50 disabled:pointer-events-none disabled:opacity-50 dark:text-amber-400 dark:hover:bg-amber-950/30"
//                                     >
//                                         {archiving
//                                             ? t("actions.archiving")
//                                             : t("actions.archive")}
//                                     </AlertDialogTrigger>

//                                     <AlertDialogContent>
//                                         <AlertDialogHeader>
//                                             <AlertDialogTitle>
//                                                 {t("archiveDialog.title")}
//                                             </AlertDialogTitle>

//                                             <AlertDialogDescription>
//                                                 {t("archiveDialog.description", {
//                                                     title: article.title,
//                                                 })}
//                                             </AlertDialogDescription>
//                                         </AlertDialogHeader>

//                                         <AlertDialogFooter>
//                                             <AlertDialogCancel disabled={busy}>
//                                                 {t("actions.cancel")}
//                                             </AlertDialogCancel>

//                                             <AlertDialogAction
//                                                 disabled={busy}
//                                                 onClick={(event) => {
//                                                     event.preventDefault();
//                                                     void handleArchive();
//                                                 }}
//                                                 className="bg-amber-600 text-white hover:bg-amber-700"
//                                             >
//                                                 {archiving
//                                                     ? t("actions.archiving")
//                                                     : t("actions.confirmArchive")}
//                                             </AlertDialogAction>
//                                         </AlertDialogFooter>
//                                     </AlertDialogContent>
//                                 </AlertDialog>
//                             )}

//                             <AlertDialog>
//                                 <AlertDialogTrigger
//                                     disabled={busy}
//                                     className="inline-flex h-10 items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-destructive/90 disabled:pointer-events-none disabled:opacity-50"
//                                 >
//                                     {deleting
//                                         ? t("actions.deleting")
//                                         : t("actions.delete")}
//                                 </AlertDialogTrigger>

//                                 <AlertDialogContent>
//                                     <AlertDialogHeader>
//                                         <AlertDialogTitle>
//                                             {t("deleteDialog.title")}
//                                         </AlertDialogTitle>

//                                         <AlertDialogDescription>
//                                             {t("deleteDialog.description", {
//                                                 title: article.title,
//                                             })}
//                                         </AlertDialogDescription>
//                                     </AlertDialogHeader>

//                                     <AlertDialogFooter>
//                                         <AlertDialogCancel disabled={busy}>
//                                             {t("actions.cancel")}
//                                         </AlertDialogCancel>

//                                         <AlertDialogAction
//                                             disabled={busy}
//                                             onClick={(event) => {
//                                                 event.preventDefault();
//                                                 void handleDelete();
//                                             }}
//                                             className="bg-destructive text-white hover:bg-destructive/90"
//                                         >
//                                             {deleting
//                                                 ? t("actions.deleting")
//                                                 : t("actions.confirmDelete")}
//                                         </AlertDialogAction>
//                                     </AlertDialogFooter>
//                                 </AlertDialogContent>
//                             </AlertDialog>
//                         </div>
//                     </div>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// }



"use client";

import {
    useCallback,
    useEffect,
    useState,
    type ChangeEvent,
    type FormEvent,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

import {
    ApiError,
    radioArticleService,
    type RadioArticle,
} from "@/lib/article-api";
import { radioCategoryService } from "@/lib/Categoryservice";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

interface ArticleDetailsProps {
    radioId: number;
    articleId: number;
}

interface RadioCategory {
    id: number;
    radioId: number;
    name: string;
    slug: string;
    description?: string | null;
    status: "ACTIVE" | "INACTIVE";
}

type Feedback = {
    type: "success" | "error";
    message: string;
} | null;

type ArticleEditForm = {
    title: string;
    excerpt: string;
    content: string;
    categoryId: string;
    seoTitle: string;
    seoDescription: string;
};

const statusVariants: Record<
    RadioArticle["status"],
    "default" | "secondary" | "outline" | "destructive"
> = {
    DRAFT: "secondary",
    PENDING_REVIEW: "outline",
    PUBLISHED: "default",
    ARCHIVED: "destructive",
};

const initialForm: ArticleEditForm = {
    title: "",
    excerpt: "",
    content: "",
    categoryId: "",
    seoTitle: "",
    seoDescription: "",
};

const inputClass =
    "mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-[#F47B16]";

const labelClass = "block text-sm font-medium";

export default function ArticleDetails({
    radioId,
    articleId,
}: ArticleDetailsProps) {
    const t = useTranslations("ArticleDetails");
    const locale = useLocale();
    const router = useRouter();

    const [article, setArticle] = useState<RadioArticle | null>(null);
    const [loading, setLoading] = useState(true);
    const [publishing, setPublishing] = useState(false);
    const [archiving, setArchiving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [updating, setUpdating] = useState(false);

    const [editOpen, setEditOpen] = useState(false);
    const [editForm, setEditForm] =
        useState<ArticleEditForm>(initialForm);

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState("");
    const [uploadingImage, setUploadingImage] = useState(false);

    const [categories, setCategories] = useState<RadioCategory[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [categoryError, setCategoryError] = useState("");

    const [error, setError] = useState("");
    const [feedback, setFeedback] = useState<Feedback>(null);
    const [editError, setEditError] = useState("");
    const [editSuccess, setEditSuccess] = useState("");
    const [deleted, setDeleted] = useState(false);

    const busy = publishing || archiving || deleting || updating;

    const loadArticle = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await radioArticleService.getArticleById(
                radioId,
                articleId,
            );

            setArticle(response.data);
        } catch (err) {
            setArticle(null);
            setError(
                err instanceof ApiError ? err.message : t("errors.load"),
            );
        } finally {
            setLoading(false);
        }
    }, [radioId, articleId, t]);

    const loadCategories = useCallback(async () => {
        setLoadingCategories(true);
        setCategoryError("");

        try {
            const response = await radioCategoryService.getCategories(
                radioId,
            );

            const activeCategories = (
                response.data ?? []
            ).filter(
                (category: RadioCategory) =>
                    category.status === "ACTIVE",
            );

            setCategories(activeCategories);
        } catch (err) {
            setCategoryError(
                err instanceof ApiError
                    ? err.message
                    : t("errors.categories"),
            );
        } finally {
            setLoadingCategories(false);
        }
    }, [radioId, t]);

    useEffect(() => {
        void loadArticle();
    }, [loadArticle]);

    const formatDate = (value?: string | null) => {
        if (!value) return "—";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) return "—";

        return new Intl.DateTimeFormat(locale, {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(date);
    };

    const openEditDialog = () => {
        if (!article || busy) return;

        setEditForm({
            title: article.title ?? "",
            excerpt: article.excerpt ?? "",
            content: article.content ?? "",
            categoryId:
                article.categoryId != null
                    ? String(article.categoryId)
                    : "",
            seoTitle: article.seoTitle ?? "",
            seoDescription: article.seoDescription ?? "",
        });

        setImageUrl(article.featuredImage ?? "");
        setImageFile(null);
        setEditError("");
        setEditSuccess("");
        setFeedback(null);
        setEditOpen(true);

        void loadCategories();
    };

    const handleImageChange = (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];

        setEditError("");
        setEditSuccess("");

        if (!file) {
            setImageFile(null);
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            setEditError(t("validation.imageFormat"));
            event.target.value = "";
            setImageFile(null);
            return;
        }

        const maxSize = 5 * 1024 * 1024;

        if (file.size > maxSize) {
            setEditError(t("validation.imageSize"));
            event.target.value = "";
            setImageFile(null);
            return;
        }

        setImageFile(file);
    };

    const handleImageUpload = async () => {
        if (!imageFile) {
            setEditError(t("validation.selectImage"));
            return;
        }

        setUploadingImage(true);
        setEditError("");
        setEditSuccess("");

        try {
            const response = await radioArticleService.uploadImage(
                radioId,
                imageFile,
            );

            const uploadedImageUrl = response.data?.imageUrl;

            if (!uploadedImageUrl) {
                throw new Error(t("errors.imageUrl"));
            }

            const apiBaseUrl = (
                process.env.NEXT_PUBLIC_API_URL ?? ""
            ).replace(/\/+$/, "");

            const finalImageUrl = uploadedImageUrl.startsWith("http")
                ? uploadedImageUrl
                : `${apiBaseUrl}${uploadedImageUrl.startsWith("/") ? "" : "/"}${uploadedImageUrl}`;

            setImageUrl(finalImageUrl);
            setImageFile(null);
            setEditSuccess(t("actions.imageUploadSuccess"));
        } catch (err) {
            setEditError(
                err instanceof ApiError
                    ? err.message
                    : err instanceof Error
                      ? err.message
                      : t("errors.imageUpload"),
            );
        } finally {
            setUploadingImage(false);
        }
    };

    const handleUpdate = async (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        if (!article || busy || uploadingImage) return;

        setEditError("");
        setEditSuccess("");

        if (editForm.title.trim().length < 5) {
            setEditError(t("validation.title"));
            return;
        }

        if (editForm.content.trim().length < 20) {
            setEditError(t("validation.content"));
            return;
        }

        if (imageFile) {
            setEditError(t("validation.imageNotUploaded"));
            return;
        }

        const parsedCategoryId = editForm.categoryId.trim()
            ? Number(editForm.categoryId)
            : undefined;

        if (
            parsedCategoryId !== undefined &&
            (!Number.isInteger(parsedCategoryId) ||
                parsedCategoryId < 1)
        ) {
            setEditError(t("validation.category"));
            return;
        }

        setUpdating(true);

        try {
            const payload = {
                title: editForm.title.trim(),
                content: editForm.content.trim(),
                categoryId: parsedCategoryId,
                excerpt: editForm.excerpt.trim() || undefined,
                featuredImage: imageUrl || undefined,
                seoTitle: editForm.seoTitle.trim() || undefined,
                seoDescription:
                    editForm.seoDescription.trim() || undefined,
            } as Parameters<
                typeof radioArticleService.updateArticle
            >[2];
            const response = await radioArticleService.updateArticle(
                radioId,
                articleId,
                payload,
            );

            if (response.data) {
                setArticle(response.data);
            } else {
                await loadArticle();
            }

            setEditOpen(false);
            setFeedback({
                type: "success",
                message: t("actions.updateSuccess"),
            });
        } catch (err) {
            setEditError(
                err instanceof ApiError
                    ? err.message
                    : t("errors.update"),
            );
        } finally {
            setUpdating(false);
        }
    };

    const handlePublish = async () => {
        if (!article || busy || article.status === "ARCHIVED") return;

        setPublishing(true);
        setError("");
        setFeedback(null);

        try {
            const response = await radioArticleService.publishArticle(
                radioId,
                articleId,
            );

            if (response.data) {
                setArticle(response.data);
            } else {
                await loadArticle();
            }

            setFeedback({
                type: "success",
                message: t("actions.publishSuccess"),
            });
        } catch (err) {
            setFeedback({
                type: "error",
                message:
                    err instanceof ApiError
                        ? err.message
                        : t("errors.publish"),
            });
        } finally {
            setPublishing(false);
        }
    };

    const handleArchive = async () => {
        if (!article || busy || article.status === "ARCHIVED") return;

        setArchiving(true);
        setError("");
        setFeedback(null);

        try {
            const response = await radioArticleService.archiveArticle(
                radioId,
                articleId,
            );

            if (response.data) {
                setArticle(response.data);
            } else {
                await loadArticle();
            }

            setFeedback({
                type: "success",
                message: t("actions.archiveSuccess"),
            });
        } catch (err) {
            setFeedback({
                type: "error",
                message:
                    err instanceof ApiError
                        ? err.message
                        : t("errors.archive"),
            });
        } finally {
            setArchiving(false);
        }
    };

    const handleDelete = async () => {
        if (!article || busy) return;

        setDeleting(true);
        setError("");
        setFeedback(null);

        try {
            await radioArticleService.deleteArticle(radioId, articleId);
            setDeleted(true);
        } catch (err) {
            setFeedback({
                type: "error",
                message:
                    err instanceof ApiError
                        ? err.message
                        : t("errors.delete"),
            });
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="mx-auto w-full max-w-4xl space-y-4">
                <Skeleton className="h-10 w-2/3" />
                <Skeleton className="h-64 w-full rounded-xl" />
                <Skeleton className="h-40 w-full rounded-xl" />
            </div>
        );
    }

    if (deleted) {
        return (
            <Card>
                <CardContent className="space-y-4 p-6">
                    <p role="status" className="text-sm text-green-700">
                        {t("actions.deleteSuccess")}
                    </p>

                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                    >
                        {t("actions.back")}
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (error || !article) {
        return (
            <Card>
                <CardContent className="space-y-4 p-6">
                    <p role="alert" className="text-sm text-destructive">
                        {error || t("errors.notFound")}
                    </p>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            onClick={() => void loadArticle()}
                            variant="outline"
                        >
                            {t("actions.retry")}
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                        >
                            {t("actions.back")}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const canPublish =
        article.status === "DRAFT" ||
        article.status === "PENDING_REVIEW";

    const canArchive = article.status !== "ARCHIVED";

    return (
        <div className="mx-auto w-full max-w-4xl space-y-6">
            {feedback && (
                <div
                    role={feedback.type === "error" ? "alert" : "status"}
                    className={
                        feedback.type === "error"
                            ? "rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                            : "rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300"
                    }
                >
                    {feedback.message}
                </div>
            )}

            <Card>
                <CardHeader className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={statusVariants[article.status]}>
                                {t(`statuses.${article.status}`)}
                            </Badge>

                            {article.categoryId != null && (
                                <Badge variant="outline">
                                    {t("fields.category")} #{article.categoryId}
                                </Badge>
                            )}
                        </div>

                        <span className="text-xs text-muted-foreground">
                            {t("fields.articleId")}: {article.id}
                        </span>
                    </div>

                    <CardTitle className="break-words text-2xl font-bold tracking-tight sm:text-3xl">
                        {article.title}
                    </CardTitle>

                    {article.excerpt && (
                        <p className="text-muted-foreground">
                            {article.excerpt}
                        </p>
                    )}

                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                        <span>
                            {t("fields.createdAt")}:{" "}
                            {formatDate(article.createdAt)}
                        </span>

                        {article.publishedAt && (
                            <span>
                                {t("fields.publishedAt")}:{" "}
                                {formatDate(article.publishedAt)}
                            </span>
                        )}
                    </div>
                </CardHeader>

                <Separator />

                <CardContent className="space-y-6 p-5 sm:p-6">
                    {article.featuredImage && (
                        <div className="overflow-hidden rounded-xl border bg-muted">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={article.featuredImage}
                                alt={article.title}
                                className="max-h-[480px] w-full object-cover"
                            />
                        </div>
                    )}

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold">
                            {t("sections.content")}
                        </h2>

                        <div className="whitespace-pre-wrap break-words leading-8">
                            {article.content}
                        </div>
                    </section>

                    <Separator />

                    <section className="space-y-4">
                        <h2 className="text-lg font-semibold">
                            {t("sections.seo")}
                        </h2>

                        <div>
                            <p className="text-sm font-medium">
                                {t("fields.seoTitle")}
                            </p>
                            <p className="mt-1 break-words text-sm text-muted-foreground">
                                {article.seoTitle || "—"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm font-medium">
                                {t("fields.seoDescription")}
                            </p>
                            <p className="mt-1 break-words text-sm text-muted-foreground">
                                {article.seoDescription || "—"}
                            </p>
                        </div>
                    </section>

                    <Separator />

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Button
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={busy}
                        >
                            {t("actions.back")}
                        </Button>

                        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                            <Button
                                variant="outline"
                                onClick={openEditDialog}
                                disabled={busy}
                            >
                                {t("actions.edit")}
                            </Button>

                            {canPublish && (
                                <Button
                                    onClick={() => void handlePublish()}
                                    disabled={busy}
                                    className="bg-[#087C3C] text-white hover:bg-[#066631]"
                                >
                                    {publishing
                                        ? t("actions.publishing")
                                        : t("actions.publish")}
                                </Button>
                            )}

                            {canArchive && (
                                <AlertDialog>
                                    <AlertDialogTrigger
                                        disabled={busy}
                                        className="inline-flex h-10 items-center justify-center rounded-md border border-amber-600 px-4 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-50 disabled:pointer-events-none disabled:opacity-50 dark:text-amber-400 dark:hover:bg-amber-950/30"
                                    >
                                        {archiving
                                            ? t("actions.archiving")
                                            : t("actions.archive")}
                                    </AlertDialogTrigger>

                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                {t("archiveDialog.title")}
                                            </AlertDialogTitle>

                                            <AlertDialogDescription>
                                                {t("archiveDialog.description", {
                                                    title: article.title,
                                                })}
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>

                                        <AlertDialogFooter>
                                            <AlertDialogCancel disabled={busy}>
                                                {t("actions.cancel")}
                                            </AlertDialogCancel>

                                            <AlertDialogAction
                                                disabled={busy}
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    void handleArchive();
                                                }}
                                                className="bg-amber-600 text-white hover:bg-amber-700"
                                            >
                                                {archiving
                                                    ? t("actions.archiving")
                                                    : t("actions.confirmArchive")}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}

                            <AlertDialog>
                                <AlertDialogTrigger
                                    disabled={busy}
                                    className="inline-flex h-10 items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-destructive/90 disabled:pointer-events-none disabled:opacity-50"
                                >
                                    {deleting
                                        ? t("actions.deleting")
                                        : t("actions.delete")}
                                </AlertDialogTrigger>

                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            {t("deleteDialog.title")}
                                        </AlertDialogTitle>

                                        <AlertDialogDescription>
                                            {t("deleteDialog.description", {
                                                title: article.title,
                                            })}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>

                                    <AlertDialogFooter>
                                        <AlertDialogCancel disabled={busy}>
                                            {t("actions.cancel")}
                                        </AlertDialogCancel>

                                        <AlertDialogAction
                                            disabled={busy}
                                            onClick={(event) => {
                                                event.preventDefault();
                                                void handleDelete();
                                            }}
                                            className="bg-destructive text-white hover:bg-destructive/90"
                                        >
                                            {deleting
                                                ? t("actions.deleting")
                                                : t("actions.confirmDelete")}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog
                open={editOpen}
                onOpenChange={(open) => {
                    if (!updating && !uploadingImage) {
                        setEditOpen(open);
                    }
                }}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {t("editDialog.title")}
                        </DialogTitle>
                        <DialogDescription>
                            {t("editDialog.description")}
                        </DialogDescription>
                    </DialogHeader>

                    {editError && (
                        <div
                            role="alert"
                            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
                        >
                            {editError}
                        </div>
                    )}

                    {editSuccess && (
                        <div
                            role="status"
                            className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300"
                        >
                            {editSuccess}
                        </div>
                    )}

                    <form
                        onSubmit={(event) => void handleUpdate(event)}
                        className="space-y-6"
                    >
                        <section className="space-y-5 rounded-xl border bg-card p-4 sm:p-5">
                            <h3 className="text-base font-semibold">
                                {t("sections.content")}
                            </h3>

                            <div>
                                <Label
                                    htmlFor="edit-article-title"
                                    className={labelClass}
                                >
                                    {t("fields.title")} *
                                </Label>

                                <Input
                                    id="edit-article-title"
                                    value={editForm.title}
                                    onChange={(event) =>
                                        setEditForm((previous) => ({
                                            ...previous,
                                            title: event.target.value,
                                        }))
                                    }
                                    className={inputClass}
                                    minLength={5}
                                    maxLength={255}
                                    required
                                    disabled={updating}
                                />

                                <p className="mt-1 text-xs text-muted-foreground">
                                    {editForm.title.length}/255
                                </p>
                            </div>

                            <div>
                                <Label
                                    htmlFor="edit-article-excerpt"
                                    className={labelClass}
                                >
                                    {t("fields.excerpt")}
                                </Label>

                                <Textarea
                                    id="edit-article-excerpt"
                                    value={editForm.excerpt}
                                    onChange={(event) =>
                                        setEditForm((previous) => ({
                                            ...previous,
                                            excerpt: event.target.value,
                                        }))
                                    }
                                    className={inputClass}
                                    rows={3}
                                    maxLength={500}
                                    disabled={updating}
                                />
                            </div>

                            <div>
                                <Label
                                    htmlFor="edit-article-category"
                                    className={labelClass}
                                >
                                    {t("fields.category")}
                                </Label>

                                <select
                                    id="edit-article-category"
                                    value={editForm.categoryId}
                                    onChange={(event) =>
                                        setEditForm((previous) => ({
                                            ...previous,
                                            categoryId: event.target.value,
                                        }))
                                    }
                                    className={inputClass}
                                    disabled={updating || loadingCategories}
                                >
                                    <option value="">
                                        {loadingCategories
                                            ? t("fields.loadingCategories")
                                            : t("fields.noCategory")}
                                    </option>

                                    {categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={String(category.id)}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </select>

                                {categoryError && (
                                    <div className="mt-2 space-y-2 text-sm text-destructive">
                                        <p>{categoryError}</p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                void loadCategories()
                                            }
                                            disabled={loadingCategories}
                                        >
                                            {t("actions.retry")}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label
                                    htmlFor="edit-article-content"
                                    className={labelClass}
                                >
                                    {t("fields.content")} *
                                </Label>

                                <Textarea
                                    id="edit-article-content"
                                    value={editForm.content}
                                    onChange={(event) =>
                                        setEditForm((previous) => ({
                                            ...previous,
                                            content: event.target.value,
                                        }))
                                    }
                                    className={`${inputClass} min-h-56 leading-7`}
                                    minLength={20}
                                    required
                                    disabled={updating}
                                />

                                <p className="mt-1 text-xs text-muted-foreground">
                                    {editForm.content.length} {t("fields.characters")}
                                </p>
                            </div>
                        </section>

                        <section className="space-y-4 rounded-xl border bg-card p-4 sm:p-5">
                            <div>
                                <h3 className="font-semibold">
                                    {t("fields.featuredImage")}
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {t("fields.imageHelp")}
                                </p>
                            </div>

                            {imageUrl && (
                                <div className="space-y-3">
                                    <div className="overflow-hidden rounded-lg border bg-muted">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={imageUrl}
                                            alt={article.title}
                                            className="max-h-72 w-full object-cover"
                                        />
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setImageUrl("")}
                                        disabled={updating || uploadingImage}
                                    >
                                        {t("actions.removeImage")}
                                    </Button>
                                </div>
                            )}

                            <div>
                                <Label
                                    htmlFor="edit-article-image"
                                    className={labelClass}
                                >
                                    {t("fields.chooseImage")}
                                </Label>

                                <Input
                                    id="edit-article-image"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleImageChange}
                                    className="mt-2"
                                    disabled={updating || uploadingImage}
                                />
                            </div>

                            {imageFile && (
                                <div className="flex flex-col gap-3 rounded-lg bg-muted/50 p-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium">
                                            {imageFile.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {(imageFile.size / 1024 / 1024).toFixed(2)} Mo
                                        </p>
                                    </div>

                                    <Button
                                        type="button"
                                        onClick={() =>
                                            void handleImageUpload()
                                        }
                                        disabled={uploadingImage || updating}
                                        className="bg-[#F47B16] text-white hover:bg-[#dc6b10]"
                                    >
                                        {uploadingImage
                                            ? t("actions.uploadingImage")
                                            : t("actions.uploadImage")}
                                    </Button>
                                </div>
                            )}
                        </section>

                        <section className="space-y-5 rounded-xl border bg-card p-4 sm:p-5">
                            <div>
                                <h3 className="font-semibold">
                                    {t("sections.seo")}
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {t("fields.seoHelp")}
                                </p>
                            </div>

                            <div>
                                <Label
                                    htmlFor="edit-article-seo-title"
                                    className={labelClass}
                                >
                                    {t("fields.seoTitle")}
                                </Label>

                                <Input
                                    id="edit-article-seo-title"
                                    value={editForm.seoTitle}
                                    onChange={(event) =>
                                        setEditForm((previous) => ({
                                            ...previous,
                                            seoTitle: event.target.value,
                                        }))
                                    }
                                    className={inputClass}
                                    maxLength={255}
                                    disabled={updating}
                                />
                            </div>

                            <div>
                                <Label
                                    htmlFor="edit-article-seo-description"
                                    className={labelClass}
                                >
                                    {t("fields.seoDescription")}
                                </Label>

                                <Textarea
                                    id="edit-article-seo-description"
                                    value={editForm.seoDescription}
                                    onChange={(event) =>
                                        setEditForm((previous) => ({
                                            ...previous,
                                            seoDescription: event.target.value,
                                        }))
                                    }
                                    className={inputClass}
                                    rows={3}
                                    maxLength={320}
                                    disabled={updating}
                                />
                            </div>
                        </section>

                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditOpen(false)}
                                disabled={updating || uploadingImage}
                            >
                                {t("actions.cancel")}
                            </Button>

                            <Button
                                type="submit"
                                disabled={busy || uploadingImage}
                                className="bg-[#087C3C] text-white hover:bg-[#066631]"
                            >
                                {updating
                                    ? t("actions.updating")
                                    : t("actions.update")}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
