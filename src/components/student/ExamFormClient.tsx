"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Answer = "D" | "Y" | "B" | null;

async function compressToWebP(file: File): Promise<Blob> {
  const img = new Image();
  img.src = URL.createObjectURL(file);
  await img.decode();
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, 800 / Math.max(img.width, img.height));
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;
  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
  return new Promise((r) => canvas.toBlob((b) => r(b!), "image/webp", 0.82));
}

export function ExamFormClient({
  token,
  examName,
  publisher,
  examDate,
  studentName,
  subjects,
}: {
  token: string;
  examName: string;
  publisher: string;
  examDate: string;
  studentName: string;
  subjects: Record<string, number>;
}) {
  const router = useRouter();
  const subjectKeys = useMemo(() => Object.keys(subjects), [subjects]);
  const [open, setOpen] = useState(subjectKeys[0]);
  const [answers, setAnswers] = useState<Record<string, Record<number, Answer>>>({});
  const [photos, setPhotos] = useState<Record<string, File | null>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function setAns(subject: string, q: number, val: Answer) {
    setAnswers((prev) => ({
      ...prev,
      [subject]: { ...(prev[subject] || {}), [q]: val },
    }));
  }

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const subjectPayload = subjectKeys.map((subject) => {
        const qs = answers[subject] || {};
        let correct = 0,
          wrong = 0,
          blank = 0;
        const wrongNos: number[] = [];
        for (let i = 1; i <= subjects[subject]; i++) {
          const a = qs[i];
          if (a === "D") correct++;
          else if (a === "Y") {
            wrong++;
            wrongNos.push(i);
          } else blank++;
        }
        return { subject, correct, wrong, blank, wrongNos };
      });

      const fd = new FormData();
      fd.append("subjects", JSON.stringify(subjectPayload));

      for (const [key, file] of Object.entries(photos)) {
        if (!file) continue;
        const blob = await compressToWebP(file);
        fd.append(`photo_${key}`, blob, `${key}.webp`);
      }

      const res = await fetch(`/api/form/${token}`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gönderim başarısız");
      router.push(`/form/onay?resultId=${data.resultId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-primary-container text-on-primary">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-primary-container/95 px-4 py-4 backdrop-blur">
        <p className="font-label-sm uppercase tracking-wider text-secondary-fixed">{publisher}</p>
        <h1 className="font-headline-md text-white">{examName}</h1>
        <p className="font-body-sm text-on-primary-container">
          {studentName} · {new Date(examDate).toLocaleDateString("tr-TR")}
        </p>
      </header>

      <main className="mx-auto max-w-lg space-y-3 px-4 py-4 pb-28">
        {subjectKeys.map((subject) => {
          const count = subjects[subject];
          const qs = answers[subject] || {};
          const filled = Object.values(qs).filter(Boolean).length;
          const isOpen = open === subject;
          return (
            <div key={subject} className="overflow-hidden rounded-xl bg-white/5">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? "" : subject)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <span className="font-label-lg text-white">{subject}</span>
                <span className="font-label-sm text-on-primary-container">
                  {filled}/{count}
                </span>
              </button>
              {isOpen && (
                <div className="space-y-2 border-t border-white/10 px-3 py-3">
                  {Array.from({ length: count }, (_, i) => i + 1).map((q) => {
                    const val = qs[q] ?? null;
                    return (
                      <div key={q} className="flex items-center justify-between gap-2">
                        <span className="w-8 font-label-md text-on-primary-container">{q}</span>
                        <div className="flex gap-1">
                          {(["D", "Y", "B"] as const).map((chip) => (
                            <button
                              key={chip}
                              type="button"
                              onClick={() => setAns(subject, q, chip)}
                              className={`h-9 w-10 rounded-lg font-label-md ${
                                val === chip
                                  ? chip === "D"
                                    ? "bg-on-tertiary-container text-white"
                                    : chip === "Y"
                                      ? "bg-error text-white"
                                      : "bg-outline text-white"
                                  : "bg-white/10 text-on-primary-container"
                              }`}
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                        {val === "Y" && (
                          <label className="cursor-pointer rounded-lg bg-white/10 p-1.5">
                            <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) setPhotos((p) => ({ ...p, [`${subject}_${q}`]: f }));
                              }}
                            />
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        {error && <p className="font-body-sm text-error-container">{error}</p>}
      </main>

      <div className="fixed right-0 bottom-0 left-0 border-t border-white/10 bg-primary-container p-4">
        <button
          type="button"
          disabled={loading}
          onClick={submit}
          className="w-full rounded-xl bg-secondary py-3 font-label-lg text-on-secondary disabled:opacity-60"
        >
          {loading ? "Gönderiliyor..." : "Sonuçları Gönder"}
        </button>
      </div>
    </div>
  );
}
