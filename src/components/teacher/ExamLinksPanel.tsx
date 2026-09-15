"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
    await navigator.clipboard.writeText(`${base}/form/${token}`);
    setCopied(token);
    setTimeout(() => setCopied(null), 1500);
  }

  async function regenerateMissing() {
    await fetch(`/api/denemeler/${examId}/link`, { method: "POST" });
    window.location.reload();
  }

  const missing = students.filter((s) => !links.some((l) => l.studentNumber === s.number));

  return (
    <div className="space-y-3">
      {missing.length > 0 && (
        <Button variant="outline" size="sm" onClick={regenerateMissing}>
          <span className="material-symbols-outlined text-[14px]">add_link</span>
          Eksik {missing.length} link oluştur
        </Button>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">No</TableHead>
            <TableHead>Öğrenci</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>Link</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {links.map((l) => (
            <TableRow key={l.id}>
              <TableCell className="text-slate-400">{l.studentNumber}</TableCell>
              <TableCell className="font-medium text-slate-800">{l.studentName}</TableCell>
              <TableCell>
                {l.usedAt ? (
                  <Badge variant="success">Gönderildi</Badge>
                ) : (
                  <Badge variant="default">Bekliyor</Badge>
                )}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => copy(l.token)}>
                  <span className="material-symbols-outlined text-[14px]">content_copy</span>
                  {copied === l.token ? "Kopyalandı!" : "Kopyala"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
