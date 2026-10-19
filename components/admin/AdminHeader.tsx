
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useRouter, Link, usePathname } from "@/i18n/navigation";
import {
  ChevronDown,
  Languages,
  LogOut,
  Monitor,
  Moon,
  Sun,
  UserRound,
  LoaderCircle,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

type AdminUser = {
  firstName: string;
  lastName?: string;
  email?: string;
};

type DashboardContext = "admin" | "radio";

export default function AdminHeader({
  user,
  context,
}: {
  user: AdminUser;
  context?: DashboardContext;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("AdminHeader");
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const settingsHref =
    context === "radio" ? "/radio/parametres" : "/admin/settings";

  const title = context === "radio" ? t("radioTitle") : t("title");
  const subtitle =
    context === "radio" ? t("radioSubtitle") : t("subtitle");
  const role = context === "radio" ? t("radioRole") : t("role");

  async function logout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      setMenuOpen(false);
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Erreur de déconnexion :", error);
      setLoggingOut(false);
    }
  }

  function changeLocale(nextLocale: "fr" | "en") {
    if (nextLocale !== locale) {
      router.replace(pathname, { locale: nextLocale });
    }
  }

  const initials =
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() ||
    "A";

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-xl sm:px-6">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">
          {title}
        </p>
        <p className="hidden text-xs text-muted-foreground sm:block">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Sélecteur de langue */}
        <div className="flex items-center gap-1 rounded-xl border border-border p-1">
          <Languages className="ml-1 h-4 w-4 text-muted-foreground" />

          {(["fr", "en"] as const).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => changeLocale(lang)}
              aria-pressed={locale === lang}
              className={`rounded-lg px-2 py-1.5 text-xs font-semibold uppercase transition ${
                locale === lang
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Sélecteur de thème */}
        <div className="flex items-center rounded-xl border border-border p-1">
          {(
            [
              { value: "light", label: t("light"), Icon: Sun },
              { value: "dark", label: t("dark"), Icon: Moon },
              { value: "system", label: t("system"), Icon: Monitor },
            ] as const
          ).map(({ value, label, Icon }) => {
            const active = mounted && theme === value;

            return (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                title={label}
                aria-label={label}
                aria-pressed={active}
                className={`rounded-lg p-2 transition ${
                  active
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent"
                }`}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>

        {/* Menu utilisateur */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-accent sm:gap-3 sm:p-2"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {initials}
            </div>

            <div className="hidden text-left sm:block">
              <p className="max-w-36 truncate text-sm font-semibold text-foreground">
                {user.firstName} {user.lastName ?? ""}
              </p>
              <p className="text-xs text-muted-foreground">{role}</p>
            </div>

            <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
          </button>

          {menuOpen && (
            <>
              <button
                type="button"
                aria-label={t("closeMenu")}
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setMenuOpen(false)}
              />

              <div
                role="menu"
                className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-border bg-popover p-2 text-popover-foreground shadow-xl"
              >
                <div className="border-b border-border px-3 py-3">
                  <p className="truncate text-sm font-semibold">
                    {user.firstName} {user.lastName ?? ""}
                  </p>

                  {user.email && (
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  )}
                </div>

                <Link
                  href={settingsHref}
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition hover:bg-accent"
                >
                  <UserRound className="h-4 w-4" />
                  {t("settings")}
                </Link>

                <button
                  type="button"
                  role="menuitem"
                  disabled={loggingOut}
                  onClick={logout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-600 transition hover:bg-red-500/10 disabled:opacity-50"
                >
                  {loggingOut ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}

                  {loggingOut ? t("loggingOut") : t("logout")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
