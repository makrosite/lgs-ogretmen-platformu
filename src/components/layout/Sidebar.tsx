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
    <aside className="fixed left-0 top-0 z-50 flex h-full w-52 flex-col bg-white border-r border-slate-200">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-3.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary">
          <span className="material-symbols-outlined text-[15px] text-white">school</span>
        </div>
        <span className="text-[14px] font-bold text-slate-900 tracking-tight">LGS Portal</span>
      </div>

      {/* Şube seçici */}
      <div className="px-3 pb-2">
        <div className="flex items-center justify-between rounded-md px-2 py-1.5 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors border border-slate-200">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="material-symbols-outlined text-[13px] text-secondary shrink-0">groups</span>
            <span className="text-[12px] font-semibold text-slate-700 truncate">{className}</span>
            <span className="text-[11px] text-slate-400 shrink-0">{studentCount} öğr.</span>
          </div>
          <span className="material-symbols-outlined text-[13px] text-slate-400 shrink-0">unfold_more</span>
        </div>
      </div>

      <div className="mx-3 h-px bg-slate-100 mb-1" />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-1">
        <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Ana Menü
        </p>
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] font-medium transition-colors mb-0.5 ${
                active
                  ? "bg-secondary/8 text-secondary"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span className={`material-symbols-outlined text-[16px] shrink-0 ${active ? "text-secondary" : "text-slate-400"}`}>
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Alt — Ayarlar */}
      <div className="mx-3 h-px bg-slate-100 mb-1" />
      <div className="px-2 pb-3">
        <Link
          href="/ayarlar"
          className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
            pathname === "/ayarlar"
              ? "bg-secondary/8 text-secondary"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <span className="material-symbols-outlined text-[16px] text-slate-400">settings</span>
          <span>Ayarlar</span>
        </Link>
      </div>
    </aside>
  );
}
