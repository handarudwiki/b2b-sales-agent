"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";
import {
  PiBooks,
  PiCalendarDots,
  PiCaretDown,
  PiGraph,
  PiMagnifyingGlass,
  PiPenNib,
  PiPlus,
  PiSparkleFill,
  PiSquaresFour,
  PiTarget,
  PiUserPlus,
  PiWhatsappLogo,
} from "react-icons/pi";
import { cn } from "./cn";

const NAV: { href: string; label: string; icon: IconType }[] = [
  { href: "/", label: "Dashboard", icon: PiSquaresFour },
  { href: "/prospects", label: "Prospek", icon: PiTarget },
  { href: "/network", label: "Jaringan Relasi", icon: PiGraph },
  { href: "/assistant", label: "Sales Assistant", icon: PiWhatsappLogo },
  { href: "/content", label: "Konten", icon: PiPenNib },
  { href: "/meetings", label: "Meeting", icon: PiCalendarDots },
  { href: "/knowledge", label: "Pengetahuan", icon: PiBooks },
];

const CREATE: { href: string; label: string; hint: string; icon: IconType }[] = [
  { href: "/prospects/discover", label: "Temukan prospek", hint: "Cari kandidat dari ICP", icon: PiMagnifyingGlass },
  { href: "/prospects/new", label: "Tambah prospek", hint: "Entri manual", icon: PiUserPlus },
  { href: "/assistant", label: "Simulasi WhatsApp", hint: "Percakapan calon klien", icon: PiWhatsappLogo },
  { href: "/content", label: "Draft konten", hint: "SEO / GEO per segmen", icon: PiPenNib },
  { href: "/network", label: "Kontak relasi", hint: "Bangun jalur warm intro", icon: PiGraph },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-canvas/70 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] w-full max-w-360 items-center gap-4 px-4 sm:px-6 lg:px-10">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5 rounded-xl outline-none focus-visible:ring-4 focus-visible:ring-lime/70">
          <span className="grid size-9 place-items-center rounded-xl bg-ink text-lime shadow-[0_6px_16px_-6px_rgb(15_17_16/0.6)] transition-transform duration-300 group-hover:rotate-12">
            <PiSparkleFill className="size-[18px]" />
          </span>
          <span className="leading-tight">
            <span className="block text-[15px] font-semibold tracking-[-0.02em] text-ink">Prospera</span>
            <span className="block text-[11px] font-medium text-muted">Growth &amp; Sales Copilot</span>
          </span>
        </Link>

        <nav aria-label="Navigasi utama" className="hidden min-w-0 flex-1 justify-center lg:flex">
          <NavPills pathname={pathname} compact />
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
          <CreateMenu />
          <div
            title="CV Arba'in Jaya Mandiri"
            className="flex items-center gap-2.5 rounded-full border border-line bg-surface py-1 pl-1 pr-1 shadow-[0_1px_1px_rgb(15_17_16/0.04)] sm:pr-3.5"
          >
            <span className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-lime-400 text-[11px] font-bold text-white">
              AJ
            </span>
            <span className="hidden leading-tight sm:block">
              <span className="block text-[12px] font-semibold text-ink">Arba&apos;in Jaya</span>
              <span className="block text-[10.5px] text-muted">Tim Growth</span>
            </span>
          </div>
        </div>
      </div>

      <nav aria-label="Navigasi utama" className="scrollbar-none -mt-1 overflow-x-auto px-4 pb-3 sm:px-6 lg:hidden">
        <NavPills pathname={pathname} />
      </nav>
    </header>
  );
}

function NavPills({ pathname, compact = false }: { pathname: string; compact?: boolean }) {
  return (
    <ul className="flex w-max items-center gap-1 rounded-full border border-line bg-surface/90 p-1 shadow-card">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <li key={href}>
            <Link
              href={href}
              title={label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-[13px] font-medium outline-none transition-colors duration-200 focus-visible:ring-4 focus-visible:ring-lime/70",
                active
                  ? "bg-ink text-white shadow-[0_6px_16px_-8px_rgb(15_17_16/0.7)]"
                  : "text-ink-2 hover:bg-surface-2 hover:text-ink",
              )}
            >
              <Icon className={cn("size-[17px] shrink-0", active && "text-lime")} />
              <span className={cn(compact && !active && "hidden xl:inline")}>{label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function CreateMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 items-center gap-1.5 rounded-full bg-lime pl-3 pr-3.5 text-[13px] font-semibold text-ink shadow-[inset_0_-1px_0_rgb(0_0_0/0.08)] outline-none transition hover:bg-lime-strong focus-visible:ring-4 focus-visible:ring-lime/70"
      >
        <PiPlus className="size-4" />
        <span className="hidden sm:inline">Buat</span>
        <PiCaretDown className={cn("hidden size-3.5 transition-transform sm:block", open && "rotate-180")} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+10px)] z-50 w-72 origin-top-right animate-pop-in rounded-3xl border border-line bg-surface p-2 shadow-pop"
        >
          <p className="px-3 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Buat baru</p>
          {CREATE.map(({ href, label, hint, icon: Icon }) => (
            <Link
              key={href + label}
              href={href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-2xl px-3 py-2.5 outline-none transition-colors hover:bg-surface-2 focus-visible:bg-surface-2"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-line bg-surface-2 text-ink">
                <Icon className="size-[17px]" />
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-medium text-ink">{label}</span>
                <span className="block text-[11.5px] text-muted">{hint}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
