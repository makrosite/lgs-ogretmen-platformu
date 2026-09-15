import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ExamFormClient } from "@/components/student/ExamFormClient";

const SUBJECT_QUESTIONS: Record<string, number> = {
  Türkçe: 20,
  Matematik: 20,
  Fen: 20,
  Sosyal: 10,
  İngilizce: 10,
  Din: 10,
  İnkılap: 10,
};

export default async function FormPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const link = await prisma.studentLink.findUnique({
    where: { token },
    include: {
      exam: true,
      student: true,
    },
  });

  if (!link || link.expiresAt < new Date()) notFound();
  if (link.usedAt) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-primary-container px-4 text-center text-on-primary">
        <div>
          <span className="material-symbols-outlined mb-2 text-5xl text-tertiary-fixed">
            check_circle
          </span>
          <h1 className="font-headline-lg">Bu form zaten gönderilmiş</h1>
          <p className="mt-2 font-body-md text-on-primary-container">
            {link.student.name} — {link.exam.name}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ExamFormClient
      token={token}
      examName={link.exam.name}
      publisher={link.exam.publisher}
      examDate={link.exam.date.toISOString()}
      studentName={link.student.name}
      subjects={SUBJECT_QUESTIONS}
    />
  );
}
