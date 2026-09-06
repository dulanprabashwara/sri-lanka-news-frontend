"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Download,
  Cpu,
  Globe,
  Newspaper,
  Sparkles,
  BarChart3,
  Users,
  FileText,
  ChevronDown,
} from "lucide-react";

export interface AdminNavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface AdminNavPillar {
  title: string;
  items: AdminNavItem[];
}

export const ADMIN_PILLARS: AdminNavPillar[] = [
  {
    title: "OPERATIONS",
    items: [
      { name: "Overview", href: "/admin", icon: LayoutDashboard },
      { name: "Ingestion", href: "/admin/ingestion", icon: Download },
      { name: "Processing Queue", href: "/admin/processing", icon: Cpu },
      { name: "Sources", href: "/admin/sources", icon: Globe },
    ],
  },
  {
    title: "CONTENT INTELLIGENCE",
    items: [
      { name: "Stories", href: "/admin/stories", icon: Newspaper },
      { name: "AI", href: "/admin/ai", icon: Sparkles },
    ],
  },
  {
    title: "INSIGHTS & SECURITY",
    items: [
      { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      { name: "User Metrics", href: "/admin/users", icon: Users },
      { name: "Audit Logs", href: "/admin/audit", icon: FileText },
    ],
  },
];

export function isRouteActive(pathname: string, href: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Find currently active item for mobile display
  let currentItemName = "Overview";
  for (const pillar of ADMIN_PILLARS) {
    for (const item of pillar.items) {
      if (isRouteActive(pathname, item.href)) {
        currentItemName = item.name;
        break;
      }
    }
  }

  return (
    <nav aria-label="Admin Navigation" className="w-full">
      {/* Desktop Sidebar Navigation (lg:block) */}
      <div className="hidden lg:flex lg:flex-col lg:gap-6">
        <div className="px-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Admin Console
          </h2>
        </div>
        {ADMIN_PILLARS.map((pillar) => (
          <div key={pillar.title} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {pillar.title}
            </h3>
            <div className="space-y-0.5">
              {pillar.items.map((item) => {
                const active = isRouteActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-teal-50 text-teal-800 font-semibold shadow-xs"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        active ? "text-teal-700" : "text-slate-400"
                      }`}
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile/Tablet Compact Navigation (< lg) */}
      <div className="block lg:hidden rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-label="Toggle admin section navigation"
          className="flex w-full items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
        >
          <span className="flex items-center gap-2">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Admin Section:</span>
            <span className="text-teal-800">{currentItemName}</span>
          </span>
          <ChevronDown
            className={`h-4 w-4 text-slate-500 transition-transform ${
              mobileOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {mobileOpen && (
          <div className="mt-3 divide-y divide-slate-100 border-t border-slate-100 pt-3 space-y-3">
            {ADMIN_PILLARS.map((pillar) => (
              <div key={pillar.title} className="pt-2 first:pt-0">
                <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  {pillar.title}
                </p>
                <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
                  {pillar.items.map((item) => {
                    const active = isRouteActive(pathname, item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium ${
                          active
                            ? "bg-teal-50 text-teal-800 font-semibold"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? "text-teal-700" : "text-slate-400"}`} />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
