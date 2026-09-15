"use client";

import { useState } from "react";

type Tab = "genel" | "net" | "kazanim" | "hedef";

export function ParentReportClient({
  studentName,
  examName,
  score,
  percentile,
  net,
  teacherNote,
  targetSchool,
  subjects,
  wrongs,
}: {
  studentName: string;
  examName: string;
  score: number;
  percentile: number;
  net: number;
  teacherNote: string | null;
  targetSchool: string | null;
  subjects: { subject: string; net: number; correct: number; wrong: number }[];
  wrongs: {
    id: string;
    subject: string;
    questionNo: number;
    photoUrl: string | null;
    kazanim: string | null;
  }[];
}) {
  const [tab, setTab] = useState<Tab>("genel");

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background pb-24">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-surface-bright/95 px-4 py-3 shadow-sm backdrop-blur">
        <div>
          <p className="font-label-sm text-on-tertiary-container">Doğrulanmış Rapor</p>
          <h1 className="font-headline-sm text-on-surface">{studentName}</h1>
        </div>
        <span className="material-symbols-outlined text-on-tertiary-container">verified</span>
      </header>

      <main className="space-y-space-md p-4">
        {tab === "genel" && (
          <>
            <div className="rounded-xl bg-primary-container p-space-md text-white">
              <p className="font-label-sm text-secondary-fixed">{examName}</p>
              <p className="mt-1 font-metric-stat">{score}</p>
              <p className="font-body-sm text-on-primary-container">LGS tahmini puan</p>
            </div>
            {teacherNote && (
              <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
                <p className="font-label-md text-on-surface">Öğretmen notu</p>
                <p className="mt-1 font-body-md text-on-surface-variant">{teacherNote}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              {[
                { l: "LGS Puanı", v: String(score) },
                { l: "Yüzdelik", v: `%${percentile}` },
                { l: "Son Net", v: String(net) },
                { l: "Doğruluk", v: `%${Math.round(100 - percentile)}` },
              ].map((m) => (
                <div
                  key={m.l}
                  className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm"
                >
                  <p className="font-label-sm text-on-surface-variant">{m.l}</p>
                  <p className="font-headline-md text-on-surface">{m.v}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "net" && (
          <div className="space-y-2">
            {subjects.map((s) => (
              <div
                key={s.subject}
                className="flex items-center justify-between rounded-xl bg-surface-container-lowest p-3 shadow-sm"
              >
                <span className="font-label-md">{s.subject}</span>
                <span className="font-headline-sm">{s.net} net</span>
              </div>
            ))}
          </div>
        )}

        {tab === "kazanim" && (
          <div className="grid grid-cols-1 gap-3">
            {wrongs.length === 0 ? (
              <p className="font-body-md text-on-surface-variant">İncelenen yanlış yok.</p>
            ) : (
              wrongs.map((w) => (
                <div
                  key={w.id}
                  className="overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm"
                >
                  {w.photoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={w.photoUrl} alt="" className="h-36 w-full object-cover" />
                  )}
                  <div className="p-3">
                    <p className="font-label-md">
                      {w.subject} · Soru {w.questionNo}
                    </p>
                    {w.kazanim && (
                      <p className="font-body-sm text-on-surface-variant">{w.kazanim}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "hedef" && (
          <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
            <p className="font-label-md text-on-surface-variant">Hedef lise</p>
            <p className="font-headline-sm text-on-surface">
              {targetSchool ?? "Henüz belirlenmedi"}
            </p>
            {targetSchool && (
              <div className="mt-3">
                <div className="mb-1 flex justify-between font-label-sm">
                  <span>Uyumluluk</span>
                  <span>%{Math.min(100, Math.max(30, Math.round(100 - percentile * 5)))}</span>
                </div>
                <div className="h-2 rounded-full bg-surface-container">
                  <div
                    className="h-full rounded-full bg-on-tertiary-container"
                    style={{
                      width: `${Math.min(100, Math.max(30, Math.round(100 - percentile * 5)))}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 rounded-xl bg-surface-container-high py-2 font-label-md"
          >
            PDF İndir
          </button>
        </div>
      </main>

      <nav className="fixed right-0 bottom-0 left-0 mx-auto flex max-w-md justify-around border-t border-outline-variant bg-surface-bright py-2">
        {(
          [
            ["genel", "Genel Bakış", "dashboard"],
            ["net", "Net Takibi", "monitoring"],
            ["kazanim", "Kazanımlar", "quiz"],
            ["hedef", "Hedef Liseler", "school"],
          ] as const
        ).map(([id, label, icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex flex-col items-center gap-0.5 px-2 ${
              tab === id ? "text-secondary" : "text-on-surface-variant"
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">{icon}</span>
            <span className="font-label-sm">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
