"use client";

import { useState } from "react";

export function StudentReportClient({
  student,
  latest,
  trend,
  reportUrl,
  whatsappUrl: wa,
}: {
  student: {
    id: string;
    name: string;
    targetSchool: string | null;
    number: number;
  };
  latest: {
    id: string;
    examName: string;
    score: number;
    percentile: number;
    net: number;
    teacherNote: string | null;
    subjects: { subject: string; correct: number; wrong: number; blank: number; net: number }[];
    wrongCount: number;
  } | null;
  trend: { label: string; net: number }[];
  reportUrl: string;
  whatsappUrl: string | null;
}) {
  const [note, setNote] = useState(latest?.teacherNote ?? "");
  const [editing, setEditing] = useState(false);
  const maxNet = Math.max(90, ...trend.map((t) => t.net));

  async function saveNote() {
    if (!latest) return;
    await fetch(`/api/exam-results/${latest.id}/note`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherNote: note }),
    });
    setEditing(false);
  }

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="flex flex-wrap items-start justify-between gap-space-md">
        <div>
          <h1 className="font-headline-lg text-on-surface">
            {student.number}. {student.name}
          </h1>
          {student.targetSchool && (
            <span className="mt-1 inline-block rounded-full bg-secondary-fixed px-3 py-1 font-label-sm text-secondary">
              Hedef: {student.targetSchool}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-space-sm">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-xl bg-surface-container-high px-space-md py-space-sm font-label-md"
          >
            Not Düzenle
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl bg-surface-container-high px-space-md py-space-sm font-label-md"
          >
            PDF İndir
          </button>
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-[#10B981] px-space-md py-space-sm font-label-md text-white"
            >
              WhatsApp Gönder
            </a>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-[#FEF3C7] px-space-md py-space-sm font-body-sm text-[#92400E]">
        Veli Önizleme Modu — Bu görünüm veliye giden raporun öğretmen önizlemesidir.
      </div>

      <div className="overflow-hidden rounded-xl shadow-sm">
        <div className="bg-primary-container p-space-lg text-white">
          <p className="font-label-sm text-secondary-fixed">LGS Tahmini</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-metric-stat">{latest?.score ?? "—"}</p>
              <p className="font-body-md text-on-primary-container">{student.name}</p>
            </div>
            <div className="text-right">
              <p className="font-headline-md">%{latest?.percentile ?? "—"}</p>
              <p className="font-body-sm text-on-primary-container">yüzdelik dilim</p>
            </div>
          </div>
          {(editing || latest?.teacherNote) && (
            <div className="mt-4 rounded-xl bg-white/10 p-space-md">
              {editing ? (
                <div className="space-y-2">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full rounded-lg bg-white/10 p-2 font-body-md text-white outline-none"
                    rows={3}
                  />
                  <button
                    type="button"
                    onClick={saveNote}
                    className="rounded-lg bg-secondary px-3 py-1 font-label-md"
                  >
                    Kaydet
                  </button>
                </div>
              ) : (
                <p className="font-body-md">{latest?.teacherNote}</p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-space-lg bg-surface-container-lowest p-space-lg">
          <div className="grid grid-cols-3 gap-space-md">
            <div className="rounded-xl bg-surface-container-low p-space-md">
              <p className="font-label-sm text-on-surface-variant">Son Net</p>
              <p className="font-headline-md">{latest?.net ?? "—"}</p>
            </div>
            <div className="rounded-xl bg-surface-container-low p-space-md">
              <p className="font-label-sm text-on-surface-variant">Yanlış</p>
              <p className="font-headline-md">{latest?.wrongCount ?? 0}</p>
            </div>
            <div className="rounded-xl bg-surface-container-low p-space-md">
              <p className="font-label-sm text-on-surface-variant">Deneme</p>
              <p className="font-label-lg">{latest?.examName ?? "—"}</p>
            </div>
          </div>

          {trend.length > 0 && (
            <div>
              <h3 className="mb-2 font-headline-sm">Net Gelişim</h3>
              <svg viewBox="0 0 400 140" className="w-full">
                <defs>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4b41e1" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#4b41e1" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {(() => {
                  const pts = trend.map((t, i) => {
                    const x = 30 + (i * 340) / Math.max(1, trend.length - 1);
                    const y = 110 - (t.net / maxNet) * 90;
                    return `${x},${y}`;
                  });
                  const line = pts.join(" ");
                  const lastX = 30 + ((trend.length - 1) * 340) / Math.max(1, trend.length - 1);
                  return (
                    <>
                      <polygon points={`30,110 ${line} ${lastX},110`} fill="url(#g2)" />
                      <polyline points={line} fill="none" stroke="#4b41e1" strokeWidth="3" />
                    </>
                  );
                })()}
              </svg>
            </div>
          )}

          <div className="space-y-2">
            {latest?.subjects
              .filter((s) => ["Türkçe", "Matematik", "Fen"].includes(s.subject))
              .map((s) => (
                <div key={s.subject}>
                  <div className="mb-1 flex justify-between font-label-md">
                    <span>{s.subject}</span>
                    <span>{s.net} net</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-container">
                    <div
                      className="h-full rounded-full bg-secondary"
                      style={{ width: `${Math.min(100, (s.net / 20) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>

          {reportUrl && (
            <div className="rounded-xl bg-surface-container-low p-space-md">
              <p className="mb-2 font-label-md text-on-surface">WhatsApp / Rapor Linki</p>
              <p className="mb-2 break-all font-body-sm text-on-surface-variant">{reportUrl}</p>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(reportUrl)}
                className="rounded-lg bg-surface-container-high px-3 py-1.5 font-label-sm"
              >
                Kopyala
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
