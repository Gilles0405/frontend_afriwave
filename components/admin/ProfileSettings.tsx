
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Check, LoaderCircle, Save, UserRound } from "lucide-react";

import {
  getMyProfile,
  updateMyProfile,
  type UserProfile,
} from "@/lib/profile.request";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ProfileSettings() {
  const t = useTranslations("ProfileSettings");

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatar, setAvatar] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const user = await getMyProfile();

        if (cancelled) return;

        setProfile(user);
        setFirstName(user.firstName ?? "");
        setLastName(user.lastName ?? "");
        setAvatar(user.avatar ?? "");
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : t("errors.load")
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [t]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const updated = await updateMyProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        avatar: avatar.trim() || null,
      });

      setProfile(updated);
      setFirstName(updated.firstName ?? "");
      setLastName(updated.lastName ?? "");
      setAvatar(updated.avatar ?? "");
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("errors.save")
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">
          {t("loading")}
        </span>
      </div>
    );
  }

  if (!profile) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error || t("errors.load")}
        </AlertDescription>
      </Alert>
    );
  }

  const initials =
    `${firstName.trim().charAt(0)}${lastName.trim().charAt(0)}`
      .toUpperCase() || "?";

  return (
    <section className="mx-auto w-full max-w-4xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("description")}
        </p>
      </header>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserRound className="h-5 w-5 text-primary" />
            <CardTitle>{t("personalInfo")}</CardTitle>
          </div>
          <CardDescription>
            {t("personalInfoDescription")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-primary/10 text-xl font-semibold text-primary">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatar}
                    alt={t("avatarAlt")}
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  initials
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <Label htmlFor="avatar">{t("avatarUrl")}</Label>
                <Input
                  id="avatar"
                  type="url"
                  placeholder="https://..."
                  value={avatar}
                  onChange={(event) => setAvatar(event.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {t("avatarHint")}
                </p>
              </div>
            </div>

            {/* Prénom et nom */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t("firstName")}</Label>
                <Input
                  id="firstName"
                  autoComplete="given-name"
                  maxLength={100}
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">{t("lastName")}</Label>
                <Input
                  id="lastName"
                  autoComplete="family-name"
                  maxLength={100}
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  required
                />
              </div>
            </div>

            {/* E-mail en lecture seule */}
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  readOnly
                  aria-describedby="email-status"
                  className="bg-muted"
                />
                <Badge
                  variant={profile.emailVerified ? "default" : "secondary"}
                  className="w-fit shrink-0 self-start sm:self-center"
                >
                  {profile.emailVerified
                    ? t("verified")
                    : t("unverified")}
                </Badge>
              </div>
            </div>

            {/* Statut du compte */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
              <div>
                <p className="font-medium">{t("accountStatus")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("accountStatusDescription")}
                </p>
              </div>

              <Badge
                variant={profile.isActive ? "default" : "destructive"}
              >
                {profile.isActive ? t("active") : t("inactive")}
              </Badge>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <Check className="h-4 w-4" />
                <AlertDescription>
                  {t("saved")}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {saving ? t("saving") : t("save")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
