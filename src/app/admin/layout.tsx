import { AdminNav } from "@/components/admin-nav";
import { getValidatedAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const auth = await getValidatedAuth();
  if (!auth) redirect("/auth/login?next=/admin");
  const { data } = await auth.supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) redirect("/auth/login?next=/admin");

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="grid items-start gap-7 lg:grid-cols-[17.5rem_minmax(0,1fr)] lg:gap-10">
        <aside className="lg:sticky lg:top-20">
          <AdminNav />
        </aside>
        <main className="min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
