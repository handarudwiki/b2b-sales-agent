"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Dashboard", icon: "📊", desc: "Unified Growth" },
  { href: "/prospects", label: "Prospek", icon: "🎯", desc: "Lead Prospecting" },
  { href: "/network", label: "Jaringan Relasi", icon: "🕸️", desc: "Path Finder" },
  { href: "/assistant", label: "Sales Assistant", icon: "💬", desc: "WhatsApp AI" },
  { href: "/content", label: "Konten", icon: "✍️", desc: "Marketing & GEO" },
  { href: "/meetings", label: "Meeting", icon: "📅", desc: "Konsultasi" },
  { href: "/knowledge", label: "Basis Pengetahuan", icon: "📚", desc: "FAQ & Katalog" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-card">
      <div className="sticky top-0 flex h-screen flex-col">
        {/* Brand */}
        <div className="border-b border-border px-5 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 text-lg font-bold text-white shadow-sm">
              P
            </span>
            <div>
              <p className="text-base font-bold leading-tight tracking-tight text-foreground">
                Prospera
              </p>
              <p className="text-[11px] font-medium text-muted">
                Growth &amp; Sales Copilot
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
            Menu
          </p>
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-accent font-medium text-primary"
                    : "text-foreground hover:bg-slate-50"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-base transition-colors ${
                    active ? "bg-white shadow-sm" : "bg-slate-100 group-hover:bg-white"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="flex flex-col">
                  <span>{item.label}</span>
                  <span className="text-[11px] text-muted">{item.desc}</span>
                </span>
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Partner footer */}
        <div className="border-t border-border px-5 py-4">
          <p className="text-xs font-semibold text-foreground">
            CV Arba&apos;in Jaya Mandiri
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted">
            AI membantu tim sales bekerja lebih efektif, bukan menggantikan
            konsultasi dan keputusan manusia.
          </p>
        </div>
      </div>
    </aside>
  );
}
