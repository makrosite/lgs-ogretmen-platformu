import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { calcNet } from "@/lib/jwt";
import { buildParentMessage, whatsappUrl } from "@/lib/whatsapp";
import { signReportToken } from "@/lib/jwt";
import { GalleryClient } from "@/components/teacher/GalleryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const SUBJECTS = ["Tümü", "Matematik", "Fen", "Türkçe", "Sosyal", "İngilizce", "Din", "İnkılap"];

export default async function YanlisSoruGalerisiPage({
  params,
  searchParams,
}: {
  params: Promise<{ examId: string }>;
  searchParams: Promise<{ subject?: string }>;
}) {
  const { examId } = await params;
  const { subject = "Tümü" } = await searchParams;
  const session = await getServerSession(authOptions);

  const exam = await prisma.exam.findFirst({
    where: { id: examId, class: { teacherId: session!.user.id } },
    include: {
      class: { include: { students: true } },
      results: {
        include: { student: true, subjectResults: true, wrongQuestions: true },
      },
    },
  });
  if (!exam) notFound();

  const allWrong = exam.results.flatMap((r) =>
    r.wrongQuestions.map((w) => ({ ...w, studentName: r.student.name, studentId: r.student.id, examResultId: r.id }))
  );
  const filtered = subject === "Tümü" ? allWrong : allWrong.filter((w) => w.subject === subject);

  const byQ = new Map<string, typeof filtered>();
  for (const w of allWrong) {
    const key = `${w.subject}-${w.questionNo}`;
    if (!byQ.has(key)) byQ.set(key, []);
    byQ.get(key)!.push(w);
  }
  const top3 = [...byQ.entries()]
    .map(([key, items]) => ({
      key, subject: items[0].subject, questionNo: items[0].questionNo,
      count: items.length,
      pct: Math.round((items.length / Math.max(1, exam.results.length)) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const subjectCounts = SUBJECTS.slice(1).map((s) => ({ s, n: allWrong.filter((w) => w.subject === s).length }));

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const tableRows = await Promise.all(
    exam.results.map(async (r) => {
      const net = r.subjectResults.reduce((s, sr) => s + calcNet(sr.correct, sr.wrong), 0);
      const reportToken = await signReportToken({ studentId: r.studentId, examResultId: r.id });
      const reportUrl = `${appUrl}/rapor/${reportToken}`;
      const wa = r.student.parentPhone && whatsappUrl(
        r.student.parentPhone,
        buildParentMessage({
          studentName: r.student.name, examName: exam.name,
          net: Math.round(net * 10) / 10, score: r.projectedScore ?? 0,
          percentile: r.percentile ?? 0, reportUrl,
        })
      );
      return {
        id: r.id, studentId: r.studentId, name: r.student.name,
        correct: r.subjectResults.reduce((s, x) => s + x.correct, 0),
        wrong: r.subjectResults.reduce((s, x) => s + x.wrong, 0),
        blank: r.subjectResults.reduce((s, x) => s + x.blank, 0),
        net: Math.round(net * 10) / 10, score: r.projectedScore ?? 0,
        photos: r.wrongQuestions.filter((w) => w.photoUrl).length,
        parentNotified: r.parentNotified, wa,
      };
    })
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{exam.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{new Date(exam.date).toLocaleDateString("tr-TR")}</Badge>
              <span className="text-xs text-slate-500">{exam.results.length}/{exam.class.students.length} katılım</span>
            </div>
          </div>
          <form action={async () => { "use server"; await prisma.exam.update({ where: { id: examId }, data: { locked: !exam.locked } }); }}>
            <Button variant="outline" size="sm" type="submit">
              <span className="material-symbols-outlined text-[14px]">{exam.locked ? "lock_open" : "lock"}</span>
              {exam.locked ? "Kilidi Aç" : "Sonuçları Kilitle"}
            </Button>
          </form>
        </div>
        <Separator className="mt-4" />
      </div>

      {/* Ders filtresi */}
      <div className="flex flex-wrap gap-2">
        {SUBJECTS.map((s) => {
          const count = s === "Tümü" ? allWrong.length : subjectCounts.find((x) => x.s === s)?.n ?? 0;
          const active = subject === s;
          return (
            <Link key={s} href={`?subject=${encodeURIComponent(s)}`}>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                active ? "bg-secondary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}>
                {s}
                {count > 0 && (
                  <span className={`rounded-full px-1.5 text-[10px] font-bold ${active ? "bg-white/20 text-white" : "bg-error/10 text-error"}`}>
                    {count}
                  </span>
                )}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Top 3 Kritik */}
      {top3.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Top 3 Kritik Soru</p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {top3.map((t) => (
              <Card key={t.key} className="border-l-4 border-l-error">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-[16px] text-error">local_fire_department</span>
                    <span className="text-sm font-semibold text-slate-800">{t.subject} Soru {t.questionNo}</span>
                  </div>
                  <p className="text-2xl font-bold text-error">%{t.pct}</p>
                  <p className="text-xs text-slate-500">{t.count} öğrenci yanıldı</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <GalleryClient
        items={filtered.map((w) => ({
          id: w.id, subject: w.subject, questionNo: w.questionNo, photoUrl: w.photoUrl,
          studentName: w.studentName, kazanim: w.kazanim, teacherDiag: w.teacherDiag,
          solvedInClass: w.solvedInClass,
        }))}
      />

      {/* Öğrenci tablosu */}
      <Card>
        <CardHeader><CardTitle>Öğrenci Tablosu</CardTitle></CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ad</TableHead>
                <TableHead>D</TableHead><TableHead>Y</TableHead><TableHead>B</TableHead>
                <TableHead>Net</TableHead><TableHead>Puan</TableHead><TableHead>Foto</TableHead>
                <TableHead>Veli</TableHead><TableHead>Aksiyon</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableRows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <Link href={`/ogrenciler/${r.studentId}`} className="font-medium text-secondary hover:underline">{r.name}</Link>
                  </TableCell>
                  <TableCell>{r.correct}</TableCell>
                  <TableCell>{r.wrong}</TableCell>
                  <TableCell>{r.blank}</TableCell>
                  <TableCell className="font-semibold">{r.net}</TableCell>
                  <TableCell>{r.score}</TableCell>
                  <TableCell>{r.photos}</TableCell>
                  <TableCell>
                    {r.parentNotified
                      ? <Badge variant="success">Gönderildi</Badge>
                      : <Badge variant="destructive">Bekliyor</Badge>
                    }
                  </TableCell>
                  <TableCell>
                    {r.wa && (
                      <a href={r.wa} target="_blank" rel="noreferrer">
                        <Button variant="ghost" size="sm" className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50">
                          <span className="material-symbols-outlined text-[14px]">chat</span>
                          WhatsApp
                        </Button>
                      </a>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
