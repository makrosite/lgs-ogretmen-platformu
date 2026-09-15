"use client";

import { useMemo, useState } from "react";

type School = {
  id: string;
  name: string;
  type: string;
  city: string;
  district: string;
  yearData: {
    year: number;
    minScore: number;
    maxScore: number;
    quota: number;
    percentile: number;
  }[];
};

export function TercihClient({ schools }: { schools: School[] }) {
  const [city, setCity] = useState("Tümü");
  const [type, setType] = useState("Tümü");
  const [studentScore, setStudentScore] = useState(450);

  const cities = useMemo(
    () => ["Tümü", ...new Set(schools.map((s) => s.city))],
    [schools]
  );
  const types = useMemo(
    () => ["Tümü", ...new Set(schools.map((s) => s.type))],
    [schools]
  );

  const filtered = schools.filter((s) => {
    if (city !== "Tümü" && s.city !== city) return false;
    if (type !== "Tümü" && s.type !== type) return false;
    return true;
  });

  function band(minScore: number) {
    const diff = studentScore - minScore;
    if (diff >= 10) return { label: "Güvenli", color: "bg-on-tertiary-container", pct: 90 };
    if (diff >= -5) return { label: "Hedef", color: "bg-[#F59E0B]", pct: 55 };
    return { label: "Uzak", color: "bg-error", pct: 25 };
  }

  return (
    <div className="space-y-space-lg">
      <div className="grid grid-cols-1 gap-space-md rounded-xl bg-surface-container-lowest p-space-md shadow-sm md:grid-cols-4">
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="h-10 rounded-xl border border-outline-variant bg-surface-container-low px-3 font-body-md"
        >
          {cities.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="h-10 rounded-xl border border-outline-variant bg-surface-container-low px-3 font-body-md"
        >
          {types.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 font-label-md text-on-surface-variant md:col-span-2">
          Öğrenci puanı
          <input
            type="number"
            value={studentScore}
            onChange={(e) => setStudentScore(Number(e.target.value))}
            className="h-10 flex-1 rounded-xl border border-outline-variant bg-surface-container-low px-3 font-body-md"
          />
        </label>
      </div>

      <div className="space-y-space-md">
        {filtered.map((s) => {
          const latest = s.yearData[0];
          const b = band(latest.minScore);
          return (
            <div
              key={s.id}
              className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-headline-sm text-on-surface">{s.name}</h2>
                  <p className="font-body-sm text-on-surface-variant">
                    {s.type} · {s.city}/{s.district} · Kontenjan {latest.quota}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 font-label-sm text-white ${b.color}`}
                >
                  {b.label}
                </span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-surface-container">
                <div className={`h-full ${b.color}`} style={{ width: `${b.pct}%` }} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-5">
                {s.yearData.map((y) => (
                  <div
                    key={y.year}
                    className="rounded-lg bg-surface-container-low p-2 text-center"
                  >
                    <p className="font-label-sm text-outline">{y.year}</p>
                    <p className="font-label-lg text-on-surface">{y.minScore}</p>
                    <p className="font-body-sm text-on-surface-variant">%{y.percentile}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
