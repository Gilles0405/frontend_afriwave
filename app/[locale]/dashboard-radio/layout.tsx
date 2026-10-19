
import type { ReactNode } from "react";

import AdminHeader from "@/components/admin/AdminHeader";
import { getCurrentUser } from "@/lib/server/auth";
import { redirect } from "@/i18n/navigation";
import RadioMobileNav from "@/components/Radio/RadioMobileNav";
import RadioSidebar from "@/components/Radio/RadioSidebar";
import AdminMobileNav from "@/components/admin/AdminMobileNav";

export default async function RadioLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect({ href: "/login", locale: "fr" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
    <AdminHeader user={user} context="radio" />
     <AdminMobileNav context="radio" />
      <div className="flex min-h-[calc(100vh-72px)]">
        <RadioSidebar />
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
