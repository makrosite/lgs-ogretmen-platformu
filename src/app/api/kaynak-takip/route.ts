import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const student = await prisma.student.findFirst({
    where: { id: body.studentId, class: { teacherId: session.user.id } },
  });
  if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let resource = await prisma.resourceTracker.findFirst({
    where: {
      studentId: student.id,
      publisher: body.publisher,
      bookName: body.bookName,
    },
  });

  if (!resource) {
    resource = await prisma.resourceTracker.create({
      data: {
        studentId: student.id,
        publisher: body.publisher,
        bookName: body.bookName,
        subject: body.subject || "Matematik",
        totalTests: body.totalTests || 40,
      },
    });
  }

  const assignment = await prisma.assignment.create({
    data: {
      resourceTrackerId: resource.id,
      startTest: body.startTest,
      endTest: body.endTest,
      dueDate: new Date(body.dueDate),
      status: "pending",
    },
  });

  return NextResponse.json({ resource, assignment });
}
