import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();

  const wq = await prisma.wrongQuestion.findFirst({
    where: {
      id,
      examResult: { exam: { class: { teacherId: session.user.id } } },
    },
  });
  if (!wq) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.wrongQuestion.update({
    where: { id },
    data: {
      solvedInClass: body.solvedInClass ?? wq.solvedInClass,
      teacherDiag: body.teacherDiag ?? wq.teacherDiag,
      kazanim: body.kazanim ?? wq.kazanim,
    },
  });
  return NextResponse.json(updated);
}
