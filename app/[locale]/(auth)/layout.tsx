
import type { ReactNode } from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/providers/theme-toggle";
import Image from "next/image";


export default async function AuthLayout({
    children,
}: {
    children: ReactNode;
}) {
    const t = await getTranslations("Auth");

    return (
        <main className="relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
            <header className="relative z-10 flex items-center justify-between gap-3 border-b border-border/60 px-4 py-4 sm:px-8 lg:px-12">
                <Link
                    href="/"
                    className="flex items-center gap-2 font-bold tracking-tight"
                    aria-label={t("brand")}
                >
                    <Image
                        src="/WhatsApp_Image_2026-10-10_at_20.27.03-removebg-preview.png"
                        alt="Logo AfriWave"
                        width={150}
                        height={52}
                        priority
                        className="h-9 w-auto object-contain sm:h-11"
                    />
                </Link>

                <div className="flex items-center gap-2">
                    <LanguageSwitcher />
                    <ThemeToggle />
                </div>
            </header>

            <section className="relative flex flex-1 items-center justify-center px-4 py-10 sm:px-6 sm:py-14">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-1/2 -z-0 size-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F47B16]/10 blur-[100px]"
                />

                <div className="relative z-10 w-full max-w-md">
                    {children}
                </div>
            </section>

            <footer className="px-4 py-5 text-center text-xs text-muted-foreground">
                © {new Date().getFullYear()} AfriWave
            </footer>
        </main>
    );
}
