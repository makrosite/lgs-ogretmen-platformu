"use client";

import Link from "next/link";

export function Header({
  teacherName = "Selim Hoca",
  teacherTitle = "Matematik Zümre Bşk.",
  notifCount = 0,
}: {
  teacherName?: string;
  teacherTitle?: string;
  notifCount?: number;
}) {
  return (
    <header className="fixed top-0 left-52 right-0 z-40 flex h-12 items-center justify-between border-b border-outline-variant bg-surface px-4">
      {/* Search */}
      <div className="flex w-64 items-center border border-outline-variant bg-surface-container-lowest">
        <span className="material-symbols-outlined ml-2.5 text-[15px] text-outline">search</span>
        <input
          className="w-full border-none bg-transparent px-2 py-1.5 text-[12px] text-on-surface outline-none placeholder:text-outline"
          placeholder="Öğrenci veya deneme ara..."
          type="text"
        />
      </div>

      {/* Sağ */}
      <div className="flex items-center gap-3">
        <Link
          href="/denemeler"
          className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 text-[12px] font-medium text-on-secondary hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-[14px]">add</span>
          Yeni Deneme
        </Link>

        <div className="relative cursor-pointer p-1.5 hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined text-[20px] text-on-surface-variant">notifications</span>
          {notifCount > 0 && (
            <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center bg-error text-[9px] font-bold text-on-error">
              {notifCount}
            </span>
          )}
        </div>

        <div className="h-4 w-px bg-outline-variant" />

        <div className="flex items-center gap-2 cursor-pointer">
          <div className="hidden text-right sm:block">
            <p className="text-[12px] font-semibold leading-tight text-on-surface">{teacherName}</p>
            <p className="text-[11px] leading-tight text-on-surface-variant">{teacherTitle}</p>
          </div>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-secondary text-[12px] font-bold text-on-secondary">
            {teacherName.slice(0, 1)}
          </div>
        </div>
      </div>
    </header>
  );
}
