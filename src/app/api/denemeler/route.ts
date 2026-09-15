import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { classId, name, publisher, date } = body;

  const klass = await prisma.class.findFirst({
    where: { id: classId, teacherId: session.user.id },
    include: { students: true },
  });
  if (!klass) return NextResponse.json({ error: "Class not found" }, { status: 404 });

  const exam = await prisma.exam.create({
    data: {
      name,
      publisher,
      date: new Date(date),
      classId,
      links: {
        create: klass.students.map((s) => ({
          token: randomBytes(24).toString("hex"),
          studentId: s.id,
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        })),
      },
    },
  });

  return NextResponse.json(exam);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const exams = await prisma.exam.findMany({
    where: { class: { teacherId: session.user.id } },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(exams);
}
