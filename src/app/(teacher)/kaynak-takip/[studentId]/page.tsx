import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { KaynakTakipClient } from "@/components/teacher/KaynakTakipClient";

export default async function KaynakTakipPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const session = await getServerSession(authOptions);

  const student = await prisma.student.findFirst({
    where: { id: studentId, class: { teacherId: session!.user.id } },
    include: {
      class: { include: { students: { orderBy: { number: "asc" } } } },
      resources: {
        include: { assignments: { orderBy: { dueDate: "asc" } } },
      },
    },
  });
  if (!student) notFound();

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="flex flex-wrap items-center justify-between gap-space-md">
        <div>
          <h1 className="font-headline-lg text-on-surface">Kaynak & Ödev Takibi</h1>
          <p className="font-body-md text-on-surface-variant">
            {student.name} · çok kaynaklı çalışma matrisi
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {student.class.students.map((s) => (
            <Link
              key={s.id}
              href={`/kaynak-takip/${s.id}`}
              className={`rounded-full px-3 py-1 font-label-sm ${
                s.id === student.id
                  ? "bg-secondary text-on-secondary"
                  : "bg-surface-container-high text-on-surface-variant"
              }`}
            >
              {s.name.split(" ")[0]}
            </Link>
          ))}
        </div>
      </div>

      <KaynakTakipClient
        studentId={student.id}
        studentName={student.name}
        resources={student.resources.map((r) => ({
          id: r.id,
          publisher: r.publisher,
          bookName: r.bookName,
          subject: r.subject,
          totalTests: r.totalTests,
          assignments: r.assignments.map((a) => ({
            id: a.id,
            startTest: a.startTest,
            endTest: a.endTest,
            dueDate: a.dueDate.toISOString(),
            status: a.status,
            score: a.score,
          })),
        }))}
      />
    </div>
  );
}
