"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard",      label: "Genel Bakış",    icon: "dashboard" },
  { href: "/denemeler",      label: "Denemeler",      icon: "assignment" },
  { href: "/yanlis-sorular", label: "Yanlış Sorular", icon: "quiz" },
  { href: "/mufredat",       label: "Müfredat",       icon: "calendar_view_month" },
  { href: "/tercih",         label: "Tercih Motoru",  icon: "school" },
  { href: "/ogrenciler",     label: "Öğrenci / Veli", icon: "person_search" },
  { href: "/kaynak-takip",   label: "Kaynak & Ödev",  icon: "auto_stories" },
];

export function Sidebar({
  className = "8-A",
  studentCount = 28,
}: {
  className?: string;
  studentCount?: number;
}) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-full w-52 flex-col bg-surface-container-low border-r border-outline-variant">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-12 border-b border-outline-variant">
        <span className="material-symbols-outlined text-[18px] text-secondary">school</span>
        <span className="text-[13px] font-semibold text-on-surface">LGS Portal</span>
      </div>

      {/* Şube */}
      <div className="px-3 py-2 border-b border-outline-variant">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
          Aktif Şube
        </p>
        <div className="flex items-center justify-between px-2 py-1.5 bg-surface-container cursor-pointer hover:bg-surface-container-high transition-colors">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-[14px] text-secondary shrink-0">groups</span>
            <span className="text-[12px] font-medium text-on-surface truncate">{className}</span>
            <span className="text-[11px] text-on-surface-variant shrink-0">{studentCount} öğr.</span>
          </div>
          <span className="material-symbols-outlined text-[14px] text-on-surface-variant shrink-0">unfold_more</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-1">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-4 py-2 text-[12px] font-medium transition-colors ${
                active
                  ? "bg-secondary-container text-on-secondary-container border-l-2 border-secondary"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface border-l-2 border-transparent"
              }`}
            >
              <span className="material-symbols-outlined text-[16px] shrink-0">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Ayarlar */}
      <div className="border-t border-outline-variant">
        <Link
          href="/ayarlar"
          className={`flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-medium transition-colors ${
            pathname === "/ayarlar"
              ? "bg-secondary-container text-on-secondary-container"
              : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">settings</span>
          <span>Ayarlar</span>
        </Link>
      </div>
    </aside>
  );
}
