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
  ArrowLeft,
  ShieldCheck,
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
      <div className="hidden overflow-hidden rounded-xl border border-slate-800 bg-foreground shadow-lg lg:flex lg:flex-col">
        <div className="relative overflow-hidden border-b border-white/10 px-5 py-6 text-white">
          <div className="absolute -right-10 -top-10 size-32 rounded-full bg-brand/25" aria-hidden="true" />
          <div className="relative">
            <span className="mb-4 flex size-10 items-center justify-center rounded-lg bg-brand shadow-sm">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-blue-300">Restricted workspace</p>
            <h2 className="mt-1 font-serif text-2xl font-semibold">Admin console</h2>
            <p className="mt-2 text-xs leading-5 text-slate-300">Monitor newsroom operations and platform health.</p>
          </div>
        </div>
        <div className="space-y-5 p-3">
          {ADMIN_PILLARS.map((pillar) => (
            <div key={pillar.title} className="space-y-1">
              <h3 className="px-3 pb-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-slate-500">
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
                      aria-current={active ? "page" : undefined}
                      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                        active
                          ? "bg-brand text-white shadow-sm"
                          : "text-slate-300 hover:bg-white/8 hover:text-white"
                      }`}
                    >
                      <Icon className={`size-4 shrink-0 ${active ? "text-white" : "text-slate-500 group-hover:text-blue-300"}`} />
                      <span className="flex-1">{item.name}</span>
                      {active ? <span className="size-1.5 rounded-full bg-white" aria-hidden="true" /> : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 p-3">
          <Link href="/" className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold text-slate-400 transition-colors hover:bg-white/8 hover:text-white">
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Back to newsroom
          </Link>
        </div>
      </div>

      <div className="block overflow-hidden rounded-xl border border-slate-800 bg-foreground p-3 shadow-md lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-label="Toggle admin section navigation"
          className="flex w-full items-center justify-between gap-2 rounded-lg bg-white/8 px-3 py-2.5 text-sm font-semibold text-white focus:outline-hidden focus:ring-2 focus:ring-brand"
        >
          <span className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-blue-300" aria-hidden="true" />
            <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Admin:</span>
            <span>{currentItemName}</span>
          </span>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform ${
              mobileOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {mobileOpen && (
          <div className="mt-3 space-y-3 border-t border-white/10 pt-3">
            {ADMIN_PILLARS.map((pillar) => (
              <div key={pillar.title} className="pt-2 first:pt-0">
                <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
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
                        className={`flex items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium ${
                          active
                            ? "bg-brand text-white font-semibold"
                            : "text-slate-300 hover:bg-white/8 hover:text-white"
                        }`}
                      >
                        <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? "text-white" : "text-slate-500"}`} />
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
