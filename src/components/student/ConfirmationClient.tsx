"use client";

import { useMemo, useState } from "react";

const SNIPPETS = ["Teşekkürler", "Süre Sorunu", "Harika Çalışma"];
const COLORS = [
  "#4b41e1",
  "#009668",
  "#ba1a1a",
  "#645efb",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#3b82f6",
];

export function ConfirmationClient({
  studentName,
  examName,
  net,
  score,
  percentile,
  targetSchool,
  photos,
  resultId,
  teacherNote: initialNote,
}: {
  studentName: string;
  examName: string;
  net: number;
  score: number;
  percentile: number;
  targetSchool: string | null;
  photos: { id: string; url: string; label: string }[];
  resultId: string;
  teacherNote: string | null;
}) {
  const [note, setNote] = useState(initialNote ?? "");
  const [saved, setSaved] = useState(false);
  const confetti = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: `${(i * 5.5) % 100}%`,
        delay: `${(i % 6) * 0.15}s`,
        color: COLORS[i % COLORS.length],
      })),
    []
  );

  async function saveNote() {
    await fetch(`/api/exam-results/${resultId}/note`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherNote: note }),
    });
    setSaved(true);
  }

  const fitPct = targetSchool
    ? Math.min(100, Math.max(20, Math.round(100 - percentile * 8)))
    : 50;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4 py-8">
      {confetti.map((c) => (
        <span
          key={c.id}
          className="confetti-piece pointer-events-none absolute top-0 h-2 w-2 rounded-full"
          style={{
            left: c.left,
            background: c.color,
            animationDelay: c.delay,
          }}
        />
      ))}

      <div className="relative z-10 mx-auto max-w-lg space-y-space-lg text-center">
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-on-tertiary-container opacity-30" />
          <span className="material-symbols-outlined relative text-5xl text-on-tertiary-container">
            check_circle
          </span>
        </div>
        <h1 className="font-headline-lg text-on-surface">
          Harika İş Çıkardın {studentName.split(" ")[0]}!
        </h1>
        <p className="font-body-md text-on-surface-variant">{examName} gönderildi</p>

        <div className="rounded-xl bg-primary-container p-space-lg text-left text-white">
          <p className="font-label-sm uppercase text-secondary-fixed">Flash LGS Projeksiyon</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div>
              <p className="font-body-sm text-on-primary-container">Net</p>
              <p className="font-headline-md">{net}</p>
            </div>
            <div>
              <p className="font-body-sm text-on-primary-container">Puan</p>
              <p className="font-headline-md">{score}</p>
            </div>
            <div>
              <p className="font-body-sm text-on-primary-container">Dilim</p>
              <p className="font-headline-md">%{percentile}</p>
            </div>
          </div>
          {targetSchool && (
            <div className="mt-4">
              <p className="mb-1 font-body-sm text-on-primary-container">{targetSchool}</p>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-on-tertiary-container"
                  style={{ width: `${fitPct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {photos.length > 0 && (
          <div className="grid grid-cols-2 gap-2 text-left">
            {photos.map((p) => (
              <div key={p.id} className="overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="" className="h-28 w-full object-cover" />
                <p className="p-2 font-label-sm text-on-surface-variant">{p.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-xl bg-surface-container-lowest p-space-lg text-left shadow-sm">
          <p className="mb-2 font-label-lg text-on-surface">Öğretmen Not Alanı</p>
          <textarea
            value={note}
            maxLength={120}
            onChange={(e) => setNote(e.target.value)}
            className="h-24 w-full rounded-xl border border-outline-variant bg-surface-container-low p-3 font-body-md outline-none focus:border-secondary"
            placeholder="Veliye kısa not..."
          />
          <p className="mt-1 text-right font-label-sm text-outline">{note.length}/120</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {SNIPPETS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setNote(s)}
                className="rounded-full bg-secondary-fixed px-3 py-1 font-label-sm text-secondary"
              >
                {s}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={saveNote}
            className="mt-3 w-full rounded-xl bg-secondary py-2 font-label-md text-on-secondary"
          >
            {saved ? "Kaydedildi" : "Notu Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}
