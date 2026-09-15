import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CreateExamForm } from "@/components/teacher/CreateExamForm";
import { ExamLinksPanel } from "@/components/teacher/ExamLinksPanel";

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
    return <p className="font-body-md">Sınıf bulunamadı. Seed çalıştırın.</p>;
  }

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline-lg text-on-surface">Deneme Sınavları & Link</h1>
          <p className="font-body-md text-on-surface-variant">
            Tek kullanımlık öğrenci form linkleri oluşturun
          </p>
        </div>
      </div>

      <CreateExamForm classId={klass.id} />

      <div className="space-y-space-md">
        {klass.exams.map((exam) => (
          <div
            key={exam.id}
            className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm"
          >
            <div className="mb-space-md flex flex-wrap items-center justify-between gap-space-sm">
              <div>
                <h2 className="font-headline-sm text-on-surface">{exam.name}</h2>
                <p className="font-body-sm text-on-surface-variant">
                  {exam.publisher} · {new Date(exam.date).toLocaleDateString("tr-TR")} ·{" "}
                  {exam._count.results} sonuç · {exam.links.filter((l) => l.usedAt).length}/
                  {exam.links.length} form tamamlandı
                </p>
              </div>
              <div className="flex gap-space-sm">
                <Link
                  href={`/yanlis-sorular/${exam.id}`}
                  className="rounded-xl bg-surface-container-high px-space-md py-space-sm font-label-md text-on-surface"
                >
                  Galeri
                </Link>
              </div>
            </div>
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
          </div>
        ))}
      </div>
    </div>
  );
}
