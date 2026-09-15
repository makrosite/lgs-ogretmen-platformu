"use client";

import { useState } from "react";

type LinkRow = {
  id: string;
  token: string;
  usedAt: string | null;
  studentName: string;
  studentNumber: number;
};

export function ExamLinksPanel({
  examId,
  links,
  students,
}: {
  examId: string;
  links: LinkRow[];
  students: { id: string; name: string; number: number }[];
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const base = typeof window !== "undefined" ? window.location.origin : "";

  async function copy(token: string) {
    const url = `${base}/form/${token}`;
    await navigator.clipboard.writeText(url);
    setCopied(token);
    setTimeout(() => setCopied(null), 1500);
  }

  async function regenerateMissing() {
    await fetch(`/api/denemeler/${examId}/link`, { method: "POST" });
    window.location.reload();
  }

  const missing = students.filter((s) => !links.some((l) => l.studentNumber === s.number));

  return (
    <div className="space-y-space-sm">
      {missing.length > 0 && (
        <button
          type="button"
          onClick={regenerateMissing}
          className="rounded-xl bg-secondary-fixed px-space-md py-space-sm font-label-md text-on-secondary-fixed-variant"
        >
          Eksik {missing.length} link oluştur
        </button>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-outline-variant font-label-md text-on-surface-variant">
              <th className="py-2 pr-2">No</th>
              <th className="py-2 pr-2">Öğrenci</th>
              <th className="py-2 pr-2">Durum</th>
              <th className="py-2">Link</th>
            </tr>
          </thead>
          <tbody>
            {links.map((l) => (
              <tr key={l.id} className="border-b border-outline-variant/40 font-body-sm">
                <td className="py-2 pr-2">{l.studentNumber}</td>
                <td className="py-2 pr-2 font-label-md text-on-surface">{l.studentName}</td>
                <td className="py-2 pr-2">
                  {l.usedAt ? (
                    <span className="rounded-full bg-tertiary-fixed/30 px-2 py-0.5 font-label-sm text-on-tertiary-container">
                      Gönderildi
                    </span>
                  ) : (
                    <span className="rounded-full bg-secondary-fixed px-2 py-0.5 font-label-sm text-secondary">
                      Bekliyor
                    </span>
                  )}
                </td>
                <td className="py-2">
                  <button
                    type="button"
                    onClick={() => copy(l.token)}
                    className="inline-flex items-center gap-1 rounded-lg bg-surface-container-high px-2 py-1 font-label-sm text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[14px]">content_copy</span>
                    {copied === l.token ? "Kopyalandı" : "Kopyala"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
