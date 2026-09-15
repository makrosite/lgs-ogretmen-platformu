"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
    <Card>
      <CardContent className="pt-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Yeni Deneme Ekle</p>
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Input name="name" required placeholder="Deneme adı" />
          <Input name="publisher" required placeholder="Yayınevi" />
          <Input name="date" type="date" required />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Oluşturuluyor..." : "Deneme + Linkler Oluştur"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
