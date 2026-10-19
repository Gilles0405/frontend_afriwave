
"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
    ArrowLeft,
    Globe,
    MapPin,
    Radio as RadioIcon,
    Volume2,
    ExternalLink,
    RadioTower,
    AlertCircle,
    RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";
import { getRadioDetail, Radio } from "@/lib/radio.request";
import { buildRadioMediaImageUrl } from "@/lib/radio-media-api";

interface RadioDetailProps {
    radioId: string;
}

export default function RadioDetail({ radioId }: RadioDetailProps) {
    const t = useTranslations("RadioDetail");

    const [radio, setRadio] = useState<Radio | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadRadio() {
            setLoading(true);
            setError("");

            try {
                const result = await getRadioDetail(radioId);

                if (!cancelled) {
                    setRadio(result);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error ? err.message : t("errors.loadFailed")
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadRadio();

        return () => {
            cancelled = true;
        };
    }, [radioId, t]);

    if (loading) {
        return (
            <div className="space-y-6" aria-busy="true">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-64 w-full rounded-2xl sm:h-80" />
                <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                    <Skeleton className="h-64 w-full rounded-2xl" />
                    <Skeleton className="h-64 w-full rounded-2xl" />
                </div>
            </div>
        );
    }

    if (error || !radio) {
        return (
            <div className="mx-auto max-w-2xl space-y-5 py-12">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>
                        {error ? t("errors.title") : t("errors.notFoundTitle")}
                    </AlertTitle>
                    <AlertDescription>
                        {error || t("errors.notFoundDescription")}
                    </AlertDescription>
                </Alert>

                <div className="flex flex-wrap gap-3">
                    <Button variant="outline" onClick={() => window.location.reload()}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        {t("retry")}
                    </Button>

                    <Link
                        href="/radios"
                        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t("backToRadios")}
                    </Link>
                </div>
            </div>
        );
    }

    const cover = radio.coverImage || radio.logo;

    return (
        <article className="space-y-6 sm:space-y-8">
            <Link
                href="/radios"
                className="inline-flex h-9 w-fit -ml-3 items-center justify-center rounded-md px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("backToRadios")}
            </Link>

            <section className="relative isolate overflow-hidden rounded-2xl border bg-card sm:rounded-3xl">
                <div className="relative h-64 bg-muted sm:h-80 lg:h-[420px]">
                    {cover ? (
                        <img
                            src={buildRadioMediaImageUrl(cover)}
                            alt={t("coverAlt", { name: radio.name })}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <RadioIcon className="h-16 w-16 text-muted-foreground" />
                        </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                    <div className="absolute inset-x-0 bottom-0 space-y-3 p-5 text-white sm:p-8 lg:p-10">
                        <Badge className="border-white/20 bg-white/15 text-white backdrop-blur">
                            <RadioTower className="mr-1.5 h-3.5 w-3.5" />
                            {t("stationLabel")}
                        </Badge>

                        <h1 className="max-w-4xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                            {radio.name}
                        </h1>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/90 sm:text-base">
                            {(radio.city || radio.country) && (
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4" />
                                    {[radio.city, radio.country].filter(Boolean).join(", ")}
                                </span>
                            )}

                            {radio.frequency && (
                                <span className="flex items-center gap-1.5">
                                    <RadioIcon className="h-4 w-4" />
                                    {radio.frequency}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-6">
                    <Card className="rounded-2xl">
                        <CardHeader>
                            <CardTitle>{t("aboutTitle")}</CardTitle>
                        </CardHeader>

                        <CardContent>
                            <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground sm:text-base">
                                {radio.description || t("noDescription")}
                            </p>
                        </CardContent>
                    </Card>

                    {radio.streamUrl && (
                        <Card className="overflow-hidden rounded-2xl">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <Volume2 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle>{t("listenTitle")}</CardTitle>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {t("listenDescription")}
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <audio
                                    controls
                                    preload="none"
                                    className="w-full"
                                    src={radio.streamUrl}
                                >
                                    {t("audioUnsupported")}
                                </audio>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle>{t("informationTitle")}</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {radio.frequency && (
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">
                                    {t("frequencyLabel")}
                                </p>
                                <p className="font-semibold">{radio.frequency}</p>
                            </div>
                        )}

                        {(radio.city || radio.country) && (
                            <>
                                <Separator />
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">
                                        {t("locationLabel")}
                                    </p>
                                    <p className="font-medium">
                                        {[radio.city, radio.country].filter(Boolean).join(", ")}
                                    </p>
                                </div>
                            </>
                        )}

                        {radio.website && (
                            <>
                                <Separator />
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        {t("websiteLabel")}
                                    </p>
                                    <a
                                        href={radio.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex max-w-full items-center gap-2 break-all text-sm font-medium text-primary hover:underline"
                                    >
                                        <Globe className="h-4 w-4 shrink-0" />
                                        {t("officialWebsite")}
                                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                                    </a>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </article>
    );
}
