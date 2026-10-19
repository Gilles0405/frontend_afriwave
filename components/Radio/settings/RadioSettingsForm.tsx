
"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ImagePlus, X, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  type RadioSettings,
  type UpdateRadioPayload,
  updateRadioSettings,
} from "@/lib/radio-settings-api";

type Props = {
  radio: RadioSettings;
  onUpdated: (radio: RadioSettings) => void;
};

type Field =
  | "name"
  | "description"
  | "logo"
  | "coverImage"
  | "frequency"
  | "city"
  | "country"
  | "address"
  | "phone"
  | "email"
  | "website"
  | "facebook"
  | "instagram"
  | "youtube"
  | "twitter"
  | "streamUrl";

type ImageField = "logo" | "coverImage";

const fields: {
  name: Field;
  type?: string;
  multiline?: boolean;
  required?: boolean;
}[] = [
    { name: "name", required: true },
    { name: "description", multiline: true },
    { name: "frequency" },
    { name: "city" },
    { name: "country" },
    { name: "address" },
    { name: "phone", type: "tel" },
    { name: "email", type: "email" },
    { name: "website", type: "url" },
    { name: "facebook", type: "url" },
    { name: "instagram", type: "url" },
    { name: "youtube", type: "url" },
    { name: "twitter", type: "url" },
    { name: "streamUrl", type: "url" },
  ];


function createValues(
  radio: RadioSettings | null | undefined,
): Record<Field, string> {
  const allFieldNames: Field[] = [
    ...fields.map(({ name }) => name),
    "logo",
    "coverImage",
  ];

  return Object.fromEntries(
    allFieldNames.map((name) => [
      name,
      radio?.[name] ?? "",
    ]),
  ) as Record<Field, string>;
}


/**
 * Extrait le chemin ou l'URL de l'image depuis la réponse du backend.
 */
export function getImageUrl(
  result: unknown,
  field: ImageField,
): string | null {
  if (typeof result !== "object" || result === null) return null;

  const body = result as {
    url?: unknown;
    imageUrl?: unknown;
    logo?: unknown;
    coverImage?: unknown;
    data?: {
      url?: unknown;
      imageUrl?: unknown;
      logo?: unknown;
      coverImage?: unknown;
    };
  };

  const candidates = [
    body.url,
    body.imageUrl,
    body[field],
    body.data?.url,
    body.data?.imageUrl,
    body.data?.[field],
  ];

  return (
    candidates.find(
      (value): value is string =>
        typeof value === "string" && value.trim().length > 0,
    ) ?? null
  );
}

/**
 * Transforme un chemin relatif en URL complète.
 */
export function buildImageUrl(path?: string | null): string {
  if (!path) return "";

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

  return `${baseUrl}/${path.replace(/^\/+/, "")}`;
}

export default function RadioSettingsForm({ radio, onUpdated }: Props) {
  const t = useTranslations("RadioSettings");

  const [values, setValues] = useState<Record<Field, string>>(
    () => createValues(radio),
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<ImageField | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValues(createValues(radio));
  }, [radio]);

  function change(name: Field, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function handleImageUpload(
    name: ImageField,
    file?: File,
  ): Promise<void> {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t("radio.imageInvalidType"));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("radio.imageTooLarge"));
      return;
    }

    setUploading(name);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(
        `/api/radio-shows/${encodeURIComponent(String(radio.id))}/upload-image`,
        {
          method: "POST",
          body: formData,
          credentials: "same-origin",
          cache: "no-store",
        },
      );

      const result: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          typeof result === "object" &&
            result !== null &&
            "message" in result &&
            typeof result.message === "string"
            ? result.message
            : t("radio.imageUploadError");

        throw new Error(message);
      }

      const imageUrl = getImageUrl(result, name);
      if (!imageUrl) {
        throw new Error(t("radio.imageUploadError"));
      }

      change(name, imageUrl);
      toast.success(t("radio.imageUploadSuccess"));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("radio.imageUploadError"),
      );
    } finally {
      setUploading(null);

      const input =
        name === "logo" ? logoInputRef.current : coverInputRef.current;

      if (input) input.value = "";
    }
  }


  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving || uploading !== null) return;

    if (!values.name.trim()) {
      toast.error(t("radio.saveError"));
      return;
    }

    setSaving(true);

    try {

      const payload = {
        ...Object.fromEntries(
          fields.map(({ name }) => {
            const value = values[name].trim();

            return [
              name,
              value === "" && name !== "name" ? null : value,
            ];
          }),
        ),
        logo: values.logo.trim() || null,
        coverImage: values.coverImage.trim() || null,
      } as UpdateRadioPayload;

      const updated = await updateRadioSettings(radio.id, payload);

      onUpdated(updated);

      toast.success(t("radio.saveSuccess"), {
        description: t("radio.saveSuccessDescription"),
        duration: 5000,
      });
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des paramètres radio :", error);

      toast.error(t("radio.saveError"), {
        description:
          error instanceof Error
            ? error.message
            : t("radio.saveErrorDescription"),
        duration: 6000,
      });
    } finally {
      setSaving(false);
    }
  }


  function renderImageField(name: ImageField) {
    const isLogo = name === "logo";
    const imageUrl = values[name];
    const inputRef = isLogo ? logoInputRef : coverInputRef;
    return (
      <div
        key={name}
        className={isLogo ? "space-y-3" : "space-y-3 sm:col-span-2"}
      >
        <Label htmlFor={`radio-${name}`}>{t(`radio.${name}`)}</Label>

        <div
          className={`overflow-hidden rounded-xl border border-dashed border-border bg-muted/30 p-4 ${isLogo ? "max-w-sm" : ""
            }`}
        >
          {imageUrl ? (
            <div
              className={`relative overflow-hidden rounded-lg ${isLogo ? "flex justify-center p-4" : ""
                }`}
            >
              <img
                src={buildImageUrl(imageUrl)}
                alt={t(`radio.${name}`)}
                className={
                  isLogo
                    ? "size-32 rounded-lg object-contain"
                    : "h-48 w-full rounded-lg object-cover sm:h-64"
                }
              />

              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2"
                disabled={saving || uploading !== null}
                aria-label={t("radio.removeImage")}
                onClick={() => change(name, "")}
              >
                <X className="size-4" />
              </Button>
            </div>
          ) : (
            <div
              className={`flex flex-col items-center justify-center gap-3 text-center ${isLogo ? "py-5" : "py-10"
                }`}
            >
              <div className="rounded-full bg-muted p-3">
                <ImagePlus className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("radio.noImage")}
              </p>
            </div>
          )}

          <input
            ref={inputRef}
            id={`radio-${name}`}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={saving || uploading !== null}
            onChange={(event) => {
              void handleImageUpload(name, event.currentTarget.files?.[0]);
            }}
          />

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={saving || uploading !== null}
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="mr-2 size-4" />
              {uploading === name
                ? t("radio.imageUploading")
                : t("radio.chooseImage")}
            </Button>

            <p className="text-xs text-muted-foreground">
              {t("radio.imageHelp")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>{t("radio.title")}</CardTitle>
        <CardDescription>{t("radio.description")}</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            {renderImageField("logo")}
            {renderImageField("coverImage")}

            {fields.map(({ name, type = "text", multiline, required }) => (
              <div
                key={name}
                className={
                  multiline ? "space-y-2 sm:col-span-2" : "space-y-2"
                }
              >
                <Label htmlFor={`radio-${name}`}>
                  {t(`radio.${name}`)}
                  {required && (
                    <span className="ml-1 text-destructive">*</span>
                  )}
                </Label>

                {multiline ? (
                  <Textarea
                    id={`radio-${name}`}
                    value={values[name]}
                    onChange={(event) => change(name, event.target.value)}
                    maxLength={5000}
                    rows={5}
                    disabled={saving || uploading !== null}
                  />
                ) : (
                  <Input
                    id={`radio-${name}`}
                    type={type}
                    value={values[name]}
                    onChange={(event) => change(name, event.target.value)}
                    required={required}
                    maxLength={name === "name" ? 150 : undefined}
                    disabled={saving || uploading !== null}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end border-t pt-5">
            <Button
              type="submit"
              disabled={
                saving || uploading !== null || !values.name.trim()
              }
              className="bg-[#087C3C] text-white hover:bg-[#066631]"
            >
              {saving ? t("radio.saving") : t("radio.save")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
