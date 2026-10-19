
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import type { Metadata} from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./../globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      "https://afriwave.data-check.org"
  ),

  title: {
    default: "AfriWave — La radio communautaire africaine",
    template: "%s | AfriWave",
  },

  description:
    "Explorez les radios communautaires africaines, les actualités, les émissions et les contenus audio.",

  applicationName: "AfriWave",

  openGraph: {
    type: "website",
    siteName: "AfriWave",
    title: "AfriWave — La radio communautaire africaine",
    description:
      "Découvrez les radios communautaires, les actualités et les émissions africaines.",
    url: "/",
    locale: "fr_FR",
  },

  twitter: {
    card: "summary_large_image",
    title: "AfriWave — La radio communautaire africaine",
    description:
      "Découvrez les radios communautaires, les actualités et les émissions africaines.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  
  return (
    <html    className={cn(
        "min-h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        inter.variable,
      )} lang={locale} suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
         <Toaster/>
      </body>
    </html>
  );
}


