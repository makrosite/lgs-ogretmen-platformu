"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard",      label: "Genel Bakış",   icon: "dashboard" },
  { href: "/denemeler",      label: "Denemeler",     icon: "assignment" },
  { href: "/yanlis-sorular", label: "Yanlış Sorular",icon: "quiz" },
  { href: "/mufredat",       label: "Müfredat",      icon: "calendar_view_month" },
  { href: "/tercih",         label: "Tercih Motoru", icon: "school" },
  { href: "/ogrenciler",     label: "Öğrenci / Veli",icon: "person_search" },
  { href: "/kaynak-takip",   label: "Kaynak & Ödev", icon: "auto_stories" },
];

const BOTTOM_NAV = [
  { href: "/ayarlar", label: "Ayarlar", icon: "settings" },
];

export function Sidebar({
  className = "8-A",
  studentCount = 28,
}: {
  className?: string;
  studentCount?: number;
}) {
  const pathname = usePathname();

  const navLink = (item: { href: string; label: string; icon: string }) => {
    const active = pathname === item.href || pathname.startsWith(item.href + "/");
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`group flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] font-medium transition-colors ${
          active
            ? "bg-secondary-container text-on-secondary-container"
            : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
        }`}
      >
        <span className="material-symbols-outlined text-[17px] shrink-0">{item.icon}</span>
        <span className="truncate">{item.label}</span>
      </Link>
    );
  };

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-full w-52 flex-col bg-surface-container-low border-r border-outline-variant/40">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-outline-variant/40">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-secondary text-on-secondary">
          <span className="material-symbols-outlined text-[14px]">school</span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold leading-tight tracking-tight text-on-surface">
            LGS Portal
          </p>
          <p className="text-[11px] leading-tight text-on-surface-variant">Öğretmen Paneli</p>
        </div>
      </div>

      {/* Şube */}
      <div className="px-3 pt-3 pb-1">
        <p className="mb-1 px-0.5 text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/60">
          Aktif Şube
        </p>
        <div className="flex items-center gap-2 rounded-md bg-surface-container px-2.5 py-1.5 cursor-pointer hover:bg-surface-container-high transition-colors">
          <span className="material-symbols-outlined text-[15px] text-secondary shrink-0">groups</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-medium leading-tight text-on-surface">{className}</p>
            <p className="text-[11px] leading-tight text-on-surface-variant">{studentCount} öğrenci</p>
          </div>
          <span className="material-symbols-outlined text-[14px] text-on-surface-variant shrink-0">expand_more</span>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-3 my-2 h-px bg-outline-variant/40" />

      {/* Ana Nav */}
      <nav className="flex-1 overflow-y-auto px-3">
        <div className="flex flex-col gap-0.5">
          {NAV.map(navLink)}
        </div>
      </nav>

      {/* Alt Nav */}
      <div className="px-3 py-2 border-t border-outline-variant/40">
        <div className="flex flex-col gap-0.5">
          {BOTTOM_NAV.map(navLink)}
        </div>
      </div>
    </aside>
  );
}
