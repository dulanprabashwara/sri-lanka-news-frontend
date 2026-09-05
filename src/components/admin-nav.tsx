"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Overview", href: "/admin" },
  { name: "Ingestion", href: "/admin/ingestion" },
  { name: "Processing", href: "/admin/processing" },
  { name: "Sources", href: "/admin/sources" },
  { name: "Stories", href: "/admin/stories" },
  { name: "AI", href: "/admin/ai" },
  { name: "Users", href: "/admin/users" },
  { name: "Analytics", href: "/admin/analytics" },
  { name: "Audit", href: "/admin/audit" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      <h2 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Admin Console</h2>
      {navigation.map((item) => {
        const isActive = item.href === "/admin" 
          ? pathname === "/admin" 
          : pathname.startsWith(item.href);
          
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium ${
              isActive
                ? "bg-teal-50 text-teal-700"
                : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
