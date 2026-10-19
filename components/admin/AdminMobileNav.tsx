
"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Radio,
  ClipboardList,
  Users,
  Settings,
  Menu,
  X,
  RadioTower,
  ChevronRight,
  Newspaper,
  Mic2,
  Headphones,
} from "lucide-react";

import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import Image from "next/image";

type DashboardContext = "admin" | "radio";

const adminNavigation = [
  { key: "overview", href: "/admin", icon: LayoutDashboard },
  { key: "requests", href: "/admin/radio-requests", icon: ClipboardList },
  { key: "radios", href: "/admin/radios", icon: Radio },
  { key: "users", href: "/admin/users", icon: Users },
  { key: "settings", href: "/admin/settings", icon: Settings },
] as const;

const radioNavigation = [
  { key: "overview", href: "/dashboard-radio", icon: LayoutDashboard },
  { key: "articles", href: "/dashboard-radio/articles", icon: Newspaper },
  { key: "shows", href: "/dashboard-radio/emissions", icon: Mic2 },
  { key: "podcasts", href: "/dashboard-radio/podcasts", icon: Headphones },
  { key: "team", href: "/dashboard-radio/equipe", icon: Users },
  { key: "settings", href: "/dashboard-radio/parametres", icon: Settings },
] as const;

export default function AdminMobileNav({
  context = "admin",
}: {
  context?: DashboardContext;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations(
    context === "radio" ? "RadioSidebar" : "AdminSidebar",
  );

  const navigation =
    context === "radio" ? radioNavigation : adminNavigation;

  const homeHref = context === "radio" ? "/dashboard-radio" : "/admin";

  function closeMenu() {
    setOpen(false);
  }

  return (
    <>
      {/* Barre mobile */}
      <div className="sticky top-[72px] z-20 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur-lg lg:hidden">
        <Link
          href={homeHref}
          onClick={closeMenu}
          className="flex items-center gap-2 font-bold"
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

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t("openMenu")}
          aria-expanded={open}
          aria-controls="dashboard-mobile-menu"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-foreground transition hover:bg-accent"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Fond assombri */}
      {open && (
        <button
          type="button"
          aria-label={t("closeMenu")}
          onClick={closeMenu}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* Menu latéral */}
      <aside
        id="dashboard-mobile-menu"
        aria-label={t("navigationLabel")}
        aria-hidden={!open}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(84vw,320px)] flex-col border-r border-border bg-card shadow-2xl transition-transform duration-300 ease-in-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* En-tête */}
        <div className="flex items-center justify-between border-b border-border px-5 py-5">
          <Link
            href={homeHref}
            onClick={closeMenu}
            className="flex items-center gap-2 text-xl font-extrabold"
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

          <button
            type="button"
            onClick={closeMenu}
            aria-label={t("closeMenu")}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("mainMenu")}
          </p>

          {navigation.map(({ key, href, icon: Icon }) => {
            const active =
              href === homeHref
                ? pathname === href
                : pathname === href ||
                  pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                onClick={closeMenu}
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

                <span className="flex-1">{t(key)}</span>

                {active && (
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Pied de menu */}
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
    </>
  );
}
