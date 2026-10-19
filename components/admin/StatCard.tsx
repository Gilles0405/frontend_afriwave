
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  accent?: "orange" | "green" | "blue" | "amber" | "purple";
};

const accentStyles = {
  orange: "bg-orange-500/10 text-[#F47B16]",
  green: "bg-green-500/10 text-[#087C3C] dark:text-green-400",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
};

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  accent = "orange",
}: StatCardProps) {
  return (
    <article className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">
          {title}
        </p>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accentStyles[accent]}`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        <p className="text-3xl font-bold tracking-tight text-foreground">
          {value}
        </p>

        <ArrowUpRight
          className="mb-1 h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100"
          aria-hidden="true"
        />
      </div>

      {description && (
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      )}
    </article>
  );
}
