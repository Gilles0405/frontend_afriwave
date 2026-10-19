
"use client";

import { useState } from "react";
import {
  Menu,
  X,
  RadioTower,
  LayoutDashboard,
  Newspaper,
  Mic2,
  Headphones,
  Users,
  Settings,
  ChevronRight,
} from "lucide-react";

import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import Image from "next/image";

const navigation = [
  { key: "overview", href: "/dashboard-radio", icon: LayoutDashboard },
  { key: "articles", href: "/dashboard-radio/articles", icon: Newspaper },
  { key: "shows", href: "/dashboard-radio/emissions", icon: Mic2 },
  { key: "podcasts", href: "/dashboard-radio/podcasts", icon: Headphones },
  { key: "team", href: "/dashboard-radio/equipe", icon: Users },
  { key: "settings", href: "/dashboard-radio/parametres", icon: Settings },
] as const;

export default function RadioMobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("RadioSidebar");

  function closeMenu() {
    setOpen(false);
  }

  return (
    <>
      <div className="sticky top-[72px] z-20 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur-lg lg:hidden">
        <Link
          href="/dashboard-radio"
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
          aria-controls="radio-mobile-menu"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border transition hover:bg-accent"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <button
          type="button"
          aria-label={t("closeMenu")}
          onClick={closeMenu}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        id="radio-mobile-menu"
        aria-label={t("navigationLabel")}
        aria-hidden={!open}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(84vw,320px)] flex-col border-r border-border bg-card shadow-2xl transition-transform duration-300 ease-in-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-5">
          <Link
            href="/radio"
            onClick={closeMenu}
            className="flex items-center gap-2 text-xl font-extrabold"
          >
            <RadioTower className="h-6 w-6 text-primary" />
            <span>
              <span className="text-[#F47B16]">Afri</span>
              <span className="text-[#087C3C]">Wave</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={closeMenu}
            aria-label={t("closeMenu")}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
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
                onClick={closeMenu}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span className="flex-1">{t(key)}</span>
                {active && <ChevronRight className="h-4 w-4" />}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <div className="rounded-xl bg-muted p-3">
            <p className="text-xs font-semibold">{t("brand")}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("description")}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
