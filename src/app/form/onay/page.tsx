import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ConfirmationClient } from "@/components/student/ConfirmationClient";

export default async function OnayPage({
  searchParams,
}: {
  searchParams: Promise<{ resultId?: string }>;
}) {
  const { resultId } = await searchParams;
  if (!resultId) notFound();

  const result = await prisma.examResult.findUnique({
    where: { id: resultId },
    include: {
      student: true,
      exam: true,
      wrongQuestions: true,
      subjectResults: true,
    },
  });
  if (!result) notFound();

  return (
    <ConfirmationClient
      studentName={result.student.name}
      examName={result.exam.name}
      net={result.projectedNet ?? 0}
      score={result.projectedScore ?? 0}
      percentile={result.percentile ?? 0}
      targetSchool={result.student.targetSchool}
      photos={result.wrongQuestions
        .filter((w) => w.photoUrl)
        .slice(0, 4)
        .map((w) => ({ id: w.id, url: w.photoUrl!, label: `${w.subject} #${w.questionNo}` }))}
      resultId={result.id}
      teacherNote={result.teacherNote}
    />
  );
}
