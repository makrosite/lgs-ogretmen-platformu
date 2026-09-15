import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const klass = await prisma.class.findFirst({
    where: { teacherId: session.user.id },
    include: { _count: { select: { students: true } } },
  });

  const pending = await prisma.examResult.count({
    where: {
      parentNotified: false,
      exam: { class: { teacherId: session.user.id } },
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        className={klass?.name ?? "8-A"}
        studentCount={klass?._count.students ?? 0}
      />
      <div className="flex min-h-screen flex-col pl-60">
        <Header
          teacherName={session.user.name ?? "Öğretmen"}
          teacherTitle={session.user.title ?? ""}
          notifCount={pending}
        />
        <main className="mx-auto w-full max-w-[1280px] flex-1 bg-background px-space-md pt-14 py-space-md">
          {children}
        </main>
      </div>
    </div>
  );
}
