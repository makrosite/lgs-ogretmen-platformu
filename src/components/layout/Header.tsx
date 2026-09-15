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
    <header className="fixed top-0 left-52 right-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-5">
      {/* Search */}
      <div className="flex w-60 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 transition-colors focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/20">
        <span className="material-symbols-outlined text-[15px] text-slate-400">search</span>
        <input
          className="flex-1 bg-transparent text-[13px] text-slate-700 outline-none placeholder:text-slate-400"
          placeholder="Öğrenci veya deneme ara..."
          type="text"
        />
      </div>

      {/* Sağ */}
      <div className="flex items-center gap-2">
        <Link
          href="/denemeler"
          className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-[13px] font-medium text-white hover:bg-secondary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-[14px]">add</span>
          Yeni Deneme
        </Link>

        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
          <span className="material-symbols-outlined text-[18px] text-slate-500">notifications</span>
          {notifCount > 0 && (
            <span className="absolute top-1 right-1 flex h-3 w-3 items-center justify-center rounded-full bg-error text-[8px] font-bold text-white">
              {notifCount}
            </span>
          )}
        </button>

        <div className="h-5 w-px bg-slate-200" />

        <div className="flex items-center gap-2 cursor-pointer rounded-lg px-2 py-1 hover:bg-slate-50 transition-colors">
          <div className="hidden text-right sm:block">
            <p className="text-[12px] font-semibold leading-tight text-slate-800">{teacherName}</p>
            <p className="text-[11px] leading-tight text-slate-400">{teacherTitle}</p>
          </div>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-[12px] font-bold text-white">
            {teacherName.slice(0, 1)}
          </div>
        </div>
      </div>
    </header>
  );
}
