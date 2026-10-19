"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import {
  Globe,
  Languages,
  Menu,
  Moon,
  Radio,
  Sun,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const locales = [
  { code: "fr", label: "Français", shortLabel: "FR" },
  { code: "en", label: "English", shortLabel: "EN" },
] as const;

type SiteHeaderProps = {
  locale: "fr" | "en";
};

export default function SiteHeader({ locale }: SiteHeaderProps) {
  const t = useTranslations("SiteHeader");
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);


  function changeLocale(nextLocale: "fr" | "en") {
    if (nextLocale === locale) return;

    router.replace(pathname, { locale: nextLocale });
    router.refresh();
  }

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  const currentLocale =
    locales.find((item) => item.code === locale) ?? locales[0];

  const navigation = [
    { href: "/" as const, label: t("navigation.home") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E7E0D6] bg-[#FFFCF7]/95 text-[#172219] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Logo AfriWave */}
        <Link
          href="/"
          aria-label="AfriWave - Accueil"
          className="group flex shrink-0 items-center gap-2.5"
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

        {/* Navigation desktop */}
        <nav
          aria-label={t("navigation.label")}
          className="hidden items-center gap-6 md:flex"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-[#667067] transition-colors hover:text-[#F56600]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Contrôles : thème et langue */}
        <div className="flex shrink-0 items-center gap-1.5">
          {/* Changement de thème */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 rounded-full text-[#172219] hover:bg-[#FFF0E5] hover:text-[#F56600]"
            onClick={toggleTheme}
            disabled={!mounted}
            aria-label={
              mounted
                ? theme === "dark"
                  ? t("theme.light")
                  : t("theme.dark")
                : t("theme.toggle")
            }
            title={
              mounted
                ? theme === "dark"
                  ? t("theme.light")
                  : t("theme.dark")
                : t("theme.toggle")
            }
          >
            {mounted && theme === "dark" ? (
              <Sun className="size-5" />
            ) : (
              <Moon className="size-5" />
            )}
          </Button>

          {/* Sélecteur de langue */}


          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  className="h-9 rounded-full px-3"
                  aria-label="Changer de langue"
                >
                  <Globe className="size-4" />
                  <span>{currentLocale.shortLabel}</span>
                </Button>
              }
            />

            <DropdownMenuContent align="end" className="min-w-40">
              {locales.map((item) => (
                <DropdownMenuItem
                  key={item.code}
                  onClick={() => changeLocale(item.code)}
                  className="cursor-pointer"
                >
                  <Languages className="size-4" />
                  <span className="flex-1">{item.label}</span>

                  {locale === item.code && (
                    <span className="text-xs font-semibold">✓</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>



          {/* Menu mobile */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9 text-[#172219] hover:bg-[#FFF0E5] hover:text-[#F56600] md:hidden"
                  aria-label={t("mobile.open")}
                >
                  <Menu className="size-5" />
                </Button>
              }
            />

            <SheetContent side="right" className="w-[300px] border-[#E7E0D6] bg-[#FFFCF7] text-[#172219] sm:w-[360px]">
              <SheetHeader className="text-left">
                <SheetTitle className="flex items-center gap-2 text-[#172219]">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-[#F56600] text-white">
                    <Radio className="size-5" />
                  </span>
                  AfriWave
                </SheetTitle>
              </SheetHeader>

              <Separator className="my-5 bg-[#E7E0D6]" />

              <nav
                aria-label={t("navigation.label")}
                className="flex flex-col gap-2"
              >
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex h-10 items-center justify-start rounded-md px-4 text-sm font-medium text-[#667067] transition-colors hover:bg-[#FFF0E5] hover:text-[#F56600]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <Separator className="my-5 bg-[#E7E0D6]" />

              <div className="space-y-3">
                <p className="text-sm font-medium text-[#667067]">
                  {t("preferences")}
                </p>

                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 border-[#E7E0D6] bg-[#FFFCF7] text-[#172219] hover:bg-[#FFF0E5] hover:text-[#F56600]"
                  onClick={toggleTheme}
                  disabled={!mounted}
                >
                  {mounted && theme === "dark" ? (
                    <Sun className="size-4" />
                  ) : (
                    <Moon className="size-4" />
                  )}
                  {mounted && theme === "dark"
                    ? t("theme.light")
                    : t("theme.dark")}
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  {locales.map((item) => (
                    <Button
                      key={item.code}
                      variant={locale === item.code ? "default" : "outline"}
                      className={
                        locale === item.code
                          ? "bg-[#F56600] text-white hover:bg-[#D95500]"
                          : "border-[#E7E0D6] bg-[#FFFCF7] text-[#172219] hover:bg-[#FFF0E5] hover:text-[#F56600]"
                      }
                      onClick={() => {
                        setMobileMenuOpen(false);
                        changeLocale(item.code);
                      }}
                    >
                      {item.shortLabel}
                      <span className="ml-1 text-xs">
                        {item.label}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Fine ligne de marque */}
      <div className="h-0.5 w-full bg-gradient-to-r from-[#F56600] via-[#FF9A52] to-[#F56600]" />
    </header>
  );
}
