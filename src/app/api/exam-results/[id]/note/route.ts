import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const updated = await prisma.examResult.update({
    where: { id },
    data: { teacherNote: String(body.teacherNote ?? "").slice(0, 120) },
  });
  return NextResponse.json(updated);
}
