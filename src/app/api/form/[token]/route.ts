import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { calcNet, estimateLgsScore } from "@/lib/jwt";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const link = await prisma.studentLink.findUnique({
    where: { token },
    include: { exam: true, student: true },
  });

  if (!link) return NextResponse.json({ error: "Geçersiz link" }, { status: 404 });
  if (link.expiresAt < new Date()) {
    return NextResponse.json({ error: "Link süresi dolmuş" }, { status: 410 });
  }
  if (link.usedAt) {
    return NextResponse.json({ error: "Form zaten gönderilmiş" }, { status: 409 });
  }
  if (link.exam.locked) {
    return NextResponse.json({ error: "Sonuçlar kilitli" }, { status: 403 });
  }

  const form = await req.formData();
  const subjectsRaw = form.get("subjects");
  if (typeof subjectsRaw !== "string") {
    return NextResponse.json({ error: "Eksik veri" }, { status: 400 });
  }

  const subjects = JSON.parse(subjectsRaw) as Array<{
    subject: string;
    correct: number;
    wrong: number;
    blank: number;
    wrongNos: number[];
  }>;

  const totalNet = subjects.reduce((s, x) => s + calcNet(x.correct, x.wrong), 0);
  const { score, percentile } = estimateLgsScore(totalNet);

  const uploadDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    link.examId,
    link.studentId
  );
  await mkdir(uploadDir, { recursive: true });

  const wrongCreates: Array<{
    subject: string;
    questionNo: number;
    photoUrl?: string;
  }> = [];

  for (const sub of subjects) {
    for (const qNo of sub.wrongNos) {
      const key = `photo_${sub.subject}_${qNo}`;
      const file = form.get(key);
      let photoUrl: string | undefined;
      if (file && typeof file !== "string" && file.size > 0) {
        const buf = Buffer.from(await file.arrayBuffer());
        const filename = `q${qNo}.webp`;
        await writeFile(path.join(uploadDir, filename), buf);
        photoUrl = `/uploads/${link.examId}/${link.studentId}/${filename}`;
      }
      wrongCreates.push({ subject: sub.subject, questionNo: qNo, photoUrl });
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    const created = await tx.examResult.create({
      data: {
        examId: link.examId,
        studentId: link.studentId,
        projectedNet: Math.round(totalNet * 100) / 100,
        projectedScore: score,
        percentile,
        subjectResults: {
          create: subjects.map((s) => ({
            subject: s.subject,
            correct: s.correct,
            wrong: s.wrong,
            blank: s.blank,
          })),
        },
        wrongQuestions: {
          create: wrongCreates,
        },
      },
    });
    await tx.studentLink.update({
      where: { id: link.id },
      data: { usedAt: new Date() },
    });
    return created;
  });

  return NextResponse.json({ resultId: result.id, score, net: totalNet, percentile });
}
