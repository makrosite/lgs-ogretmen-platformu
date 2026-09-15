import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const exam = await prisma.exam.findFirst({
    where: { id, class: { teacherId: session.user.id } },
    include: { class: { include: { students: true } }, links: true },
  });
  if (!exam) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const missing = exam.class.students.filter(
    (s) => !exam.links.some((l) => l.studentId === s.id)
  );

  await prisma.studentLink.createMany({
    data: missing.map((s) => ({
      token: randomBytes(24).toString("hex"),
      examId: exam.id,
      studentId: s.id,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    })),
  });

  return NextResponse.json({ created: missing.length });
}
