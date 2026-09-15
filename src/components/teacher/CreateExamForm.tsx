"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function CreateExamForm({ classId }: { classId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    await fetch("/api/denemeler", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        classId,
        name: fd.get("name"),
        publisher: fd.get("publisher"),
        date: fd.get("date"),
      }),
    });
    setLoading(false);
    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid grid-cols-1 gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm md:grid-cols-4"
    >
      <input
        name="name"
        required
        placeholder="Deneme adı"
        className="h-10 rounded-xl border border-outline-variant bg-surface-container-low px-3 font-body-md outline-none focus:border-secondary"
      />
      <input
        name="publisher"
        required
        placeholder="Yayınevi"
        className="h-10 rounded-xl border border-outline-variant bg-surface-container-low px-3 font-body-md outline-none focus:border-secondary"
      />
      <input
        name="date"
        type="date"
        required
        className="h-10 rounded-xl border border-outline-variant bg-surface-container-low px-3 font-body-md outline-none focus:border-secondary"
      />
      <button
        type="submit"
        disabled={loading}
        className="h-10 rounded-xl bg-secondary font-label-md text-on-secondary disabled:opacity-60"
      >
        {loading ? "Oluşturuluyor..." : "Deneme + Linkler Oluştur"}
      </button>
    </form>
  );
}
