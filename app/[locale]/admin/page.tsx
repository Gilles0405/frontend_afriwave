
// import { Link } from "@/i18n/navigation";
// import { getTranslations } from "next-intl/server";
// import {
//   ArrowRight,
//   ClipboardList,
//   Clock3,
//   Radio,
//   Users,
//   RadioTower,
//   Activity,
//   Plus,
// } from "lucide-react";

// const stats = [
//   {
//     key: "requests",
//     value: "—",
//     icon: ClipboardList,
//     iconStyle: "bg-orange-500/10 text-[#F47B16]",
//   },
//   {
//     key: "pending",
//     value: "—",
//     icon: Clock3,
//     iconStyle: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
//   },
//   {
//     key: "activeRadios",
//     value: "—",
//     icon: Radio,
//     iconStyle: "bg-green-500/10 text-[#087C3C] dark:text-green-400",
//   },
//   {
//     key: "users",
//     value: "—",
//     icon: Users,
//     iconStyle: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
//   },
// ] as const;

// export default async function AdminDashboardPage() {
//   const t = await getTranslations("AdminDashboard");

//   return (
//     <div className="mx-auto max-w-7xl space-y-8">
//       {/* En-tête */}
//       <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
//         <div>
//           <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
//             <Activity className="h-3.5 w-3.5" aria-hidden="true" />
//             {t("eyebrow")}
//           </div>

//           <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
//             {t("title")}
//           </h1>

//           <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
//             {t("description")}
//           </p>
//         </div>

//         <Link
//           href="/admin/radio-requests"
//           className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
//         >
//           <Plus className="h-4 w-4" aria-hidden="true" />
//           {t("reviewRequests")}
//         </Link>
//       </section>

//       {/* Statistiques */}
//       <section
//         aria-label={t("statistics")}
//         className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
//       >
//         {stats.map(({ key, value, icon: Icon, iconStyle }) => (
//           <article
//             key={key}
//             className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
//           >
//             <div className="flex items-start justify-between gap-3">
//               <p className="text-sm font-medium text-muted-foreground">
//                 {t(`stats.${key}`)}
//               </p>

//               <div
//                 className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconStyle}`}
//               >
//                 <Icon className="h-5 w-5" aria-hidden="true" />
//               </div>
//             </div>

//             <p className="mt-5 text-3xl font-bold tracking-tight text-foreground">
//               {value}
//             </p>

//             <p className="mt-1 text-xs text-muted-foreground">
//               {t("stats.helper")}
//             </p>
//           </article>
//         ))}
//       </section>

//       {/* Bloc demandes radio */}
//       <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
//         <div className="flex flex-col justify-between gap-5 p-5 sm:flex-row sm:items-center sm:p-7">
//           <div className="flex items-start gap-4">
//             <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
//               <RadioTower className="h-6 w-6" aria-hidden="true" />
//             </div>

//             <div>
//               <h2 className="text-lg font-semibold text-foreground">
//                 {t("requests.title")}
//               </h2>

//               <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
//                 {t("requests.description")}
//               </p>
//             </div>
//           </div>

//           <Link
//             href="/admin/radio-requests"
//             className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-accent"
//           >
//             {t("requests.action")}
//             <ArrowRight className="h-4 w-4" aria-hidden="true" />
//           </Link>
//         </div>

//         <div className="border-t border-border bg-muted/40 px-5 py-4 sm:px-7">
//           <p className="text-xs leading-5 text-muted-foreground">
//             {t("requests.footer")}
//           </p>
//         </div>
//       </section>
//     </div>
//   );
// }


import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  ArrowRight,
  ClipboardList,
} from "lucide-react";
import AdminOverviewStats from "@/components/admin/AdminOverviewStats";
import RadioRequestTable from "@/components/admin/RadioRequestTable";


export default async function AdminDashboardPage() {
  const t = await getTranslations("AdminDashboard");

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      {/* En-tête du dashboard */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-primary">
            {t("eyebrow")}
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight">
            {t("title")}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            {t("description")}
          </p>
        </div>

        <Link
          href="/admin/radio-requests"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <ClipboardList className="size-4" />
          {t("reviewRequests")}
          <ArrowRight className="size-4" />
        </Link>
      </section>

      {/* Statistiques dynamiques récupérées depuis l'API */}
      <section aria-label={t("statistics")}>
        <AdminOverviewStats />
      </section>

      {/* Tableau des demandes de création de radios */}
      <section>
        <RadioRequestTable />
      </section>
    </div>
  );
}
