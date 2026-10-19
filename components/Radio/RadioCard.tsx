
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Radio as RadioIcon,
  ArrowUpRight,
  Play,
} from "lucide-react";

import { useTranslations } from "next-intl";
import { Radio } from "@/lib/radio.request";
import { buildRadioMediaImageUrl } from "@/lib/radio-media-api";

interface RadioCardProps {
  radio: Radio;
}

export default function RadioCard({ radio }: RadioCardProps) {
  const t = useTranslations("RadioCard");

  return (
    <Card className="group h-full overflow-hidden rounded-2xl border-border/70 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
      <Link
        href={`/admin/radios/${radio.id}`}
        aria-label={t("discoverRadio", { name: radio.name })}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          {radio.coverImage || radio.logo ? (
            <img
              src={buildRadioMediaImageUrl(radio.coverImage || radio.logo || "")}
              alt={t("imageAlt", { name: radio.name })}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <RadioIcon
                className="h-12 w-12 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {radio.frequency && (
            <Badge className="absolute bottom-3 left-3 border-0 bg-background/90 text-foreground backdrop-blur">
              {radio.frequency}
            </Badge>
          )}

          <span className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform group-hover:scale-110">
            <Play className="h-4 w-4 fill-current" aria-hidden="true" />
          </span>
        </div>

        <CardContent className="flex flex-col gap-4 p-5">
          <div className="space-y-2">
            <h2 className="line-clamp-1 text-lg font-bold tracking-tight text-card-foreground">
              {radio.name}
            </h2>

            {(radio.city || radio.country) && (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="line-clamp-1">
                  {[radio.city, radio.country].filter(Boolean).join(", ")}
                </span>
              </p>
            )}
          </div>

          <p className="line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
            {radio.description || t("defaultDescription")}
          </p>

          <div className="flex items-center justify-between border-t border-border/70 pt-4">
            <span className="text-sm font-semibold text-primary">
              {t("discover")}
            </span>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              tabIndex={-1}
              aria-hidden="true"
              className="h-8 w-8 rounded-full"
            >
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
