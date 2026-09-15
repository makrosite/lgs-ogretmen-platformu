"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    setLocal((prev) => prev.map((i) => (i.id === id ? { ...i, solvedInClass: value } : i)));
    await fetch(`/api/wrong-questions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ solvedInClass: value }),
    });
  }

  if (local.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 py-12">
        <span className="material-symbols-outlined text-[40px] text-slate-300">photo_library</span>
        <p className="mt-2 text-sm text-slate-400">Bu filtrede yanlış soru yok.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Fotoğraf Galerisi · {local.length} soru
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {local.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="relative flex h-48 items-center justify-center bg-slate-50">
              {item.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.photoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-[40px] text-slate-300">image</span>
              )}
              <span className="absolute top-2 left-2 rounded bg-slate-800/70 px-2 py-0.5 text-[10px] font-bold text-white">
                Soru {item.questionNo}
              </span>
              <span className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-white">
                {item.studentName.slice(0, 1)}
              </span>
            </div>
            <CardContent className="pt-3 space-y-2">
              <p className="text-sm font-semibold text-slate-800">{item.studentName}</p>
              {item.kazanim && <Badge variant="default">{item.kazanim}</Badge>}
              {item.teacherDiag && (
                <p className="text-xs text-slate-500">{item.teacherDiag}</p>
              )}
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.solvedInClass}
                  onChange={(e) => toggleSolved(item.id, e.target.checked)}
                  className="accent-secondary"
                />
                Derste Birlikte Çöz
              </label>
              <Button variant="secondary" size="sm" className="w-full" disabled>
                Benzer Soru Üret
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
