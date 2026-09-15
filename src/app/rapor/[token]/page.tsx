import { verifyToken, type ReportTokenPayload } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { calcNet } from "@/lib/jwt";
import { ParentReportClient } from "@/components/parent/ParentReportClient";

export default async function RaporPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const payload = await verifyToken<ReportTokenPayload>(token);
  if (!payload || payload.type !== "report") notFound();

  const result = await prisma.examResult.findFirst({
    where: { id: payload.examResultId, studentId: payload.studentId },
    include: {
      student: true,
      exam: true,
      subjectResults: true,
      wrongQuestions: true,
    },
  });
  if (!result) notFound();

  const subjects = result.subjectResults.map((s) => ({
    subject: s.subject,
    net: calcNet(s.correct, s.wrong),
    correct: s.correct,
    wrong: s.wrong,
  }));

  return (
    <ParentReportClient
      studentName={result.student.name}
      examName={result.exam.name}
      score={result.projectedScore ?? 0}
      percentile={result.percentile ?? 0}
      net={result.projectedNet ?? 0}
      teacherNote={result.teacherNote}
      targetSchool={result.student.targetSchool}
      subjects={subjects}
      wrongs={result.wrongQuestions.slice(0, 4).map((w) => ({
        id: w.id,
        subject: w.subject,
        questionNo: w.questionNo,
        photoUrl: w.photoUrl,
        kazanim: w.kazanim,
      }))}
    />
  );
}
