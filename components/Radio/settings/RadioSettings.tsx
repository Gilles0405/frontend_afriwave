
"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { RefreshCw, Settings2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import {
  getRadioSettingsPageData,
  type RadioSettings as RadioSettingsType,
  type UserProfile,
} from "@/lib/radio-settings-api";

import SettingsFormSkeleton from "@/components/Radio/settings/SettingsFormSkeleton";
import { SettingsTabs } from "@/components/Radio/settings/SettingsTabs";
import RadioSettingsForm from "@/components/Radio/settings/RadioSettingsForm";
import UserProfileSettingsForm from "@/components/Radio/settings/UserProfileSettingsForm";

export default function RadioSettings() {
  const t = useTranslations("RadioSettings");

  const [radio, setRadio] = useState<RadioSettingsType | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [radioId, setRadioId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getRadioSettingsPageData();

      setUser(result.user);
      setRadio(result.radio);
      setRadioId(result.radioId);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("radio.loadError"),
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  if (loading) {
    return <SettingsFormSkeleton />;
  }

  if (error || !user || !radio || radioId === null) {
    return (
      <Alert variant="destructive">
        <AlertTitle>{t("common.errorTitle")}</AlertTitle>

        <AlertDescription className="space-y-3">
          <p>{error || t("radio.loadError")}</p>

          <Button
            type="button"
            variant="outline"
            onClick={() => void loadSettings()}
          >
            <RefreshCw className="mr-2 size-4" />
            {t("common.retry")}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-[#087C3C]/10 p-3">
          <Settings2 className="size-6 text-[#087C3C]" />
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {t("title")}
          </h1>

          <p className="text-sm text-muted-foreground">
            {t("description")}
          </p>
        </div>
      </div>

      <SettingsTabs
        radioContent={
          <RadioSettingsForm
            radio={radio}
            onUpdated={setRadio}
          />
        }
        profileContent={
          <UserProfileSettingsForm
            user={user}
            onUpdated={setUser}
          />
        }
      />
    </div>
  );
}
