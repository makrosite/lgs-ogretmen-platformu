import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

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
    <div className="flex flex-col gap-space-lg">
      <div>
        <h1 className="font-headline-lg text-on-surface">Öğrenci & Veli Raporu</h1>
        <p className="font-body-md text-on-surface-variant">Öğrenci seçerek karne açın</p>
      </div>
      <div className="grid grid-cols-1 gap-space-md md:grid-cols-2 xl:grid-cols-3">
        {students.map((s) => (
          <Link
            key={s.id}
            href={`/ogrenciler/${s.id}`}
            className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-center gap-space-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-fixed font-headline-sm text-secondary">
                {s.name.slice(0, 1)}
              </div>
              <div>
                <p className="font-label-lg text-on-surface">
                  {s.number}. {s.name}
                </p>
                <p className="font-body-sm text-on-surface-variant">
                  {s.targetSchool ?? "Hedef okul yok"}
                </p>
                {s.examResults[0] && (
                  <p className="font-label-sm text-secondary">
                    Son puan: {s.examResults[0].projectedScore}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
