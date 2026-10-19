
"use client";

import { useTranslations } from "next-intl";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { ReactNode } from "react";

type SettingsTabsProps = {
  radioContent: ReactNode;
  profileContent: ReactNode;
};

export function SettingsTabs({
  radioContent,
  profileContent,
}: SettingsTabsProps) {
  const t = useTranslations("RadioSettings");

  return (
    <Tabs defaultValue="radio" className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:w-fit">
        <TabsTrigger value="radio">
          {t("tabs.radio")}
        </TabsTrigger>
        <TabsTrigger value="profile">
          {t("tabs.profile")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="radio" className="mt-6">
        {radioContent}
      </TabsContent>

      <TabsContent value="profile" className="mt-6">
        {profileContent}
      </TabsContent>
    </Tabs>
  );
}
