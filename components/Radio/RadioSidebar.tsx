
"use client";

import {
  LayoutDashboard,
  Newspaper,
  Mic2,
  Headphones,
  Users,
  Settings,
  BookCopy,
   HardDrive
} from "lucide-react";

import Image from "next/image";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const navigation = [
  { key: "overview", href: "/dashboard-radio", icon: LayoutDashboard },
  { key: "medias", href: "/dashboard-radio/medias", icon: HardDrive },
  { key: "categories", href: "/dashboard-radio/categories", icon: BookCopy },
  { key: "articles", href: "/dashboard-radio/articles", icon: Newspaper },
  { key: "shows", href: "/dashboard-radio/emissions", icon: Mic2 },
  { key: "podcasts", href: "/dashboard-radio/podcasts", icon: Headphones },
  { key: "team", href: "/dashboard-radio/equipe", icon: Users },
  { key: "settings", href: "/dashboard-radio/parametres", icon: Settings },
] as const;

export default function RadioSidebar() {
  const pathname = usePathname();
  const t = useTranslations("RadioSidebar");

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
      <div className="border-b border-border px-6 py-6">
        <Link
          href="/dashboard-radio"
          className="inline-flex items-center gap-2"
        >
          <div className="relative h-20 w-20">
            <Image
              src="/WhatsApp_Image_2026-10-10_at_20.27.03-removebg-preview.png"
              alt="AfriWave"
              fill
              className="object-contain"
              priority
              sizes="80px"
            />
          </div>
        </Link>

        <p className="mt-2 text-xs text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <nav
        aria-label={t("navigationLabel")}
        className="flex-1 space-y-1 overflow-y-auto px-3 py-5"
      >
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("mainMenu")}
        </p>

        {navigation.map(({ key, href, icon: Icon }) => {
          const active =
            href === "/dashboard-radio"
              ? pathname === href
              : pathname === href ||
                pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon
                className="h-[18px] w-[18px] shrink-0"
                aria-hidden="true"
              />
              <span>{t(key)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="rounded-xl bg-muted p-3">
          <p className="text-xs font-semibold text-foreground">
            {t("brand")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("description")}
          </p>
        </div>
      </div>
    </aside>
  );
}
