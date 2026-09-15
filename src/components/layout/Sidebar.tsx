"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Genel Bakış", icon: "dashboard" },
  { href: "/denemeler", label: "Denemeler & Link", icon: "assignment" },
  { href: "/yanlis-sorular", label: "Yanlış Sorular", icon: "quiz" },
  { href: "/mufredat", label: "Müfredat", icon: "calendar_view_month" },
  { href: "/tercih", label: "Tercih Motoru", icon: "school" },
  { href: "/ogrenciler", label: "Öğrenci / Veli", icon: "person_search" },
  { href: "/kaynak-takip", label: "Kaynak & Ödev", icon: "auto_stories" },
  { href: "/ayarlar", label: "Ayarlar", icon: "settings" },
];

export function Sidebar({
  className = "8-A Fen & Mat",
  studentCount = 28,
}: {
  className?: string;
  studentCount?: number;
}) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-full w-60 flex-col justify-between overflow-y-auto bg-surface-container-low shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="p-space-md">
        <div className="flex items-center gap-space-sm pb-space-md">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary text-on-secondary">
            <span className="material-symbols-outlined text-[18px]">school</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm leading-none tracking-tight text-on-surface">
              LGS Portal
            </span>
            <span className="font-label-sm text-on-surface-variant">Öğretmen Akademisi</span>
          </div>
        </div>

        <div className="mb-space-lg">
          <label className="mb-space-xs block font-label-sm uppercase tracking-wider text-on-surface-variant">
            Aktif Şube / Sınıf
          </label>
          <div className="flex cursor-pointer items-center justify-between rounded-xl bg-surface-container-lowest p-space-sm shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-space-xs overflow-hidden">
              <span className="material-symbols-outlined text-[20px] text-secondary">groups</span>
              <div className="truncate">
                <p className="truncate font-label-lg text-on-surface">{className}</p>
                <p className="font-body-sm text-on-surface-variant">{studentCount} Kayıtlı Öğrenci</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
              expand_more
            </span>
          </div>
        </div>

        <nav className="flex flex-col space-y-space-xs">
          {NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-space-sm rounded-lg px-space-sm py-1.5 transition-colors ${
                  active
                    ? "bg-secondary-container font-label-lg text-on-secondary-container"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                <span className="font-label-lg">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-space-sm p-space-md">
        <div className="flex flex-col gap-space-xs rounded-xl bg-surface-container p-space-sm">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
            <span className="font-label-md font-semibold text-on-surface">%100 Ücretsiz</span>
          </div>
          <p className="font-body-sm text-on-surface-variant">MEB 2025 müfredatı güncel.</p>
        </div>
      </div>
    </aside>
  );
}
