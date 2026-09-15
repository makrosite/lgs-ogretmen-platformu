import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function OgrencilerIndex() {
  const session = await getServerSession(authOptions);
  const students = await prisma.student.findMany({
    where: { class: { teacherId: session!.user.id } },
    orderBy: { number: "asc" },
    include: {
      examResults: { orderBy: { submittedAt: "desc" }, take: 1 },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Öğrenci & Veli Raporu</h1>
        <p className="mt-0.5 text-sm text-slate-500">Öğrenci seçerek karne açın</p>
        <Separator className="mt-4" />
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {students.map((s) => (
          <Link key={s.id} href={`/ogrenciler/${s.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-4 pt-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-lg font-bold text-secondary">
                  {s.name.slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">
                    {s.number}. {s.name}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{s.targetSchool ?? "Hedef okul belirtilmemiş"}</p>
                  {s.examResults[0] && (
                    <p className="mt-0.5 text-xs font-semibold text-secondary">
                      Son puan: {s.examResults[0].projectedScore}
                    </p>
                  )}
                </div>
                <span className="material-symbols-outlined ml-auto shrink-0 text-[16px] text-slate-300">chevron_right</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
