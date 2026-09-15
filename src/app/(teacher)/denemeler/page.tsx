import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CreateExamForm } from "@/components/teacher/CreateExamForm";
import { ExamLinksPanel } from "@/components/teacher/ExamLinksPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default async function DenemelerPage() {
  const session = await getServerSession(authOptions);
  const klass = await prisma.class.findFirst({
    where: { teacherId: session!.user.id },
    include: {
      students: { orderBy: { number: "asc" } },
      exams: {
        orderBy: { date: "desc" },
        include: {
          links: { include: { student: true } },
          _count: { select: { results: true } },
        },
      },
    },
  });

  if (!klass) {
    return <p className="text-sm text-slate-500">Sınıf bulunamadı. Seed çalıştırın.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Deneme Sınavları</h1>
            <p className="mt-0.5 text-sm text-slate-500">Tek kullanımlık öğrenci form linkleri oluşturun</p>
          </div>
        </div>
        <Separator className="mt-4" />
      </div>

      <CreateExamForm classId={klass.id} />

      <div className="flex flex-col gap-4">
        {klass.exams.map((exam) => {
          const completed = exam.links.filter((l) => l.usedAt).length;
          const total = exam.links.length;
          const pct = total ? Math.round((completed / total) * 100) : 0;
          return (
            <Card key={exam.id}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">{exam.name}</CardTitle>
                    <p className="mt-1 text-xs text-slate-500">
                      {exam.publisher} · {new Date(exam.date).toLocaleDateString("tr-TR")} · {exam._count.results} sonuç
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={completed === total && total > 0 ? "success" : "default"}>
                      {completed}/{total} tamamlandı
                    </Badge>
                    <Link href={`/yanlis-sorular/${exam.id}`}>
                      <Button variant="outline" size="sm">
                        <span className="material-symbols-outlined text-[14px]">photo_library</span>
                        Galeri
                      </Button>
                    </Link>
                  </div>
                </div>
                {total > 0 && (
                  <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-secondary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-4">
                <ExamLinksPanel
                  examId={exam.id}
                  links={exam.links.map((l) => ({
                    id: l.id,
                    token: l.token,
                    usedAt: l.usedAt?.toISOString() ?? null,
                    studentName: l.student.name,
                    studentNumber: l.student.number,
                  }))}
                  students={klass.students.map((s) => ({
                    id: s.id,
                    name: s.name,
                    number: s.number,
                  }))}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
