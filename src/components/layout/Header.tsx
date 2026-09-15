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
    <header className="fixed top-0 left-60 right-0 z-40 flex h-14 items-center justify-between bg-surface-bright/90 px-space-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <div className="flex w-72 items-center">
        <div className="relative flex w-full items-center rounded-xl bg-surface-container-lowest px-space-sm py-space-xs shadow-[0_1px_8px_rgba(0,0,0,0.02)]">
          <span className="material-symbols-outlined mr-space-xs text-[18px] text-outline">
            search
          </span>
          <input
            className="w-full border-none bg-transparent font-body-sm text-on-surface outline-none placeholder:text-outline"
            placeholder="Öğrenci, deneme veya soru kazanımı ara..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-space-md">
        <Link
          href="/denemeler"
          className="flex items-center gap-space-xs rounded-xl bg-secondary px-space-sm py-1.5 font-label-md text-on-secondary shadow-[0_1px_8px_rgba(0,0,0,0.08)] transition-colors hover:bg-secondary-container hover:text-on-secondary-container"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>Yeni Deneme Linki</span>
        </Link>
        <div className="relative cursor-pointer rounded-full p-space-xs transition-colors hover:bg-surface-container-high">
          <span className="material-symbols-outlined text-[22px] text-on-surface-variant">
            notifications
          </span>
          {notifCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[9px] font-label-sm text-on-error">
              {notifCount}
            </span>
          )}
        </div>
        <div className="h-6 w-px bg-outline-variant" />
        <div className="flex cursor-pointer items-center gap-space-sm pl-space-xs">
          <div className="hidden text-right sm:block">
            <p className="font-label-md leading-tight text-on-surface">{teacherName}</p>
            <p className="font-label-sm leading-tight text-on-surface-variant">{teacherTitle}</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-fixed text-secondary font-label-md">
            {teacherName.slice(0, 1)}
          </div>
        </div>
      </div>
    </header>
  );
}
