
"use client";

import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useTranslations } from "next-intl";
import { ApiError, radioArticleService } from "@/lib/article-api";
import { radioCategoryService } from "@/lib/Categoryservice";


interface ArticleEditorProps {
  radioId: number;
}

interface RadioCategory {
  id: number;
  radioId: number;
  name: string;
  slug: string;
  description?: string | null;
  status: "ACTIVE" | "INACTIVE";
}

type SubmitAction = "draft" | "review";

export default function ArticleEditor({ radioId }: ArticleEditorProps) {
  const t = useTranslations("ArticleEditor");

  // Article fields
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  // Cover image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Categories
  const [categories, setCategories] = useState<RadioCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState("");

  // Form state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [successType, setSuccessType] = useState<SubmitAction>("draft");

  const loadCategories = useCallback(async () => {
    setLoadingCategories(true);
    setCategoryError("");

    try {
      const response = await radioCategoryService.getCategories(radioId);

      const activeCategories = (response.data ?? []).filter(
        (category: RadioCategory) => category.status === "ACTIVE",
      );

      setCategories(activeCategories);
    } catch (err) {
      if (err instanceof ApiError) {
        setCategoryError(err.message);
      } else {
        setCategoryError(
          "Impossible de charger les catégories. Vérifie ta connexion et tes permissions.",
        );
      }
    } finally {
      setLoadingCategories(false);
    }
  }, [radioId]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    setError("");
    setSuccess("");

    if (!file) {
      setImageFile(null);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Format non accepté. Utilise une image JPG, PNG ou WebP.");
      event.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError("L’image ne doit pas dépasser 5 Mo.");
      event.target.value = "";
      return;
    }

    setImageFile(file);
  };

  const handleImageUpload = async () => {
    if (!imageFile) {
      setError("Sélectionne d’abord une image de couverture.");
      return;
    }

    setUploadingImage(true);
    setError("");
    setSuccess("");

    try {
      const response = await radioArticleService.uploadImage(
        radioId,
        imageFile,
      );

      const uploadedImageUrl = response.data?.imageUrl;

      if (!uploadedImageUrl) {
        throw new Error("L’API n’a pas retourné l’URL de l’image.");
      }

      const apiBaseUrl = (
        process.env.NEXT_PUBLIC_API_URL ?? ""
      ).replace(/\/+$/, "");

      const finalImageUrl = uploadedImageUrl.startsWith("http")
        ? uploadedImageUrl
        : `${apiBaseUrl}${uploadedImageUrl.startsWith("/") ? "" : "/"}${uploadedImageUrl}`;

      setImageUrl(finalImageUrl);
      setImageFile(null);
      setSuccess("Image de couverture téléversée avec succès.");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de téléverser l’image.",
        );
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setExcerpt("");
    setContent("");
    setCategoryId("");
    setSeoTitle("");
    setSeoDescription("");
    setImageFile(null);
    setImageUrl("");
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
    action: SubmitAction,
  ) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (title.trim().length < 5) {
      setError(t("validation.title"));
      return;
    }

    if (content.trim().length < 20) {
      setError(t("validation.content"));
      return;
    }

    if (imageFile) {
      setError(
        "Tu as sélectionné une image qui n’a pas encore été téléversée. Téléverse-la avant d’enregistrer.",
      );
      return;
    }

    const parsedCategoryId = categoryId.trim()
      ? Number(categoryId)
      : undefined;

    if (
      parsedCategoryId !== undefined &&
      (!Number.isInteger(parsedCategoryId) || parsedCategoryId < 1)
    ) {
      setError(t("validation.category"));
      return;
    }

    setLoading(true);

    try {
      const articleResponse = await radioArticleService.createArticle(
        radioId,
        {
          title: title.trim(),
          content: content.trim(),
          categoryId: parsedCategoryId,
          excerpt: excerpt.trim() || undefined,
          featuredImage: imageUrl || undefined,
          seoTitle: seoTitle.trim() || undefined,
          seoDescription: seoDescription.trim() || undefined,
        },
      );

      if (!articleResponse?.data) {
        throw new Error(
          "L’article a été envoyé, mais aucune donnée n’a été retournée par l’API.",
        );
      }

      if (action === "review") {
        await radioArticleService.submitForReview(
          radioId,
          articleResponse.data.id,
        );

        setSuccess(
          "Article enregistré et soumis pour révision avec succès.",
        );
      } else {
        setSuccess("Brouillon enregistré avec succès.");
      }

      setSuccessType(action);

      setTitle("");
      setExcerpt("");
      setContent("");
      setCategoryId("");
      setSeoTitle("");
      setSeoDescription("");
      setImageFile(null);
      setImageUrl("");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          err instanceof Error
            ? err.message
            : t("errors.generic"),
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-[#F47B16]";

  const labelClass = "block text-sm font-medium";

  const textLength = content.length;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("title")}
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          {t("description")}
        </p>
      </div>

      {/* Feedback */}
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300"
        >
          {success}
        </div>
      )}

      <form
        onSubmit={(event) => handleSubmit(event, "draft")}
        className="space-y-6"
      >
        {/* Main article content */}
        <section className="space-y-5 rounded-xl border bg-card p-5 sm:p-6">
          <h2 className="text-lg font-semibold">
            {t("sections.content")}
          </h2>

          {/* Title */}
          <div>
            <label htmlFor="article-title" className={labelClass}>
              {t("fields.title")} *
            </label>

            <input
              id="article-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={t("placeholders.title")}
              className={inputClass}
              minLength={5}
              maxLength={255}
              required
              disabled={loading}
            />

            <p className="mt-1 text-xs text-muted-foreground">
              {title.length}/255 {t("characters")}
            </p>
          </div>

          {/* Excerpt */}
          <div>
            <label htmlFor="article-excerpt" className={labelClass}>
              {t("fields.excerpt")}
            </label>

            <textarea
              id="article-excerpt"
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              placeholder={t("placeholders.excerpt")}
              className={`${inputClass} min-h-24 resize-y`}
              rows={3}
              maxLength={500}
              disabled={loading}
            />

            <p className="mt-1 text-xs text-muted-foreground">
              {excerpt.length}/500 {t("characters")}
            </p>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="article-category" className={labelClass}>
              {t("fields.category")}
            </label>

            <select
              id="article-category"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className={inputClass}
              disabled={loading || loadingCategories}
            >
              <option value="">
                {loadingCategories
                  ? "Chargement des catégories..."
                  : "Sans catégorie"}
              </option>

              {categories.map((category) => (
                <option key={category.id} value={String(category.id)}>
                  {category.name}
                </option>
              ))}
            </select>

            {categoryError ? (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-red-600">
                <span>{categoryError}</span>

                <button
                  type="button"
                  onClick={() => void loadCategories()}
                  className="font-medium underline underline-offset-2"
                >
                  Réessayer
                </button>
              </div>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">
                Choisis une catégorie active de ta radio.
              </p>
            )}

            {!loadingCategories &&
              !categoryError &&
              categories.length === 0 && (
                <p className="mt-1 text-xs text-amber-600">
                  Aucune catégorie active disponible. Tu peux continuer sans
                  catégorie ou en créer une dans la gestion des catégories.
                </p>
              )}
          </div>

          {/* Article body */}
          <div>
            <label htmlFor="article-content" className={labelClass}>
              {t("fields.content")} *
            </label>

            <textarea
              id="article-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={t("placeholders.content")}
              className={`${inputClass} min-h-72 resize-y leading-7`}
              minLength={20}
              required
              disabled={loading}
            />

            <p className="mt-1 text-xs text-muted-foreground">
              {textLength} {t("characters")} — minimum 20 caractères.
            </p>
          </div>
        </section>

        {/* Cover image */}
        <section className="space-y-4 rounded-xl border bg-card p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-semibold">
              Image de couverture
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Formats acceptés : JPG, PNG et WebP. Taille maximale : 5 Mo.
            </p>
          </div>

          {imageUrl && (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-lg border bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Aperçu de l’image de couverture"
                  className="max-h-80 w-full object-cover"
                />
              </div>

              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="text-sm font-medium text-red-600 underline underline-offset-2"
                disabled={loading || uploadingImage}
              >
                Supprimer l’image
              </button>
            </div>
          )}

          <div>
            <label htmlFor="article-image" className={labelClass}>
              Choisir une image
            </label>

            <input
              id="article-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="mt-2 block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-[#F47B16]/10 file:px-4 file:py-2 file:font-medium file:text-[#F47B16] hover:file:bg-[#F47B16]/20"
              disabled={loading || uploadingImage}
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

              <button
                type="button"
                onClick={() => void handleImageUpload()}
                disabled={uploadingImage || loading}
                className="rounded-lg bg-[#F47B16] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#dc6b10] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploadingImage
                  ? "Téléversement..."
                  : "Téléverser l’image"}
              </button>
            </div>
          )}
        </section>

        {/* SEO */}
        <section className="space-y-5 rounded-xl border bg-card p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-semibold">
              {t("sections.seo")}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {t("seoDescription")}
            </p>
          </div>

          <div>
            <label htmlFor="article-seo-title" className={labelClass}>
              {t("fields.seoTitle")}
            </label>

            <input
              id="article-seo-title"
              type="text"
              value={seoTitle}
              onChange={(event) => setSeoTitle(event.target.value)}
              placeholder={t("placeholders.seoTitle")}
              className={inputClass}
              maxLength={255}
              disabled={loading}
            />

            <p className="mt-1 text-xs text-muted-foreground">
              {seoTitle.length}/255 {t("characters")}
            </p>
          </div>

          <div>
            <label
              htmlFor="article-seo-description"
              className={labelClass}
            >
              {t("fields.seoDescription")}
            </label>

            <textarea
              id="article-seo-description"
              value={seoDescription}
              onChange={(event) => setSeoDescription(event.target.value)}
              placeholder={t("placeholders.seoDescription")}
              className={`${inputClass} min-h-24 resize-y`}
              rows={3}
              maxLength={320}
              disabled={loading}
            />

            <p className="mt-1 text-xs text-muted-foreground">
              {seoDescription.length}/320 {t("characters")}
            </p>
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={resetForm}
            disabled={loading || uploadingImage}
            className="rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t("actions.clear")}
          </button>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="rounded-lg border border-[#087C3C] px-5 py-2.5 text-sm font-semibold text-[#087C3C] transition hover:bg-[#087C3C]/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && successType === "draft"
                ? t("actions.saving")
                : t("actions.save")}
            </button>

            <button
              type="button"
              onClick={(event) => {
                const form = event.currentTarget.form;

                if (form) {
                  void handleSubmit(
                    {
                      preventDefault: () => {},
                    } as FormEvent<HTMLFormElement>,
                    "review",
                  );
                }
              }}
              disabled={loading || uploadingImage}
              className="rounded-lg bg-[#087C3C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#066631] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && successType === "review"
                ? "Envoi en cours..."
                : "Soumettre pour révision"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}