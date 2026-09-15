"use client";

import { useState } from "react";

type Item = {
  id: string;
  subject: string;
  questionNo: number;
  photoUrl: string | null;
  studentName: string;
  kazanim: string | null;
  teacherDiag: string | null;
  solvedInClass: boolean;
};

export function GalleryClient({ items }: { items: Item[] }) {
  const [local, setLocal] = useState(items);

  async function toggleSolved(id: string, value: boolean) {
    setLocal((prev) =>
      prev.map((i) => (i.id === id ? { ...i, solvedInClass: value } : i))
    );
    await fetch(`/api/wrong-questions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ solvedInClass: value }),
    });
  }

  if (local.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-outline-variant p-space-xl text-center">
        <p className="font-body-md text-on-surface-variant">Bu filtrede yanlış soru yok.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-space-sm font-headline-sm text-on-surface">Fotoğraf Galerisi</h2>
      <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-4">
        {local.map((item) => (
          <div
            key={item.id}
            className="overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm"
          >
            <div className="relative flex h-56 items-center justify-center bg-surface-container">
              {item.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.photoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-4xl text-outline">image</span>
              )}
              <span className="absolute top-2 left-2 rounded bg-primary-container px-2 py-0.5 font-label-sm text-on-primary">
                Soru {item.questionNo}
              </span>
              <span className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-[11px] font-bold text-on-secondary">
                {item.studentName.slice(0, 1)}
              </span>
            </div>
            <div className="space-y-2 p-space-md">
              <p className="font-label-md text-on-surface">{item.studentName}</p>
              {item.kazanim && (
                <span className="rounded bg-secondary-fixed px-2 py-0.5 font-label-sm text-secondary">
                  {item.kazanim}
                </span>
              )}
              {item.teacherDiag && (
                <p className="font-body-sm text-on-surface-variant">{item.teacherDiag}</p>
              )}
              <label className="flex items-center gap-2 font-label-sm text-on-surface">
                <input
                  type="checkbox"
                  checked={item.solvedInClass}
                  onChange={(e) => toggleSolved(item.id, e.target.checked)}
                  className="accent-secondary"
                />
                Derste Birlikte Çöz
              </label>
              <button
                type="button"
                className="w-full rounded-lg bg-surface-container-high py-1.5 font-label-sm text-on-surface-variant"
                disabled
                title="MVP placeholder"
              >
                Benzer Soru Üret
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
