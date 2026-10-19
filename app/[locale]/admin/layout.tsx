
import type { ReactNode } from "react";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/server/auth";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminMobileNav from "@/components/admin/AdminMobileNav";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const locale = await getLocale();
  const user = await getCurrentUser();

  // Vérifier la session
  if (!user) {
    redirect({
      href: "/login",
      locale,
    });
  }

  // Réserver l'administration générale au SUPER_ADMIN
  if (user.globalRole !== "SUPER_ADMIN") {
    redirect({
      href: "/dashboard-radio",
      locale,
    });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        {/* Sidebar desktop */}
        <AdminSidebar />

        {/* Contenu principal */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Barre supérieure */}
          <AdminHeader user={user} />

          {/* Navigation mobile */}
          <AdminMobileNav />

          {/* Pages de l'administration */}
          <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
