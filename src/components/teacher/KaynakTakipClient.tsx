"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type Resource = {
  id: string;
  publisher: string;
  bookName: string;
  subject: string;
  totalTests: number;
  assignments: {
    id: string;
    startTest: number;
    endTest: number;
    dueDate: string;
    status: string;
    score: string | null;
  }[];
};

const PUBLISHERS = [
  "Sinan Kuzucu",
  "Orijinal",
  "Nitelik",
  "Hız",
  "Karekök",
  "3D",
  "Palme",
];

export function KaynakTakipClient({
  studentId,
  studentName,
  resources,
}: {
  studentId: string;
  studentName: string;
  resources: Resource[];
}) {
  const router = useRouter();
  const [modal, setModal] = useState(false);
  const [publisher, setPublisher] = useState(PUBLISHERS[0]);
  const empty = resources.length === 0;

  const allAssignments = resources.flatMap((r) =>
    r.assignments.map((a) => ({ ...a, publisher: r.publisher, bookName: r.bookName }))
  );

  async function addAssignment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/kaynak-takip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        publisher,
        bookName: fd.get("bookName"),
        subject: fd.get("subject"),
        startTest: Number(fd.get("startTest")),
        endTest: Number(fd.get("endTest")),
        dueDate: fd.get("dueDate"),
        totalTests: Number(fd.get("totalTests") || 40),
      }),
    });
    setModal(false);
    router.refresh();
  }

  return (
    <>
      <div className={modal ? "pointer-events-none opacity-75 blur-[2px]" : ""}>
      {empty ? (
        <div className="rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest p-space-xl text-center">
          <span className="material-symbols-outlined mb-2 text-5xl text-outline">
            auto_stories
          </span>
          <h2 className="font-headline-sm text-on-surface">Henüz program oluşturulmadı</h2>
          <p className="mt-1 font-body-md text-on-surface-variant">
            {studentName} için kaynak çizelgesi başlatın
          </p>
          <button
            type="button"
            onClick={() => setModal(true)}
            className="pointer-events-auto mt-4 rounded-xl bg-secondary px-space-md py-space-sm font-label-md text-on-secondary"
          >
            + Yeni Kaynak Çizelgesi Başlat
          </button>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {PUBLISHERS.slice(0, 4).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setPublisher(p);
                  setModal(true);
                }}
                className="pointer-events-auto rounded-xl bg-surface-container-low p-3 font-label-md text-on-surface"
              >
                {p}
                <span className="mt-1 block font-label-sm text-secondary">Kitaplığa Ekle</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="mb-space-md flex flex-wrap gap-2">
            {PUBLISHERS.map((p) => (
              <span
                key={p}
                className="rounded-full bg-surface-container-high px-3 py-1 font-label-sm text-on-surface-variant"
              >
                {p}
              </span>
            ))}
          </div>

          <div className="mb-space-lg grid grid-cols-2 gap-space-md md:grid-cols-4">
            {["done", "pending", "remedial", "all"].map((st) => {
              const count =
                st === "all"
                  ? allAssignments.length
                  : allAssignments.filter((a) => a.status === st).length;
              const label =
                st === "done"
                  ? "Tamamlanan"
                  : st === "pending"
                    ? "Bekleyen"
                    : st === "remedial"
                      ? "Telafi"
                      : "Toplam";
              return (
                <div
                  key={st}
                  className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm"
                >
                  <p className="font-label-sm text-on-surface-variant">{label}</p>
                  <p className="font-headline-md">{count}</p>
                </div>
              );
            })}
          </div>

          <div className="mb-space-lg rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
            <div className="mb-space-md flex items-center justify-between">
              <h2 className="font-headline-sm">7 Günlük Takvim</h2>
              <button
                type="button"
                onClick={() => setModal(true)}
                className="pointer-events-auto rounded-xl bg-secondary px-space-md py-space-sm font-label-md text-on-secondary"
              >
                Yeni Ödev
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {allAssignments.map((a) => (
                <div
                  key={a.id}
                  className={`rounded-xl border-l-4 p-3 ${
                    a.status === "done"
                      ? "border-on-tertiary-container bg-tertiary-fixed/20"
                      : a.status === "remedial"
                        ? "border-error bg-error-container/40"
                        : "border-secondary bg-secondary-fixed/20"
                  }`}
                >
                  <p className="font-label-md text-on-surface">
                    {a.publisher} · Test {a.startTest}–{a.endTest}
                  </p>
                  <p className="font-body-sm text-on-surface-variant">
                    {new Date(a.dueDate).toLocaleDateString("tr-TR")}
                    {a.score ? ` · ${a.score}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {resources.map((r) => {
              const done = r.assignments.filter((a) => a.status === "done").length;
              const pct = Math.round((done / Math.max(1, r.assignments.length)) * 100);
              return (
                <div
                  key={r.id}
                  className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm"
                >
                  <div className="mb-2 flex justify-between">
                    <div>
                      <p className="font-label-lg">{r.publisher}</p>
                      <p className="font-body-sm text-on-surface-variant">
                        {r.bookName} · {r.totalTests} test
                      </p>
                    </div>
                    <span className="font-headline-sm">%{pct}</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-container">
                    <div className="h-full rounded-full bg-secondary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1c30]/65 p-4 backdrop-blur-sm">
          <form
            onSubmit={addAssignment}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-surface-container-lowest p-space-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-space-md font-headline-sm">Hızlı Ödev Atama</h2>

            <p className="mb-2 font-label-md text-secondary">1. Yayınevi</p>
            <div className="mb-space-md grid grid-cols-3 gap-2">
              {PUBLISHERS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPublisher(p)}
                  className={`rounded-xl border-2 p-2 font-label-sm ${
                    publisher === p
                      ? "border-secondary bg-secondary-fixed/30 ring-2 ring-secondary/20"
                      : "border-outline-variant"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <p className="mb-2 font-label-md text-secondary">2. Ders / Kitap</p>
            <div className="mb-space-md grid grid-cols-2 gap-2">
              <select
                name="subject"
                className="h-11 rounded-xl border border-outline-variant bg-surface-container-low px-3"
                defaultValue="Matematik"
              >
                {["Matematik", "Türkçe", "Fen", "Sosyal"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <input
                name="bookName"
                required
                placeholder="Kitap adı"
                defaultValue="Branş Denemeleri"
                className="h-11 rounded-xl border border-outline-variant bg-surface-container-low px-3"
              />
            </div>

            <p className="mb-2 font-label-md text-secondary">3. Test aralığı</p>
            <div className="mb-space-md grid grid-cols-3 gap-2">
              <input
                name="startTest"
                type="number"
                required
                defaultValue={12}
                className="h-11 rounded-xl border border-outline-variant bg-surface-container-low px-3"
              />
              <input
                name="endTest"
                type="number"
                required
                defaultValue={16}
                className="h-11 rounded-xl border border-outline-variant bg-surface-container-low px-3"
              />
              <input
                name="totalTests"
                type="number"
                defaultValue={40}
                className="h-11 rounded-xl border border-outline-variant bg-surface-container-low px-3"
              />
            </div>

            <p className="mb-2 font-label-md text-secondary">4. Tarih</p>
            <input
              name="dueDate"
              type="date"
              required
              className="mb-space-md h-11 w-full rounded-xl border border-outline-variant bg-surface-container-low px-3"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModal(false)}
                className="rounded-xl px-space-md py-space-sm font-label-md text-on-surface-variant"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="rounded-xl bg-secondary px-space-md py-space-sm font-label-md text-on-secondary"
              >
                Ekle
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
