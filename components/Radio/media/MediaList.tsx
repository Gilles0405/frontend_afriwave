
"use client";

import { useTranslations } from "next-intl";
import { ImageIcon, Headphones, Radio, Newspaper } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { buildRadioMediaAudioUrl, buildRadioMediaImageUrl, type RadioMedia } from "@/lib/radio-media-api";

type Props = {
    items: RadioMedia[];
    loading: boolean;
};

function getMediaIcon(type: RadioMedia["type"]) {
    if (type === "show") return Radio;
    if (type === "podcast") return Headphones;
    return Newspaper;
}

function getStatusVariant(status: string) {
    switch (status.toUpperCase()) {
        case "PUBLISHED":
            return "default" as const;
        case "DRAFT":
            return "secondary" as const;
        case "REJECTED":
            return "destructive" as const;
        default:
            return "outline" as const;
    }
}

export default function MediaList({ items, loading }: Props) {
    const t = useTranslations("RadioMedia");

    function formatDate(value: string | null) {
        if (!value) return "—";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) return "—";

        return new Intl.DateTimeFormat(undefined, {
            dateStyle: "medium",
        }).format(date);
    }

    return (
        <Card className="border-border/70 shadow-sm">
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("table.media")}</TableHead>
                                <TableHead>{t("table.type")}</TableHead>
                                <TableHead>{t("table.status")}</TableHead>
                                <TableHead>{t("table.createdAt")}</TableHead>
                                <TableHead className="text-right">
                                    {t("table.actions")}
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {loading ? (
                                Array.from({ length: 4 }).map((_, index) => (
                                    <TableRow key={index}>
                                        <TableCell colSpan={5}>
                                            <div className="h-12 animate-pulse rounded-md bg-muted" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : items.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-36 text-center">
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <ImageIcon className="size-8" />
                                            <p>{t("empty.title")}</p>
                                            <p className="text-sm">{t("empty.description")}</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                items.map((item) => {
                                    const Icon = getMediaIcon(item.type);

                                    return (
                                        <TableRow key={`${item.type}-${item.id}`}>
                                            <TableCell>
                                                <div className="flex min-w-[220px] items-center gap-3">
                                                    <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                                                        {item.imageUrl ? (
                                                            <img
                                                                src={buildRadioMediaImageUrl(item.imageUrl)}
                                                                alt={item.title}
                                                                className="size-full object-cover"
                                                                loading="lazy"
                                                            />
                                                        ) : (
                                                            <Icon className="size-5 text-muted-foreground" />
                                                        )}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="max-w-[280px] truncate font-medium">
                                                            {item.title}
                                                        </p>
                                                        <p className="max-w-[280px] truncate text-xs text-muted-foreground">
                                                            {item.slug}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell>{t(`types.${item.type}`)}</TableCell>

                                            <TableCell>
                                                <Badge variant={getStatusVariant(item.status)}>
                                                    {t(`statuses.${item.status.toLowerCase()}`, {
                                                        fallback: item.status,
                                                    })}
                                                </Badge>
                                            </TableCell>

                                            <TableCell className="whitespace-nowrap">
                                                {formatDate(item.createdAt)}
                                            </TableCell>

                                            <TableCell className="text-right">
                        
                                                {item.type === "podcast" && item.audioUrl && (
                                                    <audio
                                                        controls
                                                        preload="none"
                                                        src={buildRadioMediaAudioUrl(item.audioUrl)}
                                                        className="w-full max-w-xs"
                                                    >
                                                        Votre navigateur ne prend pas en charge la lecture audio.
                                                    </audio>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
