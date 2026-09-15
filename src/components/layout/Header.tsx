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
    <header className="fixed top-0 left-52 right-0 z-40 flex h-12 items-center justify-between border-b border-outline-variant/40 bg-surface-bright/95 px-4 backdrop-blur-xl">
      {/* Search */}
      <div className="flex w-64 items-center">
        <div className="relative flex w-full items-center rounded-lg bg-surface-container-lowest px-2.5 py-1.5">
          <span className="material-symbols-outlined mr-2 text-[16px] text-outline">search</span>
          <input
            className="w-full border-none bg-transparent text-[13px] text-on-surface outline-none placeholder:text-outline"
            placeholder="Öğrenci veya deneme ara..."
            type="text"
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <Link
          href="/denemeler"
          className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-[12px] font-semibold text-on-secondary transition-colors hover:opacity-90"
        >
          <span className="material-symbols-outlined text-[14px]">add</span>
          <span>Yeni Deneme</span>
        </Link>

        <div className="relative cursor-pointer rounded-full p-1.5 transition-colors hover:bg-surface-container-high">
          <span className="material-symbols-outlined text-[20px] text-on-surface-variant">notifications</span>
          {notifCount > 0 && (
            <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-error text-[9px] font-bold text-on-error">
              {notifCount}
            </span>
          )}
        </div>

        <div className="h-5 w-px bg-outline-variant" />

        <div className="flex cursor-pointer items-center gap-2">
          <div className="hidden text-right sm:block">
            <p className="text-[12px] font-semibold leading-tight text-on-surface">{teacherName}</p>
            <p className="text-[11px] leading-tight text-on-surface-variant">{teacherTitle}</p>
          </div>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary-fixed text-[12px] font-bold text-secondary">
            {teacherName.slice(0, 1)}
          </div>
        </div>
      </div>
    </header>
  );
}
