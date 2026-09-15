import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { calcNet, signReportToken } from "@/lib/jwt";
import { buildParentMessage, whatsappUrl } from "@/lib/whatsapp";
import { StudentReportClient } from "@/components/teacher/StudentReportClient";

export default async function OgrenciKarnePage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const session = await getServerSession(authOptions);

  const student = await prisma.student.findFirst({
    where: { id: studentId, class: { teacherId: session!.user.id } },
    include: {
      examResults: {
        orderBy: { submittedAt: "asc" },
        include: {
          exam: true,
          subjectResults: true,
          wrongQuestions: true,
        },
      },
    },
  });
  if (!student) notFound();

  const latest = student.examResults[student.examResults.length - 1];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  let reportUrl = "";
  let wa: string | null = null;
  if (latest) {
    const token = await signReportToken({
      studentId: student.id,
      examResultId: latest.id,
    });
    reportUrl = `${appUrl}/rapor/${token}`;
    if (student.parentPhone) {
      const net =
        latest.projectedNet ??
        latest.subjectResults.reduce((s, sr) => s + calcNet(sr.correct, sr.wrong), 0);
      wa = whatsappUrl(
        student.parentPhone,
        buildParentMessage({
          studentName: student.name,
          examName: latest.exam.name,
          net: Math.round(net * 10) / 10,
          score: latest.projectedScore ?? 0,
          percentile: latest.percentile ?? 0,
          reportUrl,
        })
      );
    }
  }

  const trend = student.examResults.map((r) => ({
    label: r.exam.name.slice(0, 10),
    net:
      r.projectedNet ??
      r.subjectResults.reduce((s, sr) => s + calcNet(sr.correct, sr.wrong), 0),
  }));

  const subjects = latest?.subjectResults ?? [];

  return (
    <StudentReportClient
      student={{
        id: student.id,
        name: student.name,
        targetSchool: student.targetSchool,
        number: student.number,
      }}
      latest={
        latest
          ? {
              id: latest.id,
              examName: latest.exam.name,
              score: latest.projectedScore ?? 0,
              percentile: latest.percentile ?? 0,
              net: latest.projectedNet ?? 0,
              teacherNote: latest.teacherNote,
              subjects: subjects.map((s) => ({
                subject: s.subject,
                correct: s.correct,
                wrong: s.wrong,
                blank: s.blank,
                net: calcNet(s.correct, s.wrong),
              })),
              wrongCount: latest.wrongQuestions.length,
            }
          : null
      }
      trend={trend}
      reportUrl={reportUrl}
      whatsappUrl={wa}
    />
  );
}
