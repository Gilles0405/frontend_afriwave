
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  updateUserProfile,
  type UserProfile,
} from "@/lib/radio-settings-api";

type Props = {
  user: UserProfile;
  onUpdated: (user: UserProfile) => void;
};

export default function UserProfileSettingsForm({
  user,
  onUpdated,
}: Props) {
  const t = useTranslations("RadioSettings");

  const [values, setValues] = useState({
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValues({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
    });
  }, [user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    if (
      !values.firstName.trim() ||
      !values.lastName.trim() ||
      !values.email.trim()
    ) {
      toast.error(t("profile.saveError"), {
        description: t("profile.validationError"),
      });
      return;
    }

    setSaving(true);

    try {
      const updated = await updateUserProfile({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim() || null,
      });

      onUpdated(updated);

      toast.success(t("profile.saveSuccess"), {
        description: t("profile.saveSuccessDescription"),
        duration: 5000,
      });
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour du profil utilisateur :",
        error,
      );

      toast.error(t("profile.saveError"), {
        description:
          error instanceof Error
            ? error.message
            : t("profile.saveErrorDescription"),
        duration: 6000,
      });
    } finally {
      setSaving(false);
    }
  }

  const profileFields = [
    {
      name: "firstName" as const,
      label: t("profile.firstName"),
      type: "text",
      required: true,
    },
    {
      name: "lastName" as const,
      label: t("profile.lastName"),
      type: "text",
      required: true,
    },
    {
      name: "email" as const,
      label: t("profile.email"),
      type: "email",
      required: true,
    },
    {
      name: "phone" as const,
      label: t("profile.phone"),
      type: "tel",
      required: false,
    },
  ];

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>{t("profile.title")}</CardTitle>
        <CardDescription>{t("profile.description")}</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            {profileFields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={`profile-${field.name}`}>
                  {field.label}
                  {field.required && (
                    <span className="ml-1 text-destructive">*</span>
                  )}
                </Label>

                <Input
                  id={`profile-${field.name}`}
                  type={field.type}
                  required={field.required}
                  value={values[field.name]}
                  disabled={saving}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      [field.name]: event.target.value,
                    }))
                  }
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end border-t pt-5">
            <Button
              type="submit"
              disabled={saving}
              className="bg-[#087C3C] text-white hover:bg-[#066631]"
            >
              {saving ? (
                <>
                  <span className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                  {t("profile.saving")}
                </>
              ) : (
                t("profile.save")
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
